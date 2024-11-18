const mongoose = require("mongoose");

const InstagramAccountSchema = new mongoose.Schema({
  username: String,
  verified: Boolean,
  verificationCode: String,
  verifiedAt: Date,
  totalReels: Number,
  totalViews: Number,
  totalLikes: Number,
  totalComments: Number,
  averageEngagementRate: Number,
});

const ReelUrlSchema = new mongoose.Schema({
  url: String,
  shortCode: String,
  submittedAt: Date,
  platform: String,
  stats: {
    views: Number,
    likes: Number,
    comments: Number,
    engagement: Number,
  },
});

const ServerStatsSchema = new mongoose.Schema({
  joinedAt: Date,
  totalSubmissions: Number,
  lastActive: Date,
});

const UserSchema = new mongoose.Schema(
  {
    discordId: { type: String, unique: true },
    discordName: String,

    instagramAccounts: [InstagramAccountSchema],

    reelUrls: [ReelUrlSchema],

    serverStats: ServerStatsSchema,
  },
  {
    timestamps: true,
  }
);

// Create the User model
const User = mongoose.model("User", UserSchema);

module.exports = User;
