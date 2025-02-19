import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://infolewisindustries:Qu567vt@cluster0.m8kz0.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your actual MongoDB URI

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

const keywordSchema = new mongoose.Schema({
    keywords: [String],
    bigrams: [String],
    trigrams: [String],
    tfidfScores: Object,
    avgSentiment: Number,
    topics: Array,
    timestamp: { type: Date, default: Date.now }
});

const KeywordAnalysis = mongoose.model("KeywordAnalysis", keywordSchema);

async function testMongoQuery() {
    try {
        const keywordAnalysis = await KeywordAnalysis.find().sort({ timestamp: -1 }).limit(1);
        console.log("MongoDB Data:", keywordAnalysis);
        mongoose.connection.close();
    } catch (err) {
        console.error("Error fetching MongoDB data:", err);
        mongoose.connection.close();
    }
}

testMongoQuery();
