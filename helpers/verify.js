require("dotenv").config();
const axios = require("axios");

async function verifyInstagramAccount(username, expectedCode) {
  const options = {
    method: "GET",
    url: "https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile",
    params: {
      ig: username,
      response_type: "short",
      corsEnabled: "false",
    },
    headers: {
      "x-rapidapi-key": process.env.INSTAGRAM_API_KEY,
      "x-rapidapi-host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const bio = response.data[0]?.biography || "";
    console.log("\nuserN:", username, "\nexpC: ", expectedCode, "\nbio:", bio);
    return bio.includes(expectedCode); // Check if the code is in the bio
  } catch (error) {
    console.error("Error verifying Instagram account:", error);
    return false;
  }
}

module.exports = verifyInstagramAccount;
