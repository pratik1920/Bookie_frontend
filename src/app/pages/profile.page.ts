import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { BookCardComponent } from '../components/book-card.component';
import { BookListing } from '../models/book.model';
import { AuthSessionService } from '../services/auth.service';
import { CreateSellerReviewRequest, ReviewApi, SellerApi, SellersApiService } from '../services/sellers-api.service';

type ProfileTab = 'Listings' | 'Reviews';

@Component({
  selector: 'app-profile-page',
  imports: [BookCardComponent, ReactiveFormsModule],
  template: `
    @if (!resolvedSellerId()) {
      <section class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile unavailable</h1>
        <p class="mt-2 text-lg text-slate-500 dark:text-slate-400">Log in to view your seller profile.</p>
      </section>
    } @else if (seller(); as profile) {
      <section>
        <article class="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <span class="grid h-20 w-20 place-items-center rounded-2xl bg-blue-600 text-3xl font-black text-white">{{ profile.initials }}</span>
              <div>
                <h1 class="text-4xl font-extrabold text-slate-950 dark:text-slate-100">{{ profile.name }}</h1>
                <p class="text-lg text-slate-500 dark:text-slate-400">{{ profile.university }}</p>
                <p class="text-sm text-slate-400 dark:text-slate-500">Member since {{ profile.memberSince }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="logout()"
              class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            @for (stat of stats(profile); track stat.label) {
              <div [class]="stat.disabled ? 'rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 opacity-75 dark:border-slate-700 dark:bg-slate-900' : 'rounded-xl bg-slate-100 p-4 dark:bg-slate-800'">
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
                <p [class]="stat.disabled ? 'text-sm font-semibold text-slate-700 dark:text-slate-200' : 'text-2xl font-black text-slate-900 dark:text-slate-100'">{{ stat.value }}</p>
              </div>
            }
          </div>

          @if (canRateSeller()) {
            <div class="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700">
              <button
                type="button"
                (click)="showReviewForm.update((value) => !value)"
                class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
              >
                {{ showReviewForm() ? 'Cancel Rating' : 'Rate Seller' }}
              </button>

              @if (showReviewForm()) {
                <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <label class="grid gap-1">
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">Rating</span>
                    <select formControlName="rating" class="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
                      <option [ngValue]="5">5 - Excellent</option>
                      <option [ngValue]="4">4 - Good</option>
                      <option [ngValue]="3">3 - Average</option>
                      <option [ngValue]="2">2 - Poor</option>
                      <option [ngValue]="1">1 - Bad</option>
                    </select>
                  </label>

                  <label class="grid gap-1">
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">Comment</span>
                    <textarea formControlName="comment" rows="3" placeholder="Share your experience with this seller" class="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"></textarea>
                  </label>

                  @if (reviewError(); as reviewErrorMessage) {
                    <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                      {{ reviewErrorMessage }}
                    </p>
                  }

                  @if (reviewSuccess(); as reviewSuccessMessage) {
                    <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {{ reviewSuccessMessage }}
                    </p>
                  }

                  <button
                    type="submit"
                    [disabled]="isSubmittingReview() || reviewForm.invalid"
                    class="justify-self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {{ isSubmittingReview() ? 'Submitting...' : 'Submit Rating' }}
                  </button>
                </form>
              }
            </div>
          }
        </article>

        <div class="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          @for (tab of tabs; track tab) {
            <button type="button" (click)="activeTab.set(tab)" [class]="activeTab() === tab ? activeTabClass : inactiveTabClass">
              {{ tab }}
            </button>
          }
        </div>

        @if (activeTab() === 'Listings') {
          <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            @for (book of sellerBooks(); track book.id) {
              <app-book-card [book]="book" />
            }
          </div>
        } @else {
          <div class="mt-6 space-y-4">
            @for (review of reviews(); track review.id) {
              <article class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center justify-between">
                  <p class="font-bold text-slate-900 dark:text-slate-100">{{ review.reviewerName }}</p>
                  <p class="font-semibold text-amber-500">{{ review.rating }}</p>
                </div>
                <p class="mt-2 text-slate-600 dark:text-slate-300">{{ review.comment }}</p>
              </article>
            }
          </div>
        }
      </section>
    } @else {
      <section class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Unable to load profile</h1>
        <p class="mt-2 text-lg text-slate-500 dark:text-slate-400">We could not fetch your seller data right now.</p>
      </section>
    }
  `
})
export class ProfilePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authSession = inject(AuthSessionService);
  private readonly sellersApi = inject(SellersApiService);

  readonly tabs: ProfileTab[] = ['Listings', 'Reviews'];
  readonly activeTab = signal<ProfileTab>('Listings');
  readonly refreshKey = signal(0);
  readonly showReviewForm = signal(false);
  readonly isSubmittingReview = signal(false);
  readonly reviewError = signal<string | null>(null);
  readonly reviewSuccess = signal<string | null>(null);

  readonly reviewForm = this.fb.nonNullable.group({
    rating: this.fb.nonNullable.control(5, [Validators.min(1), Validators.max(5)]),
    comment: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5), Validators.maxLength(500)])
  });

  readonly routeId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? 'me')), {
    initialValue: 'me'
  });

  readonly resolvedSellerId = computed(() => {
    const requestedId = this.routeId();
    const loggedInId = this.authSession.sellerId();

    if (requestedId === 'me') {
      return loggedInId;
    }

    if (!requestedId) {
      return null;
    }

    return requestedId;
  });

  readonly canRateSeller = computed(() => {
    const viewedSellerId = this.resolvedSellerId();
    const loggedInSellerId = this.authSession.sellerId();

    if (!viewedSellerId || !loggedInSellerId) {
      return false;
    }

    return viewedSellerId !== loggedInSellerId;
  });

  readonly seller = toSignal(
    toObservable(
      computed(() => ({
        sellerId: this.resolvedSellerId(),
        refresh: this.refreshKey()
      }))
    ).pipe(
      switchMap(({ sellerId }) => {
        if (!sellerId) {
          return of(null);
        }

        return this.sellersApi.getSellerById(sellerId).pipe(catchError(() => of(null)));
      })
    ),
    { initialValue: null }
  );

  readonly sellerBooks = toSignal(
    toObservable(
      computed(() => ({
        sellerId: this.resolvedSellerId(),
        refresh: this.refreshKey()
      }))
    ).pipe(
      switchMap(({ sellerId }) => {
        if (!sellerId) {
          return of([] as BookListing[]);
        }

        return this.sellersApi
          .getSellerListings(sellerId, 0, 12)
          .pipe(map((page) => page.content), catchError(() => of([] as BookListing[])));
      })
    ),
    { initialValue: [] as BookListing[] }
  );

  readonly reviews = toSignal(
    toObservable(
      computed(() => ({
        sellerId: this.resolvedSellerId(),
        refresh: this.refreshKey()
      }))
    ).pipe(
      switchMap(({ sellerId }) => {
        if (!sellerId) {
          return of([] as ReviewApi[]);
        }

        return this.sellersApi
          .getSellerReviews(sellerId, 0, 10)
          .pipe(map((page) => page.content), catchError(() => of([] as ReviewApi[])));
      })
    ),
    { initialValue: [] as ReviewApi[] }
  );

  readonly activeTabClass = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white';
  readonly inactiveTabClass =
    'rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

  stats(seller: SellerApi): Array<{ label: string; value: string | number; disabled?: boolean }> {
    return [
      { label: 'Rating', value: `★ ${seller.rating}` },
      { label: 'Books Sold', value: seller.totalSales },
      { label: 'Response Time', value: 'Will be coming soon', disabled: true },
      { label: 'Response Rate', value: 'Will be coming soon', disabled: true }
    ];
  }

  logout(): void {
    this.authSession.clearSession();
    this.router.navigate(['/login']);
  }

  submitReview(): void {
    if (!this.canRateSeller()) {
      this.reviewError.set('You cannot rate yourself.');
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const sellerId = this.resolvedSellerId();
    if (!sellerId) {
      this.reviewError.set('Seller not found.');
      return;
    }

    this.reviewError.set(null);
    this.reviewSuccess.set(null);
    this.isSubmittingReview.set(true);

    const formValue = this.reviewForm.getRawValue();
    const payload: CreateSellerReviewRequest = {
      rating: formValue.rating,
      comment: formValue.comment.trim()
    };

    this.sellersApi
      .createSellerReview(sellerId, payload)
      .pipe(finalize(() => this.isSubmittingReview.set(false)))
      .subscribe({
        next: () => {
          this.reviewSuccess.set('Thanks! Your rating has been submitted.');
          this.reviewForm.reset({ rating: 5, comment: '' });
          this.activeTab.set('Reviews');
          this.showReviewForm.set(false);
          this.refreshKey.update((value) => value + 1);
        },
        error: (error: { error?: { message?: string; code?: string } }) => {
          if (error?.error?.code === 'SELF_REVIEW_NOT_ALLOWED') {
            this.reviewError.set('You cannot rate yourself.');
            return;
          }
          this.reviewError.set(error?.error?.message ?? 'Unable to submit rating right now.');
        }
      });
  }
}