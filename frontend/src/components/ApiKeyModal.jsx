import React, { useState, useEffect } from 'react';

const ApiKeyModal = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('gitgrade_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    // Validate API key format (64 hex characters)
    if (!/^[a-f0-9]{64}$/.test(apiKey)) {
      setError('Invalid API key format');
      return;
    }

    localStorage.setItem('gitgrade_api_key', apiKey);
    onSave(apiKey);
    setError(null);
    setSuccess('API key saved successfully!');
    setTimeout(() => {
      onClose();
      setSuccess(null);
    }, 1500);
  };

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/keys/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setApiKey(data.data.apiKey);
      setSuccess('API key created successfully! Save it now.');
      setShowRegister(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('gitgrade_skip_api_key', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {showRegister ? 'Get Free API Key' : 'API Key Setup'}
          </h3>
          <p className="text-sm text-gray-600">
            {showRegister
              ? 'Register for a free API key (50 analyses/day, 1000/month)'
              : 'Enter your API key to unlock unlimited analyses'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}

        {!showRegister ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your 64-character API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                Your API key is stored locally and never sent to any server except the GitGrade API.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 btn btn-primary"
              >
                Save API Key
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Get Free Key
              </button>
            </div>

            <button
              onClick={handleSkip}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Skip (Limited to IP-based rate limiting)
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>FREE Tier Limits:</strong>
                <br />
                • 50 analyses per day
                <br />
                • 1,000 analyses per month
                <br />
                • No credit card required
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRegister(false)}
                className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                className="flex-1 btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create API Key'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>
              API keys enable per-user rate limiting and usage tracking. Without an API key, you're limited to IP-based rate limiting (10 analyses/hour).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
