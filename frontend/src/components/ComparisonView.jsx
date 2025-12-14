import React, { useState } from 'react';

const ComparisonView = ({ analyses }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareData, setCompareData] = useState(null);

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const compareAnalyses = () => {
    const selected = analyses.filter(a => selectedIds.includes(a.id));
    setCompareData(selected);
  };

  const getMetricComparison = (metricName) => {
    return compareData.map(analysis => {
      const metric = analysis.metrics?.find(m => m.category === metricName);
      return {
        repoName: `${analysis.repo_owner}/${analysis.repo_name}`,
        score: metric?.score || 0,
        maxScore: metric?.max_score || 100
      };
    });
  };

  const metricCategories = [
    'Code Quality',
    'Testing',
    'Security',
    'Documentation',
    'Dependencies',
    'Git Practices',
    'CI/CD',
    'Project Structure',
    'Containerization'
  ];

  if (!compareData) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-blue-900">Compare Analyses</h3>
              <p className="text-sm text-blue-700 mt-1">
                Select 2-3 analyses from your history to compare their metrics and scores
              </p>
            </div>
          </div>
        </div>

        {/* Selection Grid */}
        <div className="grid gap-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                selectedIds.includes(analysis.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSelection(analysis.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedIds.includes(analysis.id)
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedIds.includes(analysis.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {analysis.repo_owner}/{analysis.repo_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">{analysis.score}</div>
                  <div className="text-xs text-gray-500">{analysis.badge}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compare Button */}
        <button
          onClick={compareAnalyses}
          disabled={selectedIds.length < 2}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compare {selectedIds.length} Analyses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Comparison Results</h2>
        <button
          onClick={() => setCompareData(null)}
          className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          ← Back to Selection
        </button>
      </div>

      {/* Overall Scores */}
      <div className="grid md:grid-cols-3 gap-4">
        {compareData.map((analysis) => (
          <div key={analysis.id} className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
            <div className="font-medium text-gray-900 mb-2 truncate">
              {analysis.repo_owner}/{analysis.repo_name}
            </div>
            <div className="text-4xl font-bold text-primary-600 mb-1">
              {analysis.score}
            </div>
            <div className="text-sm text-gray-500">out of 900</div>
            <div className="mt-3">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {analysis.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Metrics Breakdown</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {metricCategories.map((category) => {
            const comparison = getMetricComparison(category);
            return (
              <div key={category} className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">{category}</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {comparison.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-sm text-gray-600 truncate">{item.repoName}</div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-primary-600">{item.score}</span>
                        <span className="text-sm text-gray-500 mb-1">/ {item.maxScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rating & Badge Comparison</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {compareData.map((analysis) => (
            <div key={analysis.id} className="text-center">
              <div className="text-sm text-gray-600 mb-2 truncate">
                {analysis.repo_owner}/{analysis.repo_name}
              </div>
              <div className="text-lg font-semibold text-gray-900">{analysis.rating}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
