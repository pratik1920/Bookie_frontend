import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, finalize, map, of, switchMap } from 'rxjs';

import { BookCardComponent } from '../components/book-card.component';
import { BOOK_TYPES } from '../data/book-listings.data';
import { BookCondition, BookListing, BookType } from '../models/book.model';
import { ListingConditionApi, ListingSortApi, ListingTypeApi, ListingsApiService } from '../services/listings-api.service';

type SortOption = 'Newest First' | 'Price: Low to High' | 'Price: High to Low' | 'Best Savings';

@Component({
  selector: 'app-browse-page',
  imports: [BookCardComponent],
  styles: [`
    .loader-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      border: 1px solid rgba(147, 197, 253, 0.28);
      border-radius: 16px;
      background: linear-gradient(140deg, rgba(15, 23, 42, 0.12), rgba(59, 130, 246, 0.08));
      backdrop-filter: blur(14px) saturate(120%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 12px 30px rgba(15, 23, 42, 0.08);
      padding: 0.8rem 1rem;
      color: #dbeafe;
    }

    .loader-ring {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      border: 2px solid rgba(147, 197, 253, 0.24);
      border-top-color: rgba(96, 165, 250, 1);
      border-right-color: rgba(59, 130, 246, 0.9);
      background: radial-gradient(circle at 50% 50%, rgba(191, 219, 254, 0.42), rgba(191, 219, 254, 0));
      box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.08), 0 0 18px rgba(59, 130, 246, 0.28);
      animation: spin 0.85s linear infinite, pulseGlow 1.5s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
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
  `],
  template: `
    <section>
      <h1 class="text-5xl font-extrabold text-slate-950 dark:text-slate-100">Browse Books</h1>
      <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Find affordable textbooks, notes, and study guides.</p>

      <div class="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:flex-row">
        <label class="relative flex-1">
          <span class="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-slate-400">Search</span>
          <input
            type="search"
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
            placeholder="Search by title, author, subject"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-20 pr-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
          />
        </label>
        <select
          [value]="sortBy()"
          (change)="sortBy.set($any($event.target).value)"
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          @for (option of sortOptions; track option) {
            <option [value]="option">{{ option }}</option>
          }
        </select>
      </div>

      @if (activePills().length > 0) {
        <div class="mt-4 flex flex-wrap gap-2">
          @for (pill of activePills(); track pill.value + pill.group) {
            <button
              type="button"
              (click)="removeFilter(pill.group, pill.value)"
              class="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200"
            >
              {{ pill.value }} x
            </button>
          }
        </div>
      }

      <div class="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Filters</h3>

          <div class="mt-5 space-y-6">
            <section>
              <h4 class="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Subject</h4>
              <div class="grid gap-2">
                @for (subject of subjects(); track subject) {
                  <button type="button" (click)="toggleSubject(subject)" [class]="filterButtonClass(selectedSubjects().includes(subject))">{{ subject }}</button>
                }
              </div>
            </section>

            <section>
              <h4 class="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Condition</h4>
              <div class="grid gap-2">
                @for (condition of conditions; track condition) {
                  <button type="button" (click)="toggleCondition(condition)" [class]="filterButtonClass(selectedConditions().includes(condition))">{{ condition }}</button>
                }
              </div>
            </section>

            <section>
              <h4 class="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</h4>
              <div class="grid gap-2">
                @for (type of types; track type) {
                  <button type="button" (click)="toggleType(type)" [class]="filterButtonClass(selectedTypes().includes(type))">{{ type }}</button>
                }
              </div>
            </section>
          </div>

          @if (activeFilterCount() > 0) {
            <button
              type="button"
              (click)="clearAllFilters()"
              class="mt-6 rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Clear All Filters
            </button>
          }
        </aside>

        <section>
          @if (isLoading()) {
            <div class="mb-4">
              <div class="loader-chip text-sm font-semibold">
                <span class="loader-ring"></span>
                <span>Loading listings...</span>
              </div>
            </div>
          }

          @if (loadError(); as errorMessage) {
            <div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {{ errorMessage }}
            </div>
          }

          @if (filteredListings().length === 0) {
            <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <h2 class="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">No listings found</h2>
              <p class="mt-2 text-lg text-slate-500 dark:text-slate-400">Try adjusting your search or clearing active filters.</p>
              <button
                type="button"
                (click)="clearAllFilters()"
                class="mt-6 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
              >
                Clear Filters
              </button>
            </div>
          } @else {
            <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              @for (book of filteredListings(); track book.id) {
                <app-book-card [book]="book" />
              }
            </div>
          }
        </section>
      </div>
    </section>
  `
})
export class BrowsePageComponent {
  private readonly listingsApi = inject(ListingsApiService);

  readonly subjects = signal<string[]>([]);
  readonly conditions: BookCondition[] = ['Like New', 'Good', 'Fair', 'Acceptable'];
  readonly types = [...BOOK_TYPES];
  readonly sortOptions: SortOption[] = ['Newest First', 'Price: Low to High', 'Price: High to Low', 'Best Savings'];

