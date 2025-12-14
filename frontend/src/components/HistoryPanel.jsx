import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const HistoryPanel = ({ onLoadAnalysis }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getHistory(page, 10);
      setHistory(data.analyses || []);
      setTotalPages(Math.ceil((data.total || 0) / 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Gold': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Silver': 'bg-gray-100 text-gray-800 border-gray-300',
      'Bronze': 'bg-orange-100 text-orange-800 border-orange-300',
      'Beginner': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[badge] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getScoreColor = (score) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 500) return 'text-blue-600';
    if (score >= 300) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading && history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-800 font-medium">{error}</p>
        <button onClick={loadHistory} className="mt-4 btn btn-sm bg-red-600 text-white hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis History</h3>
        <p className="text-gray-600">Start analyzing repositories to see your history here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* History Items */}
      <div className="grid gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onLoadAnalysis(item.id)}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Repo Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition">
                    {item.repo_owner}/{item.repo_name}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-medium border rounded ${getBadgeColor(item.badge)}`}>
                    {item.badge}
                  </span>
                </div>
                
                {item.repo_description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.repo_description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(item.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {item.rating}
                  </span>
                </div>
              </div>

              {/* Right: Score */}
              <div className="flex flex-col items-end">
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(item.score)}`}>
                    {item.score}
                  </div>
                  <div className="text-xs text-gray-500">out of 900</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition ${
                  page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
