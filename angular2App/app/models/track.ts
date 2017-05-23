import { Playlist } from './playlist';

export class Track {
  id: number;
  playlist: Playlist;
  address: string;
  order: number;
  type: number;
  name: string;
}
