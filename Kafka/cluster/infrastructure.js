const {
  create_kafka_nodes,
  delete_kafka_cluster, delete_kafka_nodes, check_cluster_exists, update_kafka_cluster_whitelist, resize_kafka_cluster, createCredentials
} = require("../../models/kafka_cluster");
const { v4: uuidv4 } = require('uuid');
const { minimum_cluster_schema, nodes_schema, whitelist_ip_schema, resize_cluster_schema } = require("../validation/validation")

/*
  Checks if a cluster with specified cluster_uuid and account_id exists in DB.
  Returns: 
    false, if cluster is not found
    cluster data, if cluster is found
*/
/*async function cluster_exists(cluster_uuid, account_id) {
  const cluster_data = await check_cluster_exists(cluster_uuid, account_id);

  if (cluster_data.length === 0) {
    return false;
  }
  else if (cluster_data.length > 1) {
    return false;
  }
  else {
    return cluster_data[0];
  }
}*/

async function cluster_exists(cluster_uuid) {
  const cluster_data = await check_cluster_exists(cluster_uuid);

  if (cluster_data.length === 0) {
    return false;
  }
  else if (cluster_data.length > 1) {
    return false;
  }
  else {
    return cluster_data[0];
  }
}

/* 
    Prepares nodes for updation of database.
    Function verifies that required and expected information is present in parameters and then returns nodes list that can be inserted in database.
*/
function prepare_nodes_create(cluster_uuid, number_of_instances, cluster_type, nodes) {
  /* //Waiting on clarification regarding the number of ip addresses available 
  if (nodes.length !== parseInt(number_of_instances) && cluster_type === "colocated") {
    console.log(`Data mismatch: Expected number of nodes not provided. Expected${number_of_instances}: Provided${nodes.length}`);
    return null;
  }
  else if (nodes.length !== (parseInt(number_of_instances)*2) && cluster_type === "dedicated") {
    console.log(`Data mismatch: Expected number of nodes not provided. Expected${parseInt(number_of_instances)*2}: Provided${nodes.length}`);
    return null;
  }*/

  /*for (const node in nodes) {
    const result = nodes_schema.validate(node.ip_address, node.type);
    if (result.error) {
      console.log(result.error);
      return null;
    }
  }*/ //The nodes data passed is just a list of strings segnifying IP addresses - not objects.

  const nodes_info = nodes.map(node => {
    return ({
      node_id: uuidv4(),
      cluster_uuid: cluster_uuid,
      ip_address: node,
      status: "Running",
      type: "broker"
    })
  })

  return nodes_info;
};

/*
  Deletes an existing cluster specified by uuid if it exists.
*/
exports.delete_cluster = async (message) => {
  try {
    const account_id = message.meta.account_id;
    const cluster_uuid = message.meta.cluster_id;

    const verification = minimum_cluster_schema.validate({cluster_uuid, account_id});

    if (verification.error) {
      console.log(verification.error);
      return 0;
    }

    const cluster = await cluster_exists(cluster_uuid, account_id);

    if (cluster) {
      try {
        const response1 = await delete_kafka_nodes(cluster_uuid);
        const response = await delete_kafka_cluster(cluster_uuid, account_id);
        if (response === null || response1 === null) {
          return 0;
        }
        return 1;
      }
      catch (error) {
        console.log(error);
        return 0;
      }
    }
    else {
      console.log("Cluster does not exist.");
      return 2;
    }
  }
  catch (error) {
    console.log(error);
    return 0;
  }
}

