const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const db = require("quick.db");

const Ayarlar = require("../../Settings/Ayarlar.json").Kayıt;

module.exports = {
    Name: "warn",
    Aliases: ["uyar"],
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
        if(!Ayarlar.Yetkiler.some(e => message.member.roles.cache.some(c => c.id == e)) && !message.member.hasPermission("ADMINISTRATOR")) return;
        let members = await message.guild.members.fetch();
        if(!args[0]) return message.channel.send("bir şeyler eksik");
        let target = message.mentions.members.first() || members.get(args[0]);
        if(!target) return;
        if(message.member.roles.highest.position <= target.roles.highest.position) return message.channel.send("**:x: Bunu yapmak için yeterli yetkiye sahip değilsin.**");
        let reason = args.splice(1).join(" ") || "Sebep belirtilmedi.";
        if(target.roles.cache.some(e => e.id == "700277617827250256")) target.roles.add("700277581143867463").catch(err => {});
        else target.roles.add("700277617827250256").catch(err => {});
        let data = db.push(`sicil.${target.id}`, {
            Zaman: Date.now(),
            Sebep: "[UYARI]" + reason,
            Yetkili: message.author.id
        })[target.id];
        message.channel.send(new MessageEmbed()
        .setTitle("<a:tik:706565777171415161> " + message.guild.name)
        .setThumbnail(message.guild.iconURL({dynamic: true}))
        .setDescription("Bir üyenin **sicil** kaydına bakmak istiyorsan `!sicil` yazabilirsin. Eğer herhangi bir sicil kaydı yoksa oldukça temiz ve iyi bir insandır.")
        .addField(`Uyarı Bilgileri`, `<a:tik2:706565631251841074> **Yetkili:** ${message.author} \n <a:tik2:706565631251841074> **Kişi:** ${target} \n :x: **Sebep:** ${reason}`, true)
        .addField(`Sicil Bilgisi`, `${target} üyesinin toplam ${data.Sicil.length || 0} sicili bulunmakta.`, true)
        .setFooter("Sicillerin hakkında bilgi edinmek istiyorsan !sicil komutunu kullanabilirsin.")
        .setAuthor(message.author.username, message.author.avatarURL({dynamic: true})));
    }
};