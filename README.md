# Analytics API
### Production Server IP Address: 54.196.13.203
This API is built to provide GET endpoints to facilitate information to be shown on Stackmanager. It also acts as a consumer to Internal kafka to consume events and update database entries as required.
It's primary function is to maintain the database, information and providing the same as required by Stackmanager.

## External Connections
The API connects to Stacksville Internal kafka at IP address: ```139.144.37.161:9092```.
- Configurable in ```/config.js``` under ```bootstrap_servers``` of object being exported from file.
- The IPs are provided as a list of strings.
    - e.g. ```bootstrap_servers: ["139.144.37.161:9092"]```

The API connects to Stacksville Database hosted on RDS on: ```database-1.ciohjacrdv4d.us-east-1.rds.amazonaws.com```.
- Configurable in ```/utils/database.js``` in ```connection``` object used to create mariadb connection pool.
- The host, user, password, port, database are provided as an object.
    - e.g. 
    ```
    const connection = mariadb.createPool({
     host: 'database-1.ciohjacrdv4d.us-east-1.rds.amazonaws.com',
     user: 'admin_abhi',
     password: 'StacksVille2023Abhi',
     port: '3306',
     database: 'innodb',
    });
    ```
    
The API also connects to Prometheus server to gather and support metrics display by frontend.
- Configurable in ```/config.js``` under ```prometheus_url``` of object being exported from file.
- The IP is provided as a string.
 - e.g. ```prometheus_url: "http://45.33.82.190:9090"```
 
## Setting up on Local
- Make sure that you are logged into your Stacksville LLC. account and have git installed on your PC.
- Ensure that you have **Node version 16**.

  _**In terminal**_

  ```
  git clone --recursive https://github.com/Stacksville/Analytics_API
  cd Analytics_API
  npm install
  ```
  
  Ensure that ```constants``` submodules has the latest changes.
  
  ```
  cd constants
  git pull origin main
  ```

   Start the API.

  ```
  npm start
  ```
  
  API would be available on ```localhost:9000```

  When you locally start API, you might see error messages regarding failure of connection to Kafka. This is because, the code connects to the live kafka servers which are behind a firewall. Hence, your local environment may not have permission to access the same. However, the API and its routes will function properly, so you can ignore those errors. You may also choose to connect to a test Kafka cluster which would stop the error messages. Please take a look at I.K. documentation to see how to set up one.
  
## Deploying Changes
Always do a ```git pull -r``` to make sure you ahve the latest changes.

### Direct
Push changes to main branch to trigger CI/CD pipeline and push changes to live server.
```
git push
```
**Please make sure that you have done thorough testing and switched out any test urls and that the code is ready to go live before pushing to the main, since whatever you have pushed to main, will be deployed. As a sanity check, run ```npm start``` from root to see if API starts without errors.** 

### Branches
Create a local branch, commit your code there, do local testing, open PR on github, do code review and resolve conflicts if any, merge with main branch.

```
git checkout -b new_branch
git add .
git commit -m "Commit message"
git push origin new_branch
```
This will create a new local branch with the name "branch_name", add all changes in current directory to staging, commit those and push the branch to the remote repo.
**Again when you are doing local testing, before you submit code for review and open a PR make sure that the code doesn't introduce breaking changes. As a sanity check, run ```npm start``` from root to see if API starts without errors.** 

You can then use GitHub GUI to figure out conflicts and discuss the code and finally merge with main. This triggers the CI/CD pipeline and code gets pushed to live server.

When using branching as a strategy to introduce changes to the API, you may need to do ```git pull -r origin branch_name``` to get latest changes about "branch_name". Making sure that you have the latest changes before you further your development helps ensure that there are minimal conflicts while merging.

## File Structure
```
│   .gitignore
│   .gitmodules
│   config.js
│   Dockerfile
│   index.js
│   package-lock.json
│   package.json
│   stacksville-db.sql
│
├───constants
│   ├───certificates
│   │       private.key
│   │       public.crt
│   │
│   ├───helpers
│   │   └───typescript
│   │           kafka_plans.ts
│   │           provider.ts
│   │           regions.ts
│   │
│   ├───kafka
│   │   │   providers.json
│   │   │
│   │   ├───aws
│   │   │       plans.json
│   │   │       regions.json
│   │   │
│   │   └───linode
│   │           plans.json
│   │           regions.json
│   │
│   └───metrics
│       │   map.json
│       │
│       └───samples
│               example.json
│               example2.json
│               prometheus_sample.json
│
├───controller
│   └───kafka
│           clusterController.js
│           redirectionController.js
│
├───Kafka
│   │   consumer.js
│   │
│   ├───cluster
│   │       infrastructure.js
│   │       provision.js
│   │
│   └───validation
│           validation.js
│
├───middleware
│       auth.js
│
├───models
│       kafka_cluster.js
│
├───routes
│   └───kafka
│           cluster.js
│           redirection.js
└───utils
        database.js
```
- constants
  
    Submodule that maintains the constants required for frontend and APIs catering to frontend.
- controller
  
    Has code and functions that responds to requests coming into specific routes maintained in routes.js.
    - kafka
        - This is the only service we support, so all functions related to Kafka specific needs are present under this subdirectory.
        - In the future when new services are added that API supports, create new subdirectories and factor the code such that each subdirectory maintains code specific to one service.
        - e.g. Directory might look like this
        ```
        ├───controller
        │   └───kafka
        │           clusterController.js
        │           redirectionController.js
        │   └───mysql
        │           clusterController.js
        ```
        - ```clusterController.js``` will generally have functions related to cluster - updating, manipulating, getting etc.
        - ```redirectionController.js``` has functions to redirect requests aimed at CARI API to authenticate requets, provide a stable single entry point to CARI and attach required headers for CORS headers
