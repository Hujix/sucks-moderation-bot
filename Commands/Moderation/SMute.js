const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("mute")
const ms = require("ms");

module.exports = {
  Name: "smute",
  Aliases: [],
  Usage: "smute @etiket [süre] [istersen sebep]",
  Description: "Birisini sunucudan tamamen uzaklaştırmanıza yarar.",
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
   * @param {Guild} guild This is a penis
   */
  onRequest: async function (client, message, args) {
	  let ayarlar = client.Ayarlar.Mute;
	  if(!ayarlar.Yetkiler.some(yetki => message.member.roles.cache.has(yetki)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply("bunu yapmak için yeterli yetkiye sahip değilsin!").then(x => x.delete({timeout: 5000})).catch();
	  let victim = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
	  if(!victim) return message.reply("geçerli birisini etiketlemelisin!").then(x => x.delete({timeout: 5000}));
	  let süre = args[1] || "10m";
	  if(!süre || !ms(süre)) return message.reply("geçerli bir süre girmeyi dene!").then(x => x.delete({timeout: 5000}));
	  let reason = args.splice(2).join(" ") || "Sebep belirtilmedi";
	  if(victim.roles.highest.position > message.member.roles.highest.position) return message.reply("senden yüksek ya da aynı yetkiye sahip olan kişileri susturamazsın.").then(x => x.delete({timeout: 5000}));
	  let embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.author.username, message.author.avatarURL({dynamic: true})).setTimestamp().setFooter("Btw Alosha was here 💜");
	  if(db.has(`smute.${victim.id}`))
		  db.add(`smute.${victim.id}.sure`, ms(süre));
	  else
		db.set(`smute.${victim.id}`, {yetkili: message.author.id, reason: reason, sure: Date.now() + ms(süre)});
	  victim.roles.add(ayarlar.SMuteRol).catch();
	  if(victim.voice.channelID || victim.voice.channel) victim.voice.setMute(true).catch();
	  qdb.push(`sicil.${victim.id}`, {
            Zaman: Date.now(),
            Sebep: "[SMUTE]" + reason,
            Yetkili: message.author.id
        })
	  await victim.send(embed.setDescription(`${message.author} tarafından **${message.guild.name}** sunucusunda **${reason}** sebebiyle **sesli bir şekilde susturuldun**. \n\n *Yediğin cezanın sebepsiz olduğunu düşünüyorsan Sorun Çözme odalarına başvur.*`)).catch(e => {});
	  message.channel.send(embed.setDescription(`${victim} kişisi ${message.author} tarafından **${reason}** sebebi ile sunucudan **${süre.replace("m", " dakika ").replace("s", " saniye ").replace("h", " saat ")}** süresiyle **sesli susturuldu**.`));
	  if(ayarlar.MuteLog && client.channels.cache.has(ayarlar.MuteLog)) client.channels.cache.get(ayarlar.MuteLog).send(embed);
  }
};