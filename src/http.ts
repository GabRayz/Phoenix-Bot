import express from "express";
import path from "path";

const router = express.Router();
const app = express();
app.disable("x-powered-by");

import config from "../config.json" assert { type: "json" };

router.get("/mp3/:file", (req, res) => {
    const filename: string = req.params.file;
    if (!filename.match(/\d{6}/)) {
        res.send('Invalid video');
        return;
    }
    res.sendFile(path.join(__dirname, `../public/${filename}.mp3`));
});

router.get("/mp4/:file", (req, res) => {
    const filename: string = req.params.file;
    if (!filename.match(/\d{6}/)) {
        res.send('Invalid video');
        return;
    }
    res.sendFile(path.join(__dirname, `../public/${filename}.mp4`));
});

console.log("starting http");

app.use("/", router);

app.listen(config.downloadPort);
