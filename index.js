const Discord = require("discord.js")
const { Client } = require('discord.js');
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")
const csv = require('csv-parser');
const { prefix, token } = require("./marques_config.json");
const { EmbedBuilder } = require("discord.js")

dotenv.config()
const TOKEN = process.env.TOKEN
console.log(TOKEN);

const LOAD_SLASH = process.argv[2] == "load"

const CLIENT_ID = "756244690935742475"
const GUILD_ID = "729770863053897798"

const client = new Client({
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildVoiceStates",
        "MessageContent" // Do not forget MessageContent
    ]
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

let commands = []
let massive_array = [];
let quit_bool = false;

const helpEmbed = new EmbedBuilder()
	.setColor('#0099ff')
	.setTitle('List of Commands')
	.addFields(
		{ name: 'Prefix', value: 'm!' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Says Hello', value: 'm!hello', inline: true },
		{ name: 'Ping', value: 'm!ping', inline: true },
    { name: 'Beep', value: 'm!beep', inline: true },
	)

fs.createReadStream('shortjokes.csv')
  .pipe(csv())
  .on('data', (row) => {
    massive_array.push(row.Joke);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
		console.log(massive_array.length)
  });

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

if (LOAD_SLASH) {
    const rest = new REST({ version: "9" }).setToken(TOKEN)
    console.log("Deploying slash commands")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
}
else {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })
    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid slash command")

            await interaction.deferReply()
            await slashcmd.run({ client, interaction })
        }
        handleCommand()
    })
    client.login(TOKEN)
}

client.on("messageCreate", async message => {

    if (message.channel.id != 771402933307834449 && message.channel.id != 756256623630090413) {
      return
    };
  
      // let mentionedMember = message.mention.member.first() || message.guild.members.cache.get(args[0]);
      // console.log(mentionedMember);
  
      if(message.content.startsWith(`say sorry marques`)) {
          return message.channel.send("sory （>﹏<)");
      }
      if(message.content.startsWith(`go to sleep marques`)) {
      if (message.guild.roles.cache.some(role => role.name === 'Mod Man')) {
        console.log("hi");
        quit_bool = true;
            return message.channel.send("good night!");
      }
      }
    if (quit_bool) {
      process.exit()
    }
  
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
  
    if (message.content.startsWith(`${prefix}hello`)) {
      message.channel.send("Hello!");
    }
    if (message.content.startsWith(`${prefix}ping`)) {
          message.channel.send("Pong.");
      }
  
    if (message.content.startsWith(`${prefix}beep`)) {
          message.channel.send("Boop.");
      }
  
    if (message.content.startsWith(`${prefix}joke`)) {
      message.channel.send(massive_array[Math.floor(Math.random()*231657)]);
    }
  
    if(message.content.startsWith(`${prefix}help`)) {
      // return console.log(helpEmbed)
      return message.channel.send({ embeds: [helpEmbed] });
    }
  });