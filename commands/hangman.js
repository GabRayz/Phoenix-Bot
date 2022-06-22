let Command = require('../src/Command');
let Phoenix = require('../index');

module.exports = class Hangman extends Command {
    constructor(author) {
        super();
        this.author = author;
    }
    static name = 'hangman';
    static alias = [
        "hangman",
        "pendu"
    ];
    static description = "Jouons au pendu.";
    static callableFromMP = true;

    static isPlaying = false;
    static mainMsg;
    static lifes = 5;
    static mystery = "";
    static found = [];
    static tested = [];
    static channel = null;

    static async call(message, Phoenix) {
        if (message.args.length === 1 && message.args[0] === 'stop' && this.isPlaying) {
            this.stop()
        }
        else if (message.args.length === 1 && !this.isPlaying) {
            this.channel = message.channel;
            if (this.isWordValid(message.args[0].toUpperCase()))
                this.start(message.args[0].toUpperCase());
            else
                message.reply("Pas d'accent ni espace.");
        }
        else if (this.isPlaying)
        {
            let word = message.args[0];
            if (word.length > 1)
                message.reply("Tu ne peux deviner qu'une seule lettre à la fois")
            else {
                let win = this.playGuess(word.toUpperCase()[0]);
                this.draw();
                if (win) {
                    this.channel.send("Félicitations, tu as trouvé le mot mystère !")
                    this.stop();
                }
            }
        }
    }

    static isWordValid(word) {
        for (const element of word) {
            if (!element >= 'A' && element <= 'Z')
                return false;
        }
        return true;
    }

    static generateBoard(word) {
        this.mystery = word;
        for (let i = 1; i < word.length - 1; i++)
            this.found.push(false);
        this.found[0] = true;
        this.found[word.length - 1] = true;
    }

    static async start(word) {
        this.isPlaying = true;
        this.channel.send('**Le Jeu du Pendu**');
        this.mainMsg = await this.channel.send('La partie va commencer...');
        this.generateBoard(word);
        this.draw();
    }

    static draw() {
        let emojis = ['😃', '😅', '😕', '😫', '🤕', '💀'];
        let foundMsg = "";
        for (let i = 0; i < this.found.length; i++) {
            if (this.found[i])
                foundMsg += this.mystery[i];
            else
                foundMsg += '_ ';
        }
        let msg = emojis[5 - this.lifes] + '\nMot mystère: `' + foundMsg + '`\nLettres testées: ' + this.arrayToString(this.tested);
        this.mainMsg.edit(msg);
    }

    static arrayToString(array) {
        let res = "";
        array.forEach(element => {
            res += element;
        });
        return res;
    }

    static playGuess(letter) {
        for (let i = 0; i < this.mystery.length; i++) {
            if (this.found[i])
                continue;
            if (letter === this.mystery[i])
                this.found[i] = true;
        }

        // Check if finish
        return this.found.every(val => val === true);
    }

    static win()
    {
        this.stop();
    }

    static stop() {
        this.isPlaying = false;
    }
}
