require("dotenv").config();
const User = require("../models/user");

async function handleLeaderboardCommand(interaction) {
  // Retrieve all users and calculate total views for each
  const users = await User.find();

  const leaderboard = users
    .map((user) => ({
      username: user.discordName,
      totalViews: user.reelUrls.reduce(
        (acc, reel) => acc + (reel.stats.views || 0),
        0
      ),
    }))
    .sort((a, b) => b.totalViews - a.totalViews) // Sort by total views
    .slice(0, 10); // Take top 10

  if (leaderboard.length === 0) {
    return interaction.reply(
      "No users have registered or submitted reels yet."
    );
  }

  // Generate leaderboard message
  const leaderboardMessage = leaderboard
    .map(
      (user, index) =>
        `#${index + 1} **${
          user.username
        }** - Views: ${user.totalViews.toLocaleString()}`
    )
    .join("\n");

  // Send the leaderboard message
  await interaction.reply(`**Top 10 Leaderboard**\n${leaderboardMessage}`);
}

module.exports = handleLeaderboardCommand;
