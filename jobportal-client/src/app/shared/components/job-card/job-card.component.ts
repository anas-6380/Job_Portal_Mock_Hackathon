import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss'
})
export class JobCardComponent {
  @Input() job!: Job;
  @Input() colorVariant: 'default' | 'green' | 'blue' | 'purple' = 'default';

  get cardClass(): string {
    return `job-card card-${this.colorVariant}`;
  }

  get formattedDate(): string {
    const date = new Date(this.job.createdAt);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  get salaryDisplay(): string {
    if (this.job.salaryMin && this.job.salaryMax) {
      return `$${this.job.salaryMin.toLocaleString()} - $${this.job.salaryMax.toLocaleString()}`;
    }
    if (this.job.salaryMin) return `From $${this.job.salaryMin.toLocaleString()}`;
    if (this.job.salaryMax) return `Up to $${this.job.salaryMax.toLocaleString()}`;
    return 'Negotiable';
  }
}
