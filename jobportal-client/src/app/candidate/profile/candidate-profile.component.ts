import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidateService } from '../../core/services/candidate.service';
import { CandidateProfile } from '../../core/models/user.model';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <h1>My Profile</h1>
      </div>

      @if (success) {
        <div class="alert alert-success">Profile updated successfully!</div>
      }
      @if (error) {
        <div class="alert alert-error">{{ error }}</div>
      }

      @if (profile) {
        <div class="card" style="max-width: 700px">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label>First Name</label>
                <input type="text" formControlName="firstName" class="form-control">
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" formControlName="lastName" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="text" formControlName="phone" class="form-control">
            </div>
            <div class="form-group">
              <label>Headline</label>
              <input type="text" formControlName="headline" class="form-control" placeholder="e.g. Senior Software Developer">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label>Experience (Years)</label>
                <input type="number" formControlName="experienceYears" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label>Skills</label>
              <textarea formControlName="skills" class="form-control" rows="3" placeholder="JavaScript, React, Python, etc."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>
      }
    </div>
  `
})
export class CandidateProfileComponent implements OnInit {
  form!: FormGroup;
  profile: CandidateProfile | null = null;
  loading = false;
  success = false;
  error = '';

  constructor(private fb: FormBuilder, private candidateService: CandidateService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      headline: [''],
      experienceYears: [null],
      skills: ['']
    });

    this.candidateService.getProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.form.patchValue(p);
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.success = false;
    this.error = '';
    this.candidateService.updateProfile(this.form.value).subscribe({
      next: (p) => { this.profile = p; this.success = true; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }
}
