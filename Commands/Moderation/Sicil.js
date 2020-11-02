const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const db = require("quick.db");

module.exports = {
    Name: "sicil",
    Aliases: ["cezalarım","uyarılarım", "sicilim"],
    Usage: "uyar @etiket [sebep]",
    Description: "Bu ban kaldırma komutudur.",
    GuildOnly: true,
    Category: "Moderation",
    /**
     * @param {Client} client This is client letiable.
     */
    onLoad: async function (client) {
    },
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {Array<String>} args
     */
    onRequest: async function (client, message, args) {
		let members = message.guild.members;
        let target = message.mentions.members.first() || members.cache.get(args[0]) || message.member;
        if(!target) return;
        let data = db.get(`sicil.${target.id}`) || [];
        data = data.reverse();
        message.channel.send(new MessageEmbed()
        .setDescription(data.length <= 0 ? "*Ruhun o kadar temiz ki sana nasıl anlatsam bilemedim!*" : data.map((val, index) => `${index + 1}- ${new Date(val.Zaman).toTurkishFormatDate("dd MM yyyy HH:ii:ss")} Tarihinde **${val.Sebep}** sebebiyle <@${val.Yetkili}> tarafından.`).join("\n"))
        .addField("Kişi", `${target}`)
        .setThumbnail(message.guild.iconURL({dynamic:true}))
        .setTitle("<a:tik:706565777171415161> " + message.guild.name)
        .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
        );
    }
};