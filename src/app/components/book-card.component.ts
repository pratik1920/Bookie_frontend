import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BookCondition, BookListing } from '../models/book.model';

@Component({
  selector: 'app-book-card',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <article
      class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <a [routerLink]="['/book', book().id]" class="block">
        <div class="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            [src]="book().imageUrl"
            [alt]="book().title"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span class="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800">{{ book().type }}</span>
          <span class="absolute right-3 top-3 rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white">-{{ discountPercent() }}%</span>
        </div>

        <div class="space-y-3 p-4">
          <h3 class="line-clamp-2 text-xl font-bold text-slate-900 dark:text-slate-100">{{ book().title }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ book().author }}</p>

          <div class="flex items-center gap-2">
            <span [class]="conditionClasses()">{{ book().condition }}</span>
            <span class="text-sm text-slate-500 dark:text-slate-400">{{ book().subject }}</span>
          </div>

          <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span class="font-semibold text-amber-500">★ {{ book().seller.rating }}</span>
            <span>•</span>
            <span class="truncate">{{ book().seller.university }}</span>
          </div>

          <div class="flex items-end justify-between">
            <div class="flex items-end gap-2">
              <span class="text-3xl font-black text-slate-950 dark:text-slate-100">{{ book().price | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              <span class="pb-1 text-sm text-slate-400 line-through dark:text-slate-500">{{ book().originalPrice | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
            </div>
            <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Save {{ saveAmount() | currency: 'USD' : 'symbol' : '1.0-0' }}
            </span>
          </div>
        </div>
      </a>
    </article>
  `
})
export class BookCardComponent {
  readonly book = input.required<BookListing>();

  readonly discountPercent = computed(() =>
    Math.round(((this.book().originalPrice - this.book().price) / this.book().originalPrice) * 100)
  );

  readonly saveAmount = computed(() => this.book().originalPrice - this.book().price);

  readonly conditionClasses = computed(() => this.conditionClass(this.book().condition));

  private conditionClass(condition: BookCondition): string {
    const base = 'rounded-full px-2.5 py-1 text-xs font-semibold';
    if (condition === 'Like New') {
      return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300`;
    }
    if (condition === 'Good') {
      return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300`;
    }
    if (condition === 'Fair') {
      return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300`;
    }
    return `${base} bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300`;
  }
}
