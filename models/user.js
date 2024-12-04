const mongoose = require("mongoose");

const ReelUrlSchema = new mongoose.Schema({
  url: String,
  shortCode: String,
  submittedAt: Date,
  platform: String,
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  lastUpdated: { type: Date, default: Date.now }, // to track updated view changes
  stats: {
    views: Number,
    likes: Number,
    comments: Number,
    engagement: Number,
  },
});

// Schema for an Instagram account linked to a user
const InstagramAccountSchema = new mongoose.Schema({
  username: String,
  verified: Boolean,
  verificationCode: String,
  verifiedAt: Date,
  totalReels: Number,
  totalViews: Number,
  totalLikes: Number,
  totalComments: Number,
  reelUrls: [ReelUrlSchema], // Reels submitted by this account
  agencyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Agency" }],
});

// Schema for statistics related to a server (agency-specific)
const ServerStatsSchema = new mongoose.Schema({
  joinedAt: Date,
  totalSubmissions: Number,
  lastActive: Date,
});

// Schema for campaigns created by agencies
const CampaignSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
  startDate: Date,
  endDate: Date,
  totalViewsNeeded: Number,
  currency: String,
  moneyPerCap: Number, // Money per specified cap (viewsPerCap)
  viewsPerCap: Number, // The cap for views (e.g., 1000, 100000)
  isActive: { type: Boolean, default: true }, // Indicates active subscription
  createdAt: { type: Date, default: Date.now },
});

// Schema for agencies (e.g., Discord servers)
const AgencySchema = new mongoose.Schema({
  discordServerId: { type: String, unique: true }, // Maps to Discord server ID
  serverName: String,
  isSubscribed: { type: Boolean, default: false }, // Indicates subscription status
  campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
  createdAt: { type: Date, default: Date.now },
});

// Schema for tracking user contributions and earnings per campaign
const CampaignContributionSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
  viewsContributed: Number,
  moneyEarned: Number,
});

// Schema for users (Discord users)
const UserSchema = new mongoose.Schema(
  {
    discordId: { type: String, unique: true }, // Maps to Discord user ID
    discordName: String,
    instagramAccounts: [InstagramAccountSchema], // User's linked Instagram accounts
    serverStats: ServerStatsSchema, // Stats for the server the user belongs to
    campaigns: [CampaignContributionSchema], // Contributions and earnings per campaign
  },
  {
    timestamps: true,
  }
);

// Create the models
const User = mongoose.model("User", UserSchema);
const Agency = mongoose.model("Agency", AgencySchema);
const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = { User, Agency, Campaign };
