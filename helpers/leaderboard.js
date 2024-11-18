require("dotenv").config();
const User = require("../models/user");

async function handleLeaderboardCommand(interaction) {
  // Retrieve users and calculate engagement for each
  const users = await User.find();
  const leaderboard = users
    .map((user) => ({
      username: user.discordName,
      totalEngagement: user.instagramAccounts.reduce(
        (acc, account) => acc + account.averageEngagementRate || 0,
        0
      ),
    }))
    .sort((a, b) => b.totalEngagement - a.totalEngagement) // Sort by engagement
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
        `#${index + 1} **${user.username}** - Engagement: ${
          user.totalEngagement
        }`
    )
    .join("\n");
  await interaction.reply(`**Top 10 Leaderboard**\n${leaderboardMessage}`);
}

module.exports = handleLeaderboardCommand;
