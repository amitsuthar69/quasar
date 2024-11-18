require("dotenv").config();
const axios = require("axios");

async function fetchReelData(shortCode) {
  try {
    console.log("Fetching data for shortCode:", shortCode);

    const response = await axios.request({
      method: "GET",
      url: "https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_id",
      params: { shortcode: shortCode },
      headers: {
        "X-RapidAPI-Key": process.env.INSTAGRAM_API_KEY,
        "X-RapidAPI-Host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
      },
    });

    // The response is an array with a single object containing an 'items' array
    const data = response.data[0]?.items[0];

    if (!data) {
      console.error("No data found in response");
      return null;
    }

    return {
      views: data.view_count || data.play_count || 0,
      likes: data.like_count || 0,
      comments: data.comment_count || 0,
      duration: data.video_duration || 0,
      hasAudio: data.has_audio || false,
      timestamp: Date.now(),
      shortCode,
    };
  } catch (error) {
    console.error(
      `Error fetching reel data:`,
      error.response?.data || error.message
    );
    return null;
  }
}

module.exports = fetchReelData;
