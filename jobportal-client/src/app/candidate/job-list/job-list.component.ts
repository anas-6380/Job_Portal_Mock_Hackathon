import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { Job, PagedResult } from '../../core/models/job.model';
import { JobCardComponent } from '../../shared/components/job-card/job-card.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, JobCardComponent],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  page = 1;
  totalPages = 1;
  totalCount = 0;
  search = '';
  location = '';
  jobType = '';
  colors: ('default' | 'green' | 'blue' | 'purple')[] = ['default', 'green', 'blue', 'purple'];

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getJobs(this.page, 12, this.search || undefined, this.location || undefined, this.jobType || undefined)
      .subscribe({
        next: (result: PagedResult<Job>) => {
          this.jobs = result.items;
          this.totalPages = result.totalPages;
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  onSearch(): void {
    this.page = 1;
    this.loadJobs();
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadJobs();
  }

  getColor(index: number): 'default' | 'green' | 'blue' | 'purple' {
    return this.colors[index % this.colors.length];
  }
}
