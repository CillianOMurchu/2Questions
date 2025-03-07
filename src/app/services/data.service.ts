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
  ): Observable<{ url: string; response: any }[]> {
    const results: { url: string; response: any }[] = [];

    return from(urls).pipe(
      mergeMap(
        (url) =>
          this.http.get(url).pipe(
            map((response) => {
              console.log(`Fetched URL: ${url}`); // Log each fetched URL
              results.push({ url, response });
              return { url, response };
            }),
            catchError((error) => {
              console.error(`Error fetching URL: ${url}`, error);
              results.push({ url, response: error });
              return of({ url, response: error });
            })
          ),
        maxConcurrency // Limit concurrency to maxConcurrency
      ),
      // Return all results once all requests have been processed
      map(() => results)
    );
  }
}
