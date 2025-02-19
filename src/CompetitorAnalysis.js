import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  font-family: "San Francisco", Helvetica, "Myriad Set";
  background-color: #f5f5f7;
  color: #333;
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0px 15px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 2px solid #007aff;
`;

const LoadingMessage = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #007aff;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  margin: 10px 0;

  div {
    height: 45px;
    text-align: center;
    line-height: 45px;
    color: white;
    font-size: 18px;
    font-weight: bold;
    border-radius: 12px;
    transition: width 0.5s ease, background-color 0.3s ease, transform 0.3s ease;
    cursor: pointer;

    &:hover {
      background-color: #005bb5;
      transform: scale(1.05);
    }
  }
`;

const Input = styled.input`
  padding: 14px;
  border: 2px solid #007aff;
  border-radius: 12px;
  margin-right: 14px;
  font-size: 20px;
  width: 360px;
`;

const Button = styled.button`
  padding: 14px 28px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #005bb5;
    transform: scale(1.05);
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;

  li {
    margin: 14px 0;
    a {
      color: #007aff;
      text-decoration: none;
      font-weight: bold;
      transition: color 0.3s;

      &:hover {
        color: #005bb5;
      }
    }
    p {
      font-size: 18px;
      color: #555;
    }
  }
`;

function CompetitorAnalysis() {
  const [username, setUsername] = useState("");
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKeywordAnalysis = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/videos");
      setKeywordAnalysis(response.data);
    } catch (err) {
      setError("Failed to fetch keyword analysis.");
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const videoResponse = await axios.post("http://localhost:5000/analyze", { username });
      if (videoResponse.data.error) throw new Error(videoResponse.data.error);
      setChannelData(videoResponse.data.channelData);
      setVideos(videoResponse.data.videos);
      setKeywordAnalysis(videoResponse.data.keywordAnalysis);
    } catch (err) {
      setError("Failed to fetch data. Check the username and API.");
    }

    setLoading(false);
  }, [username]);

  useEffect(() => {
    fetchKeywordAnalysis();
  }, [fetchKeywordAnalysis]);

  return (
    <Container>
      <h1>Competitor Video Analysis Dashboard</h1>
      {loading && <LoadingMessage>Analyzing...</LoadingMessage>}
      <Input
        type="text"
        placeholder="Enter Competitor's Channel Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button onClick={fetchVideos}>Analyze</Button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {channelData && (
        <div>
          <h2>Channel: {channelData.title}</h2>
          <p>Subscribers: {channelData.subscriberCount}</p>
        </div>
      )}

      <List>
        {videos.map((video) => (
          <li key={video.videoId}>
            <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
              {video.title}
            </a>
            <p>Views: {video.views} | Likes: {video.likes} | Comments: {video.comments}</p>
          </li>
        ))}
      </List>

      {keywordAnalysis && (
        <div>
          <h2>Keyword Analysis</h2>

          <h3>Top Keywords</h3>
          {keywordAnalysis.keywords?.map((keyword, index) => (
            <ProgressBar key={index}>
              <div style={{ width: `${Math.min((index + 1) * 10, 100)}%`, background: "#007aff" }}>{keyword}</div>
            </ProgressBar>
          ))}

          <h3>Top Bigrams</h3>
          {keywordAnalysis.bigrams?.map((bigram, index) => (
            <ProgressBar key={index}>
              <div style={{ width: `${Math.min((index + 1) * 10, 100)}%`, background: "#34c759" }}>{bigram}</div>
            </ProgressBar>
          ))}

          <h3>Top Trigrams</h3>
          {keywordAnalysis.trigrams?.map((trigram, index) => (
            <ProgressBar key={index}>
              <div style={{ width: `${Math.min((index + 1) * 10, 100)}%`, background: "#ff3b30" }}>{trigram}</div>
            </ProgressBar>
          ))}

          <h3>TF-IDF Scores</h3>
          {Object.entries(keywordAnalysis.tfidfScores || {}).map(([word, score], index) => (
            <ProgressBar key={index}>
              <div style={{ width: `${Math.min(score * 10, 100)}%`, background: "#ff9500" }}>{`${word}: ${score.toFixed(2)}`}</div>
            </ProgressBar>
          ))}

          <h3>Suggested Keywords for Your Next Video</h3>
          {keywordAnalysis.suggestedKeywords?.map((keyword, index) => (
            <ProgressBar key={index}>
              <div style={{ width: `${Math.min((index + 1) * 10, 100)}%`, background: "#af52de" }}>{keyword}</div>
            </ProgressBar>
          ))}

          <p><strong>Suggested Title:</strong> {keywordAnalysis.suggestedTitle || "N/A"}</p>
          <p><strong>Suggested Tags:</strong> {keywordAnalysis.suggestedTags?.join(", ") || "N/A"}</p>
        </div>
      )}
    </Container>
  );
}

export default CompetitorAnalysis;