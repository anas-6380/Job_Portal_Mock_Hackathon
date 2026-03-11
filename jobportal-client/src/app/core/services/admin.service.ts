import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, UserList } from '../models/user.model';
import { Application, Job, PagedResult } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getUsers(page = 1, pageSize = 20): Observable<PagedResult<UserList>> {
    return this.http.get<PagedResult<UserList>>(`${this.apiUrl}/users?page=${page}&pageSize=${pageSize}`);
  }

  toggleUserStatus(userId: number): Observable<UserList> {
    return this.http.put<UserList>(`${this.apiUrl}/users/${userId}/toggle-status`, {});
  }

  getAllJobs(page = 1, pageSize = 20): Observable<PagedResult<Job>> {
    return this.http.get<PagedResult<Job>>(`${this.apiUrl}/jobs?page=${page}&pageSize=${pageSize}`);
  }

  moderateJob(jobId: number, isActive: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/jobs/${jobId}/moderate?isActive=${isActive}`, {});
  }

  getAllApplications(page = 1, pageSize = 20): Observable<PagedResult<Application>> {
    return this.http.get<PagedResult<Application>>(`${this.apiUrl}/applications?page=${page}&pageSize=${pageSize}`);
  }
}
