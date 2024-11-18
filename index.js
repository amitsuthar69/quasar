require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Store submitted reels for each user
const submittedReels = {};

client.on("ready", () => {
  console.log("Discord bot ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  const urlReceived = interaction.options.getString("url");

  if (command === "ping") {
    await interaction.reply("Pong!");
  }
  if (command === "submit") {
    await interaction.reply(`Your IG link: ${urlReceived}`);
  }
});

client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith("/")) return;

  const [cmd, ...args] = msg.content.slice(1).split(" ");

  switch (cmd.toLowerCase()) {
    case "submit": {
      const url = args.join(" ");

      // Validate URL
      if (!url || !url.includes("instagram.com/reel/")) {
        msg.reply("Invalid Instagram Reel URL. Please try again.");
        return;
      }

      // Extract reel ID from URL
      const shortCode = url.split("/").pop().split("?")[0];

      // Fetch reel data
      const reelData = await fetchReelData(shortCode);

      if (!reelData) {
        msg.reply("Failed to fetch reel data. Try again later.");
        return;
      }

      // Store reel data for the user
      if (!submittedReels[msg.author.id]) {
        submittedReels[msg.author.id] = [];
      }
      submittedReels[msg.author.id].push(reelData);

      msg.reply(`Reel submitted successfully!`);
      break;
    }
    case "stats": {
      const userReels = submittedReels[msg.author.id] || [];

      if (userReels.length === 0) {
        msg.reply("No reels submitted yet.");
        return;
      }

      const stats = calculateStats(userReels);

      msg.reply(
        `Total views: ${stats.totalViews}\nTotal likes: ${stats.totalLikes}`
      );
      break;
    }
    default:
      msg.reply("Unknown command. Try `/submit <url>` or `/stats`");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Helper function to fetch reel data
async function fetchReelData(shortCode) {
  try {
    const response = await axios.get(
      `https://www.instagram.com/p/${shortCode}/?__a=1`
    );
    const data = response.data.graphql.shortcode_media;

    if (!data || !data.video_view_count) {
      return null;
    }

    return {
      views: data.video_view_count,
      likes: data.like_count,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching reel data: ${error.message}`);
    return null;
  }
}

// Helper function to calculate stats
function calculateStats(reels) {
  let totalViews = 0;
  let totalLikes = 0;

  reels.forEach((reel) => {
    totalViews += reel.views;
    totalLikes += reel.likes;
  });

  return { totalViews, totalLikes };
}