  readonly apiListings = signal<BookListing[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly sortBy = signal<SortOption>('Newest First');
  readonly selectedSubjects = signal<string[]>([]);
  readonly selectedConditions = signal<BookCondition[]>([]);
  readonly selectedTypes = signal<BookType[]>([]);

  readonly activeFilterCount = computed(
    () => this.selectedSubjects().length + this.selectedConditions().length + this.selectedTypes().length
  );

  readonly activePills = computed(() => [
    ...this.selectedSubjects().map((value) => ({ group: 'subject', value })),
    ...this.selectedConditions().map((value) => ({ group: 'condition', value })),
    ...this.selectedTypes().map((value) => ({ group: 'type', value }))
  ]);

  readonly filteredListings = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    let results = this.apiListings().filter((book) => {
      const byQuery =
        query.length === 0 ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.subject.toLowerCase().includes(query);
      const bySubject = this.selectedSubjects().length === 0 || this.selectedSubjects().includes(book.subject);
      const byCondition = this.selectedConditions().length === 0 || this.selectedConditions().includes(book.condition);
      const byType = this.selectedTypes().length === 0 || this.selectedTypes().includes(book.type);
      return byQuery && bySubject && byCondition && byType;
    });

    results = [...results].sort((a, b) => this.sortCompare(a, b, this.sortBy()));
    return results;
  });

  constructor() {
    this.loadAvailableSubjects();

    toObservable(
      computed(() => ({
        search: this.searchTerm(),
        sortBy: this.sortBy(),
        subjects: this.selectedSubjects(),
        conditions: this.selectedConditions(),
        types: this.selectedTypes()
      }))
    )
      .pipe(
        debounceTime(250),
        switchMap((filters) => {
          this.loadError.set(null);
          this.isLoading.set(true);

          return this.listingsApi
            .getListings({
              search: filters.search.trim() || undefined,
              sortBy: this.toApiSort(filters.sortBy),
              subject: filters.subjects.length === 1 ? filters.subjects[0] : undefined,
              condition: filters.conditions.length === 1 ? this.toApiCondition(filters.conditions[0]) : undefined,
              type: filters.types.length === 1 ? this.toApiType(filters.types[0]) : undefined,
              status: 'ACTIVE',
              page: 0,
              size: 100
            })
            .pipe(
              map((page) => page.content),
              catchError(() => {
                this.loadError.set('Could not load listings from API.');
                return of([]);
              }),
              finalize(() => this.isLoading.set(false))
            );
        }),
        takeUntilDestroyed()
      )
      .subscribe((listings) => {
        this.apiListings.set(listings);

        const knownSubjects = new Set(this.subjects());
        for (const listing of listings) {
          if (listing.subject.trim().length > 0) {
            knownSubjects.add(listing.subject.trim());
          }
        }
        this.subjects.set([...knownSubjects].sort((a, b) => a.localeCompare(b)));
      });
  }

  toggleSubject(subject: string): void {
    this.selectedSubjects.update((current) => this.toggleInArray(current, subject));
  }

  toggleCondition(condition: BookCondition): void {
    this.selectedConditions.update((current) => this.toggleInArray(current, condition));
  }

  toggleType(type: BookType): void {
    this.selectedTypes.update((current) => this.toggleInArray(current, type));
  }

  removeFilter(group: string, value: string): void {
    if (group === 'subject') {
      this.selectedSubjects.update((current) => current.filter((item) => item !== value));
    }
    if (group === 'condition') {
      this.selectedConditions.update((current) => current.filter((item) => item !== (value as BookCondition)));
    }
    if (group === 'type') {
      this.selectedTypes.update((current) => current.filter((item) => item !== (value as BookType)));
    }
  }

  clearAllFilters(): void {
    this.selectedSubjects.set([]);
    this.selectedConditions.set([]);
    this.selectedTypes.set([]);
    this.searchTerm.set('');
  }

  filterButtonClass(selected: boolean): string {
    const base = 'rounded-xl border px-3 py-2 text-left text-sm font-semibold transition';
    if (selected) {
      return `${base} border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-200`;
    }
    return `${base} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`;
  }

  private sortCompare(a: BookListing, b: BookListing, sortBy: SortOption): number {
    if (sortBy === 'Price: Low to High') {
      return a.price - b.price;
    }
    if (sortBy === 'Price: High to Low') {
      return b.price - a.price;
    }
    if (sortBy === 'Best Savings') {
      return b.originalPrice - b.price - (a.originalPrice - a.price);
    }
    return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
  }

  private toApiSort(sortBy: SortOption): ListingSortApi {
    if (sortBy === 'Price: Low to High') {
      return 'PRICE_LOW_HIGH';
    }
    if (sortBy === 'Price: High to Low') {
      return 'PRICE_HIGH_LOW';
    }
    if (sortBy === 'Best Savings') {
      return 'BEST_SAVINGS';
    }
    return 'NEWEST_FIRST';
  }

  private toApiType(type: BookType): ListingTypeApi {
    if (type === 'Notes') {
      return 'NOTES';
    }
    if (type === 'Study Guide') {
      return 'STUDY_GUIDE';
    }
    return 'TEXTBOOK';
  }

  private toApiCondition(condition: BookCondition): ListingConditionApi {
    if (condition === 'Like New') {
      return 'LIKE_NEW';
    }
    if (condition === 'Fair') {
      return 'FAIR';
    }
    if (condition === 'Acceptable') {
      return 'ACCEPTABLE';
    }
    return 'GOOD';
  }

  private toggleInArray<T>(values: T[], value: T): T[] {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  private loadAvailableSubjects(): void {
    this.listingsApi
      .getAvailableSubjects('ACTIVE')
      .pipe(
        catchError(() => of([])),
        takeUntilDestroyed()
      )
      .subscribe((subjects) => {
        this.subjects.set(subjects);
      });
  }
}
