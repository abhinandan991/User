const express = require("express");
const clusterController = require("../../controller/kafka/clusterController");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/", auth, clusterController.get_clusters);

router.get("/:cluster_uuid", auth, clusterController.get_cluster_data);

router.get("/:cluster_uuid/metrics/:duration", auth, clusterController.serve_metrics);

router.put("/:cluster_uuid/update", auth, clusterController.update_cluster);

module.exports = router;  