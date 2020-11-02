const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("level");
const ms = require("ms");
const moment = require("moment");
const dm = require("moment-duration-format");
module.exports = {
  Name: "level",
  Aliases: ["seviye"],
  Usage: "level @etiket",
  Description: "Seviyen hakkında bilgi edinirsin.",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable.
   */
  onLoad: async function (client) {
    client.on("message", async (message) => {
    if(message.author.bot) return;
      let durum = Math.floor(Math.random() * 5);
      if(durum < 2) return;
      let xp = Math.floor(Math.random() * 5);
      let currentlyData = db.get("level." + message.author.id);
      if(!currentlyData) {
        db.set("level." + message.author.id, {Level: 0, XP: 0});
        currentlyData = {
          Level: 0,
          XP: 0
        };
      }
      currentlyData.XP += xp;
      let nextLevel = this.getLevelExp(currentlyData.Level);
      if(nextLevel <= currentlyData.XP){
        currentlyData.Level++;
        currentlyData.XP = 0;
        message.channel.send(`${message.member} 🎉 **Tebrikler!** 🎊 Seviye atladın ve **${currentlyData.Level}** seviyesine ulaştın. 🎉`);
      }
      db.set("level." + message.author.id, currentlyData);
    })
  },
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   */
  onRequest: async function (client, message, args) {
    let user = message.mentions.members.first() || message.member;
    if (!user) return;
    let data = db.get("level");
    if(!data)
      data = db.set("level", {});
    let udata = data[user.id];
    if (!udata){
      udata = db.set("level." + user.id, {
        Level: 0,
        XP: 0
      });
      udata = {
        Level: 0,
        XP: 0
      };
      data[user.id] = udata;
    }
    let sır = Object.keys(data);
    let sıralama = sır.sort((a, b) => (getLevelExp(data[b].Level) + data[b].XP) - (getLevelExp(data[a].Level) + data[a].XP)).indexOf(user.id) + 1;
    message.channel.send(new MessageEmbed()
      .setDescription(`🔷 ${udata.Level} seviye, ${udata.XP} tecrübe puanın var.`)
      .addField("Sıralama", `🔶 ${sıralama}/${sır.length}`, true)
      .addField("Sonraki Seviye", `🔹 ${udata.XP}/${this.getLevelExp(udata.Level++)} XP`, true)
      .setThumbnail(user.guild.iconURL({ dynamic: true }))
      .setAuthor(user.user.username, user.user.avatarURL({ dynamic: true })));
  },
  getLevelExp(level) {
    return 5 * (Math.pow(level, 2)) + 50 * level + 100;
  },

  getLevelFromExp(exp) {
    let level = 0;

    while (exp >= this.getLevelExp(level)) {
      exp -= this.getLevelExp(level);
      level++;
    }

    return level;
  },

  getLevelProgress(exp) {
    let level = 0;

    while (exp >= this.getLevelExp(level)) {
      exp -= this.getLevelExp(level);
      level++;
    }

    return exp;
  }
};