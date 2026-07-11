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
      overflow: clip;
      border-radius: 20px;
      background: linear-gradient(145deg, rgba(191, 219, 254, 0.24), rgba(224, 231, 255, 0.26));
      border: 1px solid rgba(147, 197, 253, 0.38);
      padding: 1rem;
      isolation: isolate;
    }

    .auth-shell::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(56% 38% at 10% 14%, rgba(255, 255, 255, 0.42), transparent 78%),
        radial-gradient(40% 34% at 88% 20%, rgba(147, 197, 253, 0.24), transparent 76%);
      pointer-events: none;
      z-index: -2;
    }

    .orb {
      position: absolute;
      border-radius: 999px;
      filter: blur(52px);
      opacity: 0.35;
      z-index: -1;
      animation: drift 10s ease-in-out infinite;
    }

    .orb-one {
      width: 260px;
      height: 260px;
      background: #0ea5e9;
      top: -54px;
      left: -44px;
    }

    .orb-two {
      width: 320px;
      height: 320px;
      background: #2563eb;
      bottom: -78px;
      right: -70px;
      animation-delay: 1.3s;
    }

    .auth-grid {
      display: grid;
      gap: 0.9rem;
      align-items: stretch;
    }

    .panel-rise {
      animation: riseIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .delay-1 {
      animation-delay: 0.12s;
    }

    .auth-brand,
    .auth-card {
      border: 1px solid rgba(147, 197, 253, 0.5);
      border-radius: 20px;
      background: linear-gradient(150deg, rgba(239, 246, 255, 0.72), rgba(224, 231, 255, 0.7));
      backdrop-filter: blur(16px) saturate(125%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 16px 32px rgba(37, 99, 235, 0.18);
      padding: 1.35rem;
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
    }

    .title-row h2 {
      margin: 0;
      color: #020617;
      font-size: 1.62rem;
      font-weight: 900;
    }

    .ghost-link {
      text-decoration: none;
      color: #1e40af;
      font-weight: 800;
      font-size: 0.92rem;
      transition: transform 0.2s ease, color 0.2s ease;
    }

    .ghost-link:hover {
      color: #1d4ed8;
      transform: translateX(-2px);
    }

    .helper {
      margin: 0.55rem 0 0;
      color: #1e293b;
      font-size: 0.92rem;
    }

    .auth-form {
      margin-top: 1.2rem;
      display: grid;
      gap: 0.95rem;
    }

    label span {
      display: block;
      margin-bottom: 0.38rem;
      font-weight: 700;
      color: #0f172a;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 0.76rem 0.88rem;
      border-radius: 12px;
      border: 1px solid rgba(147, 197, 253, 0.95);
      background: rgba(255, 255, 255, 0.94);
      color: #020617;
      outline: none;
      transition: border-color 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease;
      box-sizing: border-box;
    }

    input::placeholder {
      color: #64748b;
      opacity: 1;
    }

    input:focus {
      border-color: #3b82f6;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.22);
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
      color: #1d4ed8;
      font-weight: 700;
      cursor: pointer;
      padding: 0.25rem;
      transition: color 0.2s ease;
    }

    .toggle-password:hover {
      color: #1e40af;
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
      border: 1px solid rgba(147, 197, 253, 0.9);
      border-radius: 10px;
      background: rgba(239, 246, 255, 0.74);
      color: #1e40af;
      font-weight: 700;
      padding: 0.45rem 0.65rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .subtle-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(30, 64, 175, 0.12);
    }

    .subtle-btn:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }

    .submit-btn {
      width: 100%;
      border: 0;
      border-radius: 12px;
      background: linear-gradient(100deg, #1d4ed8 0%, #0ea5e9 52%, #0284c7 100%);
      background-size: 210% 210%;
      color: #fff;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      padding: 0.8rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 0.55rem;
      transition: transform 0.24s ease, opacity 0.2s ease, box-shadow 0.24s ease;
      animation: pulseGradient 4.5s ease infinite;
      box-shadow: 0 10px 24px rgba(29, 78, 216, 0.32);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 26px rgba(2, 132, 199, 0.32);
    }

    .submit-btn:disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: rgba(255, 255, 255, 0.96);
      border-right-color: rgba(255, 255, 255, 0.72);
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0));
      box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.06), 0 0 18px rgba(14, 165, 233, 0.35);
      animation: spin 0.85s linear infinite, pulseGlow 1.6s ease-in-out infinite;
    }

    .badge {
      display: inline-flex;
      border-radius: 999px;
      background: rgba(147, 197, 253, 0.34);
      color: #1e40af;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.01em;
      padding: 0.38rem 0.72rem;
      margin: 0;
    }

    .auth-brand h1 {
      margin: 0.75rem 0 0;
      color: #0f172a;
      font-size: clamp(1.72rem, 3vw, 2.24rem);
      line-height: 1.16;
      text-wrap: balance;
    }

    .subtext {
      color: #1e293b;
      margin: 0.75rem 0 0;
      font-size: 1.02rem;
      line-height: 1.42;
    }

    .benefits {
      margin-top: 1.1rem;
      display: grid;
      gap: 0.62rem;
    }

    .benefits article {
      border-radius: 12px;
      background: rgba(239, 246, 255, 0.62);
      border: 1px solid rgba(147, 197, 253, 0.64);
      padding: 0.74rem;
      transition: transform 0.24s ease, box-shadow 0.24s ease;
    }

    .benefits article:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(30, 64, 175, 0.12);
    }

    .benefits h3 {
      margin: 0;
      color: #1e3a8a;
      font-size: 0.95rem;
      font-weight: 800;
    }

    .benefits p {
      margin: 0.25rem 0 0;
      color: #1e293b;
      font-size: 0.82rem;
    }

    @media (min-width: 980px) {
      .auth-shell {
        padding: 1.8rem;
      }

      .auth-grid {
        grid-template-columns: 1fr 1.1fr;
        gap: 1rem;
      }

      .auth-brand,
      .auth-card {
        padding: 1.85rem;
      }
    }

    @media (max-width: 979px) {
      .auth-brand {
        order: 2;
      }

      .auth-card {
        order: 1;
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

    @keyframes pulseGlow {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.88;
      }
      50% {
        transform: scale(1.1);
        opacity: 1;
      }
    }

    @keyframes pulseGradient {
      0%,
      100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
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
        this.router.navigateByUrl(this.returnUrl || '/home');
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