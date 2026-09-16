import React, { useState, useEffect } from 'react';
import { intelligenceService } from '../services/apiServices';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Activity, PackageX } from 'lucide-react';
import toast from 'react-hot-toast';

const Intelligence = () => {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    intelligenceService.getAnalysis()
      .then(res => setAnalysis(res.data.data))
      .catch(() => toast.error('Failed to load intelligence data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ML Intelligence...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
          <Brain size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Inventory Intelligence</h1>
          <p className="text-gray-500 text-sm">Powered by Scikit-learn Machine Learning Models</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500">Product</th>
                <th className="px-6 py-4 font-medium text-gray-500">Health Score</th>
                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500">Classification</th>
                <th className="px-6 py-4 font-medium text-gray-500">Predicted Demand</th>
                <th className="px-6 py-4 font-medium text-gray-500">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analysis.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No data available</td></tr>
              ) : (
                analysis.map(item => (
                  <tr key={item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.productName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 max-w-[100px]">
                          <div 
                            className={`h-2.5 rounded-full ${item.healthScore > 80 ? 'bg-green-500' : item.healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{width: `${item.healthScore}%`}}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold">{item.healthScore}/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-xs font-medium ${
                        item.stockStatus === 'Healthy' ? 'text-green-600 dark:text-green-400' :
                        item.stockStatus === 'Overstocked' ? 'text-blue-600 dark:text-blue-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {item.stockStatus === 'Healthy' ? <CheckCircle size={14} /> : item.stockStatus === 'Overstocked' ? <Activity size={14} /> : <AlertTriangle size={14} />}
                        {item.stockStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        item.movementClassification === 'Fast-Moving' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                        item.movementClassification === 'Dead Stock' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                        {item.movementClassification}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-semibold">
                        <TrendingUp size={14} className="text-gray-400" />
                        {item.predictedDemand} units
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.restockNeeded ? (
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <PackageX size={14} />
                          Order {item.recommendedRestockQuantity} units
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Intelligence;
