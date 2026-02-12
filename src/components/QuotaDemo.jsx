import React, { useState, useEffect } from 'react';
import { QuotaManager } from '../utils/quotaManager';

// Demo component showing quota management usage
export function QuotaDemo() {
  const [quotaStatus, setQuotaStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulatingUsage, setSimulatingUsage] = useState(false);

  useEffect(() => {
    loadQuotaStatus();
  }, []);

  const loadQuotaStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await QuotaManager.getQuotaStatus();
      setQuotaStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvaluation = async () => {
    try {
      setSimulatingUsage(true);

      // Check quota and record usage
      await QuotaManager.recordUsage('evaluation');

      // Simulate the actual evaluation process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reload quota status
      await loadQuotaStatus();

      alert('✓ Evaluation created successfully!');
    } catch (err) {
      if (err.name === 'QuotaError') {
        alert(`\ud83d\udcc8 Quota exceeded!\n\n${err.message}\n\nConsider upgrading your plan.`);
      } else {
        alert(`Error: ${err.message}`);
      }
    } finally {
      setSimulatingUsage(false);
    }
  };

  const handleAIAnalysis = async () => {
    try {
      setSimulatingUsage(true);

      // Check if AI features are available
      if (QuotaManager.isUpgradeRequired('ai-analysis')) {
        alert('\u26a0\ufe0f AI Analysis requires a PRO or PREMIUM plan!\n\nUpgrade to access AI-powered insights.');
        return;
      }

      // Record usage
      await QuotaManager.recordUsage('ai-analysis');

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reload quota status
      await loadQuotaStatus();

      alert('🤖 AI Analysis completed! Your insights are ready.');
    } catch (err) {
      if (err.name === 'QuotaError') {
        alert(`\ud83d\udcc8 You've used all your AI credits!\n\n${err.message}`);
      } else {
        alert(`Error: ${err.message}`);
      }
    } finally {
      setSimulatingUsage(false);
    }
  };

  const handleCompareProjects = async () => {
    try {
      const needsUpgrade = QuotaManager.isUpgradeRequired('FREE', 'compare');
      if (needsUpgrade) {
        alert('\u26a0\ufe0f Project comparison is not available in FREE tier!\n\nUpgrade to PRO to compare up to 3 projects, or PREMIUM for unlimited comparisons.');
        return;
      }

      alert('📊 Opening project comparison tool...\n\n(Only available in PRO and PREMIUM plans)');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleExportData = async () => {
    try {
      const needsUpgrade = QuotaManager.isUpgradeRequired('FREE', 'export');
      if (needsUpgrade) {
        alert('\u26a0\ufe0f Export functionality requires a PAID plan!\n\nUpgrade to PRO or PREMIUM to export your data.');
        return;
      }

      alert('\ud83d\udcce Exporting data...\n\n(Only available in PRO and PREMIUM plans)');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const setMockTier = async (tier) => {
    await QuotaManager.setMockData({ tier });
    await loadQuotaStatus();
  };

  const simulateExceedingLimit = async () => {
    await QuotaManager.setMockData({
      tier: 'FREE',
      evaluations_used: 1
    });
    await loadQuotaStatus();

    // Try to create one more evaluation (should fail)
    handleCreateEvaluation();
  };

  if (loading) {
    return <div className="text-center p-4">Loading quota status...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  const evaluationStatus = quotaStatus.evaluation;
  const aiCreditsStatus = quotaStatus.aiCredits;
  const tier = quotaStatus.tier;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Quota Management Demo</h1>

      {/* Tier Selection */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Test Different Tiers:</h2>
        <div className="flex gap-2">
          <button onClick={() => setMockTier('FREE')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            FREE
          </button>
          <button onClick={() => setMockTier('PRO')} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            PRO
          </button>
          <button onClick={() => setMockTier('PREMIUM')} className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">
            PREMIUM
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-2">Current Status:</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Tier:</span> {tier}
          </div>
          <div>
            <span className="font-medium">Evaluations:</span> {evaluationStatus.used} / {evaluationStatus.isUnlimited ? '∞' : evaluationStatus.limit}
          </div>
          <div>
            <span className="font-medium">AI Credits:</span> {aiCreditsStatus.used} / {aiCreditsStatus.isUnlimited ? '∞' : aiCreditsStatus.limit}
          </div>
          <div>
            <span className="font-medium">Last Reset:</span> {new Date(quotaStatus.lastResetDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mb-6">
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span>Evaluations</span>
            <span className="text-sm text-gray-600">
              {evaluationStatus.used} / {evaluationStatus.limit === -1 ? '∞' : evaluationStatus.limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(evaluationStatus.usagePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span>AI Credits</span>
            <span className="text-sm text-gray-600">
              {aiCreditsStatus.used} / {aiCreditsStatus.limit === -1 ? '∞' : aiCreditsStatus.limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${Math.min(aiCreditsStatus.usagePercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feature Buttons */}
      <div className="mb-6">
        <h2 className="font-semibold mb-3">Try Features:</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCreateEvaluation}
            disabled={evaluationStatus.remaining === 0 || simulatingUsage}
            className={`p-3 rounded-lg font-medium ${
              evaluationStatus.remaining === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {simulatingUsage && evaluationStatus !== null ? 'Creating...' : '📝 Create Evaluation'}
          </button>

          <button
            onClick={handleAIAnalysis}
            disabled={aiCreditsStatus.remaining === 0 && !aiCreditsStatus.isUnlimited || simulatingUsage}
            className={`p-3 rounded-lg font-medium ${
              aiCreditsStatus.remaining === 0 && !aiCreditsStatus.isUnlimited
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {simulatingUsage && !evaluationStatus ? 'Analyzing...' : '🤖 AI Analysis'}
          </button>

          <button
            onClick={handleCompareProjects}
            disabled={QuotaManager.isUpgradeRequired('FREE', 'compare')}
            className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            📊 Compare Projects
          </button>

          <button
            onClick={handleExportData}
            disabled={QuotaManager.isUpgradeRequired('FREE', 'export')}
            className="p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
          >
            📤 Export Data
          </button>
        </div>
      </div>

      {/* Feature Availability */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h2 className="font-semibold mb-2">Feature Availability:</h2>
        <ul className="text-sm space-y-1">
          <li className={evaluationStatus.isUpgradeRequired ? 'text-gray-600' : 'text-green-600'}>
            {evaluationStatus.isUpgradeRequired ? '❌' : '✅'} Evaluations: {evaluationStatus.limit === -1 ? 'Unlimited' : `${evaluationStatus.limit} per month`}
          </li>
          <li className={aiCreditsStatus.isUpgradeRequired ? 'text-gray-600' : 'text-green-600'}>
            {aiCreditsStatus.isUpgradeRequired ? '❌' : '✅'} AI Analysis: {aiCreditsStatus.limit === -1 ? 'Unlimited' : `${aiCreditsStatus.limit} credits per month`}
          </li>
          <li className={QuotaManager.isUpgradeRequired('FREE', 'compare') ? 'text-gray-600' : 'text-green-600'}>
            {QuotaManager.isUpgradeRequired('FREE', 'compare') ? '❌' : '✅'} Compare Projects: {tier === 'PRO' ? 'up to 3' : tier === 'PREMIUM' ? 'unlimited' : 'not available'}
          </li>
          <li className={QuotaManager.isUpgradeRequired('FREE', 'export') ? 'text-gray-600' : 'text-green-600'}>
            {QuotaManager.isUpgradeRequired('FREE', 'export') ? '❌' : '✅'} Export Data
          </li>
        </ul>
      </div>

      {/* Test Scenarios */}
      <div className="space-y-2">
        <button
          onClick={simulateExceedingLimit}
          className="w-full p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
        >
          🧪 Test: Simulate hitting evaluation limit
        </button>
      </div>

      {/* Loading Indicator */}
      {simulatingUsage && (
        <div className="text-center py-4 text-blue-600">
          Processing... ⏳
        </div>
      )}
    </div>
  );
}
