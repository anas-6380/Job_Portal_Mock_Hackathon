export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
}

export interface UserList {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CandidateProfile {
  userId: number;
  candidateId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  headline?: string;
  experienceYears?: number;
  skills?: string;
  createdAt: string;
}

export interface EmployerProfile {
  userId: number;
  employerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLocation?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalEmployers: number;
  totalCandidates: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
}
