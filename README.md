#Dashboard

This purpose of this tool is to identify specific item types which are entered as 'free text' for checking before deploying to production.

## Installation

- Rename ecosystem.config.dist to ecosystem.config.js.
- Update the value of the COLECTICA_REPOSITORY_HOSTNAME environment variable with the name of a server that hosts the Colectica Repository. This environment variable is used to construct the URL for the REST API that the dashboard queries in order to retrieve data from the Colectica Repository.        

## Running the application locally

Before running either a dev or production instance of the Dashboard, type:
`npm i`

To run a dev instance of the Dashboard, modify package.json by setting the value of the COLECTICA_REPOSITORY_HOSTNAME environment variable set in the 'dev' entry under the 'scripts' section to the hostname of the Colectica repository your Dashboard instance will be querying (e.g. type the following in the root directory of the dashboard application code:

`npm run dev`

To run a production instance of the Dashboard, type the following in the root directory of the dashboard application code:
```
npm run build
npm run start
```
Note that Node.js has different option settings for development and production instances; running a production instance in the above fashion just means running a local instance of the Dashboard with the Node.js options settings for a production environment. It does not deploy and run the Dashboard on a remote production environment.  

Whether running a dev or production instance locally, the application can be viewed at http://localhost:3000. Note that this is not the same URL path for accessing the dashboard on the staging environment (which has /dashboard at the end).

## Running the dashboard as a service on a Windows server

startDashboard.bat contains commands used to run the dashboard as a service on a Windows server. The details for how to set up a Windows server to host a NodeJS based application like the Dashboard are on the CLOSER Discovery Team wiki.

## Using the application

Login to the application using your discovery.closer.ac.uk username and password.


