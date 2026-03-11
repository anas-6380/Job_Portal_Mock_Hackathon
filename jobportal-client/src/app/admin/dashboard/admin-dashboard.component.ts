import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { DashboardStats } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p class="text-secondary">System overview and management</p>
        </div>
      </div>

      @if (stats) {
        <div class="grid-4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #dbeafe; color: #2563eb">👥</div>
            <div class="stat-info">
              <h3>{{ stats.totalUsers }}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #d1fae5; color: #059669">🏢</div>
            <div class="stat-info">
              <h3>{{ stats.totalEmployers }}</h3>
              <p>Employers</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #fef3c7; color: #d97706">🎯</div>
            <div class="stat-info">
              <h3>{{ stats.totalCandidates }}</h3>
              <p>Candidates</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #f3e8ff; color: #7c3aed">💼</div>
            <div class="stat-info">
              <h3>{{ stats.totalJobs }}</h3>
              <p>Total Jobs</p>
            </div>
          </div>
        </div>

        <div class="grid-3" style="margin-top: 24px">
          <div class="stat-card">
            <div class="stat-icon" style="background: #dcfce7; color: #16a34a">✅</div>
            <div class="stat-info">
              <h3>{{ stats.activeJobs }}</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #e0e7ff; color: #4f46e5">📝</div>
            <div class="stat-info">
              <h3>{{ stats.totalApplications }}</h3>
              <p>Applications</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #fff7ed; color: #ea580c">⏳</div>
            <div class="stat-info">
              <h3>{{ stats.pendingApplications }}</h3>
              <p>Pending</p>
            </div>
          </div>
        </div>
      }

      <div class="quick-links" style="margin-top: 40px">
        <h2 style="margin-bottom: 20px">Quick Actions</h2>
        <div class="grid-3">
          <a routerLink="/admin/users" class="action-card card">
            <span class="material-icons-outlined" style="font-size: 2rem; color: var(--accent-blue)">people</span>
            <h3>Manage Users</h3>
            <p class="text-secondary">Activate/deactivate user accounts</p>
          </a>
          <a routerLink="/admin/jobs" class="action-card card">
            <span class="material-icons-outlined" style="font-size: 2rem; color: var(--accent-green)">work</span>
            <h3>Manage Jobs</h3>
            <p class="text-secondary">Moderate job postings</p>
          </a>
          <a routerLink="/admin/applications" class="action-card card">
            <span class="material-icons-outlined" style="font-size: 2rem; color: var(--accent-purple)">assignment</span>
            <h3>View Applications</h3>
            <p class="text-secondary">Monitor all job applications</p>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .action-card {
      text-align: center;
      padding: 32px;
      cursor: pointer;
      h3 { margin: 12px 0 4px; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (s) => this.stats = s
    });
  }
}
