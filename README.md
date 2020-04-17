# Medik | 2020 
Automated Clinical Diagnosis and Education Application


##### Local development instructions

###### (0) Please install yarn package manager for nodejs (preferred) or npm 
- https://classic.yarnpkg.com/en/docs/install/

###### (1) Installing the Medik Development Environment (Repository):
- Requires: Completed (0) above 
- Clone the medik repository using the following command: “git clone https://github.com/sheunaluko/medik.git”  , which will create the ‘medik’ directory on your computer  
- Type ‘cd medik/’ to go into the directory, and then run ‘yarn install’ to install the dependencies for the root project 

###### (2) Launching the Medik Client Web Application: 
- Requires: Completed (1) above 
- To install the dependencies for the web application you must go to the web application directory and install its dependencies. 
  - To do this from inside the ‘medik/’ directory, enter: ‘cd src/react_js/medik_web_app; yarn install’ 
  - To run the web application from inside the ‘medik/src/react_js/medik_web_app/’ directory run the following: ‘yarn start’ 
This will enable hot code reloading for the web application

###### (3) Launching the Medik Backend Application: 
- Actually, the Medik backend is currently implemented via GCP Cloud Functions and has already been launched 
  - The cloud functions are prototyped in the src/python/local_cloud_functions/ directory, then copied to GCP for deployment 
  - Web Application can query the cloud function via fetch browser API, as demonstrated in src/react_js/medik_web_app/src/js/util.js 

