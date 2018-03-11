import { Playlist } from './playlist';

export class Track {
  Id: number;
  Playlist: Playlist;
  Address: string;
  Order: number;
  Type: number;
  Name: string;
}
