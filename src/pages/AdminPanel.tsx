import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ScholarshipCard } from '../component/ScholarshipCard';
import { Plus, CreditCard as Edit, Trash2, Users, BookOpen, CheckCircle, Clock, Search, Filter, FileText } from 'lucide-react';
import { Scholarship, Application } from '../types';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { 
    data, 
    addScholarship, 
    updateScholarship, 
    deleteScholarship, 
    updateApplicationStatus,
    getScholarshipById,
    getUserById
  } = useLocalStorage();

  const [activeTab, setActiveTab] = useState<'scholarships' | 'applications'>('scholarships');
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [scholarshipForm, setScholarshipForm] = useState({
    title: '',
    amount: 0,
    eligibility: [''],
    deadline: '',
    description: '',
    requirements: [''],
    provider: '',
    category: 'Merit-based',
    isActive: true,
  });

  // Filter applications based on search and status
  const filteredApplications = data.applications.filter(app => {
    const scholarship = getScholarshipById(app.scholarshipId);
    const student = getUserById(app.studentId);
    
    const matchesSearch = searchTerm === '' || 
      scholarship?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setScholarshipForm({
      title: '',
      amount: 0,
      eligibility: [''],
      deadline: '',
      description: '',
      requirements: [''],
      provider: '',
      category: 'Merit-based',
      isActive: true,
    });
    setEditingScholarship(null);
  };

  const handleScholarshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scholarshipData = {
      ...scholarshipForm,
      eligibility: scholarshipForm.eligibility.filter(e => e.trim() !== ''),
      requirements: scholarshipForm.requirements.filter(r => r.trim() !== ''),
    };

    if (editingScholarship) {
      updateScholarship(editingScholarship, scholarshipData);
    } else {
      addScholarship(scholarshipData);
    }

    setShowScholarshipModal(false);
    resetForm();
  };

  const handleEditScholarship = (scholarship: Scholarship) => {
    setScholarshipForm(scholarship);
    setEditingScholarship(scholarship.id);
    setShowScholarshipModal(true);
  };

  const handleDeleteScholarship = (id: string) => {
    if (window.confirm('Are you sure you want to delete this scholarship? This will also delete all related applications.')) {
      deleteScholarship(id);
    }
  };

  const handleUpdateApplicationStatus = (applicationId: string, status: Application['status'], notes?: string) => {
    updateApplicationStatus(applicationId, status, notes);
  };

  const addEligibilityField = () => {
    setScholarshipForm({
      ...scholarshipForm,
      eligibility: [...scholarshipForm.eligibility, ''],
    });
  };

  const removeEligibilityField = (index: number) => {
    setScholarshipForm({
      ...scholarshipForm,
      eligibility: scholarshipForm.eligibility.filter((_, i) => i !== index),
    });
  };

  const updateEligibilityField = (index: number, value: string) => {
    const updated = [...scholarshipForm.eligibility];
    updated[index] = value;
    setScholarshipForm({ ...scholarshipForm, eligibility: updated });
  };

  const addRequirementField = () => {
    setScholarshipForm({
      ...scholarshipForm,
      requirements: [...scholarshipForm.requirements, ''],
    });
  };

  const removeRequirementField = (index: number) => {
    setScholarshipForm({
      ...scholarshipForm,
      requirements: scholarshipForm.requirements.filter((_, i) => i !== index),
    });
  };

  const updateRequirementField = (index: number, value: string) => {
    const updated = [...scholarshipForm.requirements];
    updated[index] = value;
    setScholarshipForm({ ...scholarshipForm, requirements: updated });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage scholarships and review applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.scholarships.length}</p>
                <p className="text-gray-600">Total Scholarships</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.applications.length}</p>
                <p className="text-gray-600">Total Applications</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.applications.filter(app => app.status === 'pending').length}
                </p>
                <p className="text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.applications.filter(app => app.status === 'approved').length}
                </p>
                <p className="text-gray-600">Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('scholarships')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'scholarships'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Scholarships
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'applications'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Review Applications ({data.applications.filter(app => app.status === 'pending').length} pending)
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'scholarships' ? (
              <div>
                {/* Add Scholarship Button */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Scholarships</h2>
                  <button
                    onClick={() => setShowScholarshipModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Scholarship
                  </button>
                </div>

                {/* Scholarships Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.scholarships.map(scholarship => (
                    <div key={scholarship.id} className="relative">
                      <ScholarshipCard
                        scholarship={scholarship}
                        showActions={false}
                      />
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => handleEditScholarship(scholarship)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScholarship(scholarship.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {data.scholarships.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first scholarship to get started.
                    </p>
                    <button
                      onClick={() => setShowScholarshipModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                    >
                      Add New Scholarship
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Applications Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
                  
                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="under-review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Applications List */}
                {filteredApplications.length > 0 ? (
                  <div className="space-y-6">
                    {filteredApplications.map(application => {
                      const scholarship = getScholarshipById(application.scholarshipId);
                      const student = getUserById(application.studentId);
                      
                      if (!scholarship || !student) return null;

                      return (
                        <div key={application.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {scholarship.title}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Applied by: {student.name} ({student.email})
                              </p>
                              <p className="text-gray-600 text-sm">
                                Applied on: {new Date(application.submittedAt).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                application.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Student Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Phone:</span>
                              <span className="ml-2 text-gray-600">{application.studentDetails.phone}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">GPA:</span>
                              <span className="ml-2 text-gray-600">{application.studentDetails.gpa}%</span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-900">Education:</span>
                              <span className="ml-2 text-gray-600">{application.studentDetails.education}</span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-900">Address:</span>
                              <span className="ml-2 text-gray-600">{application.studentDetails.address}</span>
                            </div>
                          </div>

                          {/* Admin Actions */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.id, 'under-review')}
                              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                            >
                              Mark Under Review
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.id, 'approved')}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const notes = window.prompt('Rejection reason (optional):');
                                handleUpdateApplicationStatus(application.id, 'rejected', notes || undefined);
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </div>

                          {/* Admin Notes */}
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
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter ? 'Try adjusting your search criteria.' : 'No applications have been submitted yet.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scholarship Modal */}
      {showScholarshipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
              </h2>
              
              <form onSubmit={handleScholarshipSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={scholarshipForm.title}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={scholarshipForm.amount}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider
                    </label>
                    <input
                      type="text"
                      required
                      value={scholarshipForm.provider}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, provider: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={scholarshipForm.category}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Merit-based">Merit-based</option>
                      <option value="Need-based">Need-based</option>
                      <option value="Field-specific">Field-specific</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      required
                      value={scholarshipForm.deadline}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={scholarshipForm.isActive}
                        onChange={(e) => setScholarshipForm({ ...scholarshipForm, isActive: e.target.checked })}
                        className="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={scholarshipForm.description}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Eligibility Criteria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eligibility Criteria
                  </label>
                  {scholarshipForm.eligibility.map((criteria, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={criteria}
                        onChange={(e) => updateEligibilityField(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter eligibility criterion"
                      />
                      {scholarshipForm.eligibility.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEligibilityField(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEligibilityField}
                    className="text-orange-600 hover:text-orange-700 text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Criterion
                  </button>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Documents
                  </label>
                  {scholarshipForm.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateRequirementField(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter required document"
                      />
                      {scholarshipForm.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirementField(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirementField}
                    className="text-orange-600 hover:text-orange-700 text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Requirement
                  </button>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScholarshipModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                  >
                    {editingScholarship ? 'Update' : 'Create'} Scholarship
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