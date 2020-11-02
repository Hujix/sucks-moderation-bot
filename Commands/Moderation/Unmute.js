const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("mute")
const ms = require("ms");

const ayarlar = require("../../Settings/Ayarlar.json").Mute;

module.exports = {
  Name: "unmute",
  Aliases: [],
  Usage: "unmute @etiket",
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
	if(!ayarlar.Yetkiler.some(yetki => message.member.roles.cache.has(yetki)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply("yetkin yetmiyor!");
	let victim = message.mentions.users.first() || client.users.cache.get(args[0]) || (await client.users.fetch(args[0] || ""));
	if(!victim) return;
	let checkMute = db.has(`mute.${victim.id}`);
	let checkSMute = db.has(`smute.${victim.id}`);
	if(!checkMute && !checkSMute)
		return message.reply("belirttiğin kişi zaten **susturulmamış**!").then(x => x.delete({timeout: 5000}));
	
	let member = message.guild.members.cache.get(victim.id);
	if(member){
		if(checkMute)
			member.roles.remove(ayarlar.MuteRol).catch();
		if(checkSMute){
			member.roles.remove(ayarlar.SMuteRol).catch();
			if(member.voice.channelID) member.voice.setMute(false).catch();
		}
		member.send(new MessageEmbed().setDescription(`**${message.guild.name}** sunucusunda yemiş olduğun **susturma** cezası ${message.author} (${message.author.tag}) tarafından kaldırıldı.`)).catch(e => {});
	}
	if(checkMute)
		db.delete(`mute.${victim.id}`);
	if(checkSMute)
		db.delete(`smute.${victim.id}`)
	let embed = new MessageEmbed().setDescription(`${victim} (${victim.id}) kişisinin **susturma** \`Sesli: ${checkSMute} Yazılı: ${checkMute}\` cezası ${message.author} tarafından kaldırıldı!`).setFooter("Tekrar görüşmemek dileğiyle 💜 Alosha").setAuthor(message.author.username, message.author.avatarURL({dynamic: true})).setColor("RANDOM").setTimestamp().setThumbnail(message.guild.iconURL({dynamic: true}));
	message.channel.send(embed);
	if(ayarlar.MuteLog && client.channels.cache.has(ayarlar.MuteLog)) client.channels.cache.get(ayarlar.MuteLog).send(embed);
  }
};