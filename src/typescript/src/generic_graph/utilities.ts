/* 
    Defines utilities for operating on Graphs  
    Graphs structure is defined in graph.ts 

    Sheun Aluko , Fri Mar 06 02:00:56 2020 
*/

import * as g from "./graph";
import * as util from "../utils";
import { kMaxLength } from "buffer";

/*
    Some  dummy utilities to get started 
*/
export function num_vertices(G: g.Graph) {
  return G.vertices.vertices.length;
}

export function num_edges(G: g.Graph) {
  return G.edges.edges.length;
}



/* 
 TODO : 
 implement modified BFS like algorithm for 
 generic graph searches. 

 Should keep track of paths as it goes. 
 Should accept the following functions: 
 {should_terminate, 
  should_succeed, 
  get_next_vertices } 

 Also... should implement in a modular way so that code can be easily 
 adapted for PARALLEL operation on CPU (server side) vs... browser? 
 
 ALSO - should execute asynchronously -> then can support resolving ENTITIES WITHIN the should_{succeed,terminate} functions 
  
 Also --> could have socksync vizualisation of how many recursive calls have been made , then they get canceled as they return 
      --> start with simple socksync graphical implementation like this  


TERMINATION OPTIONS: 
    - no cycles (if start vertex == end vertex )
    - length, length of path exceeds ome constant  

COORDINATOR: 
    will keep track of the ongoing graph search execution 
    will abstract away maintaining a UI state as well 

*/

/* define object which represents a path 
    array of vertices length 1 greater than array of edges */

export class Path {
  vertices: g.Vertex[];
  edges: g.Edge[]; //there will be one less edge index
  constructor(ops: {vertices? : g.Vertex[], edges? : g.Edge[]}) {
    this.vertices = ops.vertices || [];
    this.edges = ops.edges || [];
  }

  add(e: g.Edge, v: g.Vertex) {
    this.edges.push(e);
    this.vertices.push(v);
  }

  /**
   *Clones the path by creating new Path object and then copying REFERENCES to
   *vertices and edges into it
   *
   * @returns {Path}
   * @memberof Path
   */
  clone(): Path {
    let p = new Path({});
    this.vertices.map(v => p.vertices.push(v));
    this.edges.map(e => p.edges.push(e));
    return p;
  }
}

export type MaybePath = Path | null;

/* create abstractions for coordination and ultimately visualization of recursive searches */

export class JobCoordinator {
  /* 
        Can support various policies for how the coordinator reacts to submitted 
        and completed jobs. For example, if it receives a completed 
        job with j.data.succeeded == true, it may decide to allow continual execution, 
        OR... it may decide to block further submissions, suspend active jobs, and return 
        that current result. This can be configured later.. 
    */

  jobs: {
    active: Job[];
    completed: Job[];
    retired: Job[]; //for jobs which spawn child jobs and then stop execution
  };

  ops: BFS_Search_Ops; //reference to the search ops

  G: g.Graph; //reference to the parent graph

  finished_promise : Promise<boolean> 
  finished_resolver : (value?: boolean | PromiseLike<boolean>) => void

  constructor(ops: BFS_Search_Ops, G: g.Graph) {
    this.jobs = { active: [], completed: [], retired: [] };
    this.G = G;
    this.ops = ops;
    this.finished_promise = new Promise( (resolve,reject) => { 
        this.finished_resolver = resolve 
    })
  }

  remove_job(j: Job, target: Job[]): void {
    let j_index = target.indexOf(j);
    target.splice(j_index, 1);
  }

  async submit(j: Job) {
    //first add the hob to active jobs
    this.activate(j);
    //when a job is submitted we will do the job and get result
    let { job, result, new_jobs } = await DoJob(j, this.ops, this.G);
    //first remove it from active
    this.unactivate(j); //note j (start) vs job (end)
    switch (result) {
      case JobFinishResult.SUCCEEDED:
        this.complete(job);
        break;

      case JobFinishResult.TERMINATED:
        this.complete(job);
        break;

      case JobFinishResult.EOF:
        this.complete(job);
        break;

      case JobFinishResult.RETIRED:
        this.retire(job);

        if (new_jobs) {
          new_jobs.map(
            function(j: Job) {
              this.submit(j); //submit all the new jobs
            }.bind(this)
          );
        } else {
          throw "RETIRED BUT NO NEW JOBS";
        }
        break;

      default:
        throw "Should not reach default case";
    }

    /* Check to see if there are any active jobs */ 
    if (this.jobs.active.length < 1 ) {
        this.finished_resolver(true)  //RESOLVE THE FINISHED PROMISE 
    }

  }

  unactivate(j: Job) {
    this.remove_job(j, this.jobs.active);
  }

  activate(j: Job) {
    this.jobs.active.push(j);
  }

  complete(j: Job) {
    this.jobs.completed.push(j);
  }

  retire(j: Job) {
    this.jobs.retired.push(j);
  }

  async done() { 
    return this.finished_promise 
  }
}

export enum JobStatus {
  "ACTIVE",
  "COMPLETE"
}

