import { SpotifyArtist } from './spotifyartist';

export class SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: SpotifyArtist[];
}
