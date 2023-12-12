#Dashboard

This purpose of this tool is to identify specific item types which are entered as 'free text' for checking before deploying to production.

##Installation

- Rename ecosystem.config.dist to ecosystem.config.js.
- Update the value of the COLECTICA_REPOSITORY_HOSTNAME environment variable with the name of a server that hosts the Colectica Repository. This environment variable is used to construct the URL for the REST API that the dashboard queries in order to retrieve data from the Colectica Repository.        

##Running the application locally

Before running either a dev or production instance of the Dashboard, type:
`npm i`

To run a dev instance of the Dashboard, type the following in the root directory of the dashboard application code:

`npm run dev`

To run a production instance of the Dashboard, type the following in the root directory of the dashboard application code:
```
npm run build
npm run start
```

Whether running a dev or production instance, the application can be viewed at http://localhost:3000

## Running the dashboard as a service on a Windows server

startDashboard.bat contains commands used to run the dashboard as a service on a Windows server. The details for how to set up a Windows server to host a NodeJS based application like the Dashboard are on the CLOSER Discovery Team wiki.

##Using the application

Login to the application using your discovery.closer.ac.uk username and password.


