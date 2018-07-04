import { TestBed, inject } from '@angular/core/testing';

import { SpotifyPlaybackSdkService } from './spotify-playback-sdk.service';

describe('SpotifyPlaybackSdkService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpotifyPlaybackSdkService]
    });
  });

  it('should be created', inject([SpotifyPlaybackSdkService], (service: SpotifyPlaybackSdkService) => {
    expect(service).toBeTruthy();
  }));
});
