import { Playlist } from './playlist';

export class UserInfo {
  Id: number;
  UserName: string;
  IsAuthenticated: boolean;
  MaxDiscSpace: number;
  UsedDiscSpace : number;
  FileAmount : number;
  TrackCount : number;
  SpotifyTrackCount : number;
  YoutubeTrackCount : number;
  Mp3TrackCount : number;
  PlaylistCount : number;
  FirstName : string;
  LastName : string;
}