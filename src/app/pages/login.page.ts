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
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="orb orb-one"></div>
      <div class="orb orb-two"></div>

      <div class="auth-grid">
        <aside class="auth-brand panel-rise">
          <p class="badge">Student marketplace</p>
          <h1>Welcome back to BookSwap</h1>
          <p class="subtext">Buy, sell, and swap books with verified campus peers. Safe deals, faster responses, better prices.</p>

          <div class="kpis">
            <article>
              <h3>2.5k+</h3>
              <p>Active listings</p>
            </article>
            <article>
              <h3>1.2k+</h3>
              <p>Student sellers</p>
            </article>
            <article>
              <h3>4.8/5</h3>
              <p>Avg seller rating</p>
            </article>
          </div>
        </aside>

        <article class="auth-card panel-rise delay-1">
          <div class="title-row">
            <h2>Login</h2>
            <a
              [routerLink]="'/register'"
              [queryParams]="returnUrl ? { returnUrl: returnUrl } : null"
              class="ghost-link"
            >
              Create account
            </a>
          </div>

          <p class="helper" *ngIf="!otpStep">Use your registered email and password to continue.</p>
          <p class="helper" *ngIf="otpStep">Enter the OTP sent to your email to complete sign in.</p>

          <form [formGroup]="loginForm" (ngSubmit)="login()" class="auth-form">
            <label>
              <span>Email</span>
              <input type="email" formControlName="email" placeholder="you@university.edu" [readonly]="otpStep" />
              <small *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
                Enter a valid email address.
              </small>
            </label>

            <label *ngIf="!otpStep">
              <span>Password</span>
              <div class="password-wrap">
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Your password" />
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
              <small *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
                Password is required.
              </small>
            </label>

            <label *ngIf="otpStep">
              <span>OTP</span>
              <input type="text" formControlName="otp" placeholder="Enter 6-digit OTP" maxlength="6" />
              <small *ngIf="loginForm.get('otp')?.touched && loginForm.get('otp')?.invalid">
                Enter a valid 6-digit OTP.
              </small>
            </label>

            <p class="success" *ngIf="otpMessage">{{ otpMessage }}</p>

            <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

            <div class="otp-actions" *ngIf="otpStep">
              <button type="button" class="subtle-btn" (click)="resendOtp()" [disabled]="loading">Resend OTP</button>
              <button type="button" class="subtle-btn" (click)="resetOtpFlow()" [disabled]="loading">Change email</button>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading">
              <span class="spinner" *ngIf="loading"></span>
              {{ loading ? (otpStep ? 'Verifying OTP...' : 'Sending OTP...') : (otpStep ? 'Verify & Sign In' : 'Send OTP') }}
            </button>
          </form>
        </article>
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
      background: linear-gradient(140deg, #dbeafe 0%, #eff6ff 35%, #f8fafc 100%);
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
      background: #60a5fa;
      top: -48px;
      left: -32px;
    }

    .orb-two {
      width: 300px;
      height: 300px;
      background: #38bdf8;
      bottom: -60px;
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
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(8px);
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      padding: 1.5rem;
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

    .kpis {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.6rem;
    }

    .kpis article {
      border-radius: 12px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.7rem;
      text-align: center;
    }

    .kpis h3 {
      margin: 0;
      color: #1e3a8a;
      font-size: 1rem;
      font-weight: 800;
    }

    .kpis p {
      margin: 0.2rem 0 0;
      color: #334155;
      font-size: 0.72rem;
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

    .error {
      margin: 0;
      color: #b91c1c;
      font-size: 0.85rem;
      font-weight: 700;
      border-radius: 10px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      padding: 0.55rem 0.65rem;
    }

    .success {
      margin: 0;
      color: #166534;
      font-size: 0.85rem;
      font-weight: 700;
      border-radius: 10px;
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      padding: 0.55rem 0.65rem;
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

    @media (min-width: 980px) {
      .auth-shell {
        padding: 2rem;
      }

      .auth-grid {
        grid-template-columns: 1.1fr 1fr;
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
export class LoginPage {

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  otpMessage = '';
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      otp: ['']
    });
  }

  login(): void {

    if (this.otpStep) {
      this.verifyOtp();
      return;
    }

    if (this.loginForm.get('email')?.invalid || this.loginForm.get('password')?.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.otpMessage = '';

    this.authApi.requestLoginOtp({
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.otpStep = true;
          this.challengeId = response.challengeId;
          this.otpMessage = response.message || `OTP sent to ${response.maskedEmail || this.loginForm.get('email')?.value}.`;

          this.loginForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
          this.loginForm.get('otp')?.updateValueAndValidity();
        },
        error: (error) => {
          this.errorMessage = this.resolveErrorMessage(error, 'Unable to send OTP. Please check credentials.');
        }
      });
  }

  verifyOtp(): void {
    if (!this.challengeId) {
      this.errorMessage = 'OTP session expired. Please try again.';
      this.resetOtpFlow();
      return;
    }

    if (this.loginForm.get('otp')?.invalid) {
      this.loginForm.get('otp')?.markAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authApi.verifyLoginOtp({
      challengeId: this.challengeId,
      otp: this.loginForm.get('otp')?.value
    })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.authSession.setSession(response.token, response.user?.id ?? null);

          this.router.navigateByUrl(this.returnUrl || '/browse');
        },
        error: (error) => {
          this.errorMessage = this.resolveErrorMessage(error, 'Invalid OTP');
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

  resendOtp(): void {
    if (!this.challengeId) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authApi.resendOtp(this.challengeId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.otpMessage = response.message || `A new OTP was sent to ${response.maskedEmail || this.loginForm.get('email')?.value}.`;
        },
        error: (error) => {
          this.errorMessage = this.resolveErrorMessage(error, 'Unable to resend OTP right now.');
        }
      });
  }

  resetOtpFlow(): void {
    this.otpStep = false;
    this.challengeId = null;
    this.otpMessage = '';
    this.errorMessage = '';
    this.loginForm.get('otp')?.reset('');
    this.loginForm.get('otp')?.clearValidators();
    this.loginForm.get('otp')?.updateValueAndValidity();
  }
}