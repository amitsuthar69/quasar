const { User, Agency, Campaign } = require("../models/user");
const verifyInstagramAccount = require("../helpers/verify");
const fetchReelData = require("../helpers/reelData");

async function handleSubmitCommand(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const agency = await Agency.findOne({
    discordServerId: interaction.guild.id,
  });
  if (!agency) {
    return interaction.editReply("Server is not registered yet!");
  }

  // 1. Find the active campaign for this server
  const activeCampaign = await Campaign.findOne({
    agencyId: agency._id,
    isActive: true,
  });
  if (!activeCampaign) {
    return interaction.editReply("No active campaign found for this server.");
  }

  // 2. Check if user has registered
  const user = await User.findOne({ discordId: interaction.user.id });
  if (!user) {
    return interaction.editReply("You must register first using `/register`.");
  }

  const username = interaction.options.getString("username");
  if (!username) {
    return interaction.editReply(
      "Please provide the Instagram account username."
    );
  }

  // Find the Instagram account associated with this username
  const instagramAccount = user.instagramAccounts.find(
    (account) => account.username === username
  );

  if (!instagramAccount) {
    return interaction.editReply(
      `No Instagram account with username "${username}" is linked to your profile.`
    );
  }

  // Check if the Instagram account is linked to the current server/agency
  const isLinkedToAgency = instagramAccount.agencyIds.some(
    (agencyId) => agencyId.toString() === agency._id.toString()
  );

  if (!isLinkedToAgency) {
    return interaction.editReply(
      `The Instagram account "${username}" is not linked to this server/agency. Please link it before submitting reels.`
    );
  }

  // Verify the user's Instagram bio code
  const isVerified = await verifyInstagramAccount(
    instagramAccount.username,
    instagramAccount.verificationCode
  );
  if (!isVerified) {
    return interaction.editReply(
      "Verification failed. Please ensure your bio contains the correct verification code."
    );
  }

  // 3. Validate Reel URL
  const url = interaction.options.getString("url");
  if (!isValidInstagramReelUrl(url)) {
    console.log("checking for: ", url);
    return interaction.editReply(
      "Invalid Instagram Reel URL. Please provide a valid Instagram Reel link."
    );
  }

  const shortCode = extractShortCode(url);

  // 3. Check if the reel has already been submitted for this account
  const existingReel = instagramAccount.reelUrls.find((reel) => {
    console.log(`Comparing: ${reel.shortCode} === ${shortCode}`);
    return reel.shortCode === shortCode;
  });

  if (existingReel) {
    return interaction.editReply("This reel has already been submitted!");
  }

  // 5. Fetch and add reel data
  const reelData = await fetchReelData(shortCode);
  if (!reelData) {
    return interaction.editReply(
      "Failed to fetch reel data. Please check the URL and try again."
    );
  }

  // 6. Calculate contribution
  const viewsContributed = reelData.views || 0;
  const moneyEarned =
    (viewsContributed / activeCampaign.viewsPerCap) *
    activeCampaign.moneyPerCap;

  // 9. Update user's campaign contributions
  const existingContribution = user.campaigns.find(
    (contribution) =>
      contribution.campaignId.toString() === activeCampaign._id.toString()
  );

  // Update existing contribution
  if (existingContribution) {
    existingContribution.viewsContributed += viewsContributed;
    existingContribution.moneyEarned += moneyEarned;
  } else {
    // Create a new contribution
    user.campaigns.push({
      campaignId: activeCampaign._id,
      agencyId: agency._id,
      viewsContributed,
      moneyEarned,
    });
  }

  // 10. Save reel data and campaign contributions to the user
  instagramAccount.reelUrls.push({
    url,
    shortCode,
    submittedAt: new Date(),
    platform: "instagram",
    campaignId: activeCampaign._id,
    stats: reelData,
  });
  user.serverStats.totalSubmissions += 1;
  await user.save();

  await interaction.editReply("Reel submitted successfully!");
}

module.exports = handleSubmitCommand;

function isValidInstagramReelUrl(url) {
  try {
    const urlObj = new URL(url);
    console.log("host: ", urlObj.hostname);
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
