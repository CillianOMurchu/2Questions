import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, from, map, mergeMap, Observable, of, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private activeControllers: Map<string, AbortController> = new Map(); // Track active controllers
  private isCancelled: boolean = false;

  constructor(private http: HttpClient) {}

  // Function that handles fetching URLs with a concurrency limit
  fetchWithConcurrency(
    urls: string[],
    maxConcurrency: number = 2,
    requestTimeout: number = 5000
  ): Observable<{ url: string; response: any }> {
    this.isCancelled = false; // Reset the cancellation flag
    return from(urls).pipe(
      mergeMap((url) => {
        if (this.isCancelled) {
          return of({ url, response: { isCancelled: true } }); // Prevent starting new requests
        }

        const controller = new AbortController(); // Create a new AbortController for each request
        this.activeControllers.set(url, controller); // Store the controller by the URL

        return this.http.get(url).pipe(
          timeout(requestTimeout),
          map((response) => {
            return { url, response }; // Immediately return the result for each URL
          }),
          catchError((error) => {
            return of({ url, response: error }); // Return the error response immediately
          })
        );
      }, maxConcurrency)
    );
  }

  cancelAllRequests() {
    this.isCancelled = true; // Set the cancellation flag to true
    this.activeControllers.forEach((controller, url) => {
      controller.abort(); // Abort the request using the controller
    });
    this.activeControllers.clear();
  }
}