/*
  Adds nodes to an existing cluster identified by account_id and cluster_uuid. Nodes are passed as a list.

  Note: During initial creation of cluster, the number of instances is not 0. 
  "create_nodes" adds the length of the passed in "Nodes" parameter in the message to the number of instances in 
  of the cluster in the database. Thus, hen nodes are added for the first time , this will cause the number of instances to get doubled 
  inadvertedly. To prevent this, we pass in the initial parameter, to indicate that this is the first time nodes 
  are getting added to the cluster and trigger the function mnually with 0.
*/
exports.create_nodes = async (message, initial = false) => {
  try {
    //const { number_of_instances} = message.event;
    const { number_of_instances} = message;
    const account_id = message.meta.account_id;
    const nodes = message.meta.brokers_socket;
    const cluster_uuid = message.meta.cluster_id;

    const verification = minimum_cluster_schema.validate({cluster_uuid, account_id});

    if (verification.error) {
      console.log(verification.error);
      return 0;
    }
    
    const cluster = await cluster_exists(cluster_uuid, account_id);
    const prepared_nodes = prepare_nodes_create(cluster_uuid, number_of_instances, cluster.cluster_type, nodes);

    /*if (initial) {
      try {
        const response = await create_kafka_nodes(prepared_nodes, 0, cluster.cluster_type);
        if (response === null) {
          return 0;
        }
        return 1;
      } catch (error) {
        console.log(error);
        return 0;
      }
    }*/

    if (cluster) {
      try {
        const response = await create_kafka_nodes(prepared_nodes, cluster.number_of_instances, cluster.cluster_type);
        if (response === null) {
          return 0;
        }
        return 1;
      } catch (error) {
        console.log(error);
        return 0;
      }
    }
    else {
      console.log("Cluster does not exist.");
      return 2;
    }
  }
  catch (error) {
    console.log(error);
    return 0;
  }
}

exports.start_cluster = async(message) => {
  try {
    const account_id = message.meta.account_id;
    const cluster_uuid = message.meta.cluster_id;

    const verification = minimum_cluster_schema({cluster_uuid, account_id});
    if (verification.error) {
      console.log(verification.error);
      return 0;
    }

    return 1;
  }
  catch (error) {
    console.log(error);
    return 0;
  }
}

exports.stop_cluster = async(message) => {
  try {
    const account_id = message.meta.account_id;
    const cluster_uuid = message.meta.cluster_id;

    const verification = minimum_cluster_schema({cluster_uuid, account_id});
    if (verification.error) {
      console.log(verification.error);
      return 0;
    }

    return 1;
  }
  catch (error) {
    console.log(error);
    return 0;
  }
}

exports.update_whitelisted_ip = async (message) => {
  try {
    const { whitelisted_ip } = message.event;
    const account_id = message.meta.account_id;
    const cluster_uuid = message.meta.cluster_id;

    const verification = whitelist_ip_schema({cluster_uuid, account_id, whitelisted_ip});
    if (verification.error) {
      console.log(verification.error);
      return 0;
    }

    const cluster = await cluster_exists(cluster_uuid, account_id);
    if (cluster) {
      try {
        const response = await update_kafka_cluster_whitelist(cluster_uuid, account_id, whitelisted_ip.toString());
        if (response === null) {
          return 0;
        }
        return 1;
      } catch (error) {
        console.log(error);
        return 0;
      }
    }
    else {
      console.log("Cluster does not exist.");
      return 2;
    }
  }
  catch (error) {
    console.log(error);
    return 0;
  }
}

exports.resize_cluster = async (message) => {
  try {
    const { size } = message.event;
    const account_id = message.meta.account_id;
    const cluster_uuid = message.meta.cluster_id;

    const verification = resize_cluster_schema.validate({cluster_uuid, account_id, size});
    if (verification.error) {
      console.log(verification.error);
      return 0;
    }

    const cluster = await cluster_exists(cluster_uuid, account_id);
    if (cluster) {
      try {
        const response = await resize_kafka_cluster(cluster_uuid, account_id, size);
        if (response === null) {
          return 0;
        }
        return 1;
      } catch (error) {
        console.log(error);
        return 0;
      }
    }
    else {
      console.log("Cluster does not exist.");
      return 2;
    }
  }
  catch (error) {
    console.log(error);
    return 0;
  }
}

exports.createClusterCredentials = async (message) => {
  try {
    const { kafka_user_id, kafka_pwd, /*account_id,*/ cluster_id } = message.meta;

    /*const verification = minimum_cluster_schema({cluster_id, account_id});
    if (verification.error) {
      console.log(verification.error);
      return 0;
    }*/

    //const cluster = await cluster_exists(cluster_id, account_id);
    const cluster = await cluster_exists(cluster_id);

    if (cluster) {
      result = await createCredentials(kafka_user_id, kafka_pwd, cluster_id, account_id);
      if (result == null) {
        return 0;
      }
      else {
        return 1;
      }
    }
    else {
      console.log("Cluster does not exist.");
      return 2;
    }
  }
  catch (error) {
    console.log(error);
    return 0;
  }
}