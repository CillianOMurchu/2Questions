import { Component } from '@angular/core';
import { DataService } from './services/data.service';
import { TEST_URLS } from './constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [CommonModule],
})
export class AppComponent {
  requestStatuses: { [url: string]: string } = {}; // Track status of each URL request
  progress: { [url: string]: number } = {}; // Track progress (0 to 100)
  completedRequests: number = 0;
  urls = TEST_URLS;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.fetchWithConcurrency(TEST_URLS, 3).subscribe({
      next: (response) => {
        const url = response.url;
        this.requestStatuses[url] = 'Completed'; // Mark the request as completed
        this.progress[url] = 100; // Set progress to 100% for completed requests
        this.completedRequests++; // Increment the completed requests counter
        console.log(`Request for ${url} completed.`);
      },
      complete: () => {
        console.log('All requests completed!');
      },
      error: (error) => {
        const { url } = error;
        this.requestStatuses[url] = 'Failed'; // Mark as failed if an error occurs
        this.progress[url] = 0; // Set progress to 0% for failed requests
        console.error(`Request for ${url} failed:`, error);
      },
    });
  }
}
