import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, BarChart3, Calendar, Trash2, Eye } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const History = () => {
  const [uploads, setUploads] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploads');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [uploadsResponse, analysesResponse] = await Promise.all([
        api.get('/api/upload'),
        api.get('/api/analysis')
      ]);

      setUploads(uploadsResponse.data.uploads || []);
      setAnalyses(analysesResponse.data.analyses || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;

    try {
      await api.delete(`/api/upload/${uploadId}`);
      setUploads(uploads.filter(upload => upload._id !== uploadId));
      toast.success('Upload deleted successfully');
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast.error('Failed to delete upload');
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;

    try {
      await api.delete(`/api/analysis/${analysisId}`);
      setAnalyses(analyses.filter(analysis => analysis._id !== analysisId));
      toast.success('Analysis deleted successfully');
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded mr-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">History</h1>
      </div>
      <div className="mb-8">
        <p className="mt-2 text-gray-600">
          View your upload and analysis history
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'uploads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Uploads ({uploads.length})
          </button>
          <button
            onClick={() => setActiveTab('analyses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analyses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analyses ({analyses.length})
          </button>
        </nav>
      </div>

      {/* Uploads Tab */}
      {activeTab === 'uploads' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">File Uploads</h3>
          </div>
          <div className="p-6">
            {uploads.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No uploads yet. Start by uploading your first Excel file!</p>
                <Link
                  to="/upload"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload File
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {uploads.map((upload) => (
                  <div key={upload._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{upload.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(upload.uploadDate)} • {formatFileSize(upload.fileSize)} • {upload.sheets.length} sheet(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/analysis/${upload._id}`}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Analyze
                      </Link>
                      <button
                        onClick={() => handleDeleteUpload(upload._id)}
                        className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analyses Tab */}
      {activeTab === 'analyses' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Chart Analyses</h3>
          </div>
          <div className="p-6">
            {analyses.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No analyses yet. Create your first chart!</p>
                <Link
                  to="/upload"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload & Analyze
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {analysis.chartType.charAt(0).toUpperCase() + analysis.chartType.slice(1)} Chart
                        </p>
                        <p className="text-xs text-gray-500">
                          {analysis.upload?.originalName} • {analysis.xAxis?.column} vs {analysis.yAxis?.column}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(analysis.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteAnalysis(analysis._id)}
                        className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History; 