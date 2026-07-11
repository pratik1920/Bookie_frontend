import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';
import { SellerApi } from './listings-api.service';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  university?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: SellerApi;
}

export interface OtpChallengeResponse {
  challengeId: string;
  maskedEmail?: string;
  message?: string;
}

export interface VerifyOtpRequest {
  challengeId: string;
  otp: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/auth`;

  requestRegisterOtp(payload: RegisterRequest): Observable<OtpChallengeResponse> {
    return this.http.post<OtpChallengeResponse>(`${this.baseUrl}/register/request-otp`, payload);
  }

  verifyRegisterOtp(payload: VerifyOtpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register/verify-otp`, payload);
  }

  requestLoginOtp(payload: LoginRequest): Observable<OtpChallengeResponse> {
    return this.http.post<OtpChallengeResponse>(`${this.baseUrl}/login/request-otp`, payload);
  }

  verifyLoginOtp(payload: VerifyOtpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login/verify-otp`, payload);
  }

  resendOtp(challengeId: string): Observable<OtpChallengeResponse> {
    return this.http.post<OtpChallengeResponse>(`${this.baseUrl}/otp/resend`, { challengeId });
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload);
  }
}
