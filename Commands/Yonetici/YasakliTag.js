const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const db = require("quick.db");
const ydb = new db.table("yetkili");

module.exports = {
  Name: "yasakliTag",
  Aliases: ["yasaklitag","ytag"],
  Usage: "yasakliTag",
  Description: "Yasaklı tag eklemek için bu komutu kullan.",
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
	  if(!message.member.hasPermission("ADMINISTRATOR")) return;
	  if(!args[0]) return;
	  let seçim = args[0];
	  if(seçim == "liste"){
		  let taglar = db.get("yasakliTaglar") || [];
		  
		  return message.channel.send(new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL({dynamic: true})).setColor("RANDOM").setFooter("Alosha was here").setDescription(`Sunucu içerisinde aşağıdaki sembolleri isminde barındıran tüm herkes cezalı rolüne düşecektir. \n\n ${taglar.join(", ") || "*Hiçbir sembol yasaklı değil.*"}`));
	  }
	  let taglar = db.get("yasakliTaglar") || [];
	  let tag = args.join(" ");
	  if(taglar.includes(tag)) taglar = taglar.filter(ta => ta != tag);
	  else
		  taglar.push(tag);
	  db.set("yasakliTaglar", taglar);
	  message.channel.send(new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL({dynamic: true})).setColor("RANDOM").setFooter("Alosha was here").setDescription(`Sunucu içerisinde aşağıdaki sembolleri isminde barındıran tüm herkes cezalı rolüne düşecektir. \n\n ${taglar.join(", ") || "*Hiçbir sembol yasaklı değil.*"}`));
	  
	  let members = message.guild.members.cache.filter(member => member.user.username.includes(tag));
	  members.array().forEach((member, index) => {
		  setTimeout(() => {
		  member.roles.remove(member.roles.cache.filter(e => e.editable));
		  member.roles.add(client.Ayarlar.Jail.Roller);
		  }, index * 1500)
	  })
  },
};