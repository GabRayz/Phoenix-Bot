import Command from "../Command.js";

export default class Hangman extends Command {
    static commandName = "hangman";
    static alias = ["hangman", "pendu"];
    static description = "Jouons au pendu.";
    static callableFromMP = true;

    static isPlaying = false;
    static mainMsg;
    static lives = 5;
    static mystery = "";
    static found: any[] = [];
    static tested: any[] = [];
    static channel: any = null;

    author: any;

    constructor(author) {
        super(undefined, undefined);
        this.author = author;
    }

    static async call(message, phoenix) {
        if (
            message.args.length === 1 &&
            message.args[0] === "stop" &&
            this.isPlaying
        ) {
            this.stop();
        } else if (message.args.length === 1 && !this.isPlaying) {
            this.channel = message.channel;
            if (this.isWordValid(message.args[0].toUpperCase()))
                await this.start(message.args[0].toUpperCase());
            else message.reply("Pas d'accent ni espace.");
        } else if (this.isPlaying) {
            let word = message.args[0];
            if (word.length > 1)
                message.reply(
                    "Tu ne peux deviner qu'une seule lettre à la fois"
                );
            else {
                this.guess(word.toUpperCase()[0]);
            }
        } else {
            message.reply(`Usage: \`${phoenix.config.prefix}hangman <word>\``);
        }
    }

    static isWordValid(word: string) {
        return /^[A-Z]+$/.test(word);
    }

    static generateBoard(word) {
        this.mystery = word;
        for (let i = 1; i < word.length - 1; i++) this.found.push(false);
        this.found[0] = true;
        this.found[word.length - 1] = true;
    }

    static async start(word) {
        this.isPlaying = true;
        this.channel.send("**Le Jeu du Pendu**");
        this.mainMsg = await this.channel.send("La partie va commencer...");
        this.generateBoard(word);
        this.draw();
    }

    static draw() {
        let emojis = ["😃", "😅", "😕", "😫", "🤕", "💀"];
        let foundMsg = "";
        for (let i = 0; i < this.found.length; i++) {
            if (this.found[i]) foundMsg += this.mystery[i];
            else foundMsg += "_ ";
        }
        let msg =
            emojis[5 - this.lives] +
            "\nMot mystère: `" +
            foundMsg +
            "`\nLettres testées: " +
            this.arrayToString(this.tested);
        this.mainMsg.edit(msg);
    }

    static arrayToString(array) {
        let res = "";
        array.forEach((element) => {
            res += element;
        });
        return res;
    }

    static guess(letter) {
        this.applyGuess(letter);
        this.draw();
        // Check win
        if (this.found.every((val) => val === true)) {
            this.channel.send("Félicitations, tu as trouvé le mot mystère !");
            this.stop();
        } else if (this.lives === 0) {
            this.channel.send("Oh non, tu es mort !");
            this.stop();
        }
    }

    static applyGuess(letter) {
        let valid = false;
        for (let i = 0; i < this.mystery.length; i++) {
            if (this.found[i]) continue;
            if (letter === this.mystery[i]) {
                this.found[i] = true;
                valid = true;
            }
        }
        if (!valid) {
            this.lives--;
            this.tested.push(letter);
        }
    }

    static win() {
        this.stop();
    }

    static stop() {
        this.isPlaying = false;
    }
}
