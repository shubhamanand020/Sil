import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ScholarshipCard } from '../component/ScholarshipCard';
import { Search, Filter, BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getActiveScholarships, getApplicationsByStudent, hasUserApplied, addApplication, getScholarshipById } = useLocalStorage();
  const [activeTab, setActiveTab] = useState<'browse' | 'applications'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<string | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    education: '',
    gpa: 0,
    documents: [] as string[],
  });

  const scholarships = getActiveScholarships();
  const applications = user ? getApplicationsByStudent(user.id) : [];

  const filteredScholarships = useMemo(() => {
    let filtered = scholarships.filter(scholarship => {
      const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || scholarship.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort scholarships
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [scholarships, searchTerm, selectedCategory, sortBy]);

  const categories = [...new Set(scholarships.map(s => s.category))];

  const handleApply = (scholarshipId: string) => {
    setSelectedScholarship(scholarshipId);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedScholarship) return;

    addApplication({
      studentId: user.id,
      scholarshipId: selectedScholarship,
      status: 'pending',
      studentDetails: applicationForm,
    });

    setShowApplicationModal(false);
    setSelectedScholarship(null);
    setApplicationForm({
      name: user.name,
      email: user.email,
      phone: '',
      address: '',
      education: '',
      gpa: 0,
      documents: [],
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'under-review':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!user) {
    return <div>Please log in to access your dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Track your applications and discover new scholarship opportunities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{scholarships.length}</p>
                <p className="text-gray-600">Available Scholarships</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                <p className="text-gray-600">Your Applications</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'approved').length}
                </p>
                <p className="text-gray-600">Approved Applications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'browse'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Browse Scholarships
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'applications'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Applications ({applications.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'browse' ? (
              <div>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search scholarships..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="deadline">Sort by Deadline</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="title">Sort by Title</option>
                  </select>
                </div>

                {/* Scholarships Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredScholarships.map(scholarship => (
                    <ScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                      onApply={() => handleApply(scholarship.id)}
                      hasApplied={hasUserApplied(user.id, scholarship.id)}
                    />
                  ))}
                </div>

                {filteredScholarships.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or check back later for new opportunities.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Applications List */}
                {applications.length > 0 ? (
                  <div className="space-y-6">
                    {applications.map(application => {
                      const scholarship = getScholarshipById(application.scholarshipId);
                      if (!scholarship) return null;

                      return (
                        <div key={application.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {scholarship.title}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Applied on: {new Date(application.submittedAt).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {getStatusIcon(application.status)}
                              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Amount:</span>
                              <span className="ml-2 text-orange-600 font-semibold">
                                ₹{scholarship.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Provider:</span>
                              <span className="ml-2 text-gray-600">{scholarship.provider}</span>
                            </div>
                          </div>

                          {application.adminNotes && (
                            <div className="mt-4 p-3 bg-white rounded-lg border">
                              <h4 className="font-medium text-gray-900 mb-1">Admin Notes:</h4>
                              <p className="text-gray-600 text-sm">{application.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start by browsing and applying to scholarships that match your profile.
                    </p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                    >
                      Browse Scholarships
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for Scholarship</h2>
              
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={applicationForm.name}
                      onChange={(e) => setApplicationForm({ ...applicationForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPA/Percentage
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      value={applicationForm.gpa}
                      onChange={(e) => setApplicationForm({ ...applicationForm, gpa: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={applicationForm.address}
                    onChange={(e) => setApplicationForm({ ...applicationForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Educational Background
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your current education status, institution, course, etc."
                    value={applicationForm.education}
                    onChange={(e) => setApplicationForm({ ...applicationForm, education: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};