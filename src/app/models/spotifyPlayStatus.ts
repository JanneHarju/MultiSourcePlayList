import { SpotifyPlayStatusItem } from './spotifyPlayStatusItem';

export class SpotifyPlayStatus {
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyPlayStatusItem;
}
