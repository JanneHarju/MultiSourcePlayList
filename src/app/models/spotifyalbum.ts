import { SpotifyArtist } from './spotifyartist';
import { SpotifyAlbumTracks } from './spotifyalbumtrack';
import { SpotifyImage } from './spotifyimage';

export class SpotifyAlbum {
  id: string;
  uri: string;
  name: string;
  release_date: string;
  artists: SpotifyArtist[];
  tracks: SpotifyAlbumTracks;
  images: SpotifyImage[];
}
