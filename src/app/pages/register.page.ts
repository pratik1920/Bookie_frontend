import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthApiService } from '../services/auth-api.service';
import { AuthSessionService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="orb orb-one"></div>
      <div class="orb orb-two"></div>

      <div class="auth-grid">
        <article class="auth-card panel-rise">
          <div class="title-row">
            <h2>Create account</h2>
            <a
              [routerLink]="'/login'"
              [queryParams]="returnUrl ? { returnUrl: returnUrl } : null"
              class="ghost-link"
            >
              Back to login
            </a>
          </div>

          <p class="helper" *ngIf="!otpStep">Start selling and browsing instantly with a verified student account.</p>
          <p class="helper" *ngIf="otpStep">Enter the OTP sent to your email to complete signup.</p>

          <form [formGroup]="signupForm" (ngSubmit)="register()" class="auth-form">
            <label>
              <span>Full Name</span>
              <input type="text" formControlName="name" placeholder="Your full name" [readonly]="otpStep" />
              <small *ngIf="signupForm.get('name')?.touched && signupForm.get('name')?.invalid">
                Name is required.
              </small>
            </label>

            <label>
              <span>Email</span>
              <input type="email" formControlName="email" placeholder="you@university.edu" [readonly]="otpStep" />
              <small *ngIf="signupForm.get('email')?.touched && signupForm.get('email')?.invalid">
                Enter a valid email address.
              </small>
            </label>

            <label>
              <span>University (Optional)</span>
              <input type="text" formControlName="university" placeholder="University name" [readonly]="otpStep" />
            </label>

            <label *ngIf="!otpStep">
              <span>Password</span>
              <div class="password-wrap">
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="At least 8 characters" />
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
              <small *ngIf="signupForm.get('password')?.touched && signupForm.get('password')?.invalid">
                Password must be at least 8 characters.
              </small>
            </label>

            <label *ngIf="otpStep">
              <span>OTP</span>
              <input type="text" formControlName="otp" placeholder="Enter 6-digit OTP" maxlength="6" />
              <small *ngIf="signupForm.get('otp')?.touched && signupForm.get('otp')?.invalid">
                Enter a valid 6-digit OTP.
              </small>
            </label>

            <p class="success" *ngIf="success">{{ success }}</p>
            <p class="error" *ngIf="error">{{ error }}</p>

            <div class="otp-actions" *ngIf="otpStep">
              <button type="button" class="subtle-btn" (click)="resendOtp()" [disabled]="loading">Resend OTP</button>
              <button type="button" class="subtle-btn" (click)="resetOtpFlow()" [disabled]="loading">Change details</button>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading">
              <span class="spinner" *ngIf="loading"></span>
              {{ loading ? (otpStep ? 'Verifying OTP...' : 'Sending OTP...') : (otpStep ? 'Verify & Create Account' : 'Send OTP') }}
            </button>
          </form>
        </article>

        <aside class="auth-brand panel-rise delay-1">
          <p class="badge">Join BookSwap</p>
          <h1>Turn old books into value</h1>
          <p class="subtext">List textbooks, notes, and guides in minutes. Reach students on your campus and close deals faster.</p>

          <div class="benefits">
            <article>
              <h3>Fast Listing</h3>
              <p>Post in under 2 minutes with pricing and condition.</p>
            </article>
            <article>
              <h3>Verified Community</h3>
              <p>Buyers and sellers are students using trusted accounts.</p>
            </article>
            <article>
              <h3>Direct Connect</h3>
              <p>Coordinate secure campus handoffs quickly and safely.</p>
            </article>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100vh - 130px);
    }

    .auth-shell {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      background: linear-gradient(145deg, #dbeafe 0%, #eff6ff 35%, #f8fafc 100%);
      padding: 1.25rem;
      isolation: isolate;
    }

    .orb {
      position: absolute;
      border-radius: 999px;
      filter: blur(55px);
      opacity: 0.5;
      z-index: -1;
      animation: drift 8s ease-in-out infinite;
    }

    .orb-one {
      width: 240px;
      height: 240px;
      background: #38bdf8;
      top: -50px;
      left: -30px;
    }

    .orb-two {
      width: 300px;
      height: 300px;
      background: #60a5fa;
      bottom: -65px;
      right: -70px;
      animation-delay: 1s;
    }

    .auth-grid {
      display: grid;
      gap: 1rem;
      align-items: stretch;
    }

    .panel-rise {
      animation: riseIn 0.55s ease-out both;
    }

    .delay-1 {
      animation-delay: 0.08s;
    }

    .auth-brand,
    .auth-card {
      border: 1px solid #bfdbfe;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      padding: 1.5rem;
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
    }

    .title-row h2 {
      margin: 0;
      color: #0f172a;
      font-size: 1.45rem;
      font-weight: 800;
    }

    .ghost-link {
      text-decoration: none;
      color: #1d4ed8;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .helper {
      margin: 0.5rem 0 0;
      color: #475569;
      font-size: 0.92rem;
    }

    .auth-form {
      margin-top: 1.1rem;
      display: grid;
      gap: 0.9rem;
    }

    label span {
      display: block;
      margin-bottom: 0.35rem;
      font-weight: 700;
      color: #334155;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 0.72rem 0.85rem;
      border-radius: 12px;
      border: 1px solid #bfdbfe;
      background: #ffffff;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      box-sizing: border-box;
    }

    input:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
    }

    .password-wrap {
      position: relative;
    }

    .password-wrap input {
      padding-right: 4.5rem;
    }

    .toggle-password {
      position: absolute;
      top: 50%;
      right: 0.45rem;
      transform: translateY(-50%);
      border: 0;
      background: transparent;
      color: #2563eb;
      font-weight: 700;
      cursor: pointer;
      padding: 0.25rem;
    }

    small {
      display: block;
      margin-top: 0.32rem;
      color: #b91c1c;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .success,
    .error {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 700;
      border-radius: 10px;
      padding: 0.55rem 0.65rem;
    }

    .success {
      color: #166534;
      background: #dcfce7;
      border: 1px solid #bbf7d0;
    }

    .error {
      color: #b91c1c;
      background: #fee2e2;
      border: 1px solid #fecaca;
    }

    .otp-actions {
      display: flex;
      gap: 0.5rem;
    }

    .subtle-btn {
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      background: #eff6ff;
      color: #1d4ed8;
      font-weight: 700;
      padding: 0.45rem 0.65rem;
      cursor: pointer;
    }

    .subtle-btn:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }

    .submit-btn {
      width: 100%;
      border: 0;
      border-radius: 12px;
      background: linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%);
      color: #fff;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      padding: 0.8rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 0.55rem;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .submit-btn:hover {
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.6);
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }

    .badge {
      display: inline-flex;
      border-radius: 999px;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.35rem 0.7rem;
      margin: 0;
    }

    .auth-brand h1 {
      margin: 0.75rem 0 0;
      color: #0f172a;
      font-size: clamp(1.5rem, 3vw, 2rem);
      line-height: 1.2;
    }

    .subtext {
      color: #475569;
      margin: 0.75rem 0 0;
      font-size: 1rem;
    }

    .benefits {
      margin-top: 1rem;
      display: grid;
      gap: 0.6rem;
    }

    .benefits article {
      border-radius: 12px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.7rem;
    }

    .benefits h3 {
      margin: 0;
      color: #1e3a8a;
      font-size: 0.95rem;
      font-weight: 800;
    }

    .benefits p {
      margin: 0.25rem 0 0;
      color: #334155;
      font-size: 0.82rem;
    }

    @media (min-width: 980px) {
      .auth-shell {
        padding: 2rem;
      }

      .auth-grid {
        grid-template-columns: 1fr 1.1fr;
        gap: 1.4rem;
      }

      .auth-brand,
      .auth-card {
        padding: 2rem;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes riseIn {
      from {
        opacity: 0;
        transform: translateY(18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes drift {
      0%,
      100% {
        transform: translate3d(0, 0, 0);
      }
      50% {
        transform: translate3d(14px, -10px, 0);
      }
    }
  `]
})
export class SignupComponent {

  signupForm: FormGroup;
  loading = false;
  success = '';
  error = '';
  otpStep = false;
  challengeId: string | null = null;
  showPassword = false;
  readonly returnUrl: string | null;

  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor(
    private readonly fb: FormBuilder
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      university: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      otp: ['']
    });

  }

  register() {

    if (this.otpStep) {
      this.verifyOtp();
      return;
    }

    if (
      this.signupForm.get('name')?.invalid ||
      this.signupForm.get('email')?.invalid ||
      this.signupForm.get('password')?.invalid
    ) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authApi.requestRegisterOtp({
      name: this.signupForm.get('name')?.value,
      email: this.signupForm.get('email')?.value,
      university: this.signupForm.get('university')?.value,
      password: this.signupForm.get('password')?.value
    })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({

      next: (challenge) => {
        this.otpStep = true;
        this.challengeId = challenge.challengeId;
        this.success = challenge.message || `OTP sent to ${challenge.maskedEmail || this.signupForm.get('email')?.value}.`;
        this.error = '';
        this.signupForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
        this.signupForm.get('otp')?.updateValueAndValidity();
      },

      error: (err) => {
        this.error = this.resolveErrorMessage(err, 'Registration Failed');
      }

    });

  }

  verifyOtp(): void {
    if (!this.challengeId) {
      this.error = 'OTP session expired. Please try again.';
      this.resetOtpFlow();
      return;
    }

    if (this.signupForm.get('otp')?.invalid) {
      this.signupForm.get('otp')?.markAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authApi.verifyRegisterOtp({
      challengeId: this.challengeId,
      otp: this.signupForm.get('otp')?.value
    })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
      next: (response) => {
        this.success = 'Registration Successful!';
        this.authSession.setSession(response.token, response.user?.id ?? null);
        this.router.navigateByUrl(this.returnUrl || '/browse');
      },
      error: (err) => {
        this.error = this.resolveErrorMessage(err, 'Invalid OTP');
      }
    });
  }

  resendOtp(): void {
    if (!this.challengeId) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authApi.resendOtp(this.challengeId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
      next: (response) => {
        this.success = response.message || `A new OTP was sent to ${response.maskedEmail || this.signupForm.get('email')?.value}.`;
      },
      error: (err) => {
        this.error = this.resolveErrorMessage(err, 'Unable to resend OTP right now.');
      }
    });
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    const httpError = error as { status?: number; error?: { message?: string } };

    if (httpError?.status === 0) {
      return 'Cannot reach backend. Check API URL, CORS, and backend server status.';
    }

    return httpError?.error?.message || fallback;
  }

  resetOtpFlow(): void {
    this.otpStep = false;
    this.challengeId = null;
    this.success = '';
    this.error = '';
    this.signupForm.get('otp')?.reset('');
    this.signupForm.get('otp')?.clearValidators();
    this.signupForm.get('otp')?.updateValueAndValidity();
  }

}