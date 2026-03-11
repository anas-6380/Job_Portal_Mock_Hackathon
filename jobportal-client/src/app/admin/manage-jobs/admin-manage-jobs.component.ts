import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-admin-manage-jobs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <h1>Manage Jobs</h1>
      </div>

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      @if (loading) {
        <div class="loader"><div class="spinner"></div></div>
      }

      @if (!loading && jobs.length > 0) {
        <div class="card" style="padding: 0; overflow: hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Company</th>
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
                  <td>{{ job.id }}</td>
                  <td><strong>{{ job.title }}</strong></td>
                  <td>{{ job.companyName }}</td>
                  <td>{{ job.location || '-' }}</td>
                  <td>{{ job.jobType || '-' }}</td>
                  <td>{{ job.applicationCount }}</td>
                  <td>
                    <span class="tag" [class.tag-green]="job.isActive" [class.tag-red]="!job.isActive">
                      {{ job.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm"
                      [class.btn-danger]="job.isActive"
                      [class.btn-success]="!job.isActive"
                      (click)="moderate(job.id, !job.isActive)">
                      {{ job.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
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
export class AdminManageJobsComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  page = 1;
  totalPages = 1;
  success = '';

  constructor(private adminService: AdminService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.adminService.getAllJobs(this.page).subscribe({
      next: (r) => { this.jobs = r.items; this.totalPages = r.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  moderate(id: number, isActive: boolean): void {
    this.adminService.moderateJob(id, isActive).subscribe({
      next: () => { this.success = `Job ${isActive ? 'activated' : 'deactivated'}`; this.load(); }
    });
  }

  goToPage(p: number): void { this.page = p; this.load(); }
}
