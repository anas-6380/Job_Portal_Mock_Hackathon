import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { CandidateService } from '../../core/services/candidate.service';
import { AuthService } from '../../core/services/auth.service';
import { Job, Resume } from '../../core/models/job.model';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss'
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  loading = true;
  resumes: Resume[] = [];
  showApplyForm = false;
  applying = false;
  applied = false;
  applyError = '';
  applyForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private candidateService: CandidateService,
    public auth: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.applyForm = this.fb.group({
      resumeId: [null],
      coverLetter: ['']
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.getJobById(id).subscribe({
      next: (job) => { this.job = job; this.loading = false; },
      error: () => { this.loading = false; }
    });

    if (this.auth.isLoggedIn && this.auth.userRole === 'Candidate') {
      this.candidateService.getResumes().subscribe({
        next: (r) => this.resumes = r
      });
    }
  }

  openApplyForm(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.showApplyForm = true;
  }

  submitApplication(): void {
    if (!this.job) return;
    this.applying = true;
    this.applyError = '';

    this.candidateService.applyForJob({
      jobId: this.job.id,
      resumeId: this.applyForm.value.resumeId || undefined,
      coverLetter: this.applyForm.value.coverLetter || undefined
    }).subscribe({
      next: () => {
        this.applied = true;
        this.applying = false;
        this.showApplyForm = false;
      },
      error: (err) => {
        this.applyError = err.message;
        this.applying = false;
      }
    });
  }

  get salaryDisplay(): string {
    if (!this.job) return '';
    if (this.job.salaryMin && this.job.salaryMax)
      return `$${this.job.salaryMin.toLocaleString()} - $${this.job.salaryMax.toLocaleString()}`;
    if (this.job.salaryMin) return `From $${this.job.salaryMin.toLocaleString()}`;
    if (this.job.salaryMax) return `Up to $${this.job.salaryMax.toLocaleString()}`;
    return 'Negotiable';
  }
}
