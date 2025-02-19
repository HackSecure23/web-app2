const googleTrends = require('google-trends-api');

// Function to fetch trending keywords from Google Trends
async function getTrendingKeywords() {
    try {
        // Fetch daily trends for the US
        const trends = await googleTrends.dailyTrends({
            geo: 'US',  // Country code (you can change this as needed)
            hl: 'en-US',  // Language
            tz: -420  // Timezone offset (for US Pacific Time)
        });

        // Parse the trends data
        const trendData = JSON.parse(trends);
        const trendingKeywords = trendData.default.trendingSearchesDays[0].trendingSearches.map(item => item.title.query);

        console.log('Trending Keywords:', trendingKeywords);
        return trendingKeywords;
    } catch (error) {
        console.error('Error fetching trending keywords:', error);
    }
}

// Function to generate video title suggestions based on trending keywords
async function generateTitleSuggestions() {
    const trendingKeywords = await getTrendingKeywords();

    if (trendingKeywords) {
        const titles = trendingKeywords.map(keyword => `How to Create ${keyword} Content for YouTube`);
        console.log('Generated Titles:', titles);
        return titles;
    }
}

// Function to generate video tag suggestions based on trending keywords
async function generateTagSuggestions() {
    const trendingKeywords = await getTrendingKeywords();

    if (trendingKeywords) {
        const tags = trendingKeywords.map(keyword => keyword.toLowerCase().replace(/\s+/g, '-'));
        console.log('Generated Tags:', tags);
        return tags;
    }
}

// Function to generate video description suggestions based on trending keywords
async function generateDescriptionSuggestions() {
    const trendingKeywords = await getTrendingKeywords();

    if (trendingKeywords) {
        const descriptions = trendingKeywords.map(keyword => 
            `In this video, we discuss how to incorporate ${keyword} in your YouTube content strategy. Learn tips and tricks to create the best ${keyword} videos for your audience!`
        );
        console.log('Generated Descriptions:', descriptions);
        return descriptions;
    }
}

// Run all functions to fetch suggestions
async function runKeywordSuggestions() {
    console.log("Fetching trending keywords...");
    await generateTitleSuggestions();
    await generateTagSuggestions();
    await generateDescriptionSuggestions();
}

runKeywordSuggestions();
