
const waitLimit = {};
module.exports = {
  Event: "message",
  Active: true,

  onLoad: function (client) { },

  onRequest: async function (message) {
    if(["!link", "!url", "!davet"].includes(message.content.toLowerCase())){
      return message.channel.send("https://discord.gg/darksupreme");
    }
    if (message.content == "!tag" | "tag")
      return message.channel.send(message.client.Configuration.Tag1);
    if (
      message.author.bot ||
      !message.content.startsWith(message.client.Configuration.Prefix)
    )
      return;
    if (waitLimit[message.author.id])
      if ((Date.now() - waitLimit[message.author.id]) / (1000) <= 1) {
        return;
      }
    let aloshaArgs = message.content
      .substring(message.client.Configuration.Prefix.length)
      .split(" ");
    let aloshaCommand = aloshaArgs[0];
    let aloshaBot = message.client;
    aloshaArgs = aloshaArgs.splice(1);
    let calistirici;
    let guild = message.guild || null;
    if (guild != null)
      await guild.fetch().then(result => guild = result)
    if (aloshaBot.commands.has(aloshaCommand)) {
      calistirici = aloshaBot.commands.get(aloshaCommand);
      if (calistirici.GuildOnly && message.channel.type == "dm")
        return;
      calistirici.onRequest(aloshaBot, message, aloshaArgs, guild);
    } else if (aloshaBot.aliases.has(aloshaCommand)) {
      calistirici = aloshaBot.aliases.get(aloshaCommand);
      if (calistirici.GuildOnly && message.channel.type == "dm")
        return;
      calistirici.onRequest(aloshaBot, message, aloshaArgs, guild);
    }
    waitLimit[message.member.id] = Date.now();
  }
};
