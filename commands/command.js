let Config = {};
Config = require("../config.json");

module.exports.Clear = require("./clear");
module.exports.Off = require("./off");
module.exports.Pause = require("./pause");
module.exports.Play = require("./play");
module.exports.Playlist = require("./playlist");
module.exports.Queue = require("./queue");
module.exports.Resume = require("./resume");
module.exports.Skip = require("./skip");
module.exports.Stop = require("./stop");
module.exports.Volume = require("./volume");
module.exports.Help = require("./help");
module.exports.Link = require("./link");
module.exports.MusicInfo = require("./musicInfo");
module.exports.Download = require("./download");
module.exports.Update = require("./update");
module.exports.Config = require("./config");
module.exports.Power4 = require("./power4");
module.exports.Hangman = require("./hangman");
module.exports.Games = require("./games");
module.exports.Radio = require("./radio");
module.exports.Timer = require("./timer");

module.exports.Cat = require("./api/cat");
module.exports.Dog = require("./api/dog");
