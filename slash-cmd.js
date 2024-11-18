// slash-cmd.js
require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot's response time"),

  new SlashCommandBuilder()
    .setName("submit")
    .setDescription("Submit an Instagram Reel for tracking")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The Instagram Reel URL")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View statistics for your submitted reels"),
];

async function registerCommands() {
  try {
    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_BOT_TOKEN
    );

    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_BOT_ID,
        process.env.DISCORD_SERVER_ID
      ),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

registerCommands();
