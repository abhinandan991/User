const {
    create_kafka_cluster, set_kafka_status,
  } = require("../../models/kafka_cluster");
const { create_cluster_schema, status_schema, minimum_cluster_schema } = require("../validation/validation")
const { v4: uuidv4 } = require('uuid');

const tierList = {
  "s": "small",
  "m": "medium",
  "l": "large",
  "f": "trial"
}

/*
  Creates the initial cluster with payload information from create cluster request.
*/
exports.create_cluster = async (message) => {
    try {
      let { cloud_provider, region, size, cluster_label, cluster_type, number_of_instances, ips } = message.event;
      const user_id = message.meta.user_id;
      const account_id = message.meta.account_id;
      const cluster_uuid = message.meta.cluster_id;

      if (cluster_label == null) {
        cluster_label = uuidv4() + region;
      }

      /*const verification = create_cluster_schema.validate({cluster_uuid, cloud_provider, region, size, cluster_label, cluster_type, number_of_instances, account_id, user_id, ips});

      if (verification.error) {
        console.log(verification.error);
        return 0;
      }*/    

      let kafka_info = {
          cluster_uuid: cluster_uuid,
          cluster_label: cluster_label.substring(cluster_label.length - 10),
          user_id: user_id,
          account_id: account_id,
          cloud_provider: cloud_provider,
          number_of_instances: parseInt(number_of_instances),
          size: size,
          //tier: tierList[size.split["-"][2].toLowerCase()],
          cluster_type: cluster_type,
          region: region,
          status: "provisioning",
          nodes: [],
          whitelisted_ip: ips.join(",")
      };

      try {
          const response = await create_kafka_cluster(kafka_info);
          if (response === null) {
              return 0;
          }
          return 1;
      } catch (error) {
          console.log(error);
          return 0;
      }
    } catch (error) {
      console.log(error);
      return 0;
    }
};

/*
  Sets the status to a string value for a specific cluster identified by cluster_uuid.
*/
exports.set_status = async (message, status) => {
  try {
    //const account_id = message.meta.account_id;
    const cluster_uuid = message.meta.cluster_id;

    //const verification = status_schema.validate({cluster_uuid, account_id, status})
    const verification = status_schema.validate({cluster_uuid, status})

    if (verification.error) {
      console.log(verification.error);
      return 0;
    }
    //const response = await set_kafka_status(cluster_uuid, account_id, status);
    const response = await set_kafka_status(cluster_uuid, status);

    if (response === null) {
      return 0;
    }
    return 1;
  }
  catch (error) {
    console.log(error);
    return 0;
  }
}
