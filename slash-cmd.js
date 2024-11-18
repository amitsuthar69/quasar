const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const botId = process.env.DISCORD_BOT_ID;
const serverId = process.env.DISCORD_SERVER_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

const rest = new REST({ version: "10" }).setToken(botToken);

const slashRegister = async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(botId, serverId), {
      body: [
        new SlashCommandBuilder()
          .setName("ping")
          .setDescription("Pings the bot"),

        new SlashCommandBuilder()
          .setName("submit")
          .setDescription("Takes IG Reel url")
          .addStringOption((option) => {
            return option
              .setName("url")
              .setDescription("IG Reel URL")
              .setRequired(true);
          }),
      ],
    });
  } catch (error) {
    console.log(error);
  }
};

slashRegister();
