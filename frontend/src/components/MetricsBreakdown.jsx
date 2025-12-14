import React from 'react';

const MetricsBreakdown = ({ metrics }) => {
  const dimensions = [
    { name: 'Code Quality', score: metrics.codeQuality, max: 20, color: 'bg-blue-500' },
    { name: 'Project Structure', score: metrics.projectStructure, max: 15, color: 'bg-purple-500' },
    { name: 'Documentation', score: metrics.documentation, max: 15, color: 'bg-green-500' },
    { name: 'Testing', score: metrics.testing, max: 12, color: 'bg-yellow-500' },
    { name: 'Git Practices', score: metrics.gitPractices, max: 12, color: 'bg-pink-500' },
    { name: 'Security', score: metrics.security, max: 10, color: 'bg-red-500' },
    { name: 'CI/CD', score: metrics.cicd, max: 8, color: 'bg-indigo-500' },
    { name: 'Dependencies', score: metrics.dependencies, max: 5, color: 'bg-orange-500' },
    { name: 'Containerization', score: metrics.containerization, max: 3, color: 'bg-teal-500' },
  ];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Metrics Breakdown</h2>

      <div className="space-y-4">
        {dimensions.map((dim) => {
          const percentage = (dim.score / dim.max) * 100;

          return (
            <div key={dim.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{dim.name}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {dim.score} / {dim.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 ${dim.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Each dimension is weighted differently. Total: 100 points
        </p>
      </div>
    </div>
  );
};

export default MetricsBreakdown;
