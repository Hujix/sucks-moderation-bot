const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("istatistik");
const mdb = new qdb.table("level");
const moment = require("moment");
const dura = require("moment-duration-format");
const ms = require("ms");
function numberWithCommas(x) {
	if(!x) return x;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports = {
  Name: "me",
  Aliases: ["i", "profile", "profil"],
  Usage: "istatistik [mesaj/sesli]",
  Description: "İstatistikleri açmanızı/kapamanızı sağlar..",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable.
   */
    onLoad: async function (client) {
        const sesli = new Map();
        client.on("voiceStateUpdate", (oldState, newState) => {
            if (oldState.member && oldState.member.user.bot) return;
            if (!oldState.channelID && newState.channelID) {
                return sesli.set(oldState.id, {
                    channel: newState.channelID,
                    duration: Date.now()
                });
            }
            if (!sesli.has(oldState.id)) sesli.set(oldState.id, { channel: (oldState.channelID || newState.channelID), duration: Date.now() });

            let data = sesli.get(oldState.id);
            let duration = Date.now() - data.duration;
            if (oldState.channelID && !newState.channelID) {
                voiceInit(oldState.id, data.channel, duration);
                return sesli.delete(oldState.id);
            } else if (oldState.channelID && newState.channelID) {
                voiceInit(oldState.id, data.channel, duration);
                sesli.set(oldState.id, {
                    channel: newState.channelID,
                    duration: Date.now()
                });
            }
        })

function voiceInit(memberId, channelId, duraction){
     let raw = db.get(`raw`) || {day: 1, lastDay: Date.now() + (1000 * 60 * 60 * 24)};
     if(Date.now() >= raw.lastDay) raw = db.set(`raw`, {day: raw.day + 1, lastDay: Date.now() + (1000 * 60 * 60 * 24)});
     db.add(`stats.voice.members.${raw.day}.${memberId}.${channelId}`, duraction);
     db.add(`stats.voice.channels.${raw.day}.${channelId}`, duraction);
}

client.on("message", (message) => {
    if(message.author.bot || message.content.startsWith(client.Configuration.Prefix)) return;
    let raw = db.get(`raw`) || {day: 1, lastDay: Date.now() + (1000 * 60 * 60 * 24)};
    if(Date.now() >= raw.lastDay) raw = db.set(`raw`, {day: raw.day + 1, lastDay: Date.now() + (1000 * 60 * 60 * 24)});
    db.add(`stats.text.members.${raw.day}.${message.member.id}.${message.channel.id}`, 1);
    db.add(`stats.text.channels.${raw.day}.${message.channel.id}`, 1);
});
  },
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   * @param {Guild} guild
   */
  onRequest: async function (client, message, args, guild) {
        let date = Date.now();
	    let victim = message.author;
        let member = message.guild.members.cache.get(victim.id);
		let profile = qdb.get("profil." + victim.id);
		if (!profile)
            profile = qdb.set("profil." + victim.id, { Aciklama: "Açıklama belirtmedin...", Renk: "#ffffff", Rozetler: [] });
        let imza = qdb.get("imza." + victim.id);
        let embed = new MessageEmbed().setColor("#35b349").setThumbnail(victim.avatarURL({dynamic: true})).setDescription(`${message.guild.name} sunucusunda ${victim} için son __14 günlük__ kullanıcı aktiflik verileri. \n Bu verilerin kayıt olma şekli Türkiye saati ile yapılmaktadır.`);
        embed.addField(`Kullanıcı Bilgisi`, `Katılma Zamanı: \`${member ? member.joinedAt.toTurkishFormatDate("MM dd, yyyy"): "Bilinmiyor."}\` \n Oluşturulma: \`${victim.createdAt.toTurkishFormatDate("MM dd, yyyy")}\` \n Kullanıcı ID: \`${message.member.id}\``)
		let raw = db.get(`raw`) || {day: 1, lastDay: Date.now() + (1000 * 60 * 60 * 24)};
        let voiceData = db.get(`stats.voice.members`) || {};
        let messageData = db.get(`stats.text.members`) || {};
        let mostVoice = undefined;
        if(voiceData && voiceData[raw.day] && messageData[raw.day][victim.id])
            mostVoice = Object.keys(voiceData[raw.day][victim.id] || {}).filter(a=> messageData[raw.day][victim.id][a]).sort((a,b) => voiceData[raw.day][victim.id][b] - voiceData[raw.day][victim.id][a])[0];    
        let mostText = undefined;
        if(voiceData && messageData[raw.day] && messageData[raw.day][victim.id])
            mostText = Object.keys(messageData[raw.day][victim.id] || {}).filter(a=> messageData[raw.day][victim.id][a]).sort((a,b) => messageData[raw.day][victim.id][b] - messageData[raw.day][victim.id][a])[0];    
        embed.addField(`Son Aktif Kanalları`, `**   ** ${mostText == undefined ? "" : `Mesaj: ${client.channels.cache.has(mostText) ? client.channels.cache.get(mostText) : "#deleted-channel"}: \`${numberWithCommas(messageData[raw.day][message.author.id][mostText])} mesaj\``} \n ${mostVoice == undefined ? "" : `Sesli: ${client.channels.cache.has(mostVoice) ? client.channels.cache.get(mostVoice).name : "#deleted-channel"}: \`${moment.duration(voiceData[raw.day][message.author.id][mostVoice]).format("H [saat,] m [dakika]")}\``}`)
        let voiceinday = 0, voiceinweek = 0, voiceintwoweek = 0;
        if(voiceData){
            if(voiceData[raw.day] && voiceData[raw.day][victim.id]) voiceinday = Object.values(voiceData[raw.day][victim.id]).reduce((x, y) => Number(x) + Number(y), 0);
            Object.keys(voiceData).forEach(key => {
                let day = Number(key);
                if(day <= 7 && voiceData[key] && voiceData[key][victim.id]) voiceinweek += Object.values(voiceData[key][victim.id]).reduce((x, y) => Number(x) + Number(y), 0);
                if(day <= 14 && voiceData[key] && voiceData[key][victim.id]) voiceintwoweek += Object.values(voiceData[key][victim.id]).reduce((x, y) => Number(x) + Number(y), 0);
            });
            embed.addField(`Sesli`, `__14 Gün__: \`${moment.duration(voiceintwoweek).format("H [saat,] m [dakika]")}\` \n 7 Gün: \`${moment.duration(voiceinweek).format("H [saat,] m [dakika]")}\` \n 24 Saat: \`${moment.duration(voiceinday).format("H [saat,] m [dakika]")}\``, true)
        }
        let textinday = 0, textinweek = 0, textintwoweek = 0, mostChannel;
        if(messageData){
            if(messageData[raw.day] && messageData[raw.day][victim.id]) textinday = Object.values(messageData[raw.day][victim.id]).reduce((x, y) => x+y, 0);
            Object.keys(messageData).forEach(key => {
                let day = Number(key);
                if(day <= 7 && messageData[key] && messageData[key][victim.id]) textinweek += Object.values(messageData[key][victim.id]).reduce((x, y) => Number(x) + Number(y), 0);
                if(day <= 14 && messageData[key] && messageData[key][victim.id]) textintwoweek += Object.values(messageData[key][victim.id]).reduce((x, y) => Number(x) + Number(y), 0);
            });
            embed.addField(`Mesaj`, `__14 Gün__: \`${(numberWithCommas(textintwoweek))} mesaj\` \n 7 Gün: \`${(numberWithCommas(textinweek))} mesaj\` \n 24 Saat: \`${(numberWithCommas(textinday))} mesaj\``, true);
        }
        if (imza) embed.setFooter(`Profil ${imza} takdire sahip! - ${Date.now() - date / 1000} saniye sürdü -`);
        return message.channel.send(embed);
  }
};