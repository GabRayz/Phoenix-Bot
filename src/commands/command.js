import config from "../../config.json" assert { type: "json" };

import Clear from "./clear.js";
import Off from "./off.js";
import Pause from "./pause.js";
import Play from "./play.js";
import Playlist from "./playlist.js";
import Queue from "./queue.js";
import Resume from "./resume.js";
import Skip from "./skip.js";
import Stop from "./stop.js";
import Volume from "./volume.js";
import Help from "./help.js";
import Link from "./link.js";
import MusicInfo from "./musicInfo.js";
import Download from "./download.js";
import Update from "./update.js";
import Config from "./config.js";
import Power4 from "./power4.js";
import Hangman from "./hangman.js";
import Games from "./games.js";
import Radio from "./radio.js";
import Timer from "./timer.js";

import ServerInfo from "./info/serverInfo.js";
import BotInfo from "./info/botInfo.js";
import UserInfo from "./info/userInfo.js";

import Cat from "./api/cat.js";
import Dog from "./api/dog.js";

const Commands = {
    Clear,
    Off,
    Pause,
    Play,
    Playlist,
    Queue,
    Resume,
    Skip,
    Stop,
    Volume,
    Help,
    Link,
    MusicInfo,
    Download,
    Update,
    Config,
    Power4,
    Hangman,
    Games,
    Radio,
    Timer,
    ServerInfo,
    BotInfo,
    UserInfo,
    Cat,
    Dog,
};
export default Commands;
