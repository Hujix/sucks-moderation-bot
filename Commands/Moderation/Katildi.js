const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("ban")

module.exports = {
  Name: "yoklama",
  Aliases: ["toplanti", "yahak"],
  Usage: "ban",
  Description: "Birisini sunucudan tamamen uzaklaştırmanıza yarar.",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable.
   */
  onLoad: function (client) { },
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   * @param {Guild} guild This is a penis
   */
  onRequest: async function (client, message, args, guild) {
	  let data = client.Ayarlar.Toplantı;
  let embed = new MessageEmbed().setAuthor(message.member.displayName, message.author.avatarURL({dynamic: true})).setColor("RANDOM").setTimestamp();
  if(!message.member.roles.cache.has(data.Yetki) && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(embed.setDescription(`Yoklama komutunu kullanabilmek için herhangi bir yetkiye sahip değilsin.`)).then(x => x.delete({timeout: 5000}));
  if(!message.member.voice || message.member.voice.channelID != data.Kanal) return;
  
  let members = message.guild.members.cache.filter(member => member.roles.cache.has(data.Rol) && member.voice.channelID != data.Kanal);
  members.array().forEach((member, index) => {
    setTimeout(() => {
      member.roles.remove(data.Rol).catch();
    }, index * 1250)
  });
  let verildi = message.member.voice.channel.members.filter(member => !member.roles.cache.has(data.Rol) && !member.user.bot)
  verildi.array().forEach((member, index) => {
    setTimeout(() => {
      member.roles.add(data.Rol).catch();
    }, index * 1250)
  });
  message.channel.send(embed.setDescription(`Katıldı rolü dağıtılmaya başlandı! \n\n🟢 **Rol Verilecek:** ${verildi.size} \n🔴 **Rol Alınacak:** ${members.size}`)).catch();

  }
};
