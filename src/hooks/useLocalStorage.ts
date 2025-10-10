import { useState, useEffect } from 'react';
import { FinSaarthiData, User, Scholarship, Application } from '../types';

const STORAGE_KEY = 'finSaarthiData';

// Initial data structure
const initialData: FinSaarthiData = {
  users: [
    {
      id: 'admin-1',
      email: 'admin@finsaarthi.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'student-1',
      email: 'student@example.com',
      password: 'student123',
      role: 'student',
      name: 'Rahul Kumar',
      createdAt: new Date().toISOString(),
    }
  ],
  scholarships: [
    {
      id: 'sch-1',
      title: 'Merit-Based Excellence Scholarship',
      amount: 50000,
      eligibility: ['Minimum 85% marks', 'Indian citizen', 'Age below 25'],
      deadline: '2024-12-31',
      description: 'This scholarship is awarded to students who have demonstrated exceptional academic performance and leadership qualities.',
      requirements: ['Academic transcripts', 'Income certificate', 'Recommendation letter'],
      provider: 'FinSaarthi Foundation',
      category: 'Merit-based',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'sch-2',
      title: 'Need-Based Financial Aid',
      amount: 30000,
      eligibility: ['Family income below ₹3,00,000', 'Indian citizen', 'Enrolled in recognized institution'],
      deadline: '2024-11-30',
      description: 'Financial assistance for students from economically disadvantaged backgrounds to pursue higher education.',
      requirements: ['Income certificate', 'Bank statements', 'Educational documents'],
      provider: 'Government of India',
      category: 'Need-based',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'sch-3',
      title: 'STEM Innovation Scholarship',
      amount: 75000,
      eligibility: ['STEM field student', 'Minimum 80% marks', 'Research project submission'],
      deadline: '2025-01-15',
      description: 'Supporting innovative students in Science, Technology, Engineering, and Mathematics fields.',
      requirements: ['Research proposal', 'Academic records', 'Project portfolio'],
      provider: 'Tech Innovation Council',
      category: 'Field-specific',
      createdAt: new Date().toISOString(),
      isActive: true,
    }
  ],
  applications: []
};

export const useLocalStorage = () => {
  const [data, setData] = useState<FinSaarthiData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialData;
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return initialData;
    }
  });

  // Save data to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [data]);

  // User operations
  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    return newUser;
  };

  const getUserByCredentials = (email: string, password: string) => {
    return data.users.find(user => user.email === email && user.password === password);
  };

  const getUserById = (id: string) => {
    return data.users.find(user => user.id === id);
  };

  // Scholarship operations
  const addScholarship = (scholarship: Omit<Scholarship, 'id' | 'createdAt'>) => {
    const newScholarship: Scholarship = {
      ...scholarship,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      scholarships: [...prev.scholarships, newScholarship]
    }));
    return newScholarship;
  };

  const updateScholarship = (id: string, updates: Partial<Scholarship>) => {
    setData(prev => ({
      ...prev,
      scholarships: prev.scholarships.map(sch => 
        sch.id === id ? { ...sch, ...updates } : sch
      )
    }));
  };

  const deleteScholarship = (id: string) => {
    setData(prev => ({
      ...prev,
      scholarships: prev.scholarships.filter(sch => sch.id !== id),
      applications: prev.applications.filter(app => app.scholarshipId !== id)
    }));
  };

  const getActiveScholarships = () => {
    return data.scholarships.filter(sch => sch.isActive);
  };

  const getScholarshipById = (id: string) => {
    return data.scholarships.find(sch => sch.id === id);
  };

  // Application operations
  const addApplication = (application: Omit<Application, 'id' | 'submittedAt'>) => {
    const newApplication: Application = {
      ...application,
      id: `app-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      applications: [...prev.applications, newApplication]
    }));
    return newApplication;
  };

  const updateApplicationStatus = (id: string, status: Application['status'], adminNotes?: string) => {
    setData(prev => ({
      ...prev,
      applications: prev.applications.map(app => 
        app.id === id ? { ...app, status, adminNotes } : app
      )
    }));
  };

  const getApplicationsByStudent = (studentId: string) => {
    return data.applications.filter(app => app.studentId === studentId);
  };

  const getApplicationById = (id: string) => {
    return data.applications.find(app => app.id === id);
  };

  const hasUserApplied = (studentId: string, scholarshipId: string) => {
    return data.applications.some(app => 
      app.studentId === studentId && app.scholarshipId === scholarshipId
    );
  };

  return {
    data,
    // User operations
    addUser,
    getUserByCredentials,
    getUserById,
    // Scholarship operations
    addScholarship,
    updateScholarship,
    deleteScholarship,
    getActiveScholarships,
    getScholarshipById,
    // Application operations
    addApplication,
    updateApplicationStatus,
    getApplicationsByStudent,
    getApplicationById,
    hasUserApplied,
  };
};