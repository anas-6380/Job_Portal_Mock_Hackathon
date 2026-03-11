import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidateProfile } from '../models/user.model';
import { Application, PagedResult, Resume } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${this.apiUrl}/candidate/profile`);
  }

  updateProfile(data: any): Observable<CandidateProfile> {
    return this.http.put<CandidateProfile>(`${this.apiUrl}/candidate/profile`, data);
  }

  applyForJob(data: { jobId: number; resumeId?: number; coverLetter?: string }): Observable<Application> {
    return this.http.post<Application>(`${this.apiUrl}/candidate/apply`, data);
  }

  getApplications(page = 1, pageSize = 10): Observable<PagedResult<Application>> {
    return this.http.get<PagedResult<Application>>(`${this.apiUrl}/candidate/applications?page=${page}&pageSize=${pageSize}`);
  }

  uploadResume(file: File): Observable<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Resume>(`${this.apiUrl}/resume/upload`, formData);
  }

  getResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${this.apiUrl}/resume`);
  }

  downloadResume(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/resume/${id}/download`, { responseType: 'blob' });
  }

  deleteResume(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/resume/${id}`);
  }
}
