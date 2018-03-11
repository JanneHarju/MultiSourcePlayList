import { SpotifyImage } from './spotifyimage';
export class SpotifyArtist {
  id: string;
  uri: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
}
