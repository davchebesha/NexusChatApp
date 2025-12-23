import React from 'react';
import './ChartWidget.css';

const ChartWidget = ({ title, type, data }) => {
  const maxValue = Math.max(...data.data);

  const renderBarChart = () => {
    return (
      <div className="bar-chart">
        {data.labels.map((label, index) => {
          const value = data.data[index];
          const height = (value / maxValue) * 100;
          
          return (
            <div key={index} className="bar-item">
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ height: `${height}%` }}
                  title={`${label}: ${value}`}
                >
                  <span className="bar-value">{value}</span>
                </div>
              </div>
              <div className="bar-label">{label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const points = data.data.map((value, index) => {
      const x = (index / (data.data.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 80; // 80% of height for data, 20% for padding
      return { x, y, value };
    });

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="line-chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d={pathData}
            fill="none"
            stroke="var(--primary-color)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="var(--primary-color)"
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${data.labels[index]}: ${point.value}`}</title>
            </circle>
          ))}
        </svg>
        <div className="line-labels">
          {data.labels.map((label, index) => (
            <span key={index} className="line-label">{label}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="chart-widget">
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="chart-container">
        {type === 'bar' && renderBarChart()}
        {type === 'line' && renderLineChart()}
      </div>
    </div>
  );
};

export default ChartWidget;