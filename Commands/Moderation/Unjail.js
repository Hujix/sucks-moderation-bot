const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("jail")
const ms = require("ms");

const ayarlar = require("../../Settings/Ayarlar.json");
module.exports = {
  Name: "unjail",
  Aliases: [],
  Usage: "hapis @etiket @sebep",
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
	if(!ayarlar.Jail.Yetkiler.some(yetki => message.member.roles.cache.has(yetki)) && !message.member.permissions.has("ADMINISTRATOR")) return message.reply("yetkin yetmiyor!");
	let victim = message.mentions.users.first() || client.users.cache.get(args[0]) || (await client.users.fetch(args[0] || ""));
	if(!victim) return;
	if(!db.has(`jail.${victim.id}`))
		return message.reply("belirttiğin kişi zaten jail'de değil!");
	
	let member = message.guild.members.cache.get(victim.id);
	if(member){
		member.roles.set([ayarlar.Kayıt.Kayıtsız]);
		member.send(new MessageEmbed().setDescription(`**${message.guild.name}** sunucusunda yemiş olduğun **hapis** cezası ${message.author} (${message.author.tag}) tarafından kaldırıldı.`)).catch(e => {});
	}
	db.delete(`jail.${victim.id}`);
	return message.channel.send(new MessageEmbed().setDescription(`${victim} (${victim.id}) kişisinin **hapis** cezası kaldırıldı!`).setAuthor(message.author.username, message.author.avatarURL({dynamic: true})).setColor("RANDOM").setTimestamp().setThumbnail(message.guild.iconURL({dynamic: true})));
  }
};