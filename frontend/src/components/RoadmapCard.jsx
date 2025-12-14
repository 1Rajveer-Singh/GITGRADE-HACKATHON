import React from 'react';

const RoadmapCard = ({ roadmap }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  };

  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Improvement Roadmap</h2>
        <p className="text-gray-600">No improvements needed - excellent work!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Improvement Roadmap</h2>
        <span className="text-sm text-gray-500">{roadmap.length} steps</span>
      </div>

      <div className="space-y-4">
        {roadmap.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Step Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </span>
                    {getPriorityIcon(item.priority)}
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-3">{item.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Estimated: {item.estimatedTime}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Badge */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Complete these steps to improve your repository quality
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>AI Generated</span>
        </div>
      </div>
    </div>
  );
};

export default RoadmapCard;
