require("dotenv").config();
const { User, Agency } = require("../models/user");

async function handleAddCommand(interaction) {
  const platform = interaction.options.getString("platform");
  const username = interaction.options.getString("username");
  const discordServerId = interaction.guild.id;

  if (platform !== "instagram") {
    return interaction.reply({
      content: "Only Instagram is supported at this time.",
      ephemeral: true,
    });
  }

  const user = await User.findOne({ discordId: interaction.user.id });
  if (!user) {
    return interaction.reply({
      content: "You must register first using `/register`.",
      ephemeral: true,
    });
  }

  // Check if agency (server) exists
  const agency = await Agency.findOne({ discordServerId });
  if (!agency) {
    return interaction.reply({
      content: "This server is not registered as an agency.",
      ephemeral: true,
    });
  }
  const agencyId = agency._id;

  // Check if username already exists in the user's Instagram accounts
  const existingAccount = user.instagramAccounts.find(
    (account) => account.username === username
  );
  if (existingAccount) {
    return interaction.reply({
      content: "This Instagram account is already linked to your profile.",
      ephemeral: true,
    });
  }

  // Add the new Instagram account
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a new code
  user.instagramAccounts.push({
    username,
    verified: false,
    verificationCode,
    verifiedAt: null,
    agencyIds: [agencyId],
  });

  await user.save();
  await interaction.reply({
    content: `Account added successfully! Your verification code is **${verificationCode}**. Please add this code to your Instagram bio for verification.`,
    ephemeral: true,
  });
}

module.exports = handleAddCommand;
