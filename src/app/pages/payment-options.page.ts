import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { CartService } from '../services/cart.service';
import { CheckoutPaymentMethod, CheckoutService } from '../services/checkout.service';

type PaymentMethod = CheckoutPaymentMethod;

@Component({
  selector: 'app-payment-options-page',
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe],
  template: `
    <section>
      <a routerLink="/cart" class="inline-flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-500">&larr; Back to Cart</a>
      <h1 class="mt-3 text-5xl font-extrabold text-slate-950 dark:text-slate-100">Payment Options</h1>
      <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Secure checkout with server-side validation.</p>
      <p class="mt-2 inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-300">
        {{ checkout.isBackendEnabled ? 'Backend Checkout Mode' : 'Frontend Demo Mode' }}
      </p>

      @if (cartItems().length === 0) {
        <article class="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100">No items for checkout</h2>
          <p class="mt-2 text-lg text-slate-500 dark:text-slate-400">Add books to cart before selecting payment options.</p>
          <a routerLink="/browse" class="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Browse Books</a>
        </article>
      } @else {
        <div class="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <form [formGroup]="paymentForm" class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" (ngSubmit)="placeOrder()">
            <section>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Choose payment method</h2>
              <div class="mt-3 grid gap-3 sm:grid-cols-3">
                @for (method of paymentMethods; track method.value) {
                  <label [class]="methodCardClass(paymentForm.controls.method.value === method.value)" class="cursor-pointer">
                    <input type="radio" class="sr-only" [value]="method.value" formControlName="method" />
                    <p class="font-bold">{{ method.label }}</p>
                    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ method.help }}</p>
                  </label>
                }
              </div>
            </section>

            @if (paymentForm.controls.method.value === 'CARD') {
              <section class="grid gap-4 sm:grid-cols-2">
                <label class="grid gap-2 sm:col-span-2">
                  <span class="font-semibold text-slate-700 dark:text-slate-200">Card Holder Name</span>
                  <input formControlName="cardHolder" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <label class="grid gap-2">
                  <span class="font-semibold text-slate-700 dark:text-slate-200">Card Number</span>
                  <input formControlName="cardNumber" placeholder="1234 5678 9012 3456" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <label class="grid gap-2">
                  <span class="font-semibold text-slate-700 dark:text-slate-200">CVV</span>
                  <input formControlName="cvv" placeholder="123" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
                </label>
              </section>
            }

            @if (paymentForm.controls.method.value === 'UPI') {
              <section>
                <label class="grid gap-2">
                  <span class="font-semibold text-slate-700 dark:text-slate-200">UPI ID</span>
                  <input formControlName="upiId" placeholder="name@bank" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
                </label>
              </section>
            }

            <button
              type="submit"
              [disabled]="paymentForm.invalid || isSubmitting()"
              class="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isSubmitting() ? 'Processing Payment...' : 'Confirm Payment' }}
            </button>

            @if (errorMessage(); as message) {
              <p class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {{ message }}
              </p>
            }

            @if (successMessage(); as message) {
              <p class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                {{ message }}
              </p>
            }
          </form>

          <aside class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-28">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Payment Summary</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Seller: {{ sellerName() }}</p>

            <div class="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
              <div class="flex items-center justify-between">
                <span>Items</span>
                <span class="font-semibold">{{ totalItems() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Total amount</span>
                <span class="font-semibold">{{ subtotal() | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              </div>
            </div>
          </aside>
        </div>
      }
    </section>
  `
})
export class PaymentOptionsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  readonly checkout = inject(CheckoutService);

  readonly cartItems = this.cart.items;
  readonly totalItems = this.cart.totalItems;
  readonly subtotal = this.cart.subtotal;
  readonly sellerName = computed(() => this.cart.sellerName() ?? 'N/A');
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly paymentMethods: Array<{ value: PaymentMethod; label: string; help: string }> = [
    { value: 'CARD', label: 'Card', help: 'Debit or credit card' },
    { value: 'UPI', label: 'UPI', help: 'UPI app payment' },
    { value: 'CASH', label: 'Cash', help: 'Pay at meetup' }
  ];

  readonly paymentForm = this.fb.nonNullable.group({
    method: this.fb.nonNullable.control<PaymentMethod>('CARD', Validators.required),
    cardHolder: this.fb.nonNullable.control(''),
    cardNumber: this.fb.nonNullable.control(''),
    cvv: this.fb.nonNullable.control(''),
    upiId: this.fb.nonNullable.control('')
  });

  constructor() {
    this.paymentForm.controls.method.valueChanges.subscribe((method) => {
      this.syncValidators(method);
    });
    this.syncValidators(this.paymentForm.controls.method.value);
  }

  methodCardClass(selected: boolean): string {
    return selected
      ? 'rounded-xl border-2 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/40'
      : 'rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800';
  }

  placeOrder(): void {
    if (this.paymentForm.invalid || this.cartItems().length === 0) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.paymentForm.getRawValue();

    this.checkout
      .placeOrderForItems(this.cartItems(), {
        method: formValue.method,
        cardHolder: formValue.cardHolder,
        cardNumber: formValue.cardNumber,
        cvv: formValue.cvv,
        upiId: formValue.upiId
      })
      .pipe(
        switchMap((response) =>
          this.cart.clearCart().pipe(
            map(() => response)
          )
        ),
        catchError((error) => {
          this.errorMessage.set(this.resolveCheckoutErrorMessage(error));
          return of(null);
        }),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        this.successMessage.set(`Order ${response.orderId} confirmed. ${response.message}`);

        setTimeout(() => {
          this.router.navigate(['/browse']);
        }, 1200);
      });
  }

  private syncValidators(method: PaymentMethod): void {
    const cardHolderControl = this.paymentForm.controls.cardHolder;
    const cardNumberControl = this.paymentForm.controls.cardNumber;
    const cvvControl = this.paymentForm.controls.cvv;
    const upiIdControl = this.paymentForm.controls.upiId;

    cardHolderControl.clearValidators();
    cardNumberControl.clearValidators();
    cvvControl.clearValidators();
    upiIdControl.clearValidators();

    if (method === 'CARD') {
      cardHolderControl.setValidators([Validators.required, Validators.minLength(2)]);
      cardNumberControl.setValidators([Validators.required, Validators.pattern(/^\d{12,19}$/)]);
      cvvControl.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    }

    if (method === 'UPI') {
      upiIdControl.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/)]);
    }

    cardHolderControl.updateValueAndValidity({ emitEvent: false });
    cardNumberControl.updateValueAndValidity({ emitEvent: false });
    cvvControl.updateValueAndValidity({ emitEvent: false });
    upiIdControl.updateValueAndValidity({ emitEvent: false });
  }

  private resolveCheckoutErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const code = (error.error?.code ?? '').toString();

      if (code === 'CHECKOUT_CART_MISMATCH') {
        return 'Your cart changed. Please review cart and try again.';
      }
      if (code === 'CHECKOUT_PRICE_CHANGED') {
        return 'Price changed for one or more items. Please review cart.';
      }
      if (code === 'CHECKOUT_EMPTY_CART') {
        return 'Your cart is empty. Add items before checkout.';
      }
      if (code === 'PAYMENT_VALIDATION_FAILED') {
        return 'Payment details are invalid. Please verify and retry.';
      }
    }

    return 'Unable to process payment right now. Please try again.';
  }
}
