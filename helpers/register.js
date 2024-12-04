require("dotenv").config();
const { User, Agency } = require("../models/user");

async function handleRegisterCommand(interaction) {
  const platform = interaction.options.getString("platform");
  const username = interaction.options.getString("username");
  const discordServerId = interaction.guild.id;

  // 1. check for selected platform
  if (platform !== "instagram") {
    return interaction.reply({
      content: "Only Instagram is supported at this time.",
      ephemeral: true,
    });
  }

  // 2. Generate a unique verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

  // 3. Check if user already exists
  let user = await User.findOne({ discordId: interaction.user.id });

  // Check if agency (server) exists
  const agency = await Agency.findOne({ discordServerId });
  if (!agency) {
    return interaction.reply({
      content: "This server is not registered as an agency.",
      ephemeral: true,
    });
  }

  const agencyId = agency._id;

  // 4. Create new user in the database if new user
  if (!user) {
    user = new User({
      discordId: interaction.user.id,
      discordName: interaction.user.username,
      instagramAccounts: [
        {
          username,
          verified: false,
          verificationCode,
          verifiedAt: null,
          agencyIds: [agencyId],
        },
      ],
      reelUrls: [],
      serverStats: {
        joinedAt: new Date(),
        totalSubmissions: 0,
        lastActive: new Date(),
      },
    });

    await user.save();

    // 5. respond with code
    await interaction.reply({
      content: `Registration successful! Your verification code is **${verificationCode}**. Please keep this code in your Instagram bio to verify.`,
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content:
        "You are already registered. Use `/add` to link another Instagram account.",
      ephemeral: true,
    });
  }
}

module.exports = handleRegisterCommand;
