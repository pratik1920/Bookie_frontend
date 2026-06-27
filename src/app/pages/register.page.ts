import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="card">

        <h1>BookSwap</h1>
        <h2>Create Account</h2>

        <form [formGroup]="signupForm" (ngSubmit)="register()">

          <input
            type="text"
            placeholder="Full Name"
            formControlName="name">

          <small *ngIf="signupForm.get('name')?.touched && signupForm.get('name')?.invalid">
            Name is required
          </small>

          <input
            type="email"
            placeholder="Email"
            formControlName="email">

          <small *ngIf="signupForm.get('email')?.touched && signupForm.get('email')?.errors?.['required']">
            Email is required
          </small>

          <small *ngIf="signupForm.get('email')?.errors?.['email']">
            Invalid email
          </small>

          <input
            type="text"
            placeholder="University (Optional)"
            formControlName="university">

          <input
            type="password"
            placeholder="Password"
            formControlName="password">

          <small *ngIf="signupForm.get('password')?.touched && signupForm.get('password')?.errors?.['required']">
            Password is required
          </small>

          <small *ngIf="signupForm.get('password')?.errors?.['minlength']">
            Password must be at least 8 characters
          </small>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Sign Up' }}
          </button>

        </form>

        <p class="success" *ngIf="success">{{ success }}</p>
        <p class="error" *ngIf="error">{{ error }}</p>

        <p>
          Already have an account?
          <a routerLink="/login">Login</a>
        </p>

      </div>
    </div>
  `,
  styles: [`
    *{
      box-sizing:border-box;
    }

    .container{
      display:flex;
      justify-content:center;
      align-items:center;
      min-height:100vh;
      background:#f4f7fb;
    }

    .card{
      width:400px;
      background:#fff;
      padding:30px;
      border-radius:10px;
      box-shadow:0 5px 20px rgba(0,0,0,.15);
    }

    h1{
      color:#2563eb;
      text-align:center;
      margin-bottom:5px;
    }

    h2{
      text-align:center;
      margin-bottom:20px;
    }

    input{
      width:100%;
      padding:12px;
      margin-top:10px;
      border:1px solid #ccc;
      border-radius:6px;
      font-size:15px;
    }

    button{
      width:100%;
      margin-top:20px;
      padding:12px;
      border:none;
      border-radius:6px;
      background:#2563eb;
      color:#fff;
      font-size:16px;
      cursor:pointer;
    }

    button:hover{
      background:#1d4ed8;
    }

    button:disabled{
      background:gray;
      cursor:not-allowed;
    }

    small{
      color:red;
      display:block;
      margin-top:4px;
    }

    .success{
      color:green;
      text-align:center;
      margin-top:15px;
    }

    .error{
      color:red;
      text-align:center;
      margin-top:15px;
    }

    p{
      text-align:center;
      margin-top:20px;
    }

    a{
      color:#2563eb;
      text-decoration:none;
      font-weight:bold;
    }
  `]
})
export class SignupComponent {

  signupForm: FormGroup;
  loading = false;
  success = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      university: [''],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

  }

  register() {

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.http.post(
      'http://localhost:8080/api/auth/register',
      this.signupForm.value
    ).subscribe({

      next: () => {
        this.loading = false;
        this.success = 'Registration Successful!';
        this.signupForm.reset();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration Failed';
      }

    });

  }

}