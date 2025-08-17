import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  MapPin,
  Calendar
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
  citizen_name: string;
  citizen_email: string;
  worker_name?: string;
  image_path?: string;
}

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  completedComplaints: number;
  inProgressComplaints: number;
  statusBreakdown: { status: string; count: number }[];
}

const AgentDashboard: React.FC = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [assigningWorker, setAssigningWorker] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, statusFilter, priorityFilter, searchTerm]);

  const fetchData = async () => {
    try {
      const [complaintsRes, workersRes, statsRes] = await Promise.all([
        fetch('/api/complaints', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/users/workers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const complaintsData = await complaintsRes.json();
      const workersData = await workersRes.json();
      const statsData = await statsRes.json();

      setComplaints(complaintsData);
      setWorkers(workersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints.filter(complaint => {
      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
      const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           complaint.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           complaint.citizen_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesSearch;
    });

    setFilteredComplaints(filtered);
  };

  const assignWorker = async (complaintId: string, workerId: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ workerId })
      });

      if (response.ok) {
        fetchData();
        setSelectedComplaint(null);
        setAssigningWorker('');
      }
    } catch (error) {
      console.error('Error assigning worker:', error);
    }
  };

  const verifyCompletion = async (complaintId: string, approved: boolean, feedback?: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved, feedback })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error verifying completion:', error);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Municipality Agent Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
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

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressComplaints}</p>
                <p className="text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.completedComplaints}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Waste Management Reports ({filteredComplaints.length})
          </h2>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reports match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Citizen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        {complaint.image_path && (
                          <img
                            src={`/uploads/${complaint.image_path}`}
                            alt="Issue"
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <Link
                            to={`/complaint/${complaint.id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800"
                          >
                            {complaint.title}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {complaint.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-500">{complaint.address}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-500">
                              {new Date(complaint.created_at).toLocaleDateString()}
                            </p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{complaint.citizen_name}</p>
                        <p className="text-sm text-gray-500">{complaint.citizen_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {complaint.worker_name ? (
                        <p className="text-sm font-medium text-gray-900">{complaint.worker_name}</p>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {complaint.status === 'pending' && (
                          <button
                            onClick={() => setSelectedComplaint(complaint.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Assign Worker
                          </button>
                        )}
                        
                        {complaint.status === 'completed' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => verifyCompletion(complaint.id, true)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => verifyCompletion(complaint.id, false)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        
                        <Link
                          to={`/complaint/${complaint.id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Worker Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Worker</h3>
            <select
              value={assigningWorker}
              onChange={(e) => setAssigningWorker(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
            >
              <option value="">Select a worker</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setAssigningWorker('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => assignWorker(selectedComplaint, assigningWorker)}
                disabled={!assigningWorker}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;