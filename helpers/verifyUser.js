const { User, Agency } = require("../models/user");
const verifyInstagramAccount = require("../helpers/verify");

async function verifyUser(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const agency = await Agency.findOne({
    discordServerId: interaction.guild.id,
  });
  if (!agency) {
    return interaction.editReply("Server is not registered yet!");
  }

  const user = await User.findOne({ discordId: interaction.user.id });
  if (!user) {
    return interaction.editReply("You must register first using `/register`.");
  }

  const instagramAccounts = user.instagramAccounts;

  if (!instagramAccounts) {
    return interaction.editReply(
      `No Instagram accounts are linked to your profile.`
    );
  }

  instagramAccounts.forEach(async (account) => {
    if (!account.verified) {
      const codeExistsInBio = await verifyInstagramAccount(
        account.username,
        account.verificationCode
      );
      if (!codeExistsInBio) {
        return interaction.editReply(
          `Verification failed for **${account.username}**.
Please ensure your bio contains the correct verification code,
and try the /verify command again!
          `
        );
      } else {
        account.verified = true;
        account.verifiedAt = new Date();
        user.save();
        console.log("verified!");
        return interaction.editReply("Verification completed!");
      }
    }
  });
}

module.exports = verifyUser;
