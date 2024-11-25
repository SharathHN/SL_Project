import React from 'react';
import '../../styles/Reports.css';

function Reports() {
  const reports = [
    { id: 1, name: 'Blood Test Report', date: '2024-10-05', link: '#' },
    { id: 2, name: 'X-Ray', date: '2024-09-21', link: '#' },
    { id: 3, name: 'MRI Scan', date: '2024-08-15', link: '#' },
  ];

  return (
    <div className="reports-container">
      <h2>Your Reports</h2>
      <ul className="reports-list">
        {reports.map((report) => (
          <li key={report.id} className="report-item">
            <a href={report.link} target="_blank" rel="noopener noreferrer">
              {report.name} - {report.date}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reports;
