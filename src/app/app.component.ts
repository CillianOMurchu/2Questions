import { Component, signal } from '@angular/core';
import { DataService } from './services/data.service';
import { TEST_URLS } from './constants';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, interval, map, Subscription, timer } from 'rxjs';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';

interface RequestStatus {
  [url: string]: StatusType;
}

interface Progress {
  [url: string]: number;
}

type StatusType =
  | 'Pending'
  | 'Success'
  | 'Failed'
  | 'TimeoutError'
  | 'RequestCancelled';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatButtonModule,
    MatSliderModule,
    MatFormFieldModule,
  ],
})
export class AppComponent {
  requestStatuses: RequestStatus = {}; // Track status of each URL request
  private inputSubject = new BehaviorSubject<number>(0);
  licensePlate$ = this.inputSubject
    .asObservable()
    .pipe(map((n) => this.generateLicensePlate(n)));

  progress: Progress | null = null; // Track progress (0 to 100)
  completedRequests: number = 0;
  urls = TEST_URLS;
  maxConcurrency = 1;
  elapsedTime: number = 0; // Track elapsed time for all requests
  timerSubscription: Subscription | null = null; // To manage timer
  disableEverything = false;

  constructor(private dataService: DataService) {}

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const num = parseInt(value, 10);
    this.inputSubject.next(isNaN(num) || num < 0 ? 0 : num);
  }

  private generateLicensePlate(n: number): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let plate = '';

    for (let i = 0; i < 6; i++) {
      plate = chars[n % 36] + plate;
      n = Math.floor(n / 36);
    }

    return plate;
  }

  setMaxConcurrency(value: number) {
    this.maxConcurrency = value;
  }

  private startTimer() {
    // Increment time every second
    this.timerSubscription = interval(1000).subscribe(() => {
      this.elapsedTime++;
    });
  }

  private stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  get allCompleted() {
    console.log('this.urls.length; is ', this.urls.length);
    console.log('this.completedRequests; is ', this.completedRequests);
    return this.completedRequests === this.urls.length;
  }

  async stopFetching() {
    // reset all values
    // wait 5 seconds to all all fetches to complete
    this.disableEverything = true;
    this.dataService.cancelAllRequests();
    this.elapsedTime = 0;
    this.completedRequests = 0;
    this.stopTimer();
    await setTimeout(() => {
      this.disableEverything = false;
      this.requestStatuses = {};
      this.progress = {};
    }, 5000);
  }

  initiateRequests() {
    this.startTimer();
    this.dataService
      .fetchWithConcurrency(TEST_URLS, this.maxConcurrency)
      .subscribe({
        next: (response) => {
          this.handleResponse(response);
        },
        error: (error) => {
          this.handleError(error);
        },
        complete: () => {
          this.stopTimer();
        },
      });
  }

  private handleResponse(response: any) {
    const url = response.url;
    const isError = this.isRequestError(response);
    const isTimeout = response.response.name === 'TimeoutError';
    const isCancelled = response.response.isCancelled;
    if (isCancelled) {
      this.setRequestStatus(url, 'RequestCancelled', 0);
    } else if (isTimeout) {
      this.setRequestStatus(url, 'TimeoutError', 0);
    } else if (isError) {
      this.setRequestStatus(url, 'Failed', 0);
    } else {
      this.setRequestStatus(url, 'Success', 100);
    }
    this.completedRequests++;
  }

  private handleError(error: any) {
    const url = error.url || 'Unknown URL';
    this.setRequestStatus(url, 'Failed', 0);
  }

  private isRequestError(response: any): boolean {
    const result =
      !!response.response.error ||
      response.response.status === 500 ||
      response.response.status === 404;
    return result;
  }

  private setRequestStatus(
    url: string,
    status: StatusType,
    progressValue: number
  ) {
    if (!this.progress) {
      this.progress = {};
    }
    this.requestStatuses[url] = status;
    this.progress[url] = progressValue;
  }
}
