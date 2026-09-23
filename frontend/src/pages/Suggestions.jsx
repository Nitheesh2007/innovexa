import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Plus, ThumbsUp, Clock, CheckCircle, XCircle, Search, Edit3 } from 'lucide-react';

const Suggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Suggestion',
    priority: 'Medium'
  });

  const [adminResponseInput, setAdminResponseInput] = useState({});

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/suggestions');
      setSuggestions(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.warn('Failed to load feedback:', error);
      setSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/suggestions', formData);
      toast.success('Feedback submitted successfully');
      setShowForm(false);
      setFormData({ title: '', description: '', type: 'Suggestion', priority: 'Medium' });
      fetchSuggestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    }
  };

  const handleUpvote = async (id) => {
    try {
      await api.put(`/suggestions/${id}/upvote`);
      fetchSuggestions();
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const payload = { status };
      if (adminResponseInput[id]) {
        payload.adminResponse = adminResponseInput[id];
      }
      await api.put(`/suggestions/${id}/status`, payload);
      toast.success('Status updated');
      setAdminResponseInput(prev => ({...prev, [id]: ''})); // clear input
      fetchSuggestions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'REVIEWING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-indigo-500" />
            Suggestions & Feedback
          </h1>
          <p className="text-gray-500 mt-1">Help us improve the system by sharing your ideas.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          <Plus size={18} />
          Submit Feedback
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input 
                required type="text"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white"
                placeholder="Brief summary of your feedback"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select 
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white"
                >
                  <option value="Suggestion">Suggestion</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select 
                  value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea 
                required rows="4"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white"
                placeholder="Provide detailed information..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Submit</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion) => (
          <div key={suggestion._id} className="glass rounded-2xl p-5 border border-white/20 dark:border-white/5 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(suggestion.status)}`}>
                  {suggestion.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                  {suggestion.type || suggestion.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{suggestion.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{suggestion.description}</p>
              
              {suggestion.adminResponse && (
                <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-indigo-500 p-3 rounded-r-lg">
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-1">
                    <CheckCircle size={12}/> Admin Response
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{suggestion.adminResponse}"</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500 flex flex-col">
                  <span>By <span className="font-semibold text-gray-700 dark:text-gray-300">{suggestion.submittedBy?.name || 'Unknown'}</span></span>
                  <span className="opacity-70 mt-0.5">{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                </div>
                <button 
                  onClick={() => handleUpvote(suggestion._id)}
                  className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                >
                  <ThumbsUp size={14} />
                  <span>{suggestion.upvotes}</span>
                </button>
              </div>

              {user?.role === 'admin' && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-500 mb-2">Admin Action</p>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text"
                      placeholder="Optional admin response..."
                      className="w-full text-sm px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                      value={adminResponseInput[suggestion._id] || ''}
                      onChange={(e) => setAdminResponseInput({...adminResponseInput, [suggestion._id]: e.target.value})}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleStatusChange(suggestion._id, 'REVIEWING')} className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">Reviewing</button>
                      <button onClick={() => handleStatusChange(suggestion._id, 'IN_PROGRESS')} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200">In Progress</button>
                      <button onClick={() => handleStatusChange(suggestion._id, 'RESOLVED')} className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200">Resolved</button>
                      <button onClick={() => handleStatusChange(suggestion._id, 'REJECTED')} className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200">Rejected</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {suggestions.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500 glass rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-30 text-indigo-500" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No feedback submitted yet.</p>
          <p className="text-sm opacity-75">Be the first to share your ideas!</p>
        </div>
      )}
    </div>
  );
};

export default Suggestions;
