const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("register")
const data = {
  Settings: {
    Yetkiler: ["699594126039056454"],
    ErkekRolleri: ["699600911001059388", "699594142874992651"],
    KizRolleri: ["699600912078995536", "699594142149509170"],
    KayitsizRolleri: ["699600909138788412"]
  },
}
module.exports = {
  Name: "kayıt",
  Aliases: ["register"],
  Usage: "register @member",
  Description: "Register system.",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable. 
   */
  onLoad: function (client) {
  },
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   * @param {Guild} guild
   */
  onRequest: async function (client, message, args, guild) {
    try {
      if (!message.member.roles.cache.some(q => data.Settings.Yetkiler.some(y => y == q.id)) && !message.member.hasPermission("ADMINISTRATOR")) {
        let ahmet = new Discord.MessageEmbed()
          .setDescription("Eğer birisini kaydetmek istiyorsan ilk önce **kayıt yetkilisi** olmalısın.")
          .setAuthor(message.author.username, message.author.avatarURL())
          .setThumbnail(
            "https://media2.giphy.com/media/Pnfb50o1UuTagM3KMG/giphy.gif"
          )
          .setFooter("Açıklayıcı, açıklayıcı! Benimle konuşurken açıklayıcı olmaya çalış")
        message.channel.send(ahmet);
        return;
      }
      if(!args[0]) return;
      let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) { 
        message.channel.send(new Discord.MessageEmbed().setColor("RANDOM").setAuthor(message.author.username, message.author.avatarURL())
          .setDescription("Hey, hey! Birisini etiketlemelisin.").setThumbnail(
            "https://media2.giphy.com/media/Pnfb50o1UuTagM3KMG/giphy.gif"
          )).then(t => t.delete({ timeout: 5000 }).catch());
        return;
      }
      let mesaj = await message.channel.send(new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription("*Aşağıdan etiketlediğin kişinin cinsiyetini seç.*")
        .setFooter("Söylentileri duydun mu ? Köye yeni birisi katılıyormuş ")
        .setColor("#F483FF")
        .addField("Kız", "1️⃣", true)
        .addField("Erkek", "2️⃣", true)
      ).then(async m => {
        await m.react("1️⃣")
        await m.react("2️⃣")
        return m;
      }).catch(err => undefined);
      let react = await mesaj.awaitReactions((reaction, user) => user.id == message.author.id && Emojiler.some(emoji => emoji == reaction.emoji.name), { errors: ["time"], max: 1, time: 15000 }).then(coll => coll.first()).catch(err => { mesaj.delete().catch(); return; });
      if(!react) return;
      let seçim = "";
      if (react.emoji.name == "1️⃣")
        seçim = "KizRolleri";
      else if (react.emoji.name == "2️⃣")
        seçim = "ErkekRolleri";
      else {
        return;
      }
      mesaj = await mesaj.reactions.removeAll();
      let mesaj2 = await mesaj.edit(new Discord.MessageEmbed()
        .setColor("#F483FF").setAuthor(message.author.username, message.author.avatarURL())
        .setDescription("<@" + target + "> adlı kişinin sunucu içerisindeki ismi ne olsun?")
        .setFooter("| Cevap Vermelisin | Örneğin: Ali 17 ya da İrem 13 aralara bir şey koymamaya çalış.")).then(m => m);
      let content = await message.channel.awaitMessages(filter => filter.author.id == message.author.id, { max: 1, time: 15000 }).then(coll => coll.first().content).catch(err => {
        mesaj2.delete().catch();
        message.channel.send("Biraz daha hızlı olmalısın.");
        return;
      });
      if (!content) {
        await message.channel.send("Bir şeyler yanlış gidiyor! Tekrar dene.");
        return;
      }
      let result = content.split(" ");
      if (!result || result.length != 2) {
        message.channel.send(new Discord.MessageEmbed()
          .setColor("#F483FF")
          .setDescription("Bir isim ya da yaş girmelisin.").setFooter("Tekrar dene..."));
        return;
      }
      let d;
      if(target.user.username.includes(client.Configuration.Tag1))
      d = await target.setNickname(client.Configuration.Tag1+" " + result[0][0].toUpperCase() + result[0].substring(1) + " | " + result[1]).catch(async err => {
        await message.channel.send("Üzgünüm ancak bunu yapmak için yetkim yetmiyor.");
        return undefined;
      });
      else
        d =await target.setNickname(client.Configuration.Tag2+" " + result[0][0].toUpperCase() + result[0].substring(1) + " | " + result[1]).catch(async err => {
          await message.channel.send("Üzgünüm ancak bunu yapmak için yetkim yetmiyor.");
          return undefined;
        });
      if (!d) return;
      data.Settings.KayitsizRolleri.forEach(async rol => {
        await target.roles.remove(rol);
      })
	  db.add("register." + message.author.id +"."+seçim, 1);
      data.Settings[seçim].forEach(async rol => {
        await target.roles.add(rol);
      })
      // Buraya rollerin otomatik verilecek alakalı log yazılacak
      await mesaj.edit(new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription("Tebrikler aramıza yeni birisi katıldı!").setThumbnail(client.Modules.Action.CheckMark)
        .setFooter("Alosha tarafından geliştirilmektedir.")
        .addField("Bilgi", target.toString() + " adlı kişi " + message.author.toString() + " tarafından kayıt edildi.")
      );
    }
    catch (err) {
      console.log(err);
      await message.channel.send(new MessageEmbed().setDescription("Bilinmeyen bir hata meydana geldi <@558016135052787773>'ya ulaşarak hatayı bildirin. (on kere aynı şeyi yazmayın pls)"));
    }
  }
};

const Emojiler = [
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣"
]