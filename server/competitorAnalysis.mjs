import axios from 'axios';

export async function fetchVideos(channelId) {
    const API_KEY = 'AIzaSyCh3w2TXdyYnPV_b0u8vXFWrEesZspv_4Q';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=5&order=date&type=video&key=${API_KEY}`;

    try {
        const response = await axios.get(url);
        return response.data.items;
    } catch (error) {
        console.error('Error fetching videos:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function analyzeCompetitors(req, res) {
    try {
        const { channelId } = req.body;
        if (!channelId) {
            return res.status(400).json({ error: "Channel ID is required" });
        }

        const videos = await fetchVideos(channelId);
        res.json({ videos });
    } catch (error) {
        console.error("Error analyzing competitors:", error);
        res.status(500).json({ error: "Failed to analyze competitors." });
    }
}

export { analyzeCompetitors };

// Test it
// fetchVideos('UC-lHJZR3Gqxm24_Vd_AJ5Yw').then(videos => console.log(videos));
