const { Agency } = require("../models/user");

async function handleAgencyRegistration(interaction) {
  const serverId = interaction.guild.id;
  const serverName = interaction.options.getString("server_name");
  const ownerId = interaction.guild.ownerId;

  if (interaction.user.id !== ownerId) {
    return interaction.reply({
      content: "Only the server owner can register this server!",
      ephemeral: true,
    });
  }

  try {
    // Check if the agency already exists
    const existingAgency = await Agency.findOne({ discordServerId: serverId });
    if (existingAgency) {
      return interaction.reply({
        content: "This server is already registered!",
        ephemeral: true,
      });
    }

    // Register the agency
    const newAgency = new Agency({
      discordServerId: serverId,
      serverName: serverName,
      isSubscribed: true,
      createdAt: new Date(),
    });

    await newAgency.save();

    return interaction.reply({
      content: `Successfully registered **${serverName}**! 🎉`,
    });
  } catch (error) {
    console.error("Error registering server:", error);
    return interaction.reply({
      content:
        "An error occurred while registering the server. Please try again later.",
      ephemeral: true,
    });
  }
}

module.exports = handleAgencyRegistration;
