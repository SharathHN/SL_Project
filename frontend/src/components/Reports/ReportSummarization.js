import React, { useState } from 'react';
import '../../styles/Reports.css';

function ReportSummary() {
  const [reportText, setReportText] = useState('');
  const [summary, setSummary] = useState('');

  const handleSummarize = (e) => {
    e.preventDefault();
    // Placeholder for API call to generate summary
    const generatedSummary = `This is a summary of the report: ${reportText.slice(0, 100)}...`;
    setSummary(generatedSummary);
  };

  return (
    <div className="report-summary-container">
      <h2>Report Summary</h2>
      <form onSubmit={handleSummarize} className="report-form">
        <label>Enter Report Text:</label>
        <textarea
          rows="6"
          placeholder="Paste the full report text here..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
        ></textarea>
        <button type="submit" className="summarize-button">Generate Summary</button>
      </form>

      {summary && (
        <div className="summary-result">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default ReportSummary;
