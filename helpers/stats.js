const { EmbedBuilder } = require("discord.js");
const User = require("../models/user");

async function handleStatsCommand(interaction) {
  // 1. Get user from the database
  const user = await User.findOne({ discordId: interaction.user.id });

  // 2. Check if the user exists and has submitted reels
  if (!user || user.reelUrls.length === 0) {
    return interaction.reply("You haven't submitted any reels yet!");
  }

  // 3. Initialize total view, like, and comment counters
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;

  // 4. Format reel statistics
  const reelStats = user.reelUrls.map((reel, index) => {
    totalViews += reel.stats.views || 0;
    totalLikes += reel.stats.likes || 0;
    totalComments += reel.stats.comments || 0;

    return `${index + 1}: ${reel.stats.views || 0}👀  ${
      reel.stats.likes || 0
    }❤️  ${reel.stats.comments || 0}💭`;
  });

  // 5. List Instagram usernames added by the user
  const usernames = user.instagramAccounts
    .map((account) => account.username)
    .join(", ");

  // Create the message with statistics
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Your Instagram Clips Statistics")
    .addFields(
      {
        name: "IG Reel Clips",
        value: user.reelUrls.length.toString(),
      }, // Convert to string
      {
        name: "Reel Stats",
        value: reelStats.join("\n") || "No stats available",
      },
      {
        name: "Instagram usernames",
        value: usernames || "No usernames added",
      },
      {
        name: "Total View count",
        value: totalViews.toLocaleString(),
      }
    )
    .setTimestamp();

  // Reply with the formatted message
  await interaction.reply({ embeds: [embed] });
}

module.exports = handleStatsCommand;
