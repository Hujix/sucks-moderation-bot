const { User, MessageEmbed } = require("discord.js");
const conf = require("../Settings/Ayarlar.json");
const db = require("quick.db");
const Ayarlar = conf.Tag;
module.exports = {
  Event: "userUpdate",
  Active: true,
  onLoad: function(client) {},
  /**
   * @param {User} oldMember
   * @param {User} newMember
   */
  onRequest: async function(oldMember, newMember) {
    try{
      let client = global.client;
      let aloshaSunucu = global.client.guilds.cache.get(global.client.Ayarlar.Sunucu);
      if (!aloshaSunucu) return;
      let aloshaMember = aloshaSunucu.members.cache.get(newMember.id);
      if (!aloshaMember) return;

      let yasakliTaglar = db.get("yasakliTaglar") || [];

      if(!yasakliTaglar.some(e => oldMember.username.includes(e)) && yasakliTaglar.some(e => newMember.username.includes(e)) && !aloshaMember.roles.cache.has(conf.Jail.Jail_Rol)){
        aloshaMember.roles.set(conf.Jail.Jail_Rol).catch();
        aloshaMember.send(`:x: Yasaklı tag aldığın için sunucuda cezalandırıldın. Tag'ı çıkarırsan, JAIL'den çıkarsın.`).catch();
        return;
      }
      else if(yasakliTaglar.some(e => oldMember.username.includes(e)) && !yasakliTaglar.some(e => newMember.username.includes(e))){
        aloshaMember.roles.set(conf.Kayıt.Kayıtsız).catch();
        aloshaMember.send(`:x: Üstünden yasaklı tagı çıkardığın için sunucuda cezalıdan çıkartıldın.`).catch();
        return;
      }
      let kanal = aloshaSunucu.channels.cache.get(Ayarlar.Tag_Log_Kanal);
      if (!oldMember.username.includes(Ayarlar.Tag1) && newMember.username.includes(Ayarlar.Tag1)) {
        await aloshaMember.setNickname((aloshaMember.nickname || aloshaMember.user.username).replace(Ayarlar.Tag2, Ayarlar.Tag1)).catch();
        aloshaMember = await aloshaMember.roles.add(
          aloshaSunucu.roles.cache.filter(rol =>
            Ayarlar.Verilecek_Roller.includes(rol.id)
          )
        );
        let embed = new MessageEmbed()
          .setDescription(`${newMember}, adlı üye isminden ${global.client.Configuration.Tag1} tagımızı aldığı için ${aloshaSunucu.roles.cache.filter(c => Ayarlar.Verilecek_Roller.some(e => e == c.id)).map(e => e.toString()).join(", ")} adlı rolleri verildi!`);
        await kanal.send(embed);
      } else if (
        oldMember.username.includes(Ayarlar.Tag1) &&
        !newMember.username.includes(Ayarlar.Tag1)
      ) {
        await aloshaMember.setNickname((aloshaMember.nickname || aloshaMember.user.username).replace(Ayarlar.Tag1, Ayarlar.Tag2)).catch();
        await aloshaMember.roles.remove(Ayarlar.Verilecek_Roller).catch();
        let embed = new MessageEmbed()
        .setDescription(`${newMember}, adlı üye isminden ${Ayarlar.Tag1} tagımızı sildiği için ${aloshaSunucu.roles.cache.filter(c => Ayarlar.Verilecek_Roller.some(e => e == c.id)).map(e => e.toString()).join(", ")} adlı rolleri alındı!`);
        await kanal.send(embed);
		    let tagrol = aloshaSunucu.roles.cache.get(Ayarlar.TagRol);
		    let alinacakRoller = aloshaMember.roles.cache.filter(rol => tagrol.position < rol.position&& !rol.managed);
		    aloshaMember.roles.remove(alinacakRoller);
      }
    }
    catch (err){
      console.error(err);
    }
  }
};
