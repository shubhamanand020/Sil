export interface User {
  id: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  name: string;
  createdAt: string;
  photo?: string;
  resume?: string;
  phone?: string;
  address?: string;
  education?: string;
  dateOfBirth?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  amount: number;
  eligibility: string[];
  deadline: string;
  description: string;
  requirements: string[];
  provider: string;
  category: string;
  createdAt: string;
  isActive: boolean;
}

export interface Application {
  id: string;
  studentId: string;
  scholarshipId: string;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  submittedAt: string;
  studentDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    education: string;
    gpa: number;
    documents: string[];
  };
  adminNotes?: string;
}

export interface FinSaarthiData {
  users: User[];
  scholarships: Scholarship[];
  applications: Application[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
}