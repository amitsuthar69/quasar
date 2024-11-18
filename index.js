require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const mongoose = require("mongoose");
const handleRegisterCommand = require("./helpers/register");
const handleAddCommand = require("./helpers/add");
const handleSubmitCommand = require("./helpers/submit");
const handleStatsCommand = require("./helpers/stats");

const DB_URL = process.env.MONGODB_URL;

// connect to db
try {
  mongoose.connect(DB_URL);
  console.log("Database connected successfully!");
} catch (error) {
  console.log(`Error connecting to server: ${error.message}`);
}

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case "ping":
        const startTime = Date.now();
        await interaction.reply("Pong!");
        const endTime = Date.now();
        await interaction.editReply(`Pong! Latency: ${endTime - startTime}ms`);
        break;

      case "register":
        await handleRegisterCommand(interaction);
        break;

      case "add":
        await handleAddCommand(interaction);
        break;

      case "submit":
        await handleSubmitCommand(interaction);
        break;

      case "stats":
        await handleStatsCommand(interaction);
        break;
    }
  } catch (error) {
    console.error("Error handling command:", error);
    const errorMessage =
      "An error occurred while processing your command. Please try again later.";
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
