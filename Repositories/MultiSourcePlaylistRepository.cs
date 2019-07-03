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
            var entity = _context.Tracks.First(t => t.Id == id);
            _context.Tracks.Remove(entity);
            _context.SaveChanges();
        }

        public void DeleteTracksByPlaylistId(long id)
        {
            _context.Tracks.RemoveRange(_context.Tracks.Where(track=>track.Playlist.Id==id));
            _context.SaveChanges();
        }
        public void DeletePlaylist(long id)
        {
            var entity = _context.Playlists.First(t => t.Id == id);
            _context.Playlists.Remove(entity);
            _context.SaveChanges();
        }

        public void DeleteUser(long id)
        {
            var entity = _context.Users.First(t => t.Id == id);
            _context.Users.Remove(entity);
            _context.SaveChanges();
        }
        public Track GetTrack(long id)
        {
            return _context.Tracks.First(x=>x.Id == id);
        }

        public User GetTrackOwner(long id)
        {
            return _context.Tracks
                .Include(t=>t.Playlist)
                .ThenInclude(p=>p.Owner)
                .Where(tr=>tr.Id == id).Select(t=>t.Playlist.Owner).FirstOrDefault();
        }

        public List<Track> GetTracksByTypeAndAddress(int type, string address, long owner)
        {
            return _context.Tracks
                .Include(t=>t.Playlist)
                .ThenInclude(p=>p.Owner)
                .Where(tr=>tr.Type == type && tr.Address == address && tr.Playlist.Owner.Id == owner).ToList();
        }
        public List<Track> GetAllTracks()
        {
            _logger.LogCritical("Getting a the existing records");
            return _context.Tracks
                .Include(y=>y.Playlist)
                .ToList();
        }
        public List<Track> SearchTracks(string query, long userId)
        {
            var queryParameters = query.Split(' ');
            _logger.LogWarning(queryParameters.ToString());
            return _context.Tracks
                .Include( t => t.Playlist)
                .ThenInclude( t => t.Owner)
                .Where( t =>
                    queryParameters.All( q => t.Name.ToLower().Contains(q.ToLower()))
                    && (t.Type == 3 || t.Type == 5)
                    && t.Playlist.Owner.Id == userId
                    )
                .ToList();
        }
        //public List<Track> GetUsersPlaylistTracks(long playlistId, long userId)
        public List<Track> GetUsersPlaylistTracks(long playlistId, long userId)
        {
            _logger.LogCritical("Getting a the existing record" + playlistId);
            return _context.Tracks
                .Include(y=>y.Playlist)
                .ThenInclude(t=>t.Owner)
                .Where(x=>x.Playlist.Id == playlistId && x.Playlist.Owner.Id == userId)
                .OrderBy(x=>x.Order)
                .ToList();
        }

        public long GetUsersPlaylistCount(long userId)
        {
            return _context.Playlists
                .Include(p=>p.Owner)
                .Where(x=>x.Owner.Id == userId)
                .Count();
        }
        public long GetUsersTrackCountByType(long userId, int type)
        {
            return _context.Tracks
                .Include(y=>y.Playlist)
                .ThenInclude(t=>t.Owner)
                .Where(x=> x.Playlist.Owner.Id == userId && x.Type == type).Count();
        }
        public long GetUsersTrackCount(long userId)
        {
            return _context.Tracks
                .Include(y=>y.Playlist)
                .ThenInclude(t=>t.Owner)
                .Where(x=> x.Playlist.Owner.Id == userId).Count();
        }
        public Playlist GetPlaylist(long id)
        {
            return _context.Playlists.First(x=>x.Id == id);
        }
        public List<Playlist> GetAllPlaylists()
        {
            _logger.LogCritical("Getting a the existing records");
            return _context.Playlists
                .OrderBy(x=>x.Order)
                .ToList();
        }

        public List<Playlist> GetUsersPlaylists(long userId)
        {
            return _context.Playlists
                .Include(x=>x.Owner)
                .Where(x=>x.Owner.Id == userId)
                .OrderBy(x=>x.Order)
                .ToList();
        }
        public User GetUser(long id)
        {
            return _context.Users
                .First(x=>x.Id == id);
        }

        public List<User> GetAllUsers()
        {
            return _context.Users
                .ToList();
        }
        public void PostTrack(Track track)
        {
            
            _context.Tracks.Add(track);
            _context.SaveChanges();
        }

        public void PostManyTracks(List<Track> tracks)
        {
            _context.Tracks.AddRange(tracks);
            _context.SaveChanges();
        }
        public void PostPlaylist(Playlist playlist)
        {
            _context.Playlists.Add(playlist);
            _context.SaveChanges();
        }

        public void PostUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }
        public Playlist AttachPlaylist(long playlist)
        {
            Playlist myPlaylist = new Playlist { Id = playlist };
            _context.Playlists.Attach(myPlaylist);
            return myPlaylist;
        }
        public void PutTrack(long id, [FromBody] Track track)
        {
            
            _context.Tracks.Update(track);
            _context.SaveChanges();
        }

        public void PutManyTracks(long id, List<Track> tracks)
        {
            _context.Tracks.UpdateRange(tracks);
            _context.SaveChanges();
        }
        public void PutPlaylist(long id, [FromBody] Playlist playlist)
        {
            _context.Playlists.Update(playlist);
            _context.SaveChanges();
        }

        public void PutUser(long id, [FromBody] User user)
        {
            _context.Users.Update(user);
            _context.SaveChanges();
        }
    }
}