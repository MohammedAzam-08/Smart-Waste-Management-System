import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Camera,
  Navigation,
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  address: string;
  location_lat: number;
  location_lng: number;
  citizen_name: string;
  image_path?: string;
  before_image_path?: string;
  after_image_path?: string;
}

interface DashboardStats {
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

const WorkerDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchData();
    getCurrentLocation();
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const startWork = async (complaintId: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/start`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error starting work:', error);
    }
  };

  const getDirections = (lat: number, lng: number) => {
    if (currentLocation) {
      const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-indigo-600 bg-indigo-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'verified': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.assignedTasks}</p>
                <p className="text-gray-600">Assigned Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
                <p className="text-gray-600">Pending Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
                <p className="text-gray-600">Completed Tasks</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">My Assigned Tasks</h2>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks assigned yet</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{complaint.title}</h3>
                      <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} priority
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{complaint.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{complaint.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Reported {new Date(complaint.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Reported by:</strong> {complaint.citizen_name}
                    </p>
                  </div>
                  
                  {complaint.image_path && (
                    <div className="ml-6">
                      <img
                        src={`/uploads/${complaint.image_path}`}
                        alt="Issue"
                        className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => getDirections(complaint.location_lat, complaint.location_lng)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Get Directions</span>
                  </button>

                  {complaint.status === 'assigned' && (
                    <button
                      onClick={() => startWork(complaint.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Start Work</span>
                    </button>
                  )}

                  {(complaint.status === 'in_progress' || complaint.status === 'completed') && (
                    <Link
                      to={`/complaint/${complaint.id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Photos</span>
                    </Link>
                  )}

                  <Link
                    to={`/complaint/${complaint.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">
                      {complaint.status === 'assigned' ? '25%' : 
                       complaint.status === 'in_progress' ? '50%' :
                       complaint.status === 'completed' ? '75%' :
                       complaint.status === 'verified' ? '100%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        complaint.status === 'assigned' ? 'bg-blue-500 w-1/4' :
                        complaint.status === 'in_progress' ? 'bg-indigo-500 w-1/2' :
                        complaint.status === 'completed' ? 'bg-green-500 w-3/4' :
                        complaint.status === 'verified' ? 'bg-emerald-500 w-full' : 'bg-gray-300 w-0'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;