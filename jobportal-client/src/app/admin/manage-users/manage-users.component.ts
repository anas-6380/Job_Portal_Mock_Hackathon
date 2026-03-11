import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { UserList } from '../../core/models/user.model';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container fade-in">
      <div class="page-header">
        <h1>Manage Users</h1>
      </div>

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      @if (loading) {
        <div class="loader"><div class="spinner"></div></div>
      }

      @if (!loading && users.length > 0) {
        <div class="card" style="padding: 0; overflow: hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of users; track u.id) {
                <tr>
                  <td>{{ u.id }}</td>
                  <td><strong>{{ u.firstName }} {{ u.lastName }}</strong></td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.phone || '-' }}</td>
                  <td>
                    <span class="tag"
                      [class.tag-purple]="u.role === 'Admin'"
                      [class.tag-blue]="u.role === 'Employer'"
                      [class.tag-green]="u.role === 'Candidate'">
                      {{ u.role }}
                    </span>
                  </td>
                  <td>
                    <span class="tag" [class.tag-green]="u.isActive" [class.tag-red]="!u.isActive">
                      {{ u.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ u.createdAt | date:'mediumDate' }}</td>
                  <td>
                    <button class="btn btn-sm"
                      [class.btn-danger]="u.isActive"
                      [class.btn-success]="!u.isActive"
                      (click)="toggleStatus(u.id)">
                      {{ u.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
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
export class ManageUsersComponent implements OnInit {
  users: UserList[] = [];
  loading = true;
  page = 1;
  totalPages = 1;
  success = '';

  constructor(private adminService: AdminService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.adminService.getUsers(this.page).subscribe({
      next: (r) => { this.users = r.items; this.totalPages = r.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  toggleStatus(id: number): void {
    this.adminService.toggleUserStatus(id).subscribe({
      next: (u) => {
        this.success = `User ${u.firstName} ${u.lastName} ${u.isActive ? 'activated' : 'deactivated'}`;
        this.load();
      }
    });
  }

  goToPage(p: number): void { this.page = p; this.load(); }
}
