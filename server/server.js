import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import natural from 'natural';
import lda from 'lda';
import googleTrends from 'google-trends-api';

const SentimentAnalyzer = natural.SentimentAnalyzer;
const PorterStemmer = natural.PorterStemmer;
import TfIdf from 'natural/lib/natural/tfidf/tfidf.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = 'AIzaSyCh3w2TXdyYnPV_b0u8vXFWrEesZspv_4Q';

// ✅ **Fetch Channel Data**
async function getChannelData(channelName) {
    try {
        console.log(`📡 Searching for channel: ${channelName}`);
        const searchResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: { key: API_KEY, q: channelName, type: "channel", part: "snippet", maxResults: 1 }
        });

        if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
            console.error("❌ No channel found.");
            return null;
        }

        const channelId = searchResponse.data.items[0].id.channelId;
        const channelTitle = searchResponse.data.items[0].snippet.title;

        const statsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
            params: { key: API_KEY, id: channelId, part: "statistics" }
        });

        const stats = statsResponse.data.items[0]?.statistics || {};

        return {
            channelId,
            title: channelTitle,
            subscriberCount: stats.subscriberCount || "0"
        };

    } catch (error) {
        console.error("❌ Error fetching channel data:", error.response?.data || error);
        return null;
    }
}

// ✅ **Fetch Last 10 Videos & Tags**
async function getLatestVideos(channelId) {
    try {
        console.log(`📡 Fetching latest 10 videos for channel ID: ${channelId}`);

        const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: { key: API_KEY, channelId: channelId, part: "snippet", maxResults: 10, order: "date", type: "video" }
        });

        const videoIds = videoResponse.data.items.map(video => video.id.videoId);

        const videoDetailsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: { key: API_KEY, id: videoIds.join(','), part: "snippet,statistics" }
        });

        return videoDetailsResponse.data.items.map(video => ({
            videoId: video.id,
            title: video.snippet.title || "No Title",
            description: video.snippet.description || "No Description",
            tags: video.snippet.tags || [],
            views: video.statistics?.viewCount || "N/A",
            likes: video.statistics?.likeCount || "N/A",
            comments: video.statistics?.commentCount || "N/A"
        }));

    } catch (error) {
        console.error("❌ Error fetching latest videos:", error.response?.data || error);
        return [];
    }
}

// ✅ **Perform Advanced Keyword Analysis**
async function analyzeKeywords(videos) {
    const tokenizer = new natural.WordTokenizer();
    const tfidf = new TfIdf();
    const sentimentAnalyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

    let allTokens = [];
    let sentimentScores = [];
    let videoTexts = [];

    videos.forEach(video => {
        const combinedText = `${video.title} ${video.description} ${video.tags.join(' ')}`.toLowerCase();
        const tokens = tokenizer.tokenize(combinedText);
        allTokens.push(...tokens);
        tfidf.addDocument(tokens.join(' '));
        sentimentScores.push(sentimentAnalyzer.getSentiment(tokens));
        videoTexts.push(combinedText);
    });

    // ✅ Remove stopwords for better keyword ranking
    const stopwords = new Set(["video", "watch", "this", "new", "best", "how", "to", "your", "for", "with", "from", "what"]);
    const filteredTokens = allTokens.filter(word => !stopwords.has(word) && word.length > 3);

    const topKeywords = [...new Set(filteredTokens)].slice(0, 15);
    const bigrams = natural.NGrams.bigrams(filteredTokens).map(b => b.join(' ')).slice(0, 10);
    const trigrams = natural.NGrams.trigrams(filteredTokens).map(t => t.join(' ')).slice(0, 10);

    let tfidfScores = {};
    tfidf.listTerms(0).forEach(item => {
        tfidfScores[item.term] = item.tfidf;
    });

    let trendingKeywords = [];
    try {
        const trends = await googleTrends.dailyTrends({ geo: 'US', hl: 'en-US', tz: -420 });
        const trendData = JSON.parse(trends);
        trendingKeywords = trendData.default.trendingSearchesDays[0].trendingSearches.map(item => item.title.query);
    } catch (error) {
        console.error("❌ Error fetching Google Trends:", error);
    }

    let topicModeling;
    try {
        const ldaResults = lda(videoTexts.map(text => text.split(' ')), 3, 5);
        topicModeling = ldaResults.map(topic => topic.map(word => word.term).join(", "));
    } catch (error) {
        console.error("❌ Error processing LDA:", error);
        topicModeling = [];
    }

    // ✅ **Generate Creative & Unique Suggested Titles**
    const titleFormats = [
        `🚀 Mastering ${topKeywords[0]} - The Ultimate Guide!`,
        `🔥 Why ${topKeywords[0]} is Changing the Game in ${new Date().getFullYear()}!`,
        `📢 Stop Doing ${topKeywords[0]} Wrong! Do THIS Instead`,
        `💡 10 Surprising Facts About ${topKeywords[0]} You Didn't Know!`,
        `💰 How to Earn More Using ${topKeywords[0]} - Expert Tips`,
        `⏳ The Future of ${topKeywords[0]} - What You Need to Know!`,
        `🛑 Biggest Mistakes to Avoid in ${topKeywords[0]} RIGHT NOW`,
        `📈 Boost Your Channel With These ${topKeywords[0]} Growth Hacks!`
    ];

    const suggestedTitle = titleFormats[Math.floor(Math.random() * titleFormats.length)]; // Randomized selection

    // ✅ **Generate 25 Super Relevant Suggested Tags**
    const suggestedTags = [...new Set([...topKeywords, ...bigrams, ...trigrams])]
        .sort((a, b) => (tfidfScores[b] || 0) - (tfidfScores[a] || 0))
        .slice(0, 25);

    return {
        keywords: topKeywords,
        bigrams,
        trigrams,
        tfidfScores,
        trendingKeywords,
        avgSentiment: sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length,
        topics: topicModeling,
        suggestedTitle,  // ⬅️ **Now generates creative, engaging titles**
        suggestedTags
    };
}

// ✅ **Analyze Competitor & Return AI-Driven Data**
app.post('/analyze', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required." });

    try {
        const channelData = await getChannelData(username);
        if (!channelData) return res.status(404).json({ error: "Channel not found." });

        const videos = await getLatestVideos(channelData.channelId);
        const keywordAnalysis = await analyzeKeywords(videos);

        res.json({ channelData, videos, keywordAnalysis });

    } catch (error) {
        console.error("❌ Error analyzing competitor:", error);
        res.status(500).json({ error: "Failed to analyze competitor." });
    }
});

// ✅ **Fetch Last Analysis (No MongoDB)**
app.get('/videos', async (req, res) => {
    res.json({ message: "Real-time analysis only. Use /analyze for competitor data." });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 AI-Enhanced Server running on http://localhost:${PORT}`));
