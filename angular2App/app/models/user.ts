import { Playlist } from './playlist';

export class User {
  Id: number;
  Username: string;
  Password: string;
  Fname: string;
  Lname: string;
  playlists: Playlist[];
}