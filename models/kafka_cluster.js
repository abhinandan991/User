const db = require("../utils/database");

module.exports = {
    /*check_cluster_exists: async(cluster_uuid, account_id)  => {
        return db.query("SELECT * FROM KafkaClusters WHERE id=? AND account_id=?", [cluster_uuid, account_id]);
    },*/

    check_cluster_exists: async(cluster_uuid)  => {
        return db.query("SELECT * FROM KafkaClusters WHERE id=?", [cluster_uuid]);
    },

    get_cluster: async(cluster_uuid, account_id) => {
        const cluster_info = await db.query("SELECT * FROM KafkaClusters WHERE id=? AND account_id=?", [cluster_uuid, account_id]);
        const node_info = await db.query("SELECT * FROM Nodes where cluster_uuid = ?", [cluster_uuid]);
        if (cluster_info.length === 1) {
            cluster_info[0].nodes = node_info;
        }
        return cluster_info;
    },

    get_all_kafka: async(account_id) => {
        return db.query(
            "SELECT * FROM KafkaClusters WHERE account_id = ?", [account_id]
        );
    },

    create_kafka_cluster: async (kafka_info) => {
        try {
            return db.query(
                `INSERT INTO KafkaClusters SET id = '${kafka_info.cluster_uuid}', cluster_label ='${kafka_info.cluster_label}', user_id = '${kafka_info.user_id}', account_id = '${kafka_info.account_id}', cloud_provider ='${kafka_info.cloud_provider}', number_of_instances = ${kafka_info.number_of_instances}, size = '${kafka_info.size}', tier = '${kafka_info.tier}', cluster_type ='${kafka_info.cluster_type}', region = '${kafka_info.region}', status = '${kafka_info.status}', whitelisted_ip = '${kafka_info.whitelisted_ip}'`
            );
        }
        catch(error) {
            console.error(error);
            return null;
            throw new Error("Error adding new Kafka cluster");
        }
    },

    createCredentials: async (user_id, pswd, account_id, cluster_id) => {
        try {
            return db.query(`UPDATE KafkaClusters SET username = ?, password = ? WHERE id = ? AND account_id = ? `, [user_id, pswd, cluster_id, account_id])
        }
        catch (error) {
            console.log(error);
            return null;
        }
    },

    create_kafka_nodes: async (nodes, initial_number_of_nodes, cluster_type) => {
        try {
            const insertPromises = nodes.map(node => {
                return db.query(
                    `INSERT INTO Nodes SET id = '${node.node_id}', cluster_uuid ='${node.cluster_uuid}', ip_address = '${node.ip_address}', node_status = '${node.status}', type ='${node.type}'`
                );
            });
            const results = await Promise.all(insertPromises);
            /*let updated_number_of_instances;
            if (cluster_type === "dedicated") {
                updated_number_of_instances = initial_number_of_nodes + (nodes.length/2);
            }
            else {
                updated_number_of_instances = initial_number_of_nodes + nodes.length;
            }*/
            try {
                /*await db.query(
                    `UPDATE KafkaClusters SET number_of_instances = ? WHERE id = ?`,
                    [updated_number_of_instances, nodes[0].cluster_uuid]
                );*/
                return results;
            } catch (updateError) {
                console.error(updateError);
                return null;
                throw new Error("Error updating number of instances of Kafka Cluster");
            }
        } 
        catch (error) {
            console.error(error);
            return null;
            throw new Error("Error adding nodes to Kafka cluster.");
        }
    },

    delete_kafka_cluster: async (cluster_uuid, account_id) => {
        try {
            return db.query(
                `DELETE FROM KafkaClusters WHERE id = ? AND account_id = ?`, [cluster_uuid, account_id]
            );
        }
        catch (error) {
            console.error(error);
            return null;
            throw new Error(`Error deleting cluster: ${cluster_uuid}`);
        }
    },

    delete_kafka_nodes: async (cluster_uuid) => {
        try {
            return db.query(
                `DELETE FROM Nodes WHERE cluster_uuid = ?`, [cluster_uuid]
            );
        } 
        catch (error) {
            console.error(error);
            return null;
            throw new Error("Error deleting nodes.");
        }
    },

    set_kafka_status: async (cluster_uuid, status) => {
        try {
            /*const result = await db.query(
                `UPDATE KafkaClusters SET status = ? WHERE id = ? AND account_id = ? `, [status, cluster_uuid, account_id]
            );*/
            const result = await db.query(
                `UPDATE KafkaClusters SET status = ? WHERE id = ? `, [status, cluster_uuid]
            );

            if (result.affectedRows === 0) {
                return null;
            }
            else {
                return result;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    },

    update_kafka_cluster_label: async (cluster_uuid, account_id, cluster_label) => {
        try {
            const result = await db.query(
                `UPDATE KafkaClusters SET cluster_label = ? WHERE id = ? AND account_id = ? `, [cluster_label, cluster_uuid, account_id]
            );

            if (result.affectedRows === 0) {
                return null;
            }
            else {
                return result;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    },

    update_kafka_cluster_whitelist: async (cluster_uuid, account_id, whitelisted_ip) => {
        try {
            const result = await db.query(
                `UPDATE KafkaClusters SET whitelisted_ip = ? WHERE id = ? AND account_id = ? `, [whitelisted_ip, cluster_uuid, account_id]
            );

            if (result.affectedRows === 0) {
                return null;
            }
            else {
                return result;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    },

    resize_kafka_cluster: async (cluster_uuid, account_id, size) => {
        try {
            const result = await db.query(
                `UPDATE KafkaClusters SET size = ? WHERE id = ? AND account_id = ? `, [size, cluster_uuid, account_id]
            );

            if (result.affectedRows === 0) {
                return null;
            }
            else {
                return result;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
};