const { Client, Message, MessageEmbed, Guild } = require("discord.js");
const Discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("pull")
const data = {
  Yetkiler: ["699600961940750356"]
}
const ms = require("ms");
module.exports = {
  Name: "pull",
  Aliases: ["çek"],
  Usage: "pull @etiket",
  Description: "Birisini sunucudan tamamen uzaklaştırmanıza yarar.",
  GuildOnly: true,
  Category: "Moderation",
  /**
   * @param {Client} client This is client letiable.
   */
  onLoad: async function(client) {
  },
  /**
   * @param {Client} client This is client letiable.
   * @param {Message} message This is Discord Message letiable.
   * @param {Array<String>} args Message arguments.
   * @param {Guild} guild This is a penis
   */
  onRequest: async function(client, message, args, guild) {
    try{
      let data = await db.get("pull");
      if(!data)
      data= await db.set("pull",{
        Yetkiler: []
      })
        if (client.Configuration.Owners.some(c => message.author.id == c)) {
          if (args[0]) {
            if (args[0].toLowerCase() == "yetkiler") {
              let roller = [];
              if(message.mentions.roles.size > 1)
                roller = message.mentions.roles.map(role => role.id);
              else if(args.length > 1)
                roller = args.splice(1).map(e => e.replace(" "));
              if(roller.length < 1)
                return message.reply(" rol eksik");
              data = await db.set("pull.Yetkiler", roller);
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
		if(!message.member.roles.cache.some(rol => data.Yetkiler.some(yetki => yetki == rol.id))) return message.reply(" yetkin yetmiyor!").then(e => e.delete({timeout: 5000}).catch());
        if(!message.member.voice.channelID) return await message.channel.send(new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL()).setColor("RANDOM").setDescription("Herhangi bir kanalda değilsin.")).then(c => c.delete({timeout:5000}).catch());
        let target = message.mentions.members.first();
        if (!target) return await message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(message.author.username, message.author.avatarURL()).setDescription("Eğer bulunduğun odaya birisini çekmek istiyorsan onu etiketlemelisin.")).then(c => c.delete({timeout:5000}).catch());
        if(!target.voice.channelID) return await message.channel.send(new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL()).setColor("RANDOM").setDescription("Etiketlediğin kişi herhangi bir sesli kanalda değil.")).then(c => c.delete({timeout:5000}).catch());
        if(target.voice.channelID == message.member.voice.channelID) return await message.channel.send(new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL()).setColor("RANDOM").setDescription("İkinizde aynı odada olduğunuzdan dolayı işlem iptal edildi.").setColor("#ff0000")).then(c => c.delete({timeout:5000}).catch()); 
        let m = target.voice.setChannel(message.member.voice.channel).then(c => member).catch(err => undefined);
        if(!m){
            await message.channel.send(new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL()).setDescription("Etiketlediğin kişiyi taşıyamadım.").setColor("RANDOM")).then(c => c.delete({timeout:5000}).catch());
            return;
        }
        else
        return await message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(message.author.username, message.author.avatarURL())
        .setDescription("<@" + message.member.id + "> adlı yetkili tarafından <@" + target.id + "> kişisi **"+message.member.voice.channel.name + "** odasına çekildi.")).then(c => c.delete({timeout: 10000}).catch());
    }
    catch (err) {
      console.log(err);
      await message.channel.send(new MessageEmbed().setDescription("Bilinmeyen bir hata meydana geldi <@558016135052787773>'ya ulaşarak hatayı bildirin."));
    }
  }
};
