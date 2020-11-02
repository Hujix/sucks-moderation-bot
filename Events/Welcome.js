const {
  GuildMember,
  MessageEmbed,
  Client
} = require("discord.js");
const qdb = require("quick.db");
const db = require("quick.db");
const jdb = new qdb.table("jail");
const mdb = new qdb.table("mute");

const Ayarlar = require("../Settings/Ayarlar.json");

module.exports = {
  Event: "guildMemberAdd",
  Active: true,
  /**
   * @param {Client} client
   */
  onLoad: function (client) {
  },
  /**
   * @param {GuildMember} member
   */
  onRequest: async function (member) {
      if(jdb.has("jail."+member.id) || (mdb.has("mute."+member.id)) || (new Date().getTime() - member.user.createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 3){
        member.roles.add(Ayarlar.Jail.Jail_Rol);
        return;
      }
	  let taglar = db.get("yasakliTaglar") || [];
    if(taglar.some(t => member.user.username.includes(t))) return member.roles.add(Ayarlar.Jail.Jail_Rol);  
    if (member.user.bot) {
        let logs = await member.guild.fetchAuditLogs({
          limit: 1,
          type: "BOT_ADD"
        });
        let log = logs.entries.first();
        if (Ayarlar.Owners.some(c => c == log.executor.id)) return;
        member.guild.members.cache.get(log.executor.id).roles.remove(member.guild.members.cache.get(log.executor.id).roles.cache.filter(e => e.editable)).catch();
        await member.ban().catch(err => console.log("yasaklayamadım"));
        return await member.guild.channels.cache.get(Ayarlar.Bot).send(new MessageEmbed().setDescription("<@" + log.executor.id + "> adlı kişi " + member.toString() + " botunu sunucuya **aldığı** için tüm yetkileri alındı.").setColor("RANDOM"));
    }
	  
      let durum = false;
      if ((new Date().getTime() - member.user.createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 15) {
        durum = true;
        member.roles.add(Ayarlar.Welcome.Şüpheli_Rol);
        member.guild.channels.cache.get(Ayarlar.Welcome.ŞKanal).send(new MessageEmbed()
          .setTitle(member.guild.name)
          .setColor("RANDOM")
          .setDescription(member.user.tag + " adlı kişi hesabı şüpheli olduğu için `Şüpheli Hesap` rolü verildi.")
        );
		return;
      }
      // ----
      if (durum == false) member.roles.add(Ayarlar.Kayıt.Kayıtsız).catch();

      member.guild.channels.cache.get(Ayarlar.Welcome.Kanal).send(new MessageEmbed()
    .setColor("RANDOM")
    .setTitle(`<a:678684922705346560:708422601810116608> WELCOME TO ${member.guild.name} <a:678684922705346560:708422601810116608>`)
    .addField(`<a:helebek:708422608126738432> Dark Supreme`,`
    <a:gidiyorum:710332517844254730> ${member} (${member.user.tag}) sunucuya hoş geldin! 
    <a:helebek:708422608126738432> <@&699594126039056454>'nu çağırıyorum! 
    <a:helebek:708422608126738432> <#699594389684748428> kanalına göz atmayı unutma! 
    <a:yesillonay:699923262775361576> Kayıt için **Kayıt Odası** odalarına giriş yapabilirsin. 
    <a:yesillonay:699923262775361576> Sunucumuz seninle beraber **${member.guild.memberCount}** kişi oldu! `)
    .addField(`Güvenlik Sistemi`, `
    <a:geceee:708422606663057559> Hesap oluşturma tarihi: **${member.user.createdAt.toTurkishFormatDate("dd mm yyyy | HH:mm:ii")}**
    <a:geceee:708422606663057559> Hesap ${member.user.createdTimestamp / (1000 * 60 * 60 * 24) <= 7 ? "**tehlikeli.**" : "güvenlidir."}`).setImage("https://media.giphy.com/media/YnAtv62rI4eUSAVh5A/giphy.gif"))                                
     
      if (member.user.username.includes(Ayarlar.Tag.Tag1)) {
        member.roles.add(Ayarlar.Tag.TagRol).catch()
      } else {
        member.setNickname(Ayarlar.Tag.Tag1 + " " + member.user.username).catch(err => {
			  member.setNickname(Ayarlar.Tag.Tag2 + " İsim Yaş")
		    });
      }
      member.roles.add(Ayarlar.Kayıt.Kayıtsız).catch()
  }
};