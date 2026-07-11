// import { Component, inject } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// import { BOOK_TYPES, SUBJECTS } from '../data/book-listings.data';
// import { BookCondition } from '../models/book.model';

// @Component({
//   selector: 'app-sell-page',
//   imports: [ReactiveFormsModule],
//   template: `
//     <section class="mx-auto max-w-4xl">
//       <h1 class="text-5xl font-extrabold text-slate-950 dark:text-slate-100">List a Book</h1>
//       <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Share your materials with students in just a few minutes.</p>

//       <form [formGroup]="sellForm" class="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" (ngSubmit)="submit()">
//         <section>
//           <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Book Type</h2>
//           <div class="mt-4 grid gap-3 sm:grid-cols-3">
//             @for (type of bookTypes; track type) {
//               <label [class]="typeCardClass(type)" class="cursor-pointer">
//                 <input type="radio" [value]="type" formControlName="type" class="sr-only" />
//                 <span class="text-lg font-semibold">{{ type }}</span>
//               </label>
//             }
//           </div>
//         </section>

//         <section class="grid gap-4 sm:grid-cols-2">
//           <label class="grid gap-2">
//             <span class="font-semibold text-slate-700 dark:text-slate-200">Title</span>
//             <input formControlName="title" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
//           </label>
//           <label class="grid gap-2">
//             <span class="font-semibold text-slate-700 dark:text-slate-200">Author</span>
//             <input formControlName="author" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
//           </label>

//           <label class="grid gap-2">
//             <span class="font-semibold text-slate-700 dark:text-slate-200">Subject</span>
//             <select formControlName="subject" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
//               @for (subject of subjects; track subject) {
//                 <option [value]="subject">{{ subject }}</option>
//               }
//             </select>
//           </label>
//           <label class="grid gap-2">
//             <span class="font-semibold text-slate-700 dark:text-slate-200">Condition</span>
//             <select formControlName="condition" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
//               @for (condition of conditions; track condition) {
//                 <option [value]="condition">{{ condition }}</option>
//               }
//             </select>
//           </label>
//         </section>

//         <section class="grid gap-4 sm:grid-cols-2">
//           <label class="grid gap-2">
//             <span class="font-semibold text-slate-700 dark:text-slate-200">Price ($)</span>
//             <input type="number" min="1" formControlName="price" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
//           </label>
//           <label class="grid gap-2">
//             <span class="font-semibold text-slate-700 dark:text-slate-200">Original Price ($)</span>
//             <input type="number" min="1" formControlName="originalPrice" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
//           </label>
//           <label class="grid gap-2">
//             <span class="font-semibold text-slate-700 dark:text-slate-200">Edition</span>
//             <input formControlName="edition" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
//           </label>
//           <label class="grid gap-2">
//             <span class="font-semibold text-slate-700 dark:text-slate-200">ISBN</span>
//             <input formControlName="isbn" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
//           </label>
//         </section>

//         <label class="grid gap-2">
//           <span class="font-semibold text-slate-700 dark:text-slate-200">Description</span>
//           <textarea formControlName="description" rows="4" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"></textarea>
//         </label>

//         <section class="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
//           <p class="text-4xl">📷</p>
//           <p class="mt-2 font-semibold text-slate-700 dark:text-slate-200">Drag and drop photos here</p>
//           <p class="text-sm text-slate-500 dark:text-slate-400">or click to upload (UI demo)</p>
//         </section>

//         <button
//           type="submit"
//           [disabled]="sellForm.invalid"
//           class="w-full rounded-xl bg-blue-600 px-5 py-3 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           List for Sale
//         </button>
//       </form>
//     </section>
//   `
// })
// export class SellPageComponent {
//   private readonly fb = inject(FormBuilder);

//   readonly bookTypes = BOOK_TYPES;
//   readonly subjects = SUBJECTS;
//   readonly conditions: BookCondition[] = ['Like New', 'Good', 'Fair', 'Acceptable'];

//   readonly sellForm = this.fb.nonNullable.group({
//     type: this.fb.nonNullable.control(BOOK_TYPES[0]),
//     title: this.fb.nonNullable.control('', Validators.required),
//     author: this.fb.nonNullable.control('', Validators.required),
//     subject: this.fb.nonNullable.control(SUBJECTS[0]),
//     condition: this.fb.nonNullable.control<BookCondition>('Good'),
//     price: this.fb.nonNullable.control(1, Validators.min(1)),
//     originalPrice: this.fb.nonNullable.control(1, Validators.min(1)),
//     edition: this.fb.nonNullable.control(''),
//     isbn: this.fb.nonNullable.control(''),
//     description: this.fb.nonNullable.control('', Validators.required)
//   });

