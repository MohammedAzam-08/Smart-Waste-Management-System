import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Star,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare
} from 'lucide-react';

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
  citizen_email: string;
  worker_name?: string;
  image_path?: string;
  before_image_path?: string;
  after_image_path?: string;
  feedback?: string;
  rating?: number;
  assigned_at?: string;
  completed_at?: string;
  verified_at?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  created_at: string;
  user_name: string;
  user_role: string;
}

const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Worker completion state
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string>('');
  const [afterPreview, setAfterPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Citizen feedback state
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComplaintDetails();
      fetchActivityLogs();
    }
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await fetch('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const complaints = await response.json();
      const foundComplaint = complaints.find((c: Complaint) => c.id === id);
      
      if (foundComplaint) {
        setComplaint(foundComplaint);
      } else {
        setError('Complaint not found');
      }
    } catch (error) {
      setError('Failed to fetch complaint details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch(`/api/complaints/${id}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const logs = await response.json();
      setActivityLogs(logs);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'before') {
        setBeforeImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setBeforePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setAfterImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setAfterPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const submitCompletion = async () => {
    if (!beforeImage || !afterImage) {
      setError('Please upload both before and after photos');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('beforeImage', beforeImage);
      formData.append('afterImage', afterImage);

      const response = await fetch(`/api/complaints/${id}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchComplaintDetails();
        fetchActivityLogs();
        setBeforeImage(null);
        setAfterImage(null);
        setBeforePreview('');
        setAfterPreview('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit completion');
      }
    } catch (error) {
      setError('Failed to submit completion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFeedback = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/complaints/${id}/feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ feedback, rating })
      });

      if (response.ok) {
        fetchComplaintDetails();
        fetchActivityLogs();
        setShowFeedbackForm(false);
        setFeedback('');
        setRating(5);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit feedback');
      }
    } catch (error) {
      setError('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'assigned': return <User className="w-4 h-4 text-indigo-500" />;
      case 'started': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <Camera className="w-4 h-4 text-green-500" />;
      case 'verified': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'feedback': return <Star className="w-4 h-4 text-orange-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{error || 'Complaint not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                {complaint.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                {complaint.priority} priority
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2 mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-600">{complaint.description}</p>
          </div>

          {/* Original Image */}
          {complaint.image_path && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Reported Issue</h2>
              <img
                src={`/uploads/${complaint.image_path}`}
                alt="Reported issue"
                className="w-full max-w-md rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* Before/After Images */}
          {(complaint.before_image_path || complaint.after_image_path) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Work Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaint.before_image_path && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Before Cleaning</h3>
                    <img
                      src={`/uploads/${complaint.before_image_path}`}
                      alt="Before cleaning"
                      className="w-full rounded-lg shadow-sm"
                    />
                  </div>
                )}
                {complaint.after_image_path && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">After Cleaning</h3>
                    <img
                      src={`/uploads/${complaint.after_image_path}`}
                      alt="After cleaning"
                      className="w-full rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Worker Photo Upload */}
          {user?.role === 'worker' && complaint.status === 'in_progress' && !complaint.after_image_path && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Complete Work</h2>
              <p className="text-gray-600 mb-4">
                Upload before and after photos to mark this task as completed.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Before Photo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    {beforePreview ? (
                      <img src={beforePreview} alt="Before preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="py-8">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Upload before photo</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'before')}
                      className="hidden"
                      id="before-image"
                    />
                    <label
                      htmlFor="before-image"
                      className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Choose File
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After Photo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    {afterPreview ? (
                      <img src={afterPreview} alt="After preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="py-8">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Upload after photo</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'after')}
                      className="hidden"
                      id="after-image"
                    />
                    <label
                      htmlFor="after-image"
                      className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={submitCompletion}
                  disabled={!beforeImage || !afterImage || isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Mark as Completed'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Citizen Feedback Form */}
          {user?.role === 'citizen' && complaint.status === 'verified' && !complaint.feedback && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Provide Feedback</h2>
              
              {!showFeedbackForm ? (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Rate & Review
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Share your experience..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={submitFeedback}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Existing Feedback */}
          {complaint.feedback && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Citizen Feedback</h2>
              <div className="flex items-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (complaint.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600">({complaint.rating}/5)</span>
              </div>
              <p className="text-gray-600">{complaint.feedback}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Details</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Reported: {new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{complaint.address}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <div>
                  <p>{complaint.citizen_name}</p>
                  <p className="text-gray-500">{complaint.citizen_email}</p>
                </div>
              </div>
              
              {complaint.worker_name && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Assigned to:</p>
                    <p>{complaint.worker_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${complaint.location_lat},${complaint.location_lng}`}
                className="w-full h-48 rounded-lg"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${complaint.location_lat},${complaint.location_lng}`, '_blank')}
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>View in Google Maps</span>
            </button>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Timeline</h2>
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                  {getActionIcon(log.action)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{log.user_name}</p>
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded capitalize">
                        {log.user_role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;