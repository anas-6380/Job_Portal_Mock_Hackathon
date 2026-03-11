import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmployerService } from '../../core/services/employer.service';
import { Application, PagedResult } from '../../core/models/job.model';

@Component({
  selector: 'app-view-applicants',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <h1>Applicants</h1>
      </div>

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      @if (loading) {
        <div class="loader"><div class="spinner"></div></div>
      }

      @if (!loading && applicants.length > 0) {
        <div class="applicants-grid">
          @for (app of applicants; track app.id) {
            <div class="card applicant-card">
              <div class="applicant-header">
                <div class="applicant-avatar">{{ app.candidateName?.charAt(0) || '?' }}</div>
                <div>
                  <h3>{{ app.candidateName }}</h3>
                  <p class="text-secondary">{{ app.candidateEmail }}</p>
                </div>
              </div>
              @if (app.candidateHeadline) {
                <p class="headline">{{ app.candidateHeadline }}</p>
              }
              <div class="applicant-details">
                @if (app.experienceYears) {
                  <span class="tag tag-blue">{{ app.experienceYears }} yrs exp</span>
                }
                @if (app.skills) {
                  @for (skill of app.skills.split(',').slice(0, 3); track skill) {
                    <span class="tag">{{ skill.trim() }}</span>
                  }
                }
              </div>
              @if (app.coverLetter) {
                <p class="cover-letter">"{{ app.coverLetter }}"</p>
              }
              @if (app.resumeFileName) {
                <div class="resume-row">
                  <span class="material-icons-outlined" style="font-size:18px;color:var(--primary)">description</span>
                  <span class="resume-name">{{ app.resumeFileName }}</span>
                  <button class="btn btn-outline btn-sm" (click)="viewResume(app.id, app.resumeFileName!)">View Resume</button>
                </div>
              }
              <div class="applicant-footer">
                <span class="text-muted">{{ app.appliedAt | date:'mediumDate' }}</span>
                <div class="status-actions">
                  <span class="badge-status"
                    [class.badge-pending]="app.status === 'Applied'"
                    [class.badge-accepted]="app.status === 'Hired'"
                    [class.badge-rejected]="app.status === 'Rejected'"
                    [class.badge-reviewed]="app.status === 'Under Review' || app.status === 'Shortlisted'">
                    {{ app.status }}
                  </span>
                  <select (change)="updateStatus(app.id, $any($event.target).value)" class="status-select">
                    <option value="" disabled selected>Change</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlist</option>
                    <option value="Hired">Hire</option>
                    <option value="Rejected">Reject</option>
                  </select>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (!loading && applicants.length === 0) {
        <div class="empty-state">
          <span class="material-icons-outlined">people</span>
          <h3>No applicants yet</h3>
          <p>Applications will appear here when candidates apply</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .applicants-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .applicant-card { display: flex; flex-direction: column; gap: 12px; }
    .applicant-header { display: flex; gap: 12px; align-items: center; }
    .applicant-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem;
    }
    .headline { color: var(--text-secondary); font-size: 0.9rem; }
    .applicant-details { display: flex; flex-wrap: wrap; gap: 6px; }
    .cover-letter {
      font-style: italic; color: var(--text-secondary); font-size: 0.85rem;
      padding: 12px; background: var(--bg-primary); border-radius: 8px;
    }
    .applicant-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 12px; border-top: 1px solid var(--border-color);
    }
    .status-actions { display: flex; align-items: center; gap: 8px; }
    .resume-row {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; background: var(--bg-primary); border-radius: 8px;
    }
    .resume-name { flex: 1; font-size: 0.85rem; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status-select {
      padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 6px;
      font-size: 0.8rem; cursor: pointer;
    }
    @media (max-width: 768px) { .applicants-grid { grid-template-columns: 1fr; } }
  `]
})
export class ViewApplicantsComponent implements OnInit {
  applicants: Application[] = [];
  loading = true;
  jobId = 0;
  success = '';

  constructor(private route: ActivatedRoute, private employerService: EmployerService) { }

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.employerService.getApplicants(this.jobId).subscribe({
      next: (r) => { this.applicants = r.items; this.loading = false; },
      error: () => this.loading = false
    });
  }

  viewResume(applicationId: number, fileName: string): void {
    this.employerService.downloadApplicantResume(applicationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: () => this.success = ''
    });
  }

  updateStatus(applicationId: number, status: string): void {
    if (!status) return;
    this.employerService.updateApplicationStatus(applicationId, status).subscribe({
      next: () => { this.success = `Application status updated to ${status}`; this.load(); },
      error: () => this.success = ''
    });
  }
}
