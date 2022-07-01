import express from "express";
import path from "path";

const router = express.Router();
const app = express();

import config from "../config.json" assert { type: "json" };

router.get("/mp3/:file", (req, res) => {
    res.sendFile(path.join(__dirname, `../public/${req.params.file}.mp3`));
});

router.get("/mp4/:file", (req, res) => {
    res.sendFile(path.join(__dirname, `../public/${req.params.file}.mp4`));
});

console.log("starting http");

app.use("/", router);

app.listen(config.downloadPort);
