import {Message, TextBasedChannel, User} from "discord.js";

export default class CommandMessage {
    message: Message;
    command: string;
    args: string[];
    author: User;
    channel: TextBasedChannel;

    constructor(message: Message, prefix: string) {
        this.message = message;
        let msgParts = message.content.split(" ");
        this.command = msgParts[0].slice(prefix.length);
        this.args = msgParts.slice(1);
        this.author = message.author;
        this.channel = message.channel;
    }

    delete() {
        this.message.delete();
    }
}
