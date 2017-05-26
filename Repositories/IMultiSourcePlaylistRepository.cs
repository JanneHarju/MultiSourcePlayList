using System.Collections.Generic;
using PlayList.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace PlayList.Repositories
{
    public interface IMultiSourcePlaylistRepository
    {
        void DeleteTrack(long id);
        void DeleteTracksByPlaylistId(long id);
        void DeletePlaylist(long id);
        void DeleteUser(long id);
        Track GetTrack(long id);
        List<Track> GetAllTracks();
        List<Track> GetTracks(long playlistId);
        List<Playlist> GetAllPlaylists();
        Playlist GetPlaylist(long id);
        User GetUser(long id);
        List<User> GetAllUsers();
        void PostTrack(Track track);
        void PostPlaylist(Playlist playlist);
        void PostUser(User user);
        Playlist AttachPlaylist(long id);
        void PutTrack(long id, [FromBody] Track track);
        void PutPlaylist(long id, [FromBody] Playlist playlist);
        void PutUser(long id, [FromBody] User user);
    }
}