const Joi = require('joi');

exports.create_cluster_schema = Joi.alternatives({
    cluster_uuid: Joi.string().guid().required("Cluster uuid is required."),
    cloud_provider: Joi.string().valid("linode", "AWS").required("Cloud provider is required."),
    region: Joi.string().required("Region is required."),
    size: Joi.string().required("Size is required."),
    cluster_label: Joi.string().required("Please provide a unique cluster label."),
    cluster_type: Joi.string().valid("colocated", "dedicated"),
    number_of_instances: Joi.number().required("Please provide a valid number of instances to be provisioned."),
    account_id: Joi.string().guid().required("Please provide an account id."),
    user_id: Joi.string().guid().required("Please provide an user id."),
    ips: Joi.array().items(Joi.string()).optional()
})

exports.status_schema = Joi.alternatives({
    cluster_uuid: Joi.string().guid().required("Cluster uuid is required."),
    //account_id: Joi.string().guid().required("Please provide an account id."),
    status: Joi.string().required("Please provide a status."),
})

exports.minimum_cluster_schema = Joi.alternatives({
    cluster_uuid: Joi.string().guid().required("Cluster uuid is required."),
    account_id: Joi.string().guid().required("Please provide an account id."),
})

exports.nodes_schema = Joi.alternatives({
    ip_address: Joi.string().empty().required("Please provide thw ip address of the node."),
    type: Joi.string().empty().required("Please provide node type - broker/zookeeper/colocated"),
})

exports.whitelist_ip_schema = Joi.alternatives({
    cluster_uuid: Joi.string().guid().required("Cluster uuid is required."),
    account_id: Joi.string().guid().required("Please provide an account id."),
    whitelisted_ip: Joi.array().items(Joi.string()).required("Please provide the IP address to be whitelisted.")
})

exports.resize_cluster_schema = Joi.alternatives({
    cluster_uuid: Joi.string().guid().required("Cluster uuid is required."),
    account_id: Joi.string().guid().required("Please provide an account id."),
    size: Joi.string().valid("SV-Linode-S-3-1-1-75", "SV-Linode-S-3-1-2-150", "SV-Linode-M-3-2-4-240", "SV-Linode-M-3-4-8-480", "SV-Linode-M-3-8-16-960", "SV-Linode-M-3-16-32-1920", "SV-Linode-L-6-4-8-960", "SV-Linode-L-6-8-16-1920", "SV-Linode-L-6-16-32-3840", "SV-Linode-L-9-4-8-960", "SV-Linode-L-9-8-16-1920", "SV-Linode-L-9-16-32-3840").required("Please provide a valid size to resize kafka cluster to.")
})