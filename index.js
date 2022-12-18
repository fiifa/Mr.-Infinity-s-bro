const fetch = require("node-fetch");
const { REST } = require("@discordjs/rest");
const { QuickDB } = require('quick.db');
const db = new QuickDB(); 
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { readdirSync } = require("fs");
const path = require("path");
require("colors");



const express = require('express')();
express.get('/', (req, res) => res.send('Mr. Infinity!'))
express.listen(300);



const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });


const config = require("./config.json");
const token = process.env.token;




client.slash = new Discord.Collection();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.categories = fs.readdirSync("./slashCommands");






readdirSync("./slashCommands/").map(async (dir) => {
  readdirSync(`./slashCommands/${dir}/`).map(async (cmd) => {
    let pull = require(`./slashCommands/${dir}/${cmd}`);
    client.slash.set(pull.name, pull);
    if (pull.aliases) {
      pull.aliases.map((p) => client.aliases.set(p, pull));
    }
  });
});

const slash = [];
readdirSync("./slashCommands/").map(async (dir) => {
  readdirSync(`./slashCommands/${dir}/`).map(async (cmd) => {
    slash.push(require(path.join(__dirname, `./slashCommands/${dir}/${cmd}`)));
  });
});

const rest = new REST({ version: "9" }).setToken(token);
(async () => {
  try {
    console.log("Načítám slash commandy...".yellow);




    await rest.put(Routes.applicationCommands(config.clientID), {
      body: slash,
    });

    console.log("Slash commandy byly načteny.".green);


  } catch (error) {
    console.error(error);
  }
})();

client.on("interactionCreate", async (interaction) => {

  if (interaction.isCommand() || interaction.isContextMenu()) {
    if (!client.slash.has(interaction.commandName)) return;
    if (!interaction.guild) return;
    const command = client.slash.get(interaction.commandName)
    command.run(interaction, client);
  }
});




const reactions = {};
for (let x of fs.readdirSync(__dirname + "/messageReactions")) {
  let d;
  try {
    d = require(`./messageReactions/${x}`);
  } catch (e) {
    console.log(e);
    continue;
  }

  reactions[d.id] = d.run;
}

client.on("messageCreate", async (message) => {
  let reaction = reactions[message.channel.id];
  if (reaction) reaction(message);

  if (!message.guild) return;
  if (message.author.bot) return;
});

let folders = fs.readdirSync("./prefixCommands/");

folders.forEach((dir) => {
  const commandFiles = fs
    .readdirSync(`./prefixCommands/${dir}/`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./prefixCommands/${dir}/${file}`);
    if (command.name) {
      client.commands.set(command.name, command);
    } else {
      continue;
    }
    client.commands.set(command.name, command);
  }
});

client.on("messageCreate", async (message) => {
  const prefix = ",";

  let e = await db.get(`msgs_${message.author.id}`);
  if (e == null) e = 0;

  await db.set(`msgs_${message.author.id}`, e + 1);

  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    message.channel.type === "dm"
  )
    return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmda = args.shift().toLowerCase();
  let command =
    client.commands.get(cmda) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(cmda));
  if (!command) return;

  try {
    command.run(client, message, args);
  } catch (error) {
    console.log(error);
    message.reply({ content: `Nastal error!` });
  }
});





const load = (dirs) => {
  const events = fs
    .readdirSync(`./events/${dirs}/`)
    .filter((d) => d.endsWith("js"));
  for (let file of events) {
    let evt = require(`./events/${dirs}/${file}`);
    let eName = file.split(".")[0];

    client.on(eName, evt.bind(null, client));


  }
};
[""].forEach((x) => load(x));


client.login(process.env.token);