export class Job {
  id: string;
  path: Path;
  status: JobStatus;
  result : string |  null 
  data: { [key: string]: any }; //will allow arbitrary data about the job to be held (why it terminated, etc)
  start: number;
  end: number;

  constructor(ops: { id: string; path: Path }) {
    this.id = ops.id;
    this.path = ops.path;
    this.data = {};
    this.result = null
    //start and end are defined later
  }
}
/* -- */

export type EdgeToVertex = { edge: g.Edge; vertex: g.Vertex }; // represents an OUTFLOW of a certain kind to a certain node
export type Outflows = EdgeToVertex[] | null 
export type CheckReturn = { result : boolean , data : { [k: string]: any } } 
export interface BFS_Search_Ops {
  check_terminate: (
    p: Path,
    G: g.Graph
  ) => Promise<CheckReturn>; //allows more nuanced reporting
  check_succeed: (
    p: Path,
    G: g.Graph
  ) => Promise<CheckReturn>; //allows more nuanced reporting
  get_next_vertices: (p: Path, G: g.Graph) => Promise<Outflows>;
}

export var JobFinishResult =  {
"SUCCEEDED" : "succeeded" , 
  "TERMINATED" : "terminated", 
  "RETIRED" : "retired" ,
  "EOF" : "eof" 
}

export interface JobResult {
  job: Job;
  result: string;
  new_jobs?: Job[];
}

/**
 * Run a given job to produce its output
 *
 * @export
 * @param {Job} j
 * @param {BFS_Search_Ops} ops
 * @param {g.Graph} G
 * @returns {JobResult}
 */
export async function DoJob(
  j: Job,
  ops: BFS_Search_Ops,
  G: g.Graph
): Promise<JobResult> {
  j.start = util.ms();
  let { check_terminate, check_succeed, get_next_vertices } = ops;

  /* first we should check if the job has reached success - - - - - - - - - - - -  */

  var { result, data } = await check_succeed(j.path, G);

  if (result) {
    //yes, we succeeded ...
    j.end = util.ms();
    j.data["completion_data"] = data;
    j.result = JobFinishResult.SUCCEEDED
    j.status = JobStatus.COMPLETE;
    
    return { job: j, result: JobFinishResult.SUCCEEDED };
  }

  /* now check if the job should terminate - - - - -  -  -   -  -  - - - - - - - -  */

  var { result, data } = await check_terminate(j.path, G);

  if (result) {
    //yes, should terminate ... and the reason will be contained in the data object
    j.end = util.ms();
    j.data["completion_data"] = data;
    j.result = JobFinishResult.TERMINATED
    j.status = JobStatus.COMPLETE;

    return { job: j, result: JobFinishResult.TERMINATED };
  }

  /* 
    OK -- at this point the job should neither terminate nor suceed. This means it will either: 
        1) generate new Jobs based on get_next_vertices and then retire itself 
        2) terminate because there are no new Jobs to generate (j.data["eof"] = true ) 
    */

  let next_vertices = await get_next_vertices(j.path, G);

  if (next_vertices.length < 1) {
    //no future jobs, so we will terminate with EOF
    j.end = util.ms();
    j.status = JobStatus.COMPLETE;
    j.result = JobFinishResult.EOF 
    return { job: j, result: JobFinishResult.EOF };
  } else {
    /*  Finally if we reach here then there are more jobs to return */

    let new_jobs = get_new_jobs(j, next_vertices);
    j.end = util.ms();
    j.status = JobStatus.COMPLETE;
    j.result = JobFinishResult.RETIRED 
    return { job: j, result: JobFinishResult.RETIRED, new_jobs };
  }
}

export function get_new_jobs(j: Job, next_vertices: EdgeToVertex[]): Job[] {
  /* Loop over the outflow tracts */

  var counter = 0;
  let new_jobs = next_vertices.map((e2v: EdgeToVertex) => {
    let id = j.id + "." + counter++;
    let path = j.path.clone(); //clones the path until this point
    path.add(e2v.edge, e2v.vertex); //update the path so that it reflects the new outflow
    let new_job = new Job({ id, path }); //create the new job
    return new_job; //and return it
  });

  return new_jobs;
}



/**
 *MODIFIED breadth first search implmentation. 
 *
 * @export
 * @class MBFS
 */
export class MBFS {
  G: g.Graph;
  ops: BFS_Search_Ops;
  coordinator : JobCoordinator 

  constructor(G: g.Graph, ops: BFS_Search_Ops) {
    this.G = G;
    this.ops = ops;
    
  }

  async compute(start_path : Path) {
      this.coordinator = new JobCoordinator(this.ops,this.G) 
      let start_job = new Job({id : "0" , path: start_path}) 
      this.coordinator.submit(start_job) 
      await this.coordinator.done() 

      return this.coordinator.jobs 
  }
}


/* 
PHEEEW -- that was a ton of work ! 
I wonder if any of the code actually works lmao  
:D  


TODO: 
Create a test graph with a couple edges and vertices then create a custom 
MBFS and see wtf happens -- then enjoy the debugging opportunity :) 
Say yes to life :) 
*/ 