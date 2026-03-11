import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { Application } from '../../core/models/job.model';

@Component({
  selector: 'app-view-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <h1>All Applications</h1>
      </div>

      @if (loading) {
        <div class="loader"><div class="spinner"></div></div>
      }

      @if (!loading && applications.length > 0) {
        <div class="card" style="padding: 0; overflow: hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate</th>
                <th>Job</th>
                <th>Company</th>
                <th>Applied</th>
                <th>Resume</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (app of applications; track app.id) {
                <tr>
                  <td>{{ app.id }}</td>
                  <td>
                    <strong>{{ app.candidateName }}</strong>
                    <br><small class="text-muted">{{ app.candidateEmail }}</small>
                  </td>
                  <td>{{ app.jobTitle }}</td>
                  <td>{{ app.companyName }}</td>
                  <td>{{ app.appliedAt | date:'mediumDate' }}</td>
                  <td>{{ app.resumeFileName || '-' }}</td>
                  <td>
                    <span class="badge-status"
                      [class.badge-pending]="app.status === 'Applied'"
                      [class.badge-accepted]="app.status === 'Hired'"
                      [class.badge-rejected]="app.status === 'Rejected'"
                      [class.badge-reviewed]="app.status === 'Under Review' || app.status === 'Shortlisted'">
                      {{ app.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (!loading && applications.length === 0) {
        <div class="empty-state">
          <span class="material-icons-outlined">assignment</span>
          <h3>No applications</h3>
          <p>No applications have been submitted yet</p>
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
export class ViewApplicationsComponent implements OnInit {
  applications: Application[] = [];
  loading = true;
  page = 1;
  totalPages = 1;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.adminService.getAllApplications(this.page).subscribe({
      next: (r) => { this.applications = r.items; this.totalPages = r.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  goToPage(p: number): void { this.page = p; this.load(); }
}
