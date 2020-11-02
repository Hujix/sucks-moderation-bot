const { User, MessageEmbed } = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("mute");

const Ayarlar = require("../Settings/Ayarlar.json");

module.exports = {
  Event: "voiceStateUpdate",
  Active: true,
  onLoad: function(client) {},
  onRequest: async function(oldState, newState) {
    if(!oldState.channel && newState.channel || oldState.channel && newState.channel){
        let member = newState.member;
        if(!member || (oldState.member.bot || newState.member.bot || undefined)) return;
        if(db.has(`smute.${member.id}`)){
            let data = db.get(`smute.${member.id}`);
            if(Date.now() >= data.sure){
                if(member.voice.channel) member.voice.setMute(false).catch();
                db.delete(`smute.${member.id}`);
                member.roles.remove(client.Ayarlar.Mute.SMuteRol).catch();
            }
            else if(member.voice.channel && member.voice.serverMute){
                member.voice.setMute(true).catch();
            }
        }
    }
  }
};
