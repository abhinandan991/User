const express = require("express");
const bodyParser = require("body-parser");
const kafka_cluster = require("./routes/kafka/cluster");
const reach_CARI = require("./routes/kafka/redirection");
const app = express();
const cors = require("cors");
const http = require("http");
const {KafkaConsumer} = require("./Kafka/consumer");
const {bootstrap_servers} = require("./config");

app.use(cors());
// app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));
app.use(bodyParser.json());

app.use("/kafka/clusters", kafka_cluster);

app.use("/kafka/clusters/redirection", reach_CARI);

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*", "http://localhost:8000", {
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
    return res.status(200).end();
  } else {
    return res.send({ success: "0", message: "Analytics API is live. Connections may be established!" });
  }
});

app.listen(9000, async function () {
  console.log("Analytics API is running on port 80");
  const brokers = bootstrap_servers;
  const consumer = new KafkaConsumer(brokers);

  await consumer.initialize(fromBeginning = false);
  await consumer.consume();

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    try {
      await consumer.terminate();
      console.log('Kafka consumer stopped.');
    } catch (error) {
      console.log('Error stopping Kafka consumer:', error);
    }
    process.exit(0);
  });
});

module.exports = app;
