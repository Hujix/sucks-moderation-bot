const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("jail")
const ms = require("ms");

module.exports = {
  Name: "jail",
  Aliases: ["thapis"],
  Usage: "jail @etiket @sebep",
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
	let ayarlar = client.Ayarlar.Jail;
	if(!ayarlar.Yetkiler.some(yetki => message.member.roles.cache.has(yetki)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply("yetkin yetmiyor!");
	let victim = message.mentions.users.first() || client.users.cache.get(args[0]) || (await client.users.fetch(args[0] || ""));
	if(!victim) return;
	let reason = args.splice(1).join(" ") || "sebep belirtilmedi";
	if(db.has(`jail.${victim.id}`))
		return message.reply("belirttiğin kişi zaten cezalı!");
	let member = message.guild.members.cache.get(victim.id);
	let embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.author.username, message.author.avatarURL({dynamic: true})).setTimestamp().setFooter("Btw Alosha was here 💜");
	if(member){
		member.roles.set(ayarlar.Roller);
		member.send(embed.setDescription(`**${message.guild.name}** sunucusunda **${reason}** sebebiyle **cezalıya** atıldın.`)).catch(er => {});
	}
	db.set(`jail.${victim.id}`, true);
	qdb.push(`sicil.${victim.id}`, {
            Zaman: Date.now(),
            Sebep: "[JAIL] " + reason,
            Yetkili: message.author.id
        })
	message.channel.send(embed.setDescription(`${victim} kişisi ${message.author} tarafından **${reason}** sebebi ile sunucuda **cezalandırıldı** ve cezalı rolüne atıldı.`));
	if(ayarlar.Log && client.channels.cache.has(ayarlar.Log))client.channels.cache.get(ayarlar.Log).send(embed);
  }
};