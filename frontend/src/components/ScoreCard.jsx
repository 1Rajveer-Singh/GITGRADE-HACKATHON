import React from 'react';

const ScoreCard = ({ score, rating, badge }) => {
  const getScoreColor = (score) => {
    if (score >= 76) return 'text-green-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBadgeColor = (badge) => {
    if (badge === 'Gold') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (badge === 'Silver') return 'bg-gray-100 text-gray-800 border-gray-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const percentage = (score / 100) * 360;

  return (
    <div className="card text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Repository Score</h2>

      {/* Circular Progress */}
      <div className="relative inline-flex items-center justify-center w-48 h-48 mb-6">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(percentage / 360) * 553} 553`}
            className={getScoreColor(score)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</div>
          <div className="text-gray-600 text-sm">/ 100</div>
        </div>
      </div>

      {/* Rating Badge */}
      <div className="space-y-2">
        <div className={`inline-block px-6 py-2 rounded-full border-2 ${getBadgeColor(badge)} font-semibold`}>
          {badge} - {rating}
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          {rating === 'Advanced' && 'Outstanding repository quality!'}
          {rating === 'Intermediate' && 'Good foundation with room for improvement'}
          {rating === 'Beginner' && 'Needs significant improvements'}
        </p>
      </div>
    </div>
  );
};

export default ScoreCard;
