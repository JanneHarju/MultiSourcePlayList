import { SpotifyTrack } from './spotifytrack';
export class SpotifyAlbumTracks {
  offset: number;
  next: string;
  previous: string;
  limit: number;
  total: number;
  items: SpotifyTrack[];
}
