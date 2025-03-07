import { Component } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatSlideToggleModule],
})
export class AppComponent {
  urls = [
    'https://jsonplaceholder.typicode.com/todos/1',
    'https://api.github.com/zen',
    'https://dog.ceo/api/breeds/image/random',
    'https://httpbin.org/delay/1',
    'https://httpbin.org/delay/2',
    'https://httpbin.org/status/404',
    'https://httpbin.org/status/500',
    'https://jsonplaceholder.typicode.com/posts/1',
  ];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    console.log('on init');
    this.dataService.fetchWithConcurrency(this.urls, 3).subscribe({
      next: (response) => {
        console.log('Fetched result:', response);
      },
      complete: () => {
        console.log('All requests completed!');
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
