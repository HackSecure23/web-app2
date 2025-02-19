const { google } = require('googleapis');
const youtube = google.youtube('v3');

// Replace with your new API key
const apiKey = 'AIzaSyCh3w2TXdyYnPV_b0u8vXFWrEesZspv_4Q';

// Replace with your channel's ID
const channelId = 'UCN-sT7RZzHBCnQKgLWpqAqw';

// Function to get channel details
async function getChannelData() {
    try {
        const res = await youtube.channels.list({
            part: 'snippet,contentDetails,statistics',
            id: channelId,  // Using the channel ID instead of username
            key: apiKey
        });

        const channelData = res.data.items[0];
        if (channelData) {
            console.log(`Channel Name: ${channelData.snippet.title}`);
            console.log(`Subscribers: ${channelData.statistics.subscriberCount}`);
            console.log(`Views: ${channelData.statistics.viewCount}`);
        } else {
            console.log('No channel data found.');
        }
    } catch (err) {
        console.error('Error fetching channel data: ', err);
    }
}

getChannelData();
