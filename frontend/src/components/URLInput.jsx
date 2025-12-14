import React, { useState } from 'react';
import { api } from '../services/api';

const URLInput = ({ onAnalysisComplete }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    // Validate GitHub URL format
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(repoUrl)) {
      setError('Invalid GitHub URL format. Example: https://github.com/username/repo');
      return;
    }

    setLoading(true);

    try {
      const result = await api.analyzeRepository(repoUrl);
      onAnalysisComplete(result);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="card">
        <div className="mb-4">
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="text"
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Repository...
            </span>
          ) : (
            'Analyze Repository'
          )}
        </button>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Analysis typically takes 1-3 minutes
        </p>
      </form>

      {/* Example URLs */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-2">Try an example:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setRepoUrl('https://github.com/facebook/react')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition"
            disabled={loading}
          >
            facebook/react
          </button>
          <button
            onClick={() => setRepoUrl('https://github.com/vercel/next.js')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition"
            disabled={loading}
          >
            vercel/next.js
          </button>
          <button
            onClick={() => setRepoUrl('https://github.com/nodejs/node')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition"
            disabled={loading}
          >
            nodejs/node
          </button>
        </div>
      </div>
    </div>
  );
};

export default URLInput;
