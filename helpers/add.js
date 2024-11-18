require("dotenv").config();
const User = require("../models/user");

async function handleAddCommand(interaction) {
  const platform = interaction.options.getString("platform");
  const username = interaction.options.getString("username");

  if (platform !== "instagram") {
    return interaction.reply({
      content: "Only Instagram is supported at this time.",
      ephemeral: true,
    });
  }

  const user = await User.findOne({ discordId: interaction.user.id });
  if (!user) {
    return interaction.reply("You must register first using `/register`.");
  }

  // Check if username already exists in the user's Instagram accounts
  const existingAccount = user.instagramAccounts.find(
    (account) => account.username === username
  );
  if (existingAccount) {
    return interaction.reply(
      "This Instagram account is already linked to your profile."
    );
  }

  // Add the new Instagram account
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a new code
  user.instagramAccounts.push({
    username,
    verified: false,
    verificationCode,
    verifiedAt: null,
  });

  await user.save();
  await interaction.reply(
    `Account added successfully! Your verification code is **${verificationCode}**. Please add this code to your Instagram bio for verification.`
  );
}

module.exports = handleAddCommand;
