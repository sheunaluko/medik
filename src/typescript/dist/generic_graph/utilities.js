"use strict";
/*
    Defines utilities for operating on Graphs
    Graphs structure is defined in graph.ts

    Sheun Aluko , Fri Mar 06 02:00:56 2020
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../utils"));
/*
    Some  dummy utilities to get started
*/
function num_vertices(G) {
    return G.vertices.vertices.length;
}
exports.num_vertices = num_vertices;
function num_edges(G) {
    return G.edges.edges.length;
}
exports.num_edges = num_edges;
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
class Path {
    constructor(ops) {
        this.vertices = ops.vertices || [];
        this.edges = ops.edges || [];
    }
    add(e, v) {
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
    clone() {
        let p = new Path({});
        this.vertices.map(v => p.vertices.push(v));
        this.edges.map(e => p.edges.push(e));
        return p;
    }
}
exports.Path = Path;
/* create abstractions for coordination and ultimately visualization of recursive searches */
class JobCoordinator {
    constructor(ops, G) {
        this.jobs = { active: [], completed: [], retired: [] };
        this.G = G;
        this.ops = ops;
        this.finished_promise = new Promise((resolve, reject) => {
            this.finished_resolver = resolve;
        });
    }
    remove_job(j, target) {
        let j_index = target.indexOf(j);
        target.splice(j_index, 1);
    }
    submit(j) {
        return __awaiter(this, void 0, void 0, function* () {
            //first add the hob to active jobs
            this.activate(j);
            //when a job is submitted we will do the job and get result
            let { job, result, new_jobs } = yield DoJob(j, this.ops, this.G);
            //first remove it from active
            this.unactivate(j); //note j (start) vs job (end)
            switch (result) {
                case exports.JobFinishResult.SUCCEEDED:
                    this.complete(job);
                    break;
                case exports.JobFinishResult.TERMINATED:
                    this.complete(job);
                    break;
                case exports.JobFinishResult.EOF:
                    this.complete(job);
                    break;
                case exports.JobFinishResult.RETIRED:
                    this.retire(job);
                    if (new_jobs) {
                        new_jobs.map(function (j) {
                            this.submit(j); //submit all the new jobs
                        }.bind(this));
                    }
                    else {
                        throw "RETIRED BUT NO NEW JOBS";
                    }
                    break;
                default:
                    throw "Should not reach default case";
            }
            /* Check to see if there are any active jobs */
            if (this.jobs.active.length < 1) {
                this.finished_resolver(true); //RESOLVE THE FINISHED PROMISE 
            }
        });
    }
    unactivate(j) {
        this.remove_job(j, this.jobs.active);
    }
    activate(j) {
        this.jobs.active.push(j);
    }
    complete(j) {
        this.jobs.completed.push(j);
    }
    retire(j) {
        this.jobs.retired.push(j);
    }
    done() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.finished_promise;
        });
    }
}
exports.JobCoordinator = JobCoordinator;
var JobStatus;
(function (JobStatus) {
    JobStatus[JobStatus["ACTIVE"] = 0] = "ACTIVE";
    JobStatus[JobStatus["COMPLETE"] = 1] = "COMPLETE";
})(JobStatus = exports.JobStatus || (exports.JobStatus = {}));
class Job {
    constructor(ops) {
        this.id = ops.id;
        this.path = ops.path;
        this.data = {};
        this.result = null;
        //start and end are defined later
    }
}
exports.Job = Job;
exports.JobFinishResult = {
    "SUCCEEDED": "succeeded",
    "TERMINATED": "terminated",
    "RETIRED": "retired",
    "EOF": "eof"
};
/**
 * Run a given job to produce its output
 *
 * @export
 * @param {Job} j
 * @param {BFS_Search_Ops} ops
 * @param {g.Graph} G
 * @returns {JobResult}
 */
function DoJob(j, ops, G) {
    return __awaiter(this, void 0, void 0, function* () {
        j.start = util.ms();
        let { check_terminate, check_succeed, get_next_vertices } = ops;
        /* first we should check if the job has reached success - - - - - - - - - - - -  */
        var { result, data } = yield check_succeed(j.path, G);
        if (result) {
            //yes, we succeeded ...
            j.end = util.ms();
            j.data["completion_data"] = data;
            j.result = exports.JobFinishResult.SUCCEEDED;
            j.status = JobStatus.COMPLETE;
            return { job: j, result: exports.JobFinishResult.SUCCEEDED };
        }
        /* now check if the job should terminate - - - - -  -  -   -  -  - - - - - - - -  */
        var { result, data } = yield check_terminate(j.path, G);
        if (result) {
            //yes, should terminate ... and the reason will be contained in the data object
            j.end = util.ms();
            j.data["completion_data"] = data;
            j.result = exports.JobFinishResult.TERMINATED;
            j.status = JobStatus.COMPLETE;
            return { job: j, result: exports.JobFinishResult.TERMINATED };
        }
        /*
          OK -- at this point the job should neither terminate nor suceed. This means it will either:
              1) generate new Jobs based on get_next_vertices and then retire itself
              2) terminate because there are no new Jobs to generate (j.data["eof"] = true )
          */
        let next_vertices = yield get_next_vertices(j.path, G);
        if (next_vertices.length < 1) {
            //no future jobs, so we will terminate with EOF
            j.end = util.ms();
            j.status = JobStatus.COMPLETE;
            j.result = exports.JobFinishResult.EOF;
            return { job: j, result: exports.JobFinishResult.EOF };
        }
        else {
            /*  Finally if we reach here then there are more jobs to return */
            let new_jobs = get_new_jobs(j, next_vertices);
            j.end = util.ms();
            j.status = JobStatus.COMPLETE;
            j.result = exports.JobFinishResult.RETIRED;
            return { job: j, result: exports.JobFinishResult.RETIRED, new_jobs };
        }
    });
}
exports.DoJob = DoJob;
function get_new_jobs(j, next_vertices) {
    /* Loop over the outflow tracts */
    var counter = 0;
    let new_jobs = next_vertices.map((e2v) => {
        let id = j.id + "." + counter++;
        let path = j.path.clone(); //clones the path until this point
        path.add(e2v.edge, e2v.vertex); //update the path so that it reflects the new outflow
        let new_job = new Job({ id, path }); //create the new job
        return new_job; //and return it
    });
    return new_jobs;
}
exports.get_new_jobs = get_new_jobs;
/**
 *MODIFIED breadth first search implmentation.
 *
 * @export
 * @class MBFS
 */
class MBFS {
    constructor(G, ops) {
        this.G = G;
        this.ops = ops;
    }
    compute(start_path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.coordinator = new JobCoordinator(this.ops, this.G);
            let start_job = new Job({ id: "0", path: start_path });
            this.coordinator.submit(start_job);
            yield this.coordinator.done();
            return this.coordinator.jobs;
        });
    }
}
exports.MBFS = MBFS;
/*
PHEEEW -- that was a ton of work !
I wonder if any of the code actually works lmao
:D


TODO:
Create a test graph with a couple edges and vertices then create a custom
MBFS and see wtf happens -- then enjoy the debugging opportunity :)
Say yes to life :)
*/ 
//# sourceMappingURL=utilities.js.map