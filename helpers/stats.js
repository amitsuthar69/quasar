const { EmbedBuilder } = require("discord.js");
const { User, Campaign, Agency } = require("../models/user");
const fetchReelData = require("../helpers/reelData");

async function handleStatsCommand(interaction) {
  // 1. Get user from the database
  const user = await User.findOne({ discordId: interaction.user.id });
  if (!user || user.reelUrls.length === 0) {
    return interaction.reply("You haven't submitted any reels yet!");
  }

  // 2. Retrieve the current server (agency)
  const agency = await Agency.findOne({
    discordServerId: interaction.guild.id,
  });
  if (!agency) {
    return interaction.reply("This server is not registered as an agency.");
  }

  // 3. Retrieve the active campaign for the server (agency)
  const activeCampaign = await Campaign.findOne({
    isActive: true,
    agencyId: agency._id,
  });

  if (!activeCampaign) {
    return interaction.reply("No active campaign found for this server.");
  }

  // 4. Filter the user's reels for this server's active campaign
  const userContribution = user.campaigns.find(
    (c) => c.campaignId.toString() === activeCampaign._id.toString()
  );

  if (!userContribution) {
    return interaction.reply(
      "You have not contributed to the active campaign on this server."
    );
  }

  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalMoney = userContribution.moneyEarned || 0;
  let reelsUpdated = 0;

  // Filter only reels that are part of this campaign
  const relevantReels = user.reelUrls.filter(
    (reel) => reel.campaignId?.toString() === activeCampaign._id.toString()
  );

  if (relevantReels.length === 0) {
    return interaction.reply(
      "You have not submitted any reels for the active campaign on this server."
    );
  }

  // 5. Update and calculate reel statistics
  const now = Date.now();
  const eightHours = 8 * 60 * 60 * 1000;

  const updatedReels = await Promise.all(
    relevantReels.map(async (reel) => {
      const isOutdated =
        now - new Date(reel.lastUpdated).getTime() > eightHours;

      if (isOutdated) {
        const updatedStats = await fetchReelData(reel.shortCode);
        if (updatedStats) {
          reel.stats = updatedStats;
          reel.lastUpdated = new Date();
          reelsUpdated++;
        }
      }

      totalViews += reel.stats.views || 0;
      totalLikes += reel.stats.likes || 0;
      totalComments += reel.stats.comments || 0;

      return `${reel.stats.views || 0}👀  ${reel.stats.likes || 0}❤️  ${
        reel.stats.comments || 0
      }💭`;
    })
  );

  if (reelsUpdated > 0) {
    await user.save();
  }

  // 6. Prepare the response
  const usernames = user.instagramAccounts
    .map((account) => account.username)
    .join(", ");

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Your Instagram Clips Statistics")
    .addFields(
      {
        name: "IG Reel Clips",
        value: relevantReels.length.toString(),
      },
      {
        name: "Reel Stats",
        value: updatedReels.join("\n") || "No stats available",
      },
      {
        name: "Instagram usernames",
        value: usernames || "No usernames added",
      },
      {
        name: "Total View count",
        value: totalViews.toLocaleString(),
      },
      {
        name: "Estimated Earnings",
        value: `$${totalMoney.toFixed(2)}`,
      },
      {
        name: "Last Updated",
        value: formatTime(relevantReels[0].lastUpdated),
        inline: true,
      },
      {
        name: "Next Update in",
        value: calculateTimeRemaining(relevantReels[0].lastUpdated),
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

module.exports = handleStatsCommand;

function formatTime(timestamp) {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    month: "short",
    day: "numeric",
  });
}

function calculateTimeRemaining(lastUpdated) {
  if (!lastUpdated) return "Unknown";

  const now = new Date();
  const nextUpdate = new Date(lastUpdated);
  nextUpdate.setHours(nextUpdate.getHours() + 8);

  const diffMs = nextUpdate - now;
  if (diffMs <= 0) return "Update due now";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}
