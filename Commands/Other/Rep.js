const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const db = require("quick.db");
const moment = require("moment");
const durationformat = require("moment-duration-format");

const ms = require("ms");
module.exports = {
    Name: "taktir",
    Aliases: ["takdir"],
    Usage: "istatistik [mesaj/sesli]",
    Description: "İstatistikleri açmanızı/kapamanızı sağlar..",
    GuildOnly: true,
    Category: "Moderation",
    /**
     * @param {Client} client This is client letiable.
     */
    onLoad: async function (client) {

    },
    /**
     * @param {Client} client This is client letiable.
     * @param {Message} message This is Discord Message letiable.
     * @param {Array<String>} args Message arguments.
     * @param {Guild} guild
     */
    onRequest: async function (client, message, args, guild) {
        let user = message.mentions.members.first() || (args.join(" ") ? message.guild.members.cache.filter(e => e.user.username.includes(args.join(" "))).first() : undefined);
        if (!user) return;
		if(user.id == message.author.id) return;
        let data = db.get("imza." + message.author.id);
        let durum = false;
        if (!data) {
            let obj = {
                Rep: 0,
                RepDate: Date.now()
            };
            db.set("imza." + message.author.id, obj);
            data = obj;
            durum = true;
        }
        if(!data.RepDate){
            db.set("imza." + message.author.id + ".RepDate", Date.now());
            durum = true;
        }
        if(durum || ((Date.now() - data.RepDate) / (1000 * 60 * 60 *24) >= 1)){
            db.add("imza." + user.id + ".Rep", 1);
            db.set("imza." + message.author.id + ".RepDate", Date.now());
            message.channel.send(`🐦 **${message.author}, ${user} kişisini takdir etti!** :tada:`);
        }
        else{
            message.channel.send(`:x: **${message.author}, günde sadece bir tane kişiyi takdir edebilirsin!**`).then(e => e.delete({timeout: 5000}).catch());
        }
    }
};