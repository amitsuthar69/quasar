const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

async function handleCampaignForm(interaction) {
  // Check if the user is the server owner
  if (interaction.user.id !== interaction.guild.ownerId) {
    return interaction.reply({
      content: "Only the server owner can use this command.",
      ephemeral: true,
    });
  }

  const modal = new ModalBuilder()
    .setCustomId("campaignModal")
    .setTitle("New Campaign Form");

  const startDateInput = new TextInputBuilder()
    .setCustomId("startDate")
    .setLabel("Start Date (YYYY-MM-DD)")
    .setPlaceholder("Enter the start date for your campaign")
    .setStyle(TextInputStyle.Short);

  const viewsInput = new TextInputBuilder()
    .setCustomId("viewsNeeded")
    .setLabel("Total Views Needed")
    .setPlaceholder("e.g., 1000000")
    .setStyle(TextInputStyle.Short);

  const currencyInput = new TextInputBuilder()
    .setCustomId("currency")
    .setLabel("Currency (e.g., USD, INR)")
    .setPlaceholder("Enter the currency type")
    .setStyle(TextInputStyle.Short);

  const viewsPerCreatorInput = new TextInputBuilder()
    .setCustomId("viewsPerCreatorNeeded")
    .setLabel("Required Views per Creator")
    .setPlaceholder("e.g., 100000")
    .setStyle(TextInputStyle.Short);

  const moneyInput = new TextInputBuilder()
    .setCustomId("moneyPerCap")
    .setLabel("Money per Views Cap")
    .setPlaceholder("e.g., 3")
    .setStyle(TextInputStyle.Short);

  // Add inputs to modal
  modal.addComponents(
    new ActionRowBuilder().addComponents(startDateInput),
    new ActionRowBuilder().addComponents(viewsInput),
    new ActionRowBuilder().addComponents(currencyInput),
    new ActionRowBuilder().addComponents(viewsPerCreatorInput),
    new ActionRowBuilder().addComponents(moneyInput)
  );

  // Show the modal
  await interaction.showModal(modal);
}

module.exports = handleCampaignForm;
