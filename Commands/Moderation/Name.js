const discord = require("discord.js");
const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("name")
const ms = require("ms");
module.exports = {
  Name: "isim",
  Aliases: ["name"],
  Usage: "name @etiket name",
  Description: "Profile..",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable.
   */
  onLoad: async function (client) { },
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   * @param {Guild} guild
   */
  onRequest: async function (client, message, args, guild) {
    try {
      let data = client.Ayarlar.Kayıt;
      if (client.Configuration.Owners.some(c => message.author.id == c)) {
        if (args[0]) {
          if (args[0].toLowerCase() == "önizleme") {
            let embed = new MessageEmbed();
            embed.setTitle("İsim Önizleme");
            embed.setThumbnail(message.author.avatarURL({ dynamic: true }));
            embed.setDescription("Aşağıdaki özellikler sunucu içerisinde aktif olarak yerine getirilen özelliklerdir. Buradaki özelliklere bakarak sunucu içerisindeki değişikliklerini ya da senin şartların dışında eklenmiş/çıkarılmış rolleri takip edebileceğin bir arayüzdür.")
            embed.setFooter(message.author.username + " tarafından kullanıldı.", message.author.avatarURL({ dynamic: true }));
            embed.addField(":grey_question: İsim komutunu kimler kullanabiliyor?", data.Yetkiler.length <= 0 ? "Herhangi bir yetki belirlenmemiş." : data.Yetkiler.map(yetki => guild.roles.cache.get(yetki)).filter(c => c).join(", "));
            embed.addField(":question: İsim komutunu kişiselletirebilir miyim?", "Hayır.");
            return await message.channel.send(embed);
          }
          if (args[0].toLowerCase() == "yetkiler") {
            let roller = [];
            if (message.mentions.roles.size > 1)
              roller = message.mentions.roles.map(role => role.id);
            else if (args.length > 1)
              roller = args.splice(1).map(e => e.replace(" "));
            console.log(roller);
            if (roller.length < 1)
              return message.reply(" rol eksik");
            data = await db.set("name.Yetkiler", roller);
            let convert = data.Yetkiler.map(
              (val, index) =>
                index +
                1 +
                "- " +
                (guild.roles.cache.get(val).toString() || "Rol bulunamadı")
            );
            let embed = new MessageEmbed()
              .setAuthor(message.author.username, message.author.avatarURL())
              .setDescription(
                "Şu an **odaya birisini çekebilecek** düzenleyebilecek roller aşağıda listelenmiştir."
              )
              .addField(
                "Yetkiler",
                convert.length <= 0 ? "*Yetki bulunamadı.*" : convert
              );
            await message.channel.send(embed);
            return;
          }
        }
      }
      if (!message.member.roles.cache.some(rol => data.Yetkiler.some(r => r == rol.id)))
        return await message.channel.send(new MessageEmbed()
          .setDescription("Bu komutu kullanmak için gerekli rollerden herhangi birine sahip değilsin."));
      let target = message.mentions.members.first();
      if (!target) return await message.channel.send(new MessageEmbed()
        .setDescription("Birisini etiketlememişsin.")).then(m => m.delete({ timeout: 5000 }).catch());

      if (!target.manageable) {
        return await message.channel.send(new MessageEmbed()
          .setDescription("Etiketlemiş olduğun kişinin ismini değiştiremiyorum.")).then(m => m.delete({ timeout: 5000 }).catch());
      }
      let tag = (target.nickname || target.user.username)[0];
      let ad = args[1];
      let yas = args[2];
      if (!ad || !yas) return;
      await target.setNickname(tag + " " + ad + " | " + yas);
      await message.channel.send(new MessageEmbed()
        .setDescription("Başarılı bir şekilde isim değişikliği yapıldı.")).then(c => c.delete({ timeout: 2000 }).catch());
    }
    catch (err) {
      console.log(err);
      await message.channel.send(new MessageEmbed().setDescription("Bilinmeyen bir hata meydana geldi <@558016135052787773>'ya ulaşarak hatayı bildirin."));
    }
  }
};