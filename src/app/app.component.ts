import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './services/data.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Jokes';
  joke = '';
  image = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchData('joke');
    this.fetchData('image');
  }

  fetchData(dataType: string): void {
    this.dataService.getData().subscribe((data: any) => {
      console.log('data is ', data);
      const isJoke = data.joke;
      if (isJoke) {
        this.joke = data.joke;
      } else {
        this.image = data.message;
      }
      console.log(this.joke);
    });
  }

  // Given an array of URLs and a MAX_CONCURRENCY integer, implement a function that will asynchronously
  // fetch each URL, not requesting more than MAX_CONCURRENCY URLs at the same time. The URLs should be
  // fetched as soon as possible. The function should return an array of responses for each URL.
  // How would you write a test for such a function?

  //  fetchAllUrls(){
  //   const arrayOfUrls = [
  //     'https://jsonplaceholder.typicode.com/posts/1',
  //     'https://jsonplaceholder.typicode.com/posts/2'
  //   ];
  //   const MAX_CONCURRENCY = 3;

  //   const fetchedUrl = await fetch(arrayOfUrls[0]);

  //   return fetchedUrl;
  //  }
}
