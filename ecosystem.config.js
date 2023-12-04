module.exports = {
  apps : [
  
    {
      name: "dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start", //running on port 3000
      watch: false,
      "env": {
      "NODE_EXTRA_CA_CERTS": "public/geant.pem"
      },
      "env_staging" : {
      "NODE_EXTRA_CA_CERTS": "public/www.ucl.ac.uk.cer"
    } 
  },
]
};
