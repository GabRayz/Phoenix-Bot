import Command from "../Command";

export default class Example extends Command {
    static commandName = "example";
    static alias = ["example", "expl"];
    static description = "Example for creating a command";

    static async call(message, Phoenix) {
        // Code . . .
    }
}
