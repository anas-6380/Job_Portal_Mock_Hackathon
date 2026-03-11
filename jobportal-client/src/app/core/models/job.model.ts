export interface Job {
  id: number;
  title: string;
  description: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  experienceRequired?: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  companyName: string;
  companyLocation?: string;
  companyWebsite?: string;
  employerId: number;
  applicationCount: number;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  location?: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  resumeId?: number;
  resumeFileName?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateHeadline?: string;
  experienceYears?: number;
  skills?: string;
}

export interface Resume {
  id: number;
  fileName: string;
  uploadedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
