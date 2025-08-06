import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Upload, 
  BarChart3, 
  FileText, 
  TrendingUp,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalAnalyses: 0,
    storageUsed: 0,
    recentUploads: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [uploadsResponse, analysesResponse] = await Promise.all([
        api.get('/api/upload'),
        api.get('/api/analysis')
      ]);

      const uploads = uploadsResponse.data.uploads || [];
      const analyses = analysesResponse.data.analyses || [];

      setStats({
        totalUploads: uploads.length,
        totalAnalyses: analyses.length,
        storageUsed: uploads.reduce((sum, upload) => sum + upload.fileSize, 0),
        recentUploads: uploads.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Upload your Excel files and create beautiful charts to visualize your data.
          </p>
        </div>
        <button
          onClick={async () => { await logout(); navigate('/login'); }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/upload"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Excel File</h3>
              <p className="text-sm text-gray-500">Upload and parse your Excel data</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
          </div>
        </Link>

        <Link
          to="/history"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">View History</h3>
              <p className="text-sm text-gray-500">See your uploads and analyses</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Profile</h3>
              <p className="text-sm text-gray-500">Manage your account settings</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
          </div>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Uploads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.storageUsed)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Member Since</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Uploads</h3>
        </div>
        <div className="p-6">
          {stats.recentUploads.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              {stats.recentUploads.map((upload) => (
                <div key={upload._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{upload.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(upload.uploadDate).toLocaleDateString()} • {formatFileSize(upload.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/analysis/${upload._id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Analyze
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 