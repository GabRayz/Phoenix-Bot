const express = require("express");
let router = express.Router();
let app = express();
var path = require("path");
let config = {};
config = require("../config.json");

router.get("/mp3/:file", (req, res) => {
    res.sendFile(path.join(__dirname, `../public/${req.params.file}.mp3`));
});

router.get("/mp4/:file", (req, res) => {
    res.sendFile(path.join(__dirname, `../public/${req.params.file}.mp4`));
});

console.log("starting http");

app.use("/", router);

app.listen(config.downloadPort);
