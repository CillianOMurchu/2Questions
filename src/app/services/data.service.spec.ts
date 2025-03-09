import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DataService } from './data.service';
import { provideHttpClient } from '@angular/common/http';

describe('DataService', () => {
  let dataService: DataService;
  let httpTestingController: HttpTestingController;

  const mockUrls = ['https://jsonplaceholder.typicode.com/posts/1'];
  const mockResponses = [{ data: 'Response 1' }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DataService],
    });

    dataService = TestBed.inject(DataService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure no outstanding HTTP requests
  });

  it('should fetch a URL', async () => {
    // const result = await dataService.fetchWithConcurrency(mockUrls);
    // Assert the result length
    // expect(result.length).toBe(mockUrls.length);
  });
});
