import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environment/env';
import { BookCondition, BookListing, BookType, Seller } from '../models/book.model';
import { expand, reduce } from 'rxjs';

export type ListingTypeApi = 'TEXTBOOK' | 'NOTES' | 'STUDY_GUIDE';
export type ListingConditionApi = 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'ACCEPTABLE';
export type ListingStatusApi = 'ACTIVE' | 'SOLD' | 'DRAFT';
export type ListingSortApi = 'NEWEST_FIRST' | 'PRICE_LOW_HIGH' | 'PRICE_HIGH_LOW' | 'BEST_SAVINGS';

export interface SellerApi {
  id: string;
  name: string;
  initials: string;
  university: string;
  rating: number;
  totalSales: number;
  responseTime: string;
  responseRate: string;
  memberSince: string;
}

export interface CreateListingRequest {
  title: string;
  author: string;
  subject: string;
  type: ListingTypeApi;
  condition: ListingConditionApi;
  description: string;
  price: number;
  originalPrice: number;
  edition: string;
  isbn: string;
  imageUrl: string;
}

export interface ListingResponse {
  id: string;
  title: string;
  author: string;
  subject: string;
  type: ListingTypeApi;
  condition: ListingConditionApi;
  description: string;
  price: number;
  originalPrice: number;
  savingsPercent: number;
  edition: string;
  isbn: string;
  imageUrl: string;
  postedDate: string;
  status: ListingStatusApi;
  viewCount: number;
  seller: SellerApi;
}

export interface PageResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ListingQueryParams {
  search?: string;
  subject?: string;
  condition?: ListingConditionApi;
  type?: ListingTypeApi;
  status?: ListingStatusApi;
  sortBy?: ListingSortApi;
  page?: number;
  size?: number;
}

export interface UpdateListingRequest extends CreateListingRequest {}

export interface PageResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
  isFirst: boolean;
  isLast: boolean;
}

export function mapApiTypeToUi(type: ListingTypeApi): BookType {
  if (type === 'NOTES') {
    return 'Notes';
  }
  if (type === 'STUDY_GUIDE') {
    return 'Study Guide';
  }
  return 'Textbook';
}

export function mapApiConditionToUi(condition: ListingConditionApi): BookCondition {
  if (condition === 'LIKE_NEW') {
    return 'Like New';
  }
  if (condition === 'FAIR') {
    return 'Fair';
  }
  if (condition === 'ACCEPTABLE') {
    return 'Acceptable';
  }
  return 'Good';
}

export function mapSellerApiToUi(seller: SellerApi): Seller {
  return {
    id: seller.id,
    name: seller.name,
    initials: seller.initials,
    university: seller.university,
    rating: seller.rating,
    totalSales: seller.totalSales,
    responseTime: seller.responseTime,
    responseRate: seller.responseRate,
    memberSince: seller.memberSince
  };
}

export function mapListingApiToUi(listing: ListingResponse): BookListing {
  return {
    id: listing.id,
    title: listing.title,
    author: listing.author,
    subject: listing.subject,
    type: mapApiTypeToUi(listing.type),
    condition: mapApiConditionToUi(listing.condition),
    description: listing.description,
    price: listing.price,
    originalPrice: listing.originalPrice,
    edition: listing.edition,
    isbn: listing.isbn,
    imageUrl: listing.imageUrl,
    postedDate: listing.postedDate,
    savingsPercent: listing.savingsPercent,
    status: listing.status,
    viewCount: listing.viewCount,
    seller: mapSellerApiToUi(listing.seller)
  };
}

function mapPageResponse<TIn, TOut>(page: PageResponse<TIn>, mapper: (value: TIn) => TOut): PageResult<TOut> {
  return {
    content: page.content.map(mapper),
    totalPages: page.totalPages,
    totalElements: page.totalElements,
    page: page.number,
    size: page.size,
    isFirst: page.first,
    isLast: page.last
  };
}

@Injectable({ providedIn: 'root' })
export class ListingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/listings`;

  getListings(params: ListingQueryParams = {}): Observable<PageResult<BookListing>> {
    return this.http
      .get<PageResponse<ListingResponse>>(this.baseUrl, {
        params: {
          ...(params.search ? { search: params.search } : {}),
          ...(params.subject ? { subject: params.subject } : {}),
          ...(params.condition ? { condition: params.condition } : {}),
          ...(params.type ? { type: params.type } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(params.sortBy ? { sortBy: params.sortBy } : {}),
          page: `${params.page ?? 0}`,
          size: `${params.size ?? 12}`
        }
      })
      .pipe(map((page) => mapPageResponse(page, mapListingApiToUi)));
  }

  getListingById(id: string): Observable<BookListing> {
    return this.http
      .get<ListingResponse>(`${this.baseUrl}/${encodeURIComponent(id)}`)
      .pipe(map((listing) => mapListingApiToUi(listing)));
  }

  createListing(payload: CreateListingRequest): Observable<BookListing> {
    return this.http
      .post<ListingResponse>(this.baseUrl, payload)
      .pipe(map((listing) => mapListingApiToUi(listing)));
  }

  updateListing(id: string, payload: UpdateListingRequest): Observable<BookListing> {
    return this.http
      .put<ListingResponse>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload)
      .pipe(map((listing) => mapListingApiToUi(listing)));
  }

  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  updateStatus(id: string, status: ListingStatusApi): Observable<BookListing> {
    return this.http
      .patch<ListingResponse>(`${this.baseUrl}/${encodeURIComponent(id)}/status`, null, {
        params: { status }
      })
      .pipe(map((listing) => mapListingApiToUi(listing)));
  }

  getMyListings(): Observable<Record<ListingStatusApi, BookListing[]>> {
    return this.http
      .get<Partial<Record<ListingStatusApi, ListingResponse[]>>>(`${this.baseUrl}/my`)
      .pipe(
        map((response) => ({
          ACTIVE: (response.ACTIVE ?? []).map((listing) => ({ ...mapListingApiToUi(listing), status: 'ACTIVE' })),
          SOLD: (response.SOLD ?? []).map((listing) => ({ ...mapListingApiToUi(listing), status: 'SOLD' })),
          DRAFT: (response.DRAFT ?? []).map((listing) => ({ ...mapListingApiToUi(listing), status: 'DRAFT' }))
        }))
      );
  }

  getAvailableSubjects(status: ListingStatusApi = 'ACTIVE'): Observable<string[]> {
    const pageSize = 100;

    return this.getListings({
      status,
      page: 0,
      size: pageSize
    }).pipe(
      expand((page) =>
        page.isLast
          ? EMPTY
          : this.getListings({
              status,
              page: page.page + 1,
              size: pageSize
            })
      ),
      map((page) => page.content.map((listing) => listing.subject.trim()).filter((subject) => subject.length > 0)),
      reduce((subjectSet, pageSubjects) => {
        for (const subject of pageSubjects) {
          subjectSet.add(subject);
        }
        return subjectSet;
      }, new Set<string>()),
      map((subjectSet) => [...subjectSet].sort((a, b) => a.localeCompare(b)))
    );
  }
}