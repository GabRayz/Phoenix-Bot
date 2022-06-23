// Import packages
const Discord = require('discord.js');
require('./src/http');
const fs = require('fs');
const Phoenix = require('./src/Phoenix');

RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const phoenix = new Phoenix();

phoenix.loadConfig().then(async () => {
    await phoenix.login();
});

module.exports = phoenix;

// Import commands
const Command = require('./commands/command');

function searchPermissions(command, message) {
    for (let name of Object.keys(Phoenix.config.permissions)) {
        if (name == command.name) {
            let perm = Phoenix.config.permissions[name];
            console.log(perm);
            return checkPermissions(perm, message);
        }
    };
    let perm = Phoenix.config.permissions.default;
    return checkPermissions(perm, message);
}

async function checkPermissions(perm, message) {
    let member = await GetGuildMember(message.author);
    let role = member.highestRole;
    // check blacklists
    if(perm.roles.blacklist.length > 0 && perm.roles.blacklist.includes(role.name)) {
        return false;
    }
    if(perm.channels.blacklist.length > 0 && perm.channels.blacklist.includes(message.channel.id)) {
        return false;
    }
    if(perm.members.blacklist.includes(message.author.tag)) {
        return false;
    }

    // check whitelists
    if(perm.roles.whitelist.length > 0 && !perm.roles.whitelist.includes(role.name)) {
        return false;
    }
    if(perm.channels.whitelist.length > 0 && !perm.channels.whitelist.includes(message.channel.id)) {
        return false;
    }
    if(perm.members.whitelist.length > 0 && !perm.members.whitelist.includes(message.author.tag)) {
        return false;
    }

    return true;
}

function PermissionDenied(msg) {
    console.log('Permission denied');
    msg.reply("Patouche");
    // msg.react('');
}

function checkIfUpdated()
{
    fs.access('temoin', fs.constants.F_OK, (err) => {
        if (!err) {
            fs.unlink('temoin', () => {
                Command.Update.readVersion().then(version => {
                    if (Phoenix.config.updateAlert == "true") {
                        let embed = new Discord.MessageEmbed();
                        embed.setTitle('Phoenix a été mis à jour.')
                        .setDescription('v' + version)
                        .setColor('ORANGE')
                        .setThumbnail(Phoenix.bot.user.avatarURL)
                        .setFooter({text: 'Codé par GabRay'});
                        
                        Phoenix.botChannel.send({embeds: [embed]}).catch(err => {
                            if (err.message == 'Missing Permissions') {
                                Phoenix.botChannel.send('Erreur, mes permissions sont insuffisantes :(');
                            }else if (err)
                                console.error(err);
                        })
                    }
                }).catch(err, console.error(err));
            });
        }
    })
}
//
// Command.Update.autoUpdate(Phoenix);
// setInterval(() => {
//     if (Phoenix.activities == 0) {
//         Command.Update.autoUpdate(Phoenix);
//     }
// }, 30 * 1000)
