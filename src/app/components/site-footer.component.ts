import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer class="border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/70">
      <div class="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div class="mb-3 flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M4 6.5C4 5.12 5.12 4 6.5 4H11V19H6.5A2.5 2.5 0 0 0 4 21V6.5ZM20 6.5C20 5.12 18.88 4 17.5 4H13V19H17.5A2.5 2.5 0 0 1 20 21V6.5Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
              </svg>
            </span>
            <h3 class="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">BookSwap</h3>
          </div>
          <p class="text-lg text-slate-600 dark:text-slate-300">
            The student marketplace for textbooks, notes & study guides. Save money, help others.
          </p>
        </div>

        <div>
          <h4 class="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-100">For Buyers</h4>
          <ul class="space-y-2 text-lg text-slate-600 dark:text-slate-300">
            <li><a routerLink="/browse" class="hover:text-blue-600">Browse Books</a></li>
            <li><a routerLink="/browse" class="hover:text-blue-600">Search by Subject</a></li>
            <li><a routerLink="/" class="hover:text-blue-600">Safe Meetups</a></li>
          </ul>
        </div>

        <div>
          <h4 class="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-100">For Sellers</h4>
          <ul class="space-y-2 text-lg text-slate-600 dark:text-slate-300">
            <li><a routerLink="/sell" class="hover:text-blue-600">List Your Books</a></li>
            <li><a routerLink="/sell" class="hover:text-blue-600">Set Your Price</a></li>
            <li><a routerLink="/my-listings" class="hover:text-blue-600">Track Sales</a></li>
          </ul>
        </div>

        <div>
          <h4 class="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-100">Support</h4>
          <ul class="space-y-2 text-lg text-slate-600 dark:text-slate-300">
            <li><a routerLink="/" class="hover:text-blue-600">Help Center</a></li>
            <li><a routerLink="/" class="hover:text-blue-600">Contact Us</a></li>
            <li><a routerLink="/" class="hover:text-blue-600">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-slate-200 px-4 py-6 text-center text-base text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © 2026 BookSwap. All rights reserved. Built for students, by students.
      </div>
    </footer>
  `
})
export class SiteFooterComponent {}
