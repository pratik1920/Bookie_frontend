import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, timeout } from 'rxjs';
import { AuthApiService } from '../services/auth-api.service';
import { AuthSessionService } from '../services/auth.service';
import { ListingsApiService } from '../services/listings-api.service';

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
              <h3>{{ activeListingsKpi }}</h3>
              <p>Active listings</p>
            </article>
            <article>
              <h3>{{ studentSellersKpi }}</h3>
              <p>Student sellers</p>
            </article>
            <article>
              <h3>{{ avgSellerRatingKpi }}</h3>
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
      overflow: clip;
      border-radius: 20px;
      background: linear-gradient(140deg, rgba(191, 219, 254, 0.24), rgba(224, 231, 255, 0.26));
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

    .kpis {
      margin-top: 1.1rem;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.62rem;
    }

    .kpis article {
      border-radius: 12px;
      background: rgba(239, 246, 255, 0.62);
      border: 1px solid rgba(147, 197, 253, 0.64);
      padding: 0.74rem;
      text-align: center;
      transition: transform 0.24s ease, box-shadow 0.24s ease;
    }

    .kpis article:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(30, 64, 175, 0.12);
    }

    .kpis h3 {
      margin: 0;
      color: #1e3a8a;
      font-size: 1rem;
      font-weight: 800;
    }

    .kpis p {
      margin: 0.2rem 0 0;
      color: #1e293b;
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
      transform: translateX(2px);
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

    @media (min-width: 980px) {
      .auth-shell {
        padding: 1.8rem;
      }

      .auth-grid {
        grid-template-columns: 1.1fr 1fr;
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

      .kpis {
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
export class LoginPage {

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  otpMessage = '';
  otpStep = false;
  challengeId: string | null = null;
  showPassword = false;
  activeListingsKpi = '0';
  studentSellersKpi = '0';
  avgSellerRatingKpi = '0.0/5';
  readonly returnUrl: string | null;

  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly listingsApi = inject(ListingsApiService);
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

    this.loadMarketplaceKpis();
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

          this.router.navigateByUrl(this.returnUrl || '/home');
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

  private loadMarketplaceKpis(): void {
    this.listingsApi
      .getListings({
        status: 'ACTIVE',
        sortBy: 'NEWEST_FIRST',
        page: 0,
        size: 500
      })
      .pipe(
        map((page) => {
          const sellerRatings = new Map<string, number>();
          for (const listing of page.content) {
            sellerRatings.set(listing.seller.id, listing.seller.rating);
          }

          const ratings = [...sellerRatings.values()];
          const averageRating = ratings.length === 0 ? 0 : ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

          return {
            activeListings: page.totalElements,
            studentSellers: sellerRatings.size,
            averageRating
          };
        }),
        catchError(() =>
          of({
            activeListings: 0,
            studentSellers: 0,
            averageRating: 0
          })
        )
      )
      .subscribe(({ activeListings, studentSellers, averageRating }) => {
        this.activeListingsKpi = this.formatCompactCount(activeListings);
        this.studentSellersKpi = this.formatCompactCount(studentSellers);
        this.avgSellerRatingKpi = `${averageRating.toFixed(1)}/5`;
      });
  }

  private formatCompactCount(value: number): string {
    if (value >= 1000) {
      const compact = (value / 1000).toFixed(1).replace(/\.0$/, '');
      return `${compact}k+`;
    }

    return `${value}`;
  }
}