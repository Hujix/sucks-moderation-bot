const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("yetkili");
const ms = require("ms");
const moment = require("moment");
const dm = require("moment-duration-format");

const Ayarlar = require("../../Settings/Ayarlar.json");


module.exports = {
  Name: "yetkiliyap",
  Aliases: ["ytyap"],
  Usage: "yetkiliyap @etiket",
  Description: "Seviyen hakkında bilgi edinirsin.",
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
   */
  onRequest: async function (client, message, args) {
	if(!Ayarlar.Yönetici.some(e => message.member.roles.cache.has(e))) return message.reply("yetkin yetmiyor.");
	let Yetkiler = client.Ayarlar.Yetkiler;
	 let victim = message.mentions.users.first() || client.users.cache.get(args[0]);
        if(!victim) return message.reply("böyle birisi yok.");
        let member = message.guild.members.cache.get(victim.id);
        if(!member) return message.reply("böyle birisi yok.");
 
        if(db.has(`yetkililer.${victim.id}`)) return message.reply("bu kişi zaten yetkili.");
        let yeniYetki = Yetkiler[0];
        member.roles.add(yeniYetki.roller);
        db.set(`yetkililer.${member.id}`, {
            owner: message.author.id,
            date: Date.now(),
            position: 0
        });
        return message.reply("etiketlediğin kişi başarılı bir şekilde yetkili yapıldı.");
  },
};