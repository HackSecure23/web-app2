require("dotenv").config(); // Load environment variables
const axios = require("axios");

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

if (!API_KEY || !CHANNEL_ID) {
  console.error("❌ Missing API Key or Channel ID. Set them in .env file.");
  process.exit(1);
}

const getChannelData = async () => {
  try {
    console.log("🔄 Fetching YouTube channel data...");

    const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
      params: {
        part: "statistics,snippet",
        id: CHANNEL_ID,
        key: API_KEY,
      },
    });

    console.log("✅ API Response received:", response.data);

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("No channel data found. Check if the Channel ID is correct.");
    }

    const channel = response.data.items[0]; // Safe to access now
    console.log("🎯 Channel Data:", {
      title: channel.snippet.title,
      description: channel.snippet.description,
      subscribers: channel.statistics.subscriberCount,
      totalViews: channel.statistics.viewCount,
      videoCount: channel.statistics.videoCount,
    });

  } catch (error) {
    console.error("❌ Error fetching channel data:", error.message);
  }
};

// Run the function when script executes
getChannelData();
