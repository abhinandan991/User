const express = require("express");
const controler = require("../../controller/kafka/redirectionController");
const auth = require("../../middleware/auth");

const router = express.Router();

router.post("/create", auth, controler.create_cluster);

router.delete("/delete", auth, controler.delete_cluster);

router.get("/test", controler.test)

module.exports = router;  