const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const db = require("quick.db");
const moment = require("moment");
const durationformat = require("moment-duration-format");
moment.locale("tr");
const ms = require("ms");
module.exports = {
    Name: "afk",
    Aliases: [],
    Usage: "istatistik [mesaj/sesli]",
    Description: "İstatistikleri açmanızı/kapamanızı sağlar..",
    GuildOnly: true,
    Category: "Moderation",
    /**
     * @param {Client} client This is client letiable.
     */
    onLoad: async function (client) {
  client.on("message", (message) => {
    if(message.author.bot || message.content.startsWith(client.Configuration.Prefix) || message.channel.type != "text") return;
    
    if(!db.has(`afk.${message.author.id}`)){
      if(message.mentions.users.size > 0){
      let victim = message.mentions.users.first();
      if(!victim) return;
      if(db.has(`afk.${victim.id}`)){
          let data = db.get(`afk.${victim.id}`);
          message.reply(`etiketlediğin kişi **${data.sebep}** sebebiyle uzakta. - **${moment(data.sure).from(Date.now())}**`).then(x => x.delete({timeout: 7000})).catch();
        }
      }
      return;
    }
    if(message.member.manageable)
	    message.member.setNickname(`${message.member.displayName.replace("[AFK]", "")}`).catch();
    message.reply(`artık **AFK** değilsin!`).then(x => x.delete({timeout: 2000})).catch();
    db.delete(`afk.${message.author.id}`);
  });
    },
    /**
     * @param {Client} client This is client letiable.
     * @param {Message} message This is Discord Message letiable.
     * @param {Array<String>} args Message arguments.
     * @param {Guild} guild
     */
    onRequest: async function (client, message, args, guild) {
  let reason = args.join(" ") || "-";
  if(badWords.some(e => reason.toLowerCase().includes(e))) return;
  db.set(`afk.${message.author.id}`, {
    sure: Date.now(),
    sebep: reason
  });
  if(!message.member.displayName.includes("[AFK]") && message.member.manageable)
    message.member.setNickname(`[AFK]${message.member.displayName}`).catch();
  return message.reply(`artık **uzakta modundasın** ve seni etiketleyen herkes **${reason}** mesajı alacak.`).then(x => x.delete({timeout: 5000})).catch();

    }
};
const badWords = ["discord.gg", "https", "http", "invite", "j4j", ".com"];