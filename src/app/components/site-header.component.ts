import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthSessionService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  styles: [
    `
      .logo-mark {
        animation: logo-enter 420ms ease-out both;
      }

      .logo-word {
        animation: logo-word-enter 520ms ease-out both;
      }

      .logo-link:hover .logo-mark,
      .logo-link:focus-visible .logo-mark {
        animation: logo-wiggle 700ms ease-in-out;
      }

      @keyframes logo-enter {
        0% {
          opacity: 0;
          transform: translateY(-6px) scale(0.92);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes logo-word-enter {
        0% {
          opacity: 0;
          transform: translateX(-8px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes logo-wiggle {
        0%,
        100% {
          transform: rotate(0deg) scale(1);
        }
        25% {
          transform: rotate(-6deg) scale(1.04);
        }
        75% {
          transform: rotate(6deg) scale(1.04);
        }
      }
    `
  ],
  template: `
    <header
      class="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80"
    >
      <div class="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <a [routerLink]="isAuthenticated() ? '/home' : '/login'" class="logo-link flex items-center gap-3">
            <span
              class="logo-mark grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            >
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" aria-hidden="true">
                <path
                  d="M4 6.5C4 5.12 5.12 4 6.5 4H11V19H6.5A2.5 2.5 0 0 0 4 21V6.5ZM20 6.5C20 5.12 18.88 4 17.5 4H13V19H17.5A2.5 2.5 0 0 1 20 21V6.5Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
              </svg>
            </span>
            <span class="logo-word text-2xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100">BookSwap</span>
          </a>

          @if (isAuthenticated()) {
          <div class="hidden flex-1 px-6 md:block">
            <label class="relative block">
              <span class="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-slate-400">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
                  <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search books, notes, subjects"
                class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
              />
            </label>
          </div>

          <nav class="hidden items-center gap-2 md:flex">
            <a
              routerLink="/browse"
              routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >Browse</a
            >
            <a
              routerLink="/my-listings"
              routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >My Listings</a
            >
            <a
              routerLink="/cart"
              routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >Cart ({{ cart.totalItems() }})</a
            >
            <a
              routerLink="/sell"
              class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
              >Sell Book</a
            >
            <a
              routerLink="/profile/me"
              class="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-label="Profile"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8" />
                <path d="M4 20C4 16.69 7.13 14 11 14H13C16.87 14 20 16.69 20 20" stroke="currentColor" stroke-width="1.8" />
              </svg>
            </a>
            <button
              type="button"
              (click)="theme.toggleTheme()"
              class="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              [attr.aria-label]="theme.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              @if (theme.isDarkMode()) {
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M12 3V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M12 19V21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M1 12H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M21 12H23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />
                </svg>
              } @else {
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3C11.13 3.33 11.09 3.66 11.09 4A8 8 0 0 0 20 12C20.34 12 20.67 11.96 21 11.88V12.79Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
              }
            </button>
            <button
              type="button"
              (click)="logout()"
              class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          </nav>

          <button
            type="button"
            (click)="mobileOpen.update((value) => !value)"
            class="ml-auto rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden dark:border-slate-700 dark:text-slate-100"
            aria-label="Toggle mobile menu"
          >
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" aria-hidden="true">
              <path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M4 12H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M4 17H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
          }
        </div>

        @if (isAuthenticated()) {
        <div class="pt-3 md:hidden">
          <label class="relative block">
            <span class="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-slate-400">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search books, notes, subjects"
              class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
            />
          </label>
        </div>

        @if (mobileOpen()) {
          <div class="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:hidden">
            <nav class="grid gap-2">
              <a routerLink="/browse" (click)="mobileOpen.set(false)" class="rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">Browse</a>
              <a routerLink="/my-listings" (click)="mobileOpen.set(false)" class="rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">My Listings</a>
              <a routerLink="/cart" (click)="mobileOpen.set(false)" class="rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">Cart ({{ cart.totalItems() }})</a>
              <a routerLink="/sell" (click)="mobileOpen.set(false)" class="rounded-xl bg-blue-600 px-3 py-2 text-center font-semibold text-white">Sell Book</a>
              <a routerLink="/profile/me" (click)="mobileOpen.set(false)" class="rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">Profile</a>
              <button
                type="button"
                (click)="theme.toggleTheme()"
                class="rounded-xl border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100"
              >
                {{ theme.isDarkMode() ? 'Use Light Mode' : 'Use Dark Mode' }}
              </button>
              <button
                type="button"
                (click)="logout()"
                class="rounded-xl border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100"
              >
                Logout
              </button>
            </nav>
          </div>
        }
        }
      </div>
    </header>
  `
})
export class SiteHeaderComponent {
  readonly mobileOpen = signal(false);
  readonly cart = inject(CartService);
  readonly isAuthenticated = inject(AuthSessionService).isAuthenticated;
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  constructor(readonly theme: ThemeService) {}

  logout(): void {
    this.authSession.clearSession();
    this.mobileOpen.set(false);
    this.router.navigate(['/login']);
  }
}
