import { SpotifyArtist } from './spotifyartist';
import { SpotifyAlbum } from './spotifyalbum';

export class SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  track_number: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
}
