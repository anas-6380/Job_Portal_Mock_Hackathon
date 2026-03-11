import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job, PagedResult } from '../../core/models/job.model';

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <h1>My Jobs</h1>
        <a routerLink="/employer/create-job" class="btn btn-primary">+ Post New Job</a>
      </div>

      @if (loading) {
        <div class="loader"><div class="spinner"></div></div>
      }

      @if (!loading && jobs.length > 0) {
        <div class="card" style="padding: 0; overflow: hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (job of jobs; track job.id) {
                <tr>
                  <td><strong>{{ job.title }}</strong></td>
                  <td>{{ job.location || '-' }}</td>
                  <td>{{ job.jobType || '-' }}</td>
                  <td>
                    @if (job.salaryMin || job.salaryMax) {
                      \${{ job.salaryMin || 0 | number }} - \${{ job.salaryMax || 0 | number }}
                    } @else {
                      Negotiable
                    }
                  </td>
                  <td>{{ job.applicationCount }}</td>
                  <td>
                    <span class="tag" [class.tag-green]="job.isActive" [class.tag-red]="!job.isActive">
                      {{ job.isActive ? 'Active' : 'Closed' }}
                    </span>
                  </td>
                  <td style="display: flex; gap: 8px;">
                    <a [routerLink]="['/employer/jobs', job.id, 'applicants']" class="btn btn-accent btn-sm">
                      Applicants
                    </a>
                    @if (job.isActive) {
                      <button class="btn btn-danger btn-sm" (click)="closeJob(job.id)">Close</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (!loading && jobs.length === 0) {
        <div class="empty-state">
          <span class="material-icons-outlined">work</span>
          <h3>No jobs posted</h3>
          <p>Create your first job to start hiring</p>
        </div>
      }

      @if (totalPages > 1) {
        <div class="pagination">
          <button (click)="goToPage(page - 1)" [disabled]="page === 1">← Prev</button>
          @for (p of [].constructor(totalPages); track $index) {
            <button [class.active]="page === $index + 1" (click)="goToPage($index + 1)">{{ $index + 1 }}</button>
          }
          <button (click)="goToPage(page + 1)" [disabled]="page === totalPages">Next →</button>
        </div>
      }
    </div>
  `
})
export class ManageJobsComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  page = 1;
  totalPages = 1;

  constructor(private jobService: JobService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.jobService.getMyJobs(this.page).subscribe({
      next: (r) => { this.jobs = r.items; this.totalPages = r.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  closeJob(id: number): void {
    if (!confirm('Close this job posting?')) return;
    this.jobService.deleteJob(id).subscribe({ next: () => this.load() });
  }

  goToPage(p: number): void { this.page = p; this.load(); }
}