- middleware/auth.js

  All requests pass through middleware. The auth token is verified here by decrypting with private key available from the constants subdirectory.

  For added security, the ```user_id``` and ```account_id``` available after decrypting the token, is verified against the database to make sure they exist in the platform. We can choose to remove that later on after carefully considering the cost and benifits.
  
  #### Future Work
  As per discussions, the private key would need to change to accomodate platform-wide JST. The key might also be password protected, hence we need to research and look at how we can do the verification, if the current library supports this flow or if we need to look at some otehr solution.
  
- models/kafka_cluster.js

  All database queries related to kafka clusters that Analytics performs are maintained here.
  
- Kafka

    Has the actual consumer class code required for Analytics to act as a consumer to I.K., that is instantiated at ```index.js```. **Uses ```kafkajs``` library**.
        
    #### Future work
    Currently, when errors occur, we do a console log and move on to the next message. We do not commit the offset however. In the future we would want to have some kind of logging to ensure that errors are properly logged and handled. We would also want some kind of notification system to notify us when such an error occurs.

- utils/database.js
  
  Has the code to configure and connect to database. This section is triggered everytime the API starts.

- Dockerfile
  
  CI/CD sets up the docker image through this, it essentially sets up the VM and configures it so that the API runs in the environment. The steps are the commands you would generally run on a new VM to set up the API in a production environment. Some parts of it is specific to how Dockerfiles are written.


- stacksville-db.sql
  This SQL file has the table schema exactly similar to Stacksville database and can be used to reinitialize the same structure. In case we need to export structure and data from database we can do so using MySQL workbench. Go to ```server > data export``` and export the data as required. Choose self-contained dump to ensure that you get the required material in a .sql file.

## Modifying API

### Adding a route
- Create the function that handles request in a file under ```controller```
- Add a route under a file in ```routes``` and make sure the main controller is imported in it, so that you can use the function

  e.g. 
  ```
  router.get("/route", auth, controller.serve_metrics);
  ```
    - Change the function call to ```router.post```, ```router.put``` according to your needs.
    - this route would be available in ```base_url_of_API/route
    - auth, will ensure that all request in this route are authenticated by middleware
    - controller.function is the function that is triggered when a request is autheticated and is handled by API. This function has to be written available in a file under ```controller```.

### Adding Queries
 - Add a function under ```module.exports``` of ```models/kafka_clusters.js``` that will be triggered and will perform the query.
  
  e.g.
  ```
  create_kafka_cluster: async (kafka_info) => {
        try {
            return db.query(
                `INSERT INTO KafkaClusters SET id = '${kafka_info.cluster_uuid}', cluster_label ='${kafka_info.cluster_label}', user_id = '${kafka_info.user_id}', account_id = '${kafka_info.account_id}', cloud_provider ='${kafka_info.cloud_provider}', number_of_instances = ${kafka_info.number_of_instances}, size = '${kafka_info.size}', tier = '${kafka_info.tier}', cluster_type ='${kafka_info.cluster_type}', region = '${kafka_info.region}', status = '${kafka_info.status}', whitelisted_ip = '${kafka_info.whitelisted_ip}'`
            );
        }
        catch(error) {
            console.error(error);
            return null;
        }
    },
```

**return null** if there was an error performing the query or if the function "effectively" fails - maybe for all practical purposes, if you run the query but database has no changes, then something went wrong and the function failed. I have returned null for these cases too.
    
- Import and use the function in controller.
    
    e.g.
    ```
    const {create_kafka_cluster} =  require("../../models/kafka_cluster");
    
    ...
    
    result = await create_kafka_cluster();
    ```
    
### Updating metrics to display to Stackmanager
Code has been written to make it as dynamic as possible. Just add a key value pair to ```constants/metrics/map.json``` where the key is the graph title we want to show on stackmanager and value is the corresponding metric-name for prometheus, i.e. the metric that we query on prometheus server.

Implementation can be found in file ```controller/kafka/clusterController.js``` in function ```serve_metrics```.

### Modifying the kafka consumer
Implementation under ```Kafka``` folder in root.

This section generally connects to the DB to update it with changes to Kafka Cluster records - a cluster may be created, deleted or brokers may be added to it, IP addresses may get whitelisted etc. It also handles transient events and updates the database on the status of an operation ongoing currently (if any).
- ```consumer.js``` 
    - Sets up the consumer, configures it and defines functions for utilizing it.
    - Topics are mentioned in ```async initialize``` function.
        - Provide topic name that you want to consume from in the list of topics as a string. ```fromBeginning``` signifies the offset from which the consumer should start consuming messages from upon startup. See Kafka documentation for more info.
        ```await this.consumer.subscribe({ topics: ["provision", "deploy", "test_build", "build_status"], fromBeginning: fromBeginning });```
    - ```async consume``` parses each message and triggers appropriate functions depending on what it needs to do.
        - Functions are triggered to handle messages coming into the different topics. Implementation will become clear when you have a clear understanding of the events that are coming in and the structure they have. [View here](https://docs.google.com/document/d/1dEne-ABN92KQDrw3Sci5Zous61SPTxYCUl2lzSBsi0w/edit#heading=h.2t8gmtkljbr6)
        
- ```cluster/provision.js``` & ```cluster/infrastructure.js```
    - Maintains functions to handle events, depending on topic and action.
- ```validation/validation.js```
    - Maintains the ```Joi``` schemas to ensure that events recieved are in expected structure.

### Adding a new node library
```npm install library```
Adds the library to package.json and package-lock.json.
