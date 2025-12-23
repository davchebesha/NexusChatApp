import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  color = 'blue',
  onClick 
}) => {
  const isPositiveTrend = trend > 0;
  const TrendIcon = isPositiveTrend ? FiTrendingUp : FiTrendingDown;

  return (
    <div 
      className={`dashboard-card ${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="card-icon">
          <Icon />
        </div>
        <div className="card-title">
          <h3>{title}</h3>
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-value">
          {value}
        </div>
        
        {trend !== undefined && (
          <div className={`card-trend ${isPositiveTrend ? 'positive' : 'negative'}`}>
            <TrendIcon className="trend-icon" />
            <span className="trend-value">
              {Math.abs(trend)}%
            </span>
            <span className="trend-label">
              {trendLabel}
            </span>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <div className="card-indicator"></div>
      </div>
    </div>
  );
};

export default DashboardCard;