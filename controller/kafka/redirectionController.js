const {base_url, Infrastructure_API, prometheus_url} = require("../../config");

exports.create_cluster = async (req, res) => {
    console.log("\nRedirection mssg recieved\n");
    res.setHeader("Access-Control-Allow-Origin", "*", {
      reconnect: true,
    });
    res.header("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Accept, X-Custom-Header,Authorization"
    );
    res.setHeader("Content-Type", "text/plain");
  
    if (req.method === "OPTIONS") {
      console.log("\nSent back OPTIONS headers\n");
      return res.status(200).end();
    } else {
      console.log("\nSending POST request\n");
  
      const axios = require('axios');
      await axios.post(`${Infrastructure_API}/api/v1/kafka/clusters`, req.body, req.headers)
      .then(response => {
        console.log("\nRecieved response\n");
        console.log(response);
  
        res.status(response.status).json(response)
      })
      .catch((error) => {
        console.log("\nError\n");
        console.log("Error: " + error);
  
        res.status(503).json({
          success: false,
          detail: {msg: error.message},
          status: 503,
        })
      })
    }
}

exports.delete_cluster = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*", {
        reconnect: true,
    });
    res.header("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
    res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Accept, X-Custom-Header,Authorization"
    );
    res.setHeader("Content-Type", "text/plain");

    if (req.method === "OPTIONS") {
        console.log("\nSent back OPTIONS headers\n");
        return res.status(200).end();
      } else {
        console.log("\nSending DELETE request\n");
    
        const axios = require('axios');
        await axios.delete(`${Infrastructure_API}/api/v1/kafka/clusters`, req.body, req.headers)
        .then(response => {
          console.log("\nRecieved response\n");
          console.log(response);
    
          res.status(response.status).json(response)
        })
        .catch((error) => {
          console.log("\nError\n");
          console.log("Error: " + error);
    
          res.status(503).json({
            success: false,
            detail: {msg: error.message},
            status: 503,
          })
        })
      }
}

exports.test = (req, res) => {
    console.log("\nRedirection mssg recieved\n");
    res.setHeader("Access-Control-Allow-Origin", "*", {
      reconnect: true,
    });
    res.header("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Accept, X-Custom-Header,Authorization"
    );
    res.setHeader("Content-Type", "text/plain");
  
    if (req.method === "OPTIONS") {
      console.log("\nSent back OPTIONS headers\n");
      return res.status(200).end();
    } else {
      console.log("\nSending POST request\n");
  
      const axios = require('axios');
      axios({
        method: "get",
        url: `${Infrastructure_API}/docs`, 
        headers: req.headers, 
        body: req.body
      })
      .then(response => {
        console.log(response)
        return response.body.json()
      })
      .then(response => {
        console.log("\nRecieved response\n");
        console.log(response);
  
        res.status(response.status).json(response)
      })
      .catch((error) => {
        console.log("\nError\n");
        console.log("Error: " + error);
  
        res.status(503).json({
          success: false,
          detail: {msg: error.message},
          status: 503,
        })
      })
    }
  }