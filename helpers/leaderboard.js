require("dotenv").config();
const { User, Campaign, Agency } = require("../models/user");

async function handleLeaderboardCommand(interaction) {
  // 1. Find the agency (Discord server)
  const agency = await Agency.findOne({
    discordServerId: interaction.guild.id,
  });
  if (!agency) {
    return interaction.reply({
      content: "This server is not registered as an agency.",
      ephemeral: true,
    });
  }

  // 2. Find the active campaign for this agency
  const activeCampaign = await Campaign.findOne({
    agencyId: agency._id,
    isActive: true,
  });
  if (!activeCampaign) {
    return interaction.reply({
      content: "No active campaign found for this server.",
      ephemeral: true,
    });
  }

  // 3. Retrieve all users and calculate total views and money earned for the active campaign
  const users = await User.find();

  const leaderboard = users
    .map((user) => {
      // Find the user's contribution to the active campaign
      const contribution = user.campaigns.find(
        (c) => c.campaignId.toString() === activeCampaign._id.toString()
      );

      // If there's no contribution for the active campaign, skip the user
      if (!contribution) return null;

      // Calculate total views and total money earned
      const totalViews = contribution.viewsContributed || 0;
      const totalMoney = contribution.moneyEarned || 0;

      return {
        username: user.discordName,
        totalViews,
        totalMoney,
      };
    })
    .filter((user) => user !== null) // Remove null entries (users not participating in the active campaign)
    .sort((a, b) => b.totalViews - a.totalViews) // Sort by total views
    .slice(0, 10); // Take top 10

  if (leaderboard.length === 0) {
    return interaction.reply({
      content: "No users have participated in the active campaign yet.",
      ephemeral: true,
    });
  }

  // 4. Generate leaderboard message including money earned
  const leaderboardMessage = leaderboard
    .map(
      (user, index) =>
        `#${index + 1} **${
          user.username
        }** - Views: ${user.totalViews.toLocaleString()} | Money: $${user.totalMoney.toFixed(
          2
        )}`
    )
    .join("\n");

  // 5. Send the leaderboard message
  await interaction.reply({
    content: `**Top 10 Leaderboard (Active Campaign)**\n${leaderboardMessage}`,
    ephemeral: true,
  });
}

module.exports = handleLeaderboardCommand;
