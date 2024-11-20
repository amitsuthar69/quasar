const { User, Agency, Campaign } = require("../models/user");
const verifyInstagramAccount = require("../helpers/verify");
const fetchReelData = require("../helpers/reelData");

async function handleSubmitCommand(interaction) {
  await interaction.deferReply();

  // 1. Check if user has registered
  const user = await User.findOne({ discordId: interaction.user.id });
  if (!user) {
    return interaction.editReply("You must register first using `/register`.");
  }

  // 2. Verify the user's Instagram bio code
  const isVerified = await verifyInstagramAccount(
    user.instagramAccounts[0].username,
    user.instagramAccounts[0].verificationCode
  );
  if (!isVerified) {
    return interaction.editReply(
      "Verification failed. Please ensure your bio contains the correct verification code."
    );
  }

  // 3. Validate Reel URL
  const url = interaction.options.getString("url");
  if (!isValidInstagramReelUrl(url)) {
    return interaction.editReply(
      "Invalid Instagram Reel URL. Please provide a valid Instagram Reel link."
    );
  }

  // 4. Check for already submitted reels
  const shortCode = extractShortCode(url);
  const existingReel = user.reelUrls.find(
    (reel) => reel.shortCode === shortCode
  );
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

  // 6. Find the server (agency)
  const agency = await Agency.findOne({
    discordServerId: interaction.guild.id,
  });
  if (!agency) {
    return interaction.editReply("Server is not registered yet!");
  }

  // 7. Find the active campaign for this server
  const activeCampaign = await Campaign.findOne({
    agencyId: agency._id,
    isActive: true,
  });
  if (!activeCampaign) {
    return interaction.editReply("No active campaign found for this server.");
  }

  // 8. Calculate contribution (dummy logic, replace with actual data if needed)
  const viewsContributed = reelData.views || 0; // Replace with actual calculation logic
  const moneyEarned =
    (viewsContributed / activeCampaign.viewsPerCap) *
    activeCampaign.moneyPerCap;

  // 9. Update user's campaign contributions
  const existingContribution = user.campaigns.find(
    (contribution) =>
      contribution.campaignId.toString() === activeCampaign._id.toString()
  );

  if (existingContribution) {
    // Update existing contribution
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
  user.reelUrls.push({
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
