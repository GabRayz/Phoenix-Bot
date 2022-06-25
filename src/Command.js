class Command {
    /**
     * Name of the command. No real purpose
     */
    static name;
    /**
     * List of strings to match to call the command.
     */
    static alias = [];
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
    static call() {
        throw new Error('Function not implemented');
    }

    phoenix = null;
    guild = null;
    channel = null;

    constructor(phoenix, channel) {
        this.guild = channel.guild;
        this.phoenix = phoenix;
        this.channel = channel;
    }
}

module.exports = Command;
