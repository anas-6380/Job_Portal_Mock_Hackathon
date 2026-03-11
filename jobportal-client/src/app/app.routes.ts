import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/jobs', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./candidate/job-list/job-list.component').then(m => m.JobListComponent)
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./candidate/job-detail/job-detail.component').then(m => m.JobDetailComponent)
  },
  // Candidate routes
  {
    path: 'candidate',
    canActivate: [authGuard, roleGuard(['Candidate'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./candidate/dashboard/candidate-dashboard.component').then(m => m.CandidateDashboardComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./candidate/my-applications/my-applications.component').then(m => m.MyApplicationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./candidate/profile/candidate-profile.component').then(m => m.CandidateProfileComponent)
      },
      {
        path: 'resumes',
        loadComponent: () => import('./candidate/resume-upload/resume-upload.component').then(m => m.ResumeUploadComponent)
      }
    ]
  },
  // Employer routes
  {
    path: 'employer',
    canActivate: [authGuard, roleGuard(['Employer'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./employer/dashboard/employer-dashboard.component').then(m => m.EmployerDashboardComponent)
      },
      {
        path: 'create-job',
        loadComponent: () => import('./employer/create-job/create-job.component').then(m => m.CreateJobComponent)
      },
      {
        path: 'manage-jobs',
        loadComponent: () => import('./employer/manage-jobs/manage-jobs.component').then(m => m.ManageJobsComponent)
      },
      {
        path: 'jobs/:jobId/applicants',
        loadComponent: () => import('./employer/view-applicants/view-applicants.component').then(m => m.ViewApplicantsComponent)
      }
    ]
  },
  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['Admin'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./admin/manage-jobs/admin-manage-jobs.component').then(m => m.AdminManageJobsComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./admin/view-applications/view-applications.component').then(m => m.ViewApplicationsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/jobs' }
];
