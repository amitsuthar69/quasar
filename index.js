require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Store submitted reels for each user (Note: This will reset when bot restarts)
const submittedReels = new Map();

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

async function handleSubmitCommand(interaction) {
  await interaction.deferReply();

  const url = interaction.options.getString("url");
  if (!isValidInstagramReelUrl(url)) {
    return interaction.editReply(
      "Invalid Instagram Reel URL. Please provide a valid Instagram Reel link."
    );
  }

  const shortCode = extractShortCode(url);
  const reelData = await fetchReelData(shortCode);

  if (!reelData) {
    return interaction.editReply(
      "Failed to fetch reel data. Please check the URL and try again."
    );
  }

  // Get or initialize user's reels array using Map
  const userReels = submittedReels.get(interaction.user.id) || [];
  userReels.push(reelData);
  submittedReels.set(interaction.user.id, userReels);

  const embed = new EmbedBuilder()
    .setColor("#00ff00")
    .setTitle("Reel Submitted Successfully")
    .addFields(
      { name: "Views", value: reelData.views.toString(), inline: true },
      { name: "Likes", value: reelData.likes.toString(), inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleStatsCommand(interaction) {
  const userReels = submittedReels.get(interaction.user.id) || [];

  if (userReels.length === 0) {
    return interaction.reply("You haven't submitted any reels yet!");
  }

  const stats = calculateStats(userReels);
  const avgViews = Math.round(stats.totalViews / userReels.length);
  const avgLikes = Math.round(stats.totalLikes / userReels.length);

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Your Instagram Reel Statistics")
    .addFields(
      { name: "Total Reels", value: userReels.length.toString(), inline: true },
      {
        name: "Total Views",
        value: stats.totalViews.toLocaleString(),
        inline: true,
      },
      {
        name: "Total Likes",
        value: stats.totalLikes.toLocaleString(),
        inline: true,
      },
      { name: "Average Views", value: avgViews.toLocaleString(), inline: true },
      { name: "Average Likes", value: avgLikes.toLocaleString(), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

function isValidInstagramReelUrl(url) {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "www.instagram.com" ||
      urlObj.hostname === "instagram.com"
    );
  } catch {
    return false;
  }
}

function extractShortCode(url) {
  const matches = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
  return matches ? matches[1] : null;
}

async function fetchReelData(shortCode) {
  try {
    // Note: Instagram's public API endpoints might be restricted
    // You might need to use Instagram's official API or a third-party service
    const response = await axios.get(
      `https://www.instagram.com/p/${shortCode}/?__a=1`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const data = response.data.graphql.shortcode_media;
    return {
      views: data.video_view_count || 0,
      likes: data.edge_media_preview_like?.count || 0,
      timestamp: Date.now(),
      shortCode,
    };
  } catch (error) {
    console.error(`Error fetching reel data: ${error.message}`);
    return null;
  }
}

function calculateStats(reels) {
  return reels.reduce(
    (acc, reel) => ({
      totalViews: acc.totalViews + (reel.views || 0),
      totalLikes: acc.totalLikes + (reel.likes || 0),
    }),
    { totalViews: 0, totalLikes: 0 }
  );
}

client.login(process.env.DISCORD_BOT_TOKEN);
