const { Agency, Campaign } = require("../models/user");

// Handle modal submission
async function handleSubmitForm(interaction) {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "campaignModal") {
    // Extract data from modal
    const startDate = interaction.fields.getTextInputValue("startDate");
    const viewsNeeded = parseInt(
      interaction.fields.getTextInputValue("viewsNeeded"),
      10
    );
    const currency = interaction.fields.getTextInputValue("currency");
    const moneyPerCap = parseInt(
      interaction.fields.getTextInputValue("moneyPerCap"),
      10
    );
    const viewsPerCap = parseInt(
      interaction.fields.getTextInputValue("viewsPerCreatorNeeded"),
      10
    );

    try {
      // Validate agency and campaign
      const agency = await Agency.findOne({
        discordServerId: interaction.guild.id,
      });
      if (!agency) {
        return interaction.reply({
          content: "Agency not found. Please contact Quasar Owner.",
          ephemeral: true,
        });
      }

      const activeCampaign = await Campaign.findOne({
        agencyId: agency._id,
        isActive: true,
      });
      if (activeCampaign) {
        return interaction.reply({
          content: "You already have an active campaign.",
          ephemeral: true,
        });
      }

      // Calculate end date (1 month later)
      const startDateObj = new Date(startDate);
      const endDate = new Date(startDateObj);
      endDate.setMonth(endDate.getMonth() + 1);

      // Save the new campaign
      const newCampaign = await Campaign.create({
        agencyId: agency._id,
        startDate: startDateObj,
        endDate,
        totalViewsNeeded: viewsNeeded,
        currency,
        moneyPerCap,
        viewsPerCap: viewsPerCap,
      });

      // Link campaign to agency
      agency.campaigns.push(newCampaign._id);
      await agency.save();

      return interaction.reply({
        content: "Campaign successfully created!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      return interaction.reply({
        content: "An error occurred. Please try again later.",
        ephemeral: true,
      });
    }
  }
}

module.exports = handleSubmitForm;
