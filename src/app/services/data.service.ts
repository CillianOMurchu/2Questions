import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

const urls = [
  'https://jsonplaceholder.typicode.com/todos/1',
  'https://api.github.com/zen',
  'https://dog.ceo/api/breeds/image/random',
  'https://httpbin.org/delay/1',
  'https://httpbin.org/delay/2',
  'https://httpbin.org/status/404',
  'https://httpbin.org/status/500',
  'https://jsonplaceholder.typicode.com/posts/1',
];

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  fetchWithConcurrency(urls: string[], maxConcurrency: number) {
    let results: any[] = [];
    let currentIndex = 0;

    const fetchBatch = async () => {
      const activePromises: Promise<any>[] = [];
      while (currentIndex < urls.length || activePromises.length > 0) {
        if (activePromises.length <= maxConcurrency) {
          const url = urls[currentIndex];
          activePromises.push(
            firstValueFrom(this.fetchUrl(url))
              .then((response) => {
                console.log('successful response is ', response);
                results.push(response);
              })
              .catch((error) => {
                console.log('errror is ', error);
                results.push(error);
              })
          );
        }
      }

      const settledPromise = await Promise.race(activePromises);
      const index = activePromises.findIndex((p) => p === settledPromise);
      if (index !== -1) {
        activePromises.splice(index, 1);
      }
    };

    return fetchBatch().then(() => results);
  }

  fetchUrl(url: string): Observable<any> {
    return this.http.get(url, { headers: { Accept: 'application/json' } });
  }
}