//   typeCardClass(type: string): string {
//     const isSelected = this.sellForm.controls.type.value === type;
//     return isSelected
//       ? 'rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 text-blue-700 dark:bg-blue-950 dark:text-blue-200'
//       : 'rounded-2xl border border-slate-300 bg-white p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
//   }

//   submit(): void {
//     if (this.sellForm.invalid) {
//       this.sellForm.markAllAsTouched();
//     }
//   }
// }

import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';

import { BOOK_TYPES } from '../data/book-listings.data';
import { BookCondition } from '../models/book.model';
import { CreateListingRequest, ListingConditionApi, ListingsApiService, ListingTypeApi } from '../services/listings-api.service';

@Component({
  selector: 'app-sell-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="mx-auto max-w-4xl">
      <h1 class="text-5xl font-extrabold text-slate-950 dark:text-slate-100">List a Book</h1>
      <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Share your materials with students in just a few minutes.</p>

      <form [formGroup]="sellForm" class="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" (ngSubmit)="submit()">
        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Book Type</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-3">
            @for (type of bookTypes; track type) {
              <label [class]="typeCardClass(type)" class="cursor-pointer">
                <input type="radio" [value]="type" formControlName="type" class="sr-only" />
                <span class="text-lg font-semibold">{{ type }}</span>
              </label>
            }
          </div>
        </section>

        <section class="grid gap-4 sm:grid-cols-2">
          <label class="grid gap-2">
            <span class="font-semibold text-slate-700 dark:text-slate-200">Title</span>
            <input formControlName="title" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
          </label>
          <label class="grid gap-2">
            <span class="font-semibold text-slate-700 dark:text-slate-200">Author</span>
            <input formControlName="author" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
          </label>

          <label class="grid gap-2">
            <span class="font-semibold text-slate-700 dark:text-slate-200">Subject</span>
            <select formControlName="subject" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              @for (subject of subjectOptions(); track subject) {
                <option [value]="subject">{{ subject }}</option>
              }
              <option [value]="otherSubjectValue">Other (type manually)</option>
            </select>
            @if (isLoadingSubjects()) {
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading available subjects...</span>
            }
            @if (sellForm.controls.subject.value === otherSubjectValue) {
              <input
                formControlName="customSubject"
                placeholder="Enter your subject"
                class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
              />
            }
          </label>
          <label class="grid gap-2">
            <span class="font-semibold text-slate-700 dark:text-slate-200">Condition</span>
            <select formControlName="condition" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              @for (condition of conditions; track condition) {
                <option [value]="condition">{{ condition }}</option>
              }
            </select>
          </label>
        </section>

        <section class="grid gap-4 sm:grid-cols-2">
          <label class="grid gap-2">
            <span class="font-semibold text-slate-700 dark:text-slate-200">Price ($)</span>
            <input type="number" min="1" formControlName="price" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
          </label>
          <label class="grid gap-2">
            <span class="font-semibold text-slate-700 dark:text-slate-200">Original Price ($)</span>
            <input type="number" min="1" formControlName="originalPrice" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
          </label>
       
        </section>

        <label class="grid gap-2">
          <span class="font-semibold text-slate-700 dark:text-slate-200">Description</span>
          <textarea formControlName="description" rows="4" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"></textarea>
        </label>

        <label class="grid gap-2">
          <span class="font-semibold text-slate-700 dark:text-slate-200">Image URL</span>
          <input formControlName="imageUrl" class="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" />
        </label>

        <section class="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p class="text-4xl">📷</p>
          <p class="mt-2 font-semibold text-slate-700 dark:text-slate-200">Drag and drop photos here</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">or click to upload (UI demo)</p>
        </section>

        @if (submitError(); as errorMessage) {
          <p class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {{ errorMessage }}
          </p>
        }

        @if (submitSuccess(); as successMessage) {
          <p class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {{ successMessage }}
          </p>
        }

        <button
          type="submit"
          [disabled]="sellForm.invalid || isSubmitting()"
          class="w-full rounded-xl bg-blue-600 px-5 py-3 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting() ? 'Submitting...' : 'List for Sale' }}
        </button>
      </form>
    </section>
  `
})
export class SellPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly listingsApi = inject(ListingsApiService);

  readonly otherSubjectValue = '__OTHER_SUBJECT__';
  readonly bookTypes = BOOK_TYPES;
  readonly subjectOptions = signal<string[]>([]);
  readonly conditions: BookCondition[] = ['Like New', 'Good', 'Fair', 'Acceptable'];
  readonly isLoadingSubjects = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitSuccess = signal<string | null>(null);

  readonly sellForm = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control(BOOK_TYPES[0]),
    title: this.fb.nonNullable.control('', Validators.required),
    author: this.fb.nonNullable.control('', Validators.required),
    subject: this.fb.nonNullable.control('', Validators.required),
    customSubject: this.fb.nonNullable.control(''),
    condition: this.fb.nonNullable.control<BookCondition>('Good'),
    price: this.fb.nonNullable.control(1, Validators.min(1)),
    originalPrice: this.fb.nonNullable.control(1, Validators.min(1)),
    edition: this.fb.nonNullable.control(''),
    isbn: this.fb.nonNullable.control(''),
    imageUrl: this.fb.nonNullable.control(
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
      [Validators.required, Validators.pattern(/^https?:\/\/.+/)]
    ),
    description: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(10)])
  });

  constructor() {
    this.loadSubjectOptions();

    this.sellForm.controls.subject.valueChanges.pipe(takeUntilDestroyed()).subscribe((selectedSubject) => {
      this.syncCustomSubjectValidation(selectedSubject);
    });

    this.syncCustomSubjectValidation(this.sellForm.controls.subject.value);
  }

  typeCardClass(type: string): string {
    const isSelected = this.sellForm.controls.type.value === type;
    return isSelected
      ? 'rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 text-blue-700 dark:bg-blue-950 dark:text-blue-200'
      : 'rounded-2xl border border-slate-300 bg-white p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
  }

  submit(): void {
    if (this.sellForm.invalid) {
      this.sellForm.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.submitSuccess.set(null);
    this.isSubmitting.set(true);

    const formValue = this.sellForm.getRawValue();
    const subject = this.resolveSubjectValue(formValue.subject, formValue.customSubject);

    if (!subject) {
      this.isSubmitting.set(false);
      this.submitError.set('Please select a subject or enter one manually.');
      return;
    }

    const payload:CreateListingRequest = {
      title: formValue.title.trim(),
      author: formValue.author.trim(),
      subject,
      type: this.toApiType(formValue.type),
      condition: this.toApiCondition(formValue.condition),
      description: formValue.description.trim(),
      price: formValue.price,
      originalPrice: formValue.originalPrice,
      edition: formValue.edition.trim(),
      isbn: formValue.isbn.trim(),
      imageUrl: formValue.imageUrl.trim()
    };

    this.listingsApi
      .createListing(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (createdListing) => {
          this.submitSuccess.set(`Listing created successfully: ${createdListing.title}`);
          this.sellForm.reset({
            type: BOOK_TYPES[0],
            title: '',
            author: '',
            subject: this.subjectOptions()[0] ?? this.otherSubjectValue,
            customSubject: '',
            condition: 'Good',
            price: 1,
            originalPrice: 1,
            edition: '',
            isbn: '',
            imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
            description: ''
          });
        },
        error: () => {
          this.submitError.set('Unable to create listing right now. Please try again.');
        }
      });
  }

  private toApiType(type: string): ListingTypeApi {
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

  private loadSubjectOptions(): void {
    this.isLoadingSubjects.set(true);

    this.listingsApi
      .getAvailableSubjects('ACTIVE')
      .pipe(
        catchError(() => of([])),
        finalize(() => this.isLoadingSubjects.set(false)),
        takeUntilDestroyed()
      )
      .subscribe((subjects) => {
        this.subjectOptions.set(subjects);

        const selectedSubject = this.sellForm.controls.subject.value;
        if (subjects.length > 0 && (!selectedSubject || selectedSubject === this.otherSubjectValue)) {
          this.sellForm.controls.subject.setValue(subjects[0]);
          return;
        }

        if (!selectedSubject) {
          this.sellForm.controls.subject.setValue(this.otherSubjectValue);
        }
      });
  }

  private syncCustomSubjectValidation(selectedSubject: string): void {
    const customSubjectControl = this.sellForm.controls.customSubject;

    if (selectedSubject === this.otherSubjectValue) {
      customSubjectControl.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      customSubjectControl.setValue('');
      customSubjectControl.clearValidators();
    }

    customSubjectControl.updateValueAndValidity({ emitEvent: false });
  }

  private resolveSubjectValue(selectedSubject: string, customSubject: string): string {
    if (selectedSubject === this.otherSubjectValue) {
      return customSubject.trim();
    }

    return selectedSubject.trim();
  }
}