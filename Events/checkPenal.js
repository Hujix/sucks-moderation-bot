const { User, MessageEmbed } = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("mute");

const Ayarlar = require("../Settings/Ayarlar.json");

module.exports = {
  Event: "ready",
  Active: true,
  onLoad: function(client) {},
  onRequest: async function() {
	  setInterval(() => {
		  let guild = global.client.guilds.cache.get(Ayarlar.Sunucu);
		  if(!guild) return;
		  let data = db.get(`smute`) || {};
		  let silinecekAdamlar = Object.keys(data).filter(member => Date.now() >= data[member].sure);
		  silinecekAdamlar.forEach(id => {
				let member = guild.members.cache.get(id);
				if(!member) return db.delete(`smute.${id}`);
				db.delete(`smute.${id}`);
				member.roles.remove(Ayarlar.Mute.SMuteRol).catch();
				if(member.voice.channel) member.voice.setMute(false).catch();
				
				member.send(new MessageEmbed().setDescription(`**${guild.name}** sunucusunda **sesli susturman** kalktı. İyi eğlenceler dilerim.`).setFooter("Alosha was here 💜").setColor("RANDOM")).catch(er => {});
		  });
		  let data2 = db.get(`mute`) || {};
		  silinecekAdamlar = Object.keys(data2).filter(member => Date.now() >= data2[member].sure);
		  silinecekAdamlar.forEach(id => {
				let member = guild.members.cache.get(id);
				if(!member) return db.delete(`mute.${id}`);
				member.roles.remove(Ayarlar.Mute.MuteRol).catch();
				db.delete(`mute.${id}`)
				member.send(new MessageEmbed().setDescription(`**${guild.name}** sunucusunda **susturman** kalktı, iyi eğlenceler dilerim.`).setFooter("Alosha was here 💜").setColor("RANDOM")).catch(er => {});
		  });



	  }, 5000);
  }
};
