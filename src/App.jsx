import React from "react";
import CompetitorAnalysis from "./CompetitorAnalysis"; // ✅ Import the Competitor Analysis component

function App() {
  return (
    <div className="App" style={{ textAlign: "center", padding: "20px" }}>
      <h1>SEO Tube - Competitor Analysis</h1>
      <p>Enter a YouTube channel ID to analyze its top videos and SEO performance.</p>
      <CompetitorAnalysis /> {/* ✅ Render the component */}
    </div>
  );
}

export default App;
