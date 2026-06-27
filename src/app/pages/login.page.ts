import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">

      <div class="login-card">
        <h2>Login to BookSwap</h2>

        <form [formGroup]="loginForm" (ngSubmit)="login()">

          <div class="form-group">
            <label>Email</label>

            <input
              type="email"
              formControlName="email"
              placeholder="Enter your email">

            <small
              *ngIf="loginForm.get('email')?.invalid &&
                     loginForm.get('email')?.touched">
              Valid email is required
            </small>
          </div>

          <div class="form-group">
            <label>Password</label>

            <input
              type="password"
              formControlName="password"
              placeholder="Enter password">

            <small
              *ngIf="loginForm.get('password')?.invalid &&
                     loginForm.get('password')?.touched">
              Password is required
            </small>
          </div>

          <div class="error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

        </form>
      </div>

    </div>
  `,
  styles: [`
    .login-container{
      display:flex;
      justify-content:center;
      align-items:center;
      min-height:80vh;
      padding:20px;
    }

    .login-card{
      width:100%;
      max-width:400px;
      background:#fff;
      padding:24px;
      border-radius:12px;
      box-shadow:0 4px 20px rgba(0,0,0,.1);
    }

    h2{
      text-align:center;
      margin-bottom:20px;
    }

    .form-group{
      margin-bottom:16px;
    }

    label{
      display:block;
      margin-bottom:6px;
      font-weight:600;
    }

    input{
      width:100%;
      padding:10px;
      border:1px solid #ddd;
      border-radius:6px;
      box-sizing:border-box;
    }

    button{
      width:100%;
      padding:12px;
      border:none;
      border-radius:6px;
      background:#2563eb;
      color:white;
      cursor:pointer;
      font-size:16px;
    }

    button:disabled{
      opacity:.7;
    }

    small{
      color:red;
    }

    .error{
      color:red;
      margin-bottom:12px;
    }
  `]
})
export class LoginPage {

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  private apiUrl = 'http://localhost:8080/api/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>(this.apiUrl, this.loginForm.value)
      .subscribe({
        next: (response) => {

          localStorage.setItem('token', response.token);

          this.loading = false;

          this.router.navigate(['/']);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Invalid email or password';
        }
      });
  }
}