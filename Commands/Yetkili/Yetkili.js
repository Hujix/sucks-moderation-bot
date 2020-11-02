const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("yetkili");
const idb = new qdb.table("istatistik");
const ms = require("ms");
const moment = require("moment");
const dm = require("moment-duration-format");
function numberWithCommas(x) {
	if(!x) return "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports = {
  Name: "yetkili",
  Aliases: [],
  Usage: "yetkili @etiket",
  Description: "Seviyen hakkında bilgi edinirsin.",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable.
   */
  onLoad: async function (client) {
	  client.on("guildMemberRemove", (member) => {
		  if(db.has("yetkililer."+member.id)){
			  db.delete("yetkililer."+member.id);
		  }
      });
      
  },
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   */
  onRequest: async function (client, message, args) {
	let Yetkiler = client.Ayarlar.Yetkiler;
	let IAyarlar = client.Ayarlar.IAyarlar;
    let victim = message.mentions.users.first() || client.users.cache.get(args[0]);
    if(!victim) return message.reply("böyle birisi yok.");
    let member = message.guild.members.cache.get(victim.id);
    if(!member) return message.reply("böyle birisi sunucuda yok.");
    if(!db.has(`yetkililer.${victim.id}`)) return message.reply("etiketlediğin kişi yetkili değil.");
    let embed = new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL({dynamic: true})).setThumbnail(message.guild.iconURL({dynamic: true})); // 70 - 40 - 30
    embed.addField(`Kullanıcı Bilgisi`, `Joined On: \`${member ? member.joinedAt.toTurkishFormatDate("MM dd, yyyy"): "Bilinmiyor."}\` \n Created On: \`${victim.createdAt.toTurkishFormatDate("MM dd, yyyy")}\` \n User ID: \`${message.member.id}\``)
    let yetkili = db.get(`yetkililer.${victim.id}`);
    embed.addField(`Yetkili Bilgisi`, `Alınma Tarihi: ${new Date(yetkili.date).toTurkishFormatDate()} \n\n __Yetki Pozisyonu__: ${message.guild.roles.cache.has(Yetkiler[yetkili.position].id) ? message.guild.roles.cache.get(Yetkiler[yetkili.position].id) : ""} [${yetkili.position}] \n __Yönetici__: <@${yetkili.owner}>`);
        let raw = idb.get(`raw`) || {day: 1, lastDay: Date.now() + (1000 * 60 * 60 * 24)};
        let explodeData = idb.get(`stats.voice.members`) || {};
        let messageData = idb.get(`stats.text.members`) || {};
        let mostVoice = undefined;
        if(explodeData && explodeData[raw.day] && messageData[raw.day][victim.id])
            mostVoice = Object.keys(explodeData[raw.day][victim.id] || {}).filter(a=> messageData[raw.day][victim.id][a]).sort((a,b) => explodeData[raw.day][victim.id][b] - explodeData[raw.day][victim.id][a])[0];    
        let mostText = undefined;
        if(explodeData && messageData[raw.day] && messageData[raw.day][victim.id])
            mostText = Object.keys(messageData[raw.day][victim.id] || {}).filter(a=> messageData[raw.day][victim.id][a]).sort((a,b) => messageData[raw.day][victim.id][b] - messageData[raw.day][victim.id][a])[0];    
        embed.addField(`Most Active Channels`, `**   ** ${mostText == undefined ? "" : `Message: ${client.channels.cache.has(mostText) ? client.channels.cache.get(mostText) : "#deleted-channel"}: \`${numberWithCommas(messageData[raw.day][message.author.id][mostText])} message\``} \n ${mostVoice == undefined ? "" : `Voice: ${client.channels.cache.has(mostVoice) ? client.channels.cache.get(mostVoice).name : "#deleted-channel"}: \`${moment.duration(explodeData[raw.day][message.author.id][mostVoice]).format("H [hours,] m [minutes]")}\``}`)
        let voiceinday = 0, voiceinweek = 0, voiceintwoweek = 0;
        if(explodeData){
            if(explodeData[raw.day] && explodeData[raw.day][victim.id]) voiceinday = Object.values(explodeData[raw.day][victim.id]).reduce((x, y) => x+y, 0);
            Object.keys(explodeData).forEach(key => {
                let day = Number(key);
                if(day <= 7 && explodeData[key] && explodeData[key][victim.id]) voiceinweek += Object.values(explodeData[key][victim.id]).reduce((x, y) => x + y, 0);
                if(day <= 14 && explodeData[key] && explodeData[key][victim.id]) voiceintwoweek += Object.values(explodeData[key][victim.id]).reduce((x, y) => x + y, 0);
            });
            embed.addField(`Voice`, `__14 Days__: \`${moment.duration(voiceintwoweek).format("H [hours,] m [minutes]")}\` \n 7 Days: \`${moment.duration(voiceinweek).format("H [hours,] m [minutes]")}\` \n 24 Hours: \`${moment.duration(voiceinday).format("H [hours,] m [minutes]")}\``, true)
        }
        let textinday = 0, textinweek = 0, textintwoweek = 0, mostChannel;
        if(messageData){
            if(messageData[raw.day] && messageData[raw.day][victim.id]) textinday = Object.values(messageData[raw.day][victim.id]).reduce((x, y) => x+y, 0);
            Object.keys(messageData).forEach(key => {
                let day = Number(key);
                if(day <= 7 && messageData[key] && messageData[key][victim.id]) textinweek += Object.values(messageData[key][victim.id]).reduce((x, y) => x + y, 0);
                if(day <= 14 && messageData[key] && messageData[key][victim.id]) textintwoweek += Object.values(messageData[key][victim.id]).reduce((x, y) => x + y, 0);
            });
            embed.addField(`Message`, `__14 Days__: \`${(numberWithCommas(textintwoweek))}\` \n 7 Days: \`${(numberWithCommas(textinweek))}\` \n 24 Hours: \`${(numberWithCommas(textinday))}\``, true);
        }
    let msg = await message.channel.send(embed).then(async msg => {
        return msg;
    });
    if(!IAyarlar.Yönetici.some(e => message.member.roles.cache.has(e))) return;
    msg.react("⬆️");
    msg.react("⬇️");
    msg.react("❌");
    msg.react("🔴");
    let collector = msg.createReactionCollector((reaction, user) => user.id == message.author.id, {time: 120000 });
    collector.on("collect", async(reaction, user) => {
        if(reaction.emoji.name == "⬆️"){
            if(!Yetkiler[yetkili.position + 1]) return;
            let eskiYetki = Yetkiler[yetkili.position];
            let yeniYetki = Yetkiler[yetkili.position + 1];
            yetkili.position += 1;
            			
			await member.roles.remove(Yetkiler.filter(e => e != yeniYetki).map(e => e.roller.join(",")).join(",").split(",")).catch()
            await member.roles.add(yeniYetki.roller).catch();
            db.add(`yetkililer.${victim.id}.position`, 1)

            embed.fields[1].value = `Alınma Tarihi: ${new Date(yetkili.date).toTurkishFormatDate()} \n\n __Yetki Pozisyonu__: ${message.guild.roles.cache.has(Yetkiler[yetkili.position].id) ? message.guild.roles.cache.get(Yetkiler[yetkili.position].id) : ""} [${yetkili.position}] \n __Yönetici__: <@${yetkili.owner}>`
            msg.edit(embed);
        } else if(reaction.emoji.name == "⬇️"){
            if(!Yetkiler[yetkili.position - 1]) return;
            let eskiYetki = Yetkiler[yetkili.position];
            let yeniYetki = Yetkiler[yetkili.position - 1];
            yetkili.position -= 1;
			await member.roles.remove(Yetkiler.filter(e => e != yeniYetki).map(e => e.roller.join(",")).join(",").split(",")).catch()
            await member.roles.add(yeniYetki.roller).catch();
            db.subtract(`yetkiler.${victim.id}.position`, 1)
            embed.fields[1].value = `Alınma Tarihi: ${new Date(yetkili.date).toTurkishFormatDate()} \n\n __Yetki Pozisyonu__: ${message.guild.roles.cache.has(Yetkiler[yetkili.position].id) ? message.guild.roles.cache.get(Yetkiler[yetkili.position].id) : ""} [${yetkili.position}] \n __Yönetici__: <@${yetkili.owner}>`
            msg.edit(embed);
        } else if(reaction.emoji.name == "❌"){
            msg.delete().catch();
            collector.stop();
        } else if(reaction.emoji.name == "🔴"){
            let eskiYetki = Yetkiler[yetkili.position];
            let eskiYetkininOlmadigiRoller = message.member.roles.cache.filter(role => !eskiYetki.roller.includes(role.id)).map(e => e.id);
            member.roles.set(eskiYetkininOlmadigiRoller).catch();
            db.delete(`yetkililer.${victim.id}`);
            collector.stop();
        }
    });
  },
};