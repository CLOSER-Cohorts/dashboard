module.exports = {
  apps : [
  
    {
      name: "dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start", //running on port 3000
      watch: false,
      "env": {
      "HOSTNAME": "discovery.closer.ac.uk",
      "NODE_EXTRA_CA_CERTS": "public/geant.pem"
      },
      "env_staging" : {
      "HOSTNAME": "clsr-ppcolw01n.addev.ucl.ac.uk",
      "NODE_EXTRA_CA_CERTS": "public/www.ucl.ac.uk.cer"
    } 
  },
]
};
