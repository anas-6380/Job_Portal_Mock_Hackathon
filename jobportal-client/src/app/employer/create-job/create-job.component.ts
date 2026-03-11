import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <h1>Post a New Job</h1>
      </div>

      @if (error) {
        <div class="alert alert-error">{{ error }}</div>
      }

      <div class="card" style="max-width: 800px">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Job Title *</label>
            <input type="text" formControlName="title" class="form-control" placeholder="e.g. Senior UI/UX Designer">
          </div>

          <div class="form-group">
            <label>Description *</label>
            <textarea formControlName="description" class="form-control" rows="6"
              placeholder="Describe the role, responsibilities, and requirements"></textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="form-group">
              <label>Location</label>
              <input type="text" formControlName="location" class="form-control" placeholder="e.g. New York, NY">
            </div>
            <div class="form-group">
              <label>Job Type</label>
              <select formControlName="jobType" class="form-control">
                <option value="">Select type</option>
                <option value="Full time">Full time</option>
                <option value="Part time">Part time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="form-group">
              <label>Minimum Salary ($)</label>
              <input type="number" formControlName="salaryMin" class="form-control" placeholder="e.g. 50000">
            </div>
            <div class="form-group">
              <label>Maximum Salary ($)</label>
              <input type="number" formControlName="salaryMax" class="form-control" placeholder="e.g. 100000">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="form-group">
              <label>Experience Required (Years)</label>
              <input type="number" formControlName="experienceRequired" class="form-control" placeholder="e.g. 3">
            </div>
            <div class="form-group">
              <label>Expires At</label>
              <input type="date" formControlName="expiresAt" class="form-control">
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading || form.invalid">
            {{ loading ? 'Publishing...' : 'Publish Job' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class CreateJobComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private jobService: JobService, private router: Router) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: [''],
      jobType: [''],
      salaryMin: [null],
      salaryMax: [null],
      experienceRequired: [null],
      expiresAt: [null]
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.jobService.createJob(this.form.value).subscribe({
      next: () => this.router.navigate(['/employer/manage-jobs']),
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }
}
