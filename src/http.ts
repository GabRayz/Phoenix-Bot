import express from "express";
import path from "path";
import logger from "./logger";

const router = express.Router();
const app = express();

import config from "../config.json" assert { type: "json" };

router.get("/mp3/:file", (req, res) => {
    res.sendFile(path.join(__dirname, `../public/${req.params.file}.mp3`));
});

router.get("/mp4/:file", (req, res) => {
    res.sendFile(path.join(__dirname, `../public/${req.params.file}.mp4`));
});

logger.info("Starting http server", { label: "HTTP" });

app.use("/", router);

app.listen(config.downloadPort);
