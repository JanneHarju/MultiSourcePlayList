import { SpotifyPlaylistTrack } from './spotifyplaylisttrack';
export class SpotifyTracklist {
  offset: number;
  next: string;
  previous: string;
  limit: number;
  total: number;
  items: SpotifyPlaylistTrack[];
}
