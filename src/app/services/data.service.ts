import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, from, map, mergeMap, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  // Function that handles fetching URLs with a concurrency limit
  fetchWithConcurrency(
    urls: string[],
    maxConcurrency: number
  ): Observable<{ url: string; response: any }> {
    return from(urls).pipe(
      mergeMap(
        (url) =>
          this.http.get(url).pipe(
            map((response) => {
              console.log(`Fetched URL: ${url}`); // Log each fetched URL
              return { url, response }; // Immediately return the result for each URL
            }),
            catchError((error) => {
              console.error(`Error fetching URL: ${url}`, error);
              return of({ url, response: error }); // Return the error response immediately
            })
          ),
        maxConcurrency // Limit concurrency to maxConcurrency
      )
    );
  }
}
