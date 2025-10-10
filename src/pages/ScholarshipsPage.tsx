import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ScholarshipCard } from '../component/ScholarshipCard';
import { Search, Filter, BookOpen } from 'lucide-react';

export const ScholarshipsPage: React.FC = () => {
  const { user } = useAuth();
  const { getActiveScholarships, hasUserApplied, addApplication, getScholarshipById } = useLocalStorage();
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
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setSelectedScholarship(scholarshipId);
    setShowApplicationModal(true);
  };

  const handleViewDetails = (scholarshipId: string) => {
    const scholarship = getScholarshipById(scholarshipId);
    if (scholarship) {
      alert(`Scholarship Details:\n\n${scholarship.title}\n\nAmount: ₹${scholarship.amount.toLocaleString('en-IN')}\n\nDescription: ${scholarship.description}\n\nEligibility: ${scholarship.eligibility.join(', ')}\n\nRequirements: ${scholarship.requirements.join(', ')}\n\nDeadline: ${new Date(scholarship.deadline).toLocaleDateString('en-IN')}`);
    }
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

    alert('Application submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available Scholarships
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover scholarship opportunities that match your profile and educational goals. 
            Apply now to secure funding for your academic journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search scholarships by title, provider, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-40"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-40"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="amount">Sort by Amount</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredScholarships.length} of {scholarships.length} scholarships
          </p>
          {!user && (
            <div className="text-sm text-gray-600">
              <a href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                Login to apply
              </a>
            </div>
          )}
        </div>

        {/* Scholarships Grid */}
        {filteredScholarships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredScholarships.map(scholarship => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                onApply={user ? () => handleApply(scholarship.id) : undefined}
                onView={() => handleViewDetails(scholarship.id)}
                hasApplied={user ? hasUserApplied(user.id, scholarship.id) : false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No scholarships found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search criteria or filters to find more opportunities.'
                : 'Check back later for new scholarship opportunities.'
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedScholarship && user && (
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