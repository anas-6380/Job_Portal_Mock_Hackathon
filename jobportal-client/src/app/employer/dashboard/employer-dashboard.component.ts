import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployerService } from '../../core/services/employer.service';
import { JobService } from '../../core/services/job.service';
import { EmployerProfile } from '../../core/models/user.model';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <div>
          <h1>{{ profile?.companyName || 'Employer Dashboard' }}</h1>
          <p class="text-secondary">Manage your jobs and applicants</p>
        </div>
        <a routerLink="/employer/create-job" class="btn btn-primary">+ Post New Job</a>
      </div>

      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-icon" style="background: #dbeafe; color: #2563eb">💼</div>
          <div class="stat-info">
            <h3>{{ totalJobs }}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #d1fae5; color: #059669">✅</div>
          <div class="stat-info">
            <h3>{{ activeJobs }}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #d97706">📝</div>
          <div class="stat-info">
            <h3>{{ totalApplicants }}</h3>
            <p>Total Applicants</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #f3e8ff; color: #7c3aed">📊</div>
          <div class="stat-info">
            <h3>{{ inactiveJobs }}</h3>
            <p>Closed Jobs</p>
          </div>
        </div>
      </div>

      <div style="margin-top: 32px">
        <div class="page-header">
          <h2>Recent Job Postings</h2>
          <a routerLink="/employer/manage-jobs" class="btn btn-outline btn-sm">View All</a>
        </div>

        @if (jobs.length > 0) {
          <div class="card" style="padding: 0; overflow: hidden">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (job of jobs; track job.id) {
                  <tr>
                    <td><strong>{{ job.title }}</strong></td>
                    <td>{{ job.location || 'N/A' }}</td>
                    <td>{{ job.jobType || 'N/A' }}</td>
                    <td>{{ job.applicationCount }}</td>
                    <td>
                      <span class="tag" [class.tag-green]="job.isActive" [class.tag-red]="!job.isActive">
                        {{ job.isActive ? 'Active' : 'Closed' }}
                      </span>
                    </td>
                    <td>
                      <a [routerLink]="['/employer/jobs', job.id, 'applicants']" class="btn btn-accent btn-sm">
                        Applicants
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">
            <span class="material-icons-outlined">work</span>
            <h3>No jobs posted yet</h3>
            <p>Create your first job posting</p>
          </div>
        }
      </div>
    </div>
  `
})
export class EmployerDashboardComponent implements OnInit {
  profile: EmployerProfile | null = null;
  jobs: Job[] = [];
  totalJobs = 0;
  activeJobs = 0;
  inactiveJobs = 0;
  totalApplicants = 0;

  constructor(private employerService: EmployerService, private jobService: JobService) { }

  ngOnInit(): void {
    this.employerService.getProfile().subscribe({ next: (p) => this.profile = p });
    this.jobService.getMyJobs(1, 50).subscribe({
      next: (r) => {
        this.jobs = r.items.slice(0, 5);
        this.totalJobs = r.totalCount;
        this.activeJobs = r.items.filter(j => j.isActive).length;
        this.inactiveJobs = r.items.filter(j => !j.isActive).length;
        this.totalApplicants = r.items.reduce((sum, j) => sum + j.applicationCount, 0);
      }
    });
  }
}
