import { SpotifyArtist } from './spotifyartist';
import { SpotifyAlbum } from './spotifyalbum';

export class SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
}
