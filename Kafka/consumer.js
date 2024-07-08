const { Kafka } = require('kafkajs');
const {create_cluster, set_status} = require("./cluster/provision");
const {create_nodes, delete_cluster, start_cluster, stop_cluster, update_whitelisted_ip, resize_cluster, createClusterCredentials} = require("./cluster/infrastructure");

//A Kafka consumer class to be used across APIs to consume from internal Kafka
exports.KafkaConsumer = class {

    /* 
        Creates the Kafka consumer object and sets up necessary variables.
        brokers(String[]): Bootstrap servers to connect to Kafka
    */
    constructor(brokers) {
        this.kafka = new Kafka({
        clientId: "Analytics_primary",
        brokers: brokers,
        });
        this.consumer = this.kafka.consumer({ groupId: "Analytics" });
    }

    /*
        Initializes the consumer and subscribes to provision and deploy topics.
        fromBeginning(boolean): Determines if offset is set to earliest or latest for consumption.
    */
    async initialize(fromBeginning) {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topics: ["provision", "deploy", "test_build", "build_status"], fromBeginning: fromBeginning });
            console.log(`Consumer connected to Kafka cluster. Consuming from "provision", "deploy", "test_build" and "build_result.`)
        }
        catch (error) {
            console.log(`There was an error initiating the consumer: ${error}`)
        }
    }

    /*
        Terminates the consumer.
    */
    async terminate() {
        try {
            await this.consumer.disconnect();
            console.log(`Consumer disconnected.`)
        }
        catch(error) {
            console.log(`There was an error terminating the consumer: ${error}`)
        }
    }

    /*
        Consumes messages from Kafka and processes them.
    */
    async consume() {
        try {
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    // Text decoder to decode bytes sent
                    const td = new TextDecoder();

                    console.log(`Received action from topic ${topic} on partition ${partition}:\n ${JSON.stringify(JSON.parse(td.decode(message.value)))}`);
                    const parsedMessage = JSON.parse(td.decode(message.value));

                    if (topic === "provision") {
                        this.process_provision(parsedMessage)
                        .then((result)=>
                            {
                                if (result === 1) {
                                    this.consumer.commitOffsets([{ topic, partition, offset: message.offset }])
                                }
                                else {
                                    console.log("There was an error processing the message in provision.")
                                }
                            }
                        )
                        .catch((err)=>{
                            console.log(err)
                        })
                    }
                    else if (topic === "deploy") {
                        this.process_deploy(parsedMessage)
                        .then((result)=>
                            {
                                if (result === 1) {
                                    this.consumer.commitOffsets([{ topic, partition, offset: message.offset }])
                                }
                                else {
                                    console.log("There was an error processing the message in deploy.")
                                }
                            }
                        )
                        .catch((err)=>{
                            console.log(err)
                        })
                    }
                    else if (topic === "test_build") {
                        this.process_test(parsedMessage)
                        .then((result)=>
                            {
                                if (result === 1) {
                                    this.consumer.commitOffsets([{ topic, partition, offset: message.offset }])
                                }
                                else {
                                    console.log("There was an error processing the message in test_build.")
                                }
                            }
                        )
                        .catch((err)=>{
                            console.log(err)
                        })
                    }
                    else if (topic === "build_status") {
                        this.process_status(parsedMessage)
                        .then((result)=>
                            {
                                if (result === 1) {
                                    this.consumer.commitOffsets([{ topic, partition, offset: message.offset }])
                                }
                                else {
                                    console.log("There was an error processing the message in build_result.")
                                }
                            }
                        )
                        .catch((err)=>{
                            console.log(err)
                        })
                    }
                },
            });
        } 
        catch (error) {
            console.log(`There was an error consuming messages: ${error}`);
        }
    }

    async process_provision(message) {
        try {
            const action = message.meta.action;
            let result = 0;

            if (action === "InitKafkaCluster") {
                result = await create_cluster(message);
            }
            if (action === "InitBroker" | action === "InitIPAcl" | action === "StartCluster" | action === "StopCluster" | action === "ResizeCluster") {
                result = await set_status(message, "modifying");
            }
            if (action === "DeleteCluster") {
                result = await set_status(message, "deleting");
            }

            return result;            
        }
        catch (error) {
            console.log(`There was an error processing the message: ${error}`)
        }
    }

    async process_deploy(message) {
        try {
            const action = message.meta.action;
            let result = 0;

            result = await set_status(message, "deploying");

            if (action === "InitKafkaCluster") {
                result = await create_nodes(message, true);
            }

            return result;            
        }
        catch (error) {
            console.log(`There was an error processing the message: ${error}`)
        }
    }

    async process_test(message) {
        try {
            const action = message.meta.action;
            let result = 0;

            result = await set_status(message, "testing");

            if (action === "InitKafkaCluster") {
                result = await createClusterCredentials(message);
            }
            if (action === "AddNodes") {
                result = await create_nodes(message);
            }
            if (action === "StartCluster") {
                result = await start_cluster(message);
            }
            if (action === "UpdateIPAcl") {
                result = await update_whitelisted_ip(message);
            }
            if (action === "ResizeCluster") {
                result = await resize_cluster(message);
            }
            if (action === "StopCluster") {
                result = await stop_cluster(message);
                await set_status(message, "stopped");
            }
            if (action === "DeleteCluster") {
                result = await delete_cluster(message);
                await set_status(message, "deleted");
            }

            return result;            
        }
        catch (error) {
            console.log(`There was an error processing the message: ${error}`)
        }
    }

    async process_status(message) {
        try {
            const status = message.status;
            let result = 0;

            let status_message = {
                "meta": {
                    "cluster_id": message.cluster_id
                }
            };

            const publisher = this.statusMap.publishers[status - (status % 1000)]; // Gets 1000 * the first digit of the status, e.g. 2000 in 2201
            const stage = this.statusMap.stages[(status % 1000) - (status % 100)]; // Gets 100 * the second digit of the status, e.g. 200 in 2201
            const action = this.statusMap.actions[status % 100]; // Gets the last two digits of status, e.g. 1 in 2201

            if (stage === "failed") {
                result = await set_status(status_message, `failed ${publisher}`);
            }
            else if (stage === "passed") {
                if (publisher === "deploy" && action !== "DeleteCluster") {
                    result = await set_status(status_message, `running`);
                }
                else if (publisher === "test") {
                    result = await set_status(status_message, `tests passed`)
                }
            }
            return result;
        }
        catch (error) {
            console.log(`There was an error processing the message: ${error}`)
        }
    }

    statusMap = {
        "publishers": {
            1000: "",
            2000: "provision",
            3000: "deploy",
            4000: "test"
        },
        "stages": {
            100: "passed",
            200: "failed",
            0: "recieved"
        },
        "actions": {
            1: "InitKafkaCluster",
            2: "InitBroker",
            3: "DeleteCluster"
        }
    };
}