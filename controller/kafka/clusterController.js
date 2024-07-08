const {
    get_cluster, get_all_kafka, update_kafka_cluster_label, update_kafka_cluster_whitelist
  } = require("../../models/kafka_cluster");
const metricsMap = require("../../constants/metrics/map.json");
const { response } = require("../..");
const {base_url, Infrastructure_API, prometheus_url} = require("../../config");

const metricsList = [
  "CPU Utilization",
  "Memory Utilization",
  "Disk I/O",
  "Disk Usage",
  "Throughput",
  "Consumer Lag",
  "Latency",
]

/*
    Returns information about cluster identified by "cluster_uuid".
*/
exports.get_cluster_data = async (req, res) => {
    try {
      const cluster_uuid = req.params.cluster_uuid;
      const account_id = req.account_id;
  
      const cluster_data = await get_cluster(cluster_uuid, account_id);
      if (cluster_data.length === 1) {
        return res.json(cluster_data[0]);
      }
      else {
        return res.json({
            success: false,
            message: "No cluster with the specified uuid found.",
            status: 500,
          });
      }
    }
    catch (error) {
      console.log(error);
      return res.json({
        success: false,
        message: "Internal server error",
        status: 500,
      });
    }
};


/*
    Returns data about all clusters for a particular account identified by "account_id".
*/
exports.get_clusters = async (req, res) => {
  try {
      const account_id = req.account_id;
      const all_cluster_data = await get_all_kafka(account_id);
      if (all_cluster_data != 0) {
          return res.json({
              success: true,
              status: 200,
              message: "Found requested data.",
              data: all_cluster_data,
          });
      } else {
          return res.json({
              success: true,
              status: 200,
              message: "No data found",
              data: []
          });
      }
  } catch (error) {
      console.log(error);
      return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      });
  }
};

function generateData(x, min, max) {
  const data = [];

  for (var i = 0; i < x.length; i++) {
    data.push([x[i], Math.floor(Math.random() * (max - min) + min)])
  }

  return data;
}

exports.serve_metrics = async (req, res) => {
  try{
    const cluster_uuid = req.params.cluster_uuid;
    const duration = req.params.duration;
    const account_id = req.account_id;

    const cluster = await get_cluster(cluster_uuid, account_id);

    if (cluster.length != 1) {
      return res.status(400).json({
        success: false,
        message: "No cluster of provided cluster_uuid exists.",
        status: 400,
      });
    }

    // Get data from kminion and node-exporter
    const axios = require('axios');

    // Get data for all metrics in metricsList.
    let promiseList = [];

    if (duration === "range") {
      const startTime = req.query.start;
      const endTime = req.query.end;

      const dayjs = require('dayjs');

      const daysDifference = dayjs(endTime).diff(dayjs(startTime), 'day');
      let step = "1m"
      if (daysDifference <= 7 && daysDifference >= 2) {
        step = "30m"
      }
      else {
        step = "2h"
      }

      Object.keys(metricsMap).forEach((metric) => 
        {
          //nodeexporter used
          const queryString = metricsMap[metric].includes("node")? 
          `${prometheus_url}/api/v1/query_range?query=${metricsMap[metric]}{job="node-exporter_${cluster_uuid}"}&start=${startTime}&end=${endTime}&step=${step}`: 
          `${prometheus_url}/api/v1/query_range?query=${metricsMap[metric]}{job="kminion_${cluster_uuid}"}&start=${startTime}&end=${endTime}&step=${step}`

          promiseList.push(axios.get(queryString)
            .then(response => response.data.data)
            .then(response => {
              let metricResult = {}
              metricResult[metric] = {}

              response.result.forEach((instanceData) => {

                const instance = instanceData.metric.instance;
                const values = instanceData.values;
                metricResult[metric][instance] = values;
              })
              return metricResult;
            })
            .catch((error) => {
              console.log(error)
              }
            )
          )
        }
      );
    }
    else {
      Object.keys(metricsMap).forEach((metric) => 
        {
          //nodeexporter used
          const queryString = metricsMap[metric].includes("node")? 
          `${prometheus_url}/api/v1/query?query=${metricsMap[metric]}{job="node-exporter_${cluster_uuid}"}[${duration}]`: 
          `${prometheus_url}/api/v1/query?query=${metricsMap[metric]}{job="kminion_${cluster_uuid}"}[${duration}]`

          promiseList.push(axios.get(queryString)
            .then(response => response.data.data)
            .then(response => {
              let metricResult = {}
              metricResult[metric] = {}

              response.result.forEach((instanceData) => {

                const instance = instanceData.metric.instance;
                const values = instanceData.values;
                metricResult[metric][instance] = values;
              })
              return metricResult;
            })
            .catch((error) => {
              }
            )
          )
        }
      );
    }

    const result = await Promise.all(promiseList)

    const returnObject = {
      "data": {}
    }
    //They return promises, so wait for them to execute.
    result.forEach((data) => {
      returnObject["data"][Object.keys(data)[0]] = Object.values(data)[0];
      return returnObject;
    })

    return res.json(returnObject);
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

exports.update_cluster = async(req, res) => {
  try {
    const account_id = req.account_id;
    const user_id = req.user_id;

    const { cluster_label, whitelisted_ip } = req.body;
    const cluster_uuid = req.params.cluster_uuid;
    
    if (cluster_label) {
      result = await update_kafka_cluster_label(cluster_uuid, account_id, cluster_label);

      if (result === null) {
        return res.json({
          success: false,
          status: 400,
          message: "Requested cluster not found.",
        });
      }
      else {
        const cluster_data = await get_cluster(cluster_uuid, account_id);
        return res.json(cluster_data[0]);
      }
    }
    else if (whitelisted_ip) {
      if (result === null) {
        return res.json({
          success: false,
          status: 400,
          message: "Requested cluster not found.",
        });
      }
      else {
        const cluster_data = await get_cluster(cluster_uuid, account_id);
        return res.json(cluster_data[0]);
      }
    }
  }
  catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      });
  }
}