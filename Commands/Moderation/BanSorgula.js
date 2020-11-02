const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const db = require("quick.db");
const ms = require("ms");
module.exports = {
  Name: "bansorgula",
  Aliases: [],
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
  if(!message.member.hasPermission('BAN_MEMBERS')) return message.reply('Bu komutu kullanabilmek için `Üyeleri Yasakla` iznine sahip olmalısın!');
  if(!args[0] || isNaN(args[0])) return message.reply(`Geçerli bir ban yemiş kullanıcı ID'si belirtmelisin!`);
  try {
    message.guild.fetchBan(args.slice(0).join(' '))
    .then(({ user, reason }) => message.channel.send(new discord.MessageEmbed().setAuthor(user.tag, user.avatarURL).setColor('RANDOM').addField('Banlanan Kullanıcı', `${user.tag} \`(${user.id})\``).setDescription(`**Ban Sebebi:** ${reason}`)))
  } catch(err) { message.reply('**Belirtilen ID numarasına sahip banlanmış kullanıcı bulamadım veya bir sorun oluştu!**') }
  }
};