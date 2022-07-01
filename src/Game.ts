import EventEmitter from "events";

export default class Game extends EventEmitter {
    static gameName: string;
    static alias = [];

    /**
     * Unique identifier of the game.
     */
    gameId: any;
    /**
     * The discord text channel the game is taking place in.
     */
    channel: any;
    /**
     * List of players playing the game.
     */
    players: any[] = [];
    /**
     * Wether the game has started.
     */
    isPlaying = false;
    phoenix: any = null;

    constructor(message, gameId, phoenix) {
        super();
        this.phoenix = phoenix;
        this.gameId = gameId;
        this.channel = message.channel;
        this.players = [];
        this.players.push({
            tag: message.author.tag,
            username:
                message.member.nickname == null
                    ? message.author.username
                    : message.member.nickname,
        });
        this.isPlaying = false;
    }
}
