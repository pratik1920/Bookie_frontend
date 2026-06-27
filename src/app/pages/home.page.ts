import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BookCardComponent } from '../components/book-card.component';
import { BOOK_LISTINGS, SUBJECTS } from '../data/book-listings.data';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, BookCardComponent],
  template: `
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-800 px-6 py-16 text-white shadow-xl sm:px-10 lg:px-14">
      <div class="absolute -left-14 top-8 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>
      <div class="absolute -right-12 bottom-8 h-48 w-48 rounded-full bg-indigo-400/40 blur-3xl"></div>
      <div class="relative max-w-3xl">
        <span class="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur">Built for students, by students</span>
        <h1 class="mt-5 text-5xl font-extrabold leading-tight sm:text-6xl">Buy & Sell Textbooks for Less</h1>
        <p class="mt-5 max-w-2xl text-xl text-blue-100">Save up to 80% on textbooks, notes, and study guides. Connect directly with students at your university.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/browse" class="rounded-xl bg-white px-5 py-3 text-base font-bold text-blue-700 transition hover:bg-blue-50">Browse All Books</a>
          <a routerLink="/sell" class="rounded-xl border border-white/60 px-5 py-3 text-base font-bold text-white transition hover:bg-white/10">Start Selling</a>
        </div>
      </div>
    </section>

    <section class="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
      @for (stat of stats; track stat.label) {
        <article class="rounded-xl border border-slate-100 p-4 text-center dark:border-slate-800">
          <p class="text-4xl font-black text-slate-950 dark:text-slate-100">{{ stat.value }}</p>
          <p class="text-base text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
        </article>
      }
    </section>

    <section class="mt-14">
      <div class="mb-6 flex items-end justify-between">
        <div>
          <h2 class="text-4xl font-extrabold text-slate-950 dark:text-slate-100">Browse by Subject</h2>
          <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Find materials for your courses</p>
        </div>
        <a routerLink="/browse" class="text-lg font-bold text-blue-600 hover:text-blue-500">View All -></a>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (subject of subjectCards; track subject.label) {
          <a routerLink="/browse" class="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ subject.label }}</h3>
            <p class="text-lg text-slate-500 dark:text-slate-400">{{ subject.count }} items</p>
          </a>
        }
      </div>
    </section>

    <section class="mt-14">
      <div class="mb-6 flex items-end justify-between">
        <div>
          <h2 class="text-4xl font-extrabold text-slate-950 dark:text-slate-100">Recently Listed</h2>
          <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Fresh listings from your fellow students</p>
        </div>
        <a routerLink="/browse" class="text-lg font-bold text-blue-600 hover:text-blue-500">See All Books -></a>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        @for (book of newestBooks(); track book.id) {
          <app-book-card [book]="book" />
        }
      </div>

      <div class="mt-8 text-center">
        <a routerLink="/browse" class="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500">Browse All 8+ Listings</a>
      </div>
    </section>

    <section class="mt-16 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-center text-4xl font-extrabold text-slate-950 dark:text-slate-100">How It Works</h2>
      <div class="mt-8 grid gap-6 md:grid-cols-3">
        @for (step of steps; track step.title) {
          <article class="text-center">
            <span [class]="step.numberClass">{{ step.number }}</span>
            <h3 class="mt-4 text-3xl font-bold text-slate-950 dark:text-slate-100">{{ step.title }}</h3>
            <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">{{ step.description }}</p>
          </article>
        }
      </div>
    </section>

    <section class="mt-14 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-center text-4xl font-extrabold text-slate-950 dark:text-slate-100">Safe & Trusted</h2>
      <p class="mt-2 text-center text-xl text-slate-500 dark:text-slate-400">We take your safety seriously</p>
      <div class="mt-8 grid gap-5 md:grid-cols-3">
        @for (item of trustCards; track item.title) {
          <article class="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <h3 class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ item.title }}</h3>
            <p class="mt-1 text-lg text-slate-500 dark:text-slate-400">{{ item.description }}</p>
          </article>
        }
      </div>
    </section>

    <section class="mt-14 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-14 text-center text-white shadow-xl">
      <h2 class="text-5xl font-extrabold">Have books to sell?</h2>
      <p class="mx-auto mt-4 max-w-3xl text-2xl text-blue-100">List your textbooks and notes in under 2 minutes and start earning from materials you no longer need.</p>
      <a routerLink="/sell" class="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-xl font-bold text-blue-700 transition hover:bg-blue-50">List Your First Book</a>
    </section>
  `
})
export class HomePageComponent {
  readonly stats = [
    { value: '2,500+', label: 'Books Listed' },
    { value: '1,200+', label: 'Active Students' },
    { value: '$450', label: 'Avg. Savings' },
    { value: '4.8', label: 'Avg. Rating' }
  ] as const;

  readonly subjectCards = SUBJECTS.map((label, index) => ({
    label,
    count: [312, 248, 540, 189, 201, 178][index]
  }));

  readonly newestBooks = computed(() =>
    [...BOOK_LISTINGS]
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
      .slice(0, 4)
  );

  readonly steps = [
    {
      number: 1,
      numberClass: 'inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-black text-white shadow-lg shadow-blue-600/30',
      title: 'Browse & Search',
      description: 'Find textbooks and notes from students at your university using powerful filters.'
    },
    {
      number: 2,
      numberClass: 'inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-black text-white shadow-lg shadow-indigo-600/30',
      title: 'Connect & Purchase',
      description: 'Message sellers, negotiate prices, and arrange safe campus pickup or delivery.'
    },
    {
      number: 3,
      numberClass: 'inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-3xl font-black text-white shadow-lg shadow-purple-600/30',
      title: 'Save Money',
      description: 'Get the materials you need at a fraction of retail price and help other students too.'
    }
  ] as const;

  readonly trustCards = [
    { title: 'Verified Students', description: 'All sellers verify with a .edu email address' },
    { title: 'Seller Ratings', description: 'Transparent reviews from real buyers' },
    { title: 'Safe Meetups', description: 'Campus exchange guidelines & recommended spots' }
  ] as const;
}
