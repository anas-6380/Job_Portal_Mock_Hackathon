import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmployerProfile } from '../models/user.model';
import { Application, PagedResult } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class EmployerService {
  private apiUrl = `${environment.apiUrl}/employer`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<EmployerProfile> {
    return this.http.get<EmployerProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<EmployerProfile> {
    return this.http.put<EmployerProfile>(`${this.apiUrl}/profile`, data);
  }

  getApplicants(jobId: number, page = 1, pageSize = 10): Observable<PagedResult<Application>> {
    return this.http.get<PagedResult<Application>>(`${this.apiUrl}/jobs/${jobId}/applicants?page=${page}&pageSize=${pageSize}`);
  }

  updateApplicationStatus(applicationId: number, status: string): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/applications/${applicationId}/status`, { status });
  }

  downloadApplicantResume(applicationId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/resume/${applicationId}`, { responseType: 'blob' });
  }
}
