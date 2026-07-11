import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environment/env';
import { BookListing } from '../models/book.model';
import { ListingResponse, PageResponse, PageResult, mapListingApiToUi } from './listings-api.service';

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

export interface ReviewApi {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

export interface CreateSellerReviewRequest {
  rating: number;
  comment: string;
}

export interface SellerReviewPage {
  content: ReviewApi[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
  isFirst: boolean;
  isLast: boolean;
}

function mapPageResponse<T>(page: PageResponse<T>): PageResult<T> {
  return {
    content: page.content,
    totalPages: page.totalPages,
    totalElements: page.totalElements,
    page: page.number,
    size: page.size,
    isFirst: page.first,
    isLast: page.last
  };
}

@Injectable({ providedIn: 'root' })
export class SellersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/sellers`;
  private readonly reviewsBaseUrl = `${environment.apiBaseUrl}/api/reviews/sellers`;

  getSellerById(id: string): Observable<SellerApi> {
    return this.http.get<SellerApi>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  getSellerListings(id: string, page = 0, size = 12): Observable<PageResult<BookListing>> {
    return this.http
      .get<PageResponse<ListingResponse>>(`${this.baseUrl}/${encodeURIComponent(id)}/listings`, {
        params: { page: `${page}`, size: `${size}` }
      })
      .pipe(
        map((response) => {
          const mapped = mapPageResponse(response);
          return {
            ...mapped,
            content: mapped.content.map((listing) => mapListingApiToUi(listing))
          };
        })
      );
  }

  getSellerReviews(id: string, page = 0, size = 10): Observable<SellerReviewPage> {
    return this.http
      .get<PageResponse<ReviewApi>>(`${this.reviewsBaseUrl}/${encodeURIComponent(id)}`, {
        params: { page: `${page}`, size: `${size}` }
      })
      .pipe(
        map((response) => {
          const mapped = mapPageResponse(response);
          return {
            ...mapped,
            content: mapped.content
          };
        })
      );
  }

  createSellerReview(id: string, payload: CreateSellerReviewRequest): Observable<ReviewApi> {
    return this.http.post<ReviewApi>(`${this.reviewsBaseUrl}/${encodeURIComponent(id)}`, payload);
  }
}