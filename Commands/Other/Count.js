const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const db = require("quick.db");
const ms = require("ms");
module.exports = {
  Name: "say",
  Aliases: ["count", "yoklama"],
  Usage: "istatistik [mesaj/sesli]",
  Description: "İstatistikleri açmanızı/kapamanızı sağlar..",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable.
   */
  onLoad: async function(client) {},
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   * @param {Guild} guild
   */
  onRequest: async function(client, message, args) {
	  let guild = message.guild;
	  let members = message.guild.members.cache;
      let tag = members.filter(m => m.user.username.includes(client.Ayarlar.Tag.Tag1)).size;
      let aktifUye = members.filter(m => m.presence.status != "offline").size;
      let sesteUye = message.guild.channels.cache.filter(c => c.type == "voice" && c.members.size > 0).map(c => c.members.size).reduce((a, b) => a + b, 0);
      message.channel.send(new MessageEmbed()
      .setTitle(guild.name)
      .addField(client.Ayarlar.Tag.Tag1+" Tag Üyesi", tag, true)
      .setThumbnail(message.guild.iconURL({dynamic: true}))
      .addField(":scales: Aktif Üye", aktifUye, false)
      .addField(":pushpin: Toplam Üye", members.size, false)
      .addField(":microphone: Seste Aktif", sesteUye, true))
      //.setDescription(":gem: **TAG Üye Sayısı:** " + tag + "\n :scales: **Aktif Üye Sayısı:** " + aktifUye + "\n :pushpin: **Sunucu Toplam Üye Sayısı:** " + members.size + "\n:microphone: **Seste Aktif Üye:** " + sesteUye));
  }
};