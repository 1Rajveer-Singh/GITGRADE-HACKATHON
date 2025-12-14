import React, { useState, useEffect } from 'react';
import URLInput from './components/URLInput';
import ScoreCard from './components/ScoreCard';
import MetricsBreakdown from './components/MetricsBreakdown';
import SummaryCard from './components/SummaryCard';
import RoadmapCard from './components/RoadmapCard';
import ApiKeyModal from './components/ApiKeyModal';
import HistoryPanel from './components/HistoryPanel';
import ComparisonView from './components/ComparisonView';
import ExportButton from './components/ExportButton';
import { api } from './services/api';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [usageData, setUsageData] = useState(null);
  const [activeView, setActiveView] = useState('analyze'); // 'analyze', 'history', 'compare'
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    // Check if API key is configured
    const apiKey = localStorage.getItem('gitgrade_api_key');
    const skipApiKey = localStorage.getItem('gitgrade_skip_api_key');
    
    if (apiKey) {
      setApiKeyConfigured(true);
      loadUsageData();
      loadHistory();
    } else if (!skipApiKey) {
      // Show modal on first visit
      setTimeout(() => setShowApiKeyModal(true), 1000);
    }
  }, []);

  const loadUsageData = async () => {
    try {
      const data = await api.getUsage();
      setUsageData(data);
    } catch (error) {
      // Silently fail if not authenticated
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.getHistory(1, 50);
      setHistoryData(data.analyses || []);
    } catch (error) {
      // Silently fail
    }
  };

  const handleLoadAnalysis = async (analysisId) => {
    try {
      const data = await api.getAnalysis(analysisId);
      setAnalysisResult(data);
      setActiveView('analyze');
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      alert('Failed to load analysis: ' + error.message);
    }
  };

  const handleApiKeySaved = (apiKey) => {
    setApiKeyConfigured(true);
    loadUsageData();
    loadHistory();
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    loadHistory(); // Refresh history
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setActiveView('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySaved}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GitGrade</h1>
                <p className="text-xs text-gray-600">AI Repository Analyzer</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setActiveView('analyze'); setAnalysisResult(null); }}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeView === 'analyze'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Analyze
                </div>
              </button>
              
              <button
                onClick={() => setActiveView('history')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeView === 'history'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History
                </div>
              </button>

              {historyData.length >= 2 && (
                <button
                  onClick={() => setActiveView('compare')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    activeView === 'compare'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Compare
                  </div>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Usage Badge */}
              {apiKeyConfigured && usageData && (
                <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700">
                    <strong>{usageData.remaining.daily}</strong> left today
                  </p>
                </div>
              )}

              {/* API Key Button */}
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                API Key
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Analyze View */}
        {activeView === 'analyze' && (
          !analysisResult ? (
            // Input Section
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Analyze Your GitHub Repository
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Get an AI-powered evaluation with a score, summary, and personalized improvement roadmap
              </p>

              <URLInput onAnalysisComplete={handleAnalysisComplete} />

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Analysis</h3>
                  <p className="text-sm text-gray-600">9-dimensional scoring across code quality, testing, security, and more</p>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Generated Insights</h3>
                  <p className="text-sm text-gray-600">Powered by Google Gemini for honest, actionable feedback</p>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personalized Roadmap</h3>
                  <p className="text-sm text-gray-600">Step-by-step improvement plan tailored to your project</p>
                </div>
              </div>
            </div>
          ) : (
            // Results Section
            <div id="results" className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
                <p className="text-gray-600">Here's your comprehensive repository evaluation</p>
              </div>
              <div className="flex items-center gap-3">
                <ExportButton analysisResult={analysisResult} />
                <button
                  onClick={handleNewAnalysis}
                  className="btn btn-primary"
                >
                  New Analysis
                </button>
              </div>
            </div>

            {/* Score Card */}
            <ScoreCard
              score={analysisResult.score}
              rating={analysisResult.rating}
              badge={analysisResult.badge}
            />

            {/* Summary */}
            <SummaryCard
              summary={analysisResult.summary}
              repoInfo={analysisResult.repoInfo}
            />

            {/* Metrics Breakdown */}
            <MetricsBreakdown metrics={analysisResult.metrics} />

            {/* Roadmap */}
            <RoadmapCard roadmap={analysisResult.roadmap} />
            </div>
          )
        )}

        {/* History View */}
        {activeView === 'history' && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis History</h2>
              <p className="text-gray-600">View and load your previous repository analyses</p>
            </div>
            <HistoryPanel onLoadAnalysis={handleLoadAnalysis} />
          </div>
        )}

        {/* Compare View */}
        {activeView === 'compare' && (
          <div>
            <ComparisonView analyses={historyData} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Built for the <strong>UnsaidTalks GitGrade Hackathon</strong>
            </p>
            <p className="text-xs text-gray-500">
              100% Free Stack: React + Node.js + PostgreSQL + Redis + Google Gemini AI
            </p>
            <p className="text-xs text-gray-400 mt-2">
              © 2024 GitGrade. Open Source Project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
