import config from "../../config.json" assert { type: "json" };

import Clear from "./clear.js";
import Off from "./off.js";
import Help from "./help.js";
import Link from "./link.js";
import Update from "./update.js";
import Config from "./config.js";
import Radio from "./radio.js";
import Timer from "./timer.js";

import Play from "./music/play.js";
import Playlist from "./music/playlist.js";
import Queue from "./music/queue.js";
import Resume from "./music/resume.js";
import Skip from "./music/skip.js";
import Stop from "./music/stop.js";
import Volume from "./music/volume.js";
import Pause from "./music/pause.js";
import MusicInfo from "./music/musicInfo.js";
import Download from "./music/download.js";

import ServerInfo from "./info/serverInfo.js";
import BotInfo from "./info/botInfo.js";
import UserInfo from "./info/userInfo.js";
import Avatar from "./info/avatar.js";
import RoleInfo from "./info/role.js";

import Cat from "./api/cat.js";
import Dog from "./api/dog.js";

import Power4 from "./games/power4.js";
import Hangman from "./games/hangman.js";
import Games from "./games/games.js";

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
    Avatar,
    RoleInfo,
    Cat,
    Dog,
};
export default Commands;
