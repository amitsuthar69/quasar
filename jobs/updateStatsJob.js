const cron = require("node-cron");
const { User } = require("../models/user");
const fetchReelData = require("../helpers/reelData");

const updateReelStats = async () => {
  console.log("[update job started] Updating reel stats...");
  const now = new Date();
  const eightHoursInMs = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

  try {
    // aggregate users with reels that need updating
    const usersWithReelsToUpdate = await User.aggregate([
      // Unwind Instagram accounts
      { $unwind: "$instagramAccounts" },

      // Unwind reel URLs
      { $unwind: "$instagramAccounts.reelUrls" },

      // Filter reels that haven't been updated in 8 hours
      {
        $match: {
          $or: [
            {
              "instagramAccounts.reelUrls.lastUpdated": {
                $lt: new Date(now.getTime() - eightHoursInMs),
              },
            },
            { "instagramAccounts.reelUrls.lastUpdated": { $exists: false } },
          ],
        },
      },

      // Project only necessary fields
      {
        $project: {
          userId: "$_id",
          instagramAccountId: "$instagramAccounts._id",
          reelShortCode: "$instagramAccounts.reelUrls.shortCode",
        },
      },
    ]);

    // Batch process reels that need updating
    const updatePromises = usersWithReelsToUpdate.map(async (item) => {
      try {
        // Find the specific user
        const user = await User.findById(item.userId);

        // Find the specific Instagram account
        const instagramAccount = user.instagramAccounts.id(
          item.instagramAccountId
        );

        // Find the specific reel
        const reel = instagramAccount.reelUrls.find(
          (r) => r.shortCode === item.reelShortCode
        );

        if (reel) {
          // Fetch updated stats
          const updatedStats = await fetchReelData(reel.shortCode);

          if (updatedStats) {
            reel.stats = updatedStats;
            reel.lastUpdated = now;

            // Save only if there are changes
            await user.save();
          }
        }
      } catch (error) {
        console.error(`Failed to update reel ${item.reelShortCode}:`, error);
      }
    });

    // Wait for all updates to complete
    await Promise.allSettled(updatePromises);

    console.log("Cron job completed: Reel stats updated.");
  } catch (error) {
    console.error("Error in updateReelStats:", error);
  }
};

// Schedule the job to run every 8 hours
cron.schedule("0 */8 * * *", updateReelStats);
