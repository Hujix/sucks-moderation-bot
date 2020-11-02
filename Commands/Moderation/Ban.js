const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("ban")
module.exports = {
  Name: "ban",
  Aliases: ["yasakla", "yahak"],
  Usage: "ban",
  Description: "Birisini sunucudan tamamen uzaklaştırmanıza yarar.",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable.
   */
  onLoad: function (client) { },
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   * @param {Guild} guild This is a penis
   */
  onRequest: async function (client, message, args, guild) {
    try{
		let data = client.Ayarlar.Ban;
      if (
        !message.member.roles.cache.some(c =>
          data.Yetkiler.some(d => d == c.id)
        ) &&
        !client.Configuration.Owners.some(c => c == message.author.id) && !message.member.hasPermission("ADMINISTRATOR")
      )
        return await message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription("Bunu yapmak için yeterli yetkiye sahip değilsin.")
            .setFooter(
              "Bu köyde herkese farklı görev veriliyor, senin görevin olmayan bir şeye müdahale etme!"
            )
            .setThumbnail(
              "https://media2.giphy.com/media/Pnfb50o1UuTagM3KMG/giphy.gif"
            )
        );
      if(!message.member.roles.cache.some(c => data.Yetkiler.some(y => y == c.id))){
        return await message.channel.send(new MessageEmbed()
          .setDescription("Bu komutu kullanmak için gerekli rollerden herhangi birine sahip değilsin."));
      }
	  let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target){
	  let reason = args.splice(1).join(" ");
  
      if (!reason)
        return await message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(
              "Sebep belirtmelisin."
            )
            .setFooter("Doğru kullanım: s!ban @etiket Rahatsız edici söylem")
            .setThumbnail(
              "https://media2.giphy.com/media/Pnfb50o1UuTagM3KMG/giphy.gif"
            )
        );
		  let deger = message.guild.members.ban(args[0]).then(e => e).catch(e => undefined);
		  if(!deger)
			  return await message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(
              "Eğer birisini yasaklamak istiyorsan ilk önce onu **etiketlemelisin** ki kimi yasaklayacağımı bileyim."
            )
            .setFooter(
              "Açıklayıcı, açıklayıcı! Benimle konuşurken açıklayıcı olmaya çalış-"
            )
            .setThumbnail(
              "https://media2.giphy.com/media/Pnfb50o1UuTagM3KMG/giphy.gif"
            )
        );
		return message.channel.send(new MessageEmbed().setDescription("<@"+message.author+">, <@"+args[0]+"> kişisini **" + reason+ "** sebebiyle yasakladı.").setColor("RANDOM"));
	  }
  
      if (message.member.roles.highest.position <= target.roles.highest.position)
        return await message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription("Senden yüksek yetkisi olan kişileri susturamazsın.")
            .setFooter(
              "Hey, hey! Sen iyice saçmalamaya başlamışsı- Ona zarar veremezsin."
            )
            .setThumbnail(
              "https://media2.giphy.com/media/Pnfb50o1UuTagM3KMG/giphy.gif"
            )
        );
      if(!target.manageable)
		return await message.channel.send(new MessageEmbed().setDescription("Bu kişiyi yasaklamak için yeterli yetkim yok."));  
      let reason = args.splice(1).join(" ");
  
      if (!reason)
        return await message.channel.send(
          new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(
              "Lanet herif! -Aramızdan birisini yasaklamaya çalışıyorsan bunu doğru yap ve bir **sebep** belirt."
            )
            .setFooter("Doğru kullanım: s!ban @etiket Rahatsız edici söylem")
            .setThumbnail(
              "https://media2.giphy.com/media/Pnfb50o1UuTagM3KMG/giphy.gif"
            )
        );
      if(!data[message.member.id])
      data[message.member.id] = {Toplam: 0, EnSonAtilan: new Date().getTime()};
  
  if((Date.now() - data[message.member.id].EnSonAtilan) / (1000 * 60 * 60 *24) >= 1){
	  data[message.member.id].EnSonAtilan = Date.now();
	  data[message.member.id].Toplam = 0;
  }
      if(data[message.member.id].Toplam + 1 > 3 && (Date.now() - data[message.member.id].EnSonAtilan) / (1000 * 60 * 60 *24) < 1)
      {
        return await message.channel.send(new MessageEmbed().setDescription("Gün içerisinde fazlasıyla yasaklama hakkını kullandın! Bu kişiyi yasaklayamazsın."));
      }
      else
        data[message.member.id].Toplam++;
	
      const banEmbed = new Discord.MessageEmbed();
	  await target.send(banEmbed).catch(err => {});
      target
        .ban({ reason: reason })
        .then(async c => { })
        .catch(console.log);
      banEmbed.setAuthor(message.author.username, message.author.avatarURL());
      banEmbed.setDescription("<@"+message.author+">, <@"+target+"> kişisini **" + reason+ "** sebebiyle yasakladı.")
      db.set("ban.Members." + message.member.id, data[message.member.id]);
      let channel = message.guild.channels.cache.get(data.Ban_Log);
      if(!channel)
        await channel.send(banEmbed);
      message.channel.send(banEmbed)
      qdb.push(`sicil.${target.id}`, {
        Zaman: Date.now(),
        Sebep: "[BAN]" + reason,
        Yetkili: message.author.id
      })
    }
    catch (err) {
      console.log(err);
      await message.channel.send(new MessageEmbed().setDescription("Bilinmeyen bir hata meydana geldi <@558016135052787773>'ya ulaşarak hatayı bildirin."));
    }
  }
};
