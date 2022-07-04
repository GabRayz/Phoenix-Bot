import express from "express";
import path from "path";
import logger from "./logger";

const router = express.Router();
const app = express();

import config from "../config.json" assert { type: "json" };

router.get("/mp3/:file", (req, res) => {
    const filename: string = req.params.file;
    if (!filename.match(/\d{6}/)) {
        res.send('Invalid video');
        return;
    }
    res.sendFile(path.resolve(`./public/${req.params.file}.mp3`));
});

router.get("/mp4/:file", (req, res) => {
    const filename: string = req.params.file;
    if (!filename.match(/\d{6}/)) {
        res.send('Invalid video');
        return;
    }
    res.sendFile(path.resolve(`./public/${req.params.file}.mp4`));
});

logger.info("Starting http server", { label: "HTTP" });

app.use("/", router);

app.listen(config.downloadPort);
