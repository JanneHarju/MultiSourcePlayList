using System.Collections.Generic;
using System.Linq;
using PlayList.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace PlayList.Repositories
{
    public class MultiSourcePlaylistRepository : IMultiSourcePlaylistRepository
    {
        private readonly MultiSourcePlaylistContext _context;
        private readonly ILogger _logger;
        public MultiSourcePlaylistRepository(MultiSourcePlaylistContext context, ILoggerFactory loggerFactory)
        {
            _context = context;
            _logger = loggerFactory.CreateLogger("IMultiSourcePlaylistRepository");          
        }
        public void DeleteTrack(long id)
        {
            var entity = _context.Tracks.First(t => t.id == id);
            _context.Tracks.Remove(entity);
            _context.SaveChanges();
        }

        public void DeleteTracksByPlaylistId(long id)
        {
            _context.Tracks.RemoveRange(_context.Tracks.Where(track=>track.playlist.id==id));
            _context.SaveChanges();
        }
        public void DeletePlaylist(long id)
        {
            var entity = _context.Playlists.First(t => t.id == id);
            _context.Playlists.Remove(entity);
            _context.SaveChanges();
        }

        public Track GetTrack(long id)
        {
            return _context.Tracks.First(x=>x.id == id);
        }

        public List<Track> GetAllTracks()
        {
            _logger.LogCritical("Getting a the existing records");
            return _context.Tracks
                .Include(y=>y.playlist)
                .ToList();
        }
        public List<Track> GetTracks(long playlistId)
        {
            _logger.LogCritical("Getting a the existing record" + playlistId);
            return _context.Tracks
                .Include(y=>y.playlist)
                .Where(x=>x.playlist.id == playlistId)
                .OrderBy(x=>x.order)
                .ToList();
        }

        public Playlist GetPlaylist(long id)
        {
            return _context.Playlists.First(x=>x.id == id);
        }
        public List<Playlist> GetAllPlaylists()
        {
            _logger.LogCritical("Getting a the existing records");
            return _context.Playlists
            .OrderBy(x=>x.order)
            .ToList();
        }
        public void PostTrack(Track track)
        {
            
            _context.Tracks.Add(track);
            _context.SaveChanges();
        }

        public Playlist AttachPlaylist(long playlist)
        {
            Playlist myPlaylist = new Playlist { id = playlist };
            _context.Playlists.Attach(myPlaylist);
            return myPlaylist;
        }
        public void PutTrack(long id, [FromBody] Track track)
        {
            Playlist myPlaylist = new Playlist { id = track.playlist.id };
            _context.Playlists.Attach(myPlaylist);
            track.playlist = myPlaylist;
            _context.Tracks.Update(track);
            _context.SaveChanges();
        }
        public void PostPlaylist(Playlist playlist)
        {
            _context.Playlists.Add(playlist);
            _context.SaveChanges();
        }
        public void PutPlaylist(long id, [FromBody] Playlist playlist)
        {
            _context.Playlists.Update(playlist);
            _context.SaveChanges();
        }
    }
}