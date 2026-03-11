import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CandidateService } from '../../core/services/candidate.service';
import { CandidateProfile } from '../../core/models/user.model';
import { Application, Resume, PagedResult } from '../../core/models/job.model';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <div>
          <h1>Welcome back{{ profile ? ', ' + profile.firstName : '' }}!</h1>
          <p class="text-secondary">Here's your activity overview</p>
        </div>
        <a routerLink="/jobs" class="btn btn-primary">Browse Jobs</a>
      </div>

      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-icon" style="background: #dbeafe; color: #2563eb">📄</div>
          <div class="stat-info">
            <h3>{{ resumes.length }}</h3>
            <p>Resumes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #d1fae5; color: #059669">📝</div>
          <div class="stat-info">
            <h3>{{ applications.length }}</h3>
            <p>Applications</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #d97706">⏳</div>
          <div class="stat-info">
            <h3>{{ pendingCount }}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #f3e8ff; color: #7c3aed">✅</div>
          <div class="stat-info">
            <h3>{{ acceptedCount }}</h3>
            <p>Accepted</p>
          </div>
        </div>
      </div>

      <div style="margin-top:32px">
        <div class="page-header">
          <h2>Recent Applications</h2>
          <a routerLink="/candidate/applications" class="btn btn-outline btn-sm">View All</a>
        </div>
        @if (applications.length > 0) {
          <div class="card" style="padding: 0; overflow: hidden">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (app of applications.slice(0, 5); track app.id) {
                  <tr>
                    <td><strong>{{ app.jobTitle }}</strong></td>
                    <td>{{ app.companyName }}</td>
                    <td>{{ app.appliedAt | date:'mediumDate' }}</td>
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
        } @else {
          <div class="empty-state">
            <span class="material-icons-outlined">description</span>
            <h3>No applications yet</h3>
            <p>Start applying for jobs to see your activity here</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [``]
})
export class CandidateDashboardComponent implements OnInit {
  profile: CandidateProfile | null = null;
  applications: Application[] = [];
  resumes: Resume[] = [];

  constructor(private candidateService: CandidateService) { }

  ngOnInit(): void {
    this.candidateService.getProfile().subscribe({ next: (p) => this.profile = p });
    this.candidateService.getApplications(1, 5).subscribe({ next: (r) => this.applications = r.items });
    this.candidateService.getResumes().subscribe({ next: (r) => this.resumes = r });
  }

  get pendingCount(): number {
    return this.applications.filter(a => a.status === 'Applied').length;
  }

  get acceptedCount(): number {
    return this.applications.filter(a => a.status === 'Hired').length;
  }
}
