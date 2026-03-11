import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  selectedRole = 'Candidate';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      role: ['Candidate', Validators.required],
      companyName: [''],
      companyWebsite: [''],
      companyLocation: [''],
      headline: [''],
      skills: ['']
    });
  }

  onRoleChange(): void {
    this.selectedRole = this.form.get('role')?.value;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.register(this.form.value).subscribe({
      next: (user) => {
        this.loading = false;
        if (user.role === 'Employer') this.router.navigate(['/employer/dashboard']);
        else this.router.navigate(['/candidate/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Registration failed';
      }
    });
  }
}
