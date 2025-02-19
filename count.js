const { google } = require('googleapis');
const youtube = google.youtube('v3');

// Replace with your API key
const apiKey = 'AIzaSyCh3w2TXdyYnPV_b0u8vXFWrEesZspv_4Q';

// Function to get channel details
const getChannelData = async () => {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
        params: {
          part: 'statistics,snippet',
          id: 'YOUR_CHANNEL_ID',
          key: 'YOUR_API_KEY'
        }
      });
  
      if (!response.data.items || response.data.items.length === 0) {
        throw new Error("No channel data found");
      }
  
      const channel = response.data.items[0]; // Now it is safe to access
      console.log("Channel Data:", channel);
      
      return channel;
    } catch (error) {
      console.error("Error fetching channel data:", error.message);
    }
  };
  

getChannelData();
