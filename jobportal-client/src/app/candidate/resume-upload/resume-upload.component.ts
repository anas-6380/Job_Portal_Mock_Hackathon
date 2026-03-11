import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../core/services/candidate.service';
import { Resume } from '../../core/models/job.model';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <h1>My Resumes</h1>
      </div>

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }
      @if (error) {
        <div class="alert alert-error">{{ error }}</div>
      }

      <div class="card" style="max-width: 700px; margin-bottom: 24px">
        <h3 style="margin-bottom: 16px">Upload Resume</h3>
        <p class="text-secondary" style="margin-bottom: 16px; font-size: 0.875rem">
          Accepted formats: PDF, DOC, DOCX (Max 5MB)
        </p>
        <div class="upload-area" (click)="fileInput.click()"
          (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
          <span class="material-icons-outlined" style="font-size: 2.5rem; color: var(--text-muted)">cloud_upload</span>
          <p>Click or drag file to upload</p>
          <input #fileInput type="file" accept=".pdf,.doc,.docx" (change)="onFileSelected($event)" style="display:none">
        </div>
        @if (uploading) {
          <div style="margin-top: 12px; text-align: center" class="text-secondary">Uploading...</div>
        }
      </div>

      @if (resumes.length > 0) {
        <div class="card" style="max-width: 700px; padding: 0; overflow: hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of resumes; track r.id) {
                <tr>
                  <td><strong>{{ r.fileName }}</strong></td>
                  <td>{{ r.uploadedAt | date:'mediumDate' }}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" (click)="download(r)">Download</button>
                    <button class="btn btn-danger btn-sm" style="margin-left:8px" (click)="deleteResume(r.id)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <span class="material-icons-outlined">description</span>
          <h3>No resumes uploaded</h3>
          <p>Upload your resume to apply for jobs</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-area {
      border: 2px dashed var(--border-color);
      border-radius: var(--border-radius);
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        border-color: var(--accent-blue);
        background: rgba(67, 97, 238, 0.03);
      }

      p {
        margin-top: 8px;
        color: var(--text-muted);
        font-size: 0.9rem;
      }
    }
  `]
})
export class ResumeUploadComponent implements OnInit {
  resumes: Resume[] = [];
  uploading = false;
  success = '';
  error = '';

  constructor(private candidateService: CandidateService) {}

  ngOnInit(): void { this.loadResumes(); }

  loadResumes(): void {
    this.candidateService.getResumes().subscribe({ next: (r) => this.resumes = r });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.uploadFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  uploadFile(file: File): void {
    this.uploading = true;
    this.error = '';
    this.success = '';
    this.candidateService.uploadResume(file).subscribe({
      next: () => {
        this.success = 'Resume uploaded successfully!';
        this.uploading = false;
        this.loadResumes();
      },
      error: (e) => { this.error = e.message; this.uploading = false; }
    });
  }

  download(resume: Resume): void {
    this.candidateService.downloadResume(resume.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resume.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  deleteResume(id: number): void {
    if (!confirm('Delete this resume?')) return;
    this.candidateService.deleteResume(id).subscribe({
      next: () => { this.success = 'Resume deleted'; this.loadResumes(); },
      error: (e) => this.error = e.message
    });
  }
}
