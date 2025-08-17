import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  address: string;
  image_path?: string;
  worker_name?: string;
  rating?: number;
}

interface DashboardStats {
  myComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
}

const CitizenDashboard: React.FC = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        fetch('/api/complaints', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const complaintsData = await complaintsRes.json();
      const statsData = await statsRes.json();

      setComplaints(complaintsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-indigo-600 bg-indigo-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'verified': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
        <Link
          to="/report"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.myComplaints}</p>
                <p className="text-gray-600">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingComplaints}</p>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedComplaints}</p>
                <p className="text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Reports</h2>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No reports submitted yet</p>
            <Link
              to="/report"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Submit Your First Report</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaint/${complaint.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getPriorityIcon(complaint.priority)}
                      <h3 className="text-lg font-medium text-gray-900">{complaint.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
                    <p className="text-sm text-gray-500 mb-2">{complaint.address}</p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                      
                      {complaint.rating && (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= complaint.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {complaint.image_path && (
                    <div className="ml-4">
                      <img
                        src={`/uploads/${complaint.image_path}`}
                        alt="Issue"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;