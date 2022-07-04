export default class Command {
    /**
     * Name of the command. No real purpose
     */
    static commandName: string;
    /**
     * List of strings to match to call the command.
     */
    static alias: any[] = [];
    static description = "Nettoie le chat des commandes bot";

    /**
     * Check if @command is an alias of the Command.
     * @param {*} command : The command typed by the user.
     */
    static match(command) {
        return this.alias.includes(command);
    }
    /**
     * Execute the command
     */
    static call(_message, _phoenix) {
        throw new Error("Function not implemented");
    }

    phoenix: any = null;
    guild: any = null;
    channel: any = null;

    constructor(phoenix, channel) {
        this.guild = channel.guild;
        this.phoenix = phoenix;
        this.channel = channel;
    }
}
