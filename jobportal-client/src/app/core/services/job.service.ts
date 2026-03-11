import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Job, PagedResult } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getJobs(page = 1, pageSize = 12, search?: string, location?: string, jobType?: string): Observable<PagedResult<Job>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (search) params = params.set('search', search);
    if (location) params = params.set('location', location);
    if (jobType) params = params.set('jobType', jobType);
    return this.http.get<PagedResult<Job>>(this.apiUrl, { params });
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  createJob(data: any): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, data);
  }

  updateJob(id: number, data: any): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, data);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMyJobs(page = 1, pageSize = 10): Observable<PagedResult<Job>> {
    const params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    return this.http.get<PagedResult<Job>>(`${this.apiUrl}/my-jobs`, { params });
  }
}
