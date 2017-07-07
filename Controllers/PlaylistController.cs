
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using PlayList.Repositories;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;

namespace PlayList.Controllers
{
    [Produces("application/json")]
    [Route("api/playlists")]
    public class PlaylistController : Controller
    {
        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _environment;
        public PlaylistController(
            IHostingEnvironment environment,
            IMultiSourcePlaylistRepository multiSourcePlaylistRepository
            ,ILoggerFactory loggerFactory)
         : base()
        {
            _environment = environment;
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _logger = loggerFactory.CreateLogger("PlaylistController");  
        }
        // GET api/values
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        [Authorize("Bearer")]
        public List<Playlist> Get()
        {
            return _multiSourcePlaylistRepository.GetAllPlaylists();
        }
        // GET api/values/5
        [HttpGet("{id}")]
        [Authorize("Bearer")]
        public Playlist Get(int id)
        {
            return _multiSourcePlaylistRepository.GetPlaylist(id);
        }
        // GET api/values/5

        [HttpGet("GetUsersPlaylists")]
        [Authorize("Bearer")]
        public List<Playlist> GetUsersPlaylists()
        {
            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            _logger.LogCritical("UserId"+userId.ToString());
            var usersPlaylists = _multiSourcePlaylistRepository.GetUsersPlaylists(userId);
            usersPlaylists.ForEach(x=>x.Owner=null);
            return usersPlaylists;
        }
        // PUT api/values/5
        [HttpPut("{id}")]
        [Authorize("Bearer")]
        public void Put(int id, [FromBody]Playlist value)
        {
            _multiSourcePlaylistRepository.PutPlaylist(id,value);
        }

        [HttpPut("Shuffle/{id}")]
        [Authorize("Bearer")]
        public void Shuffle(int id)
        {
            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            var values = _multiSourcePlaylistRepository.GetUsersPlaylistTracks(id,userId);
            var random = new Random();
            if(values != null && values.Any())
            {
                values.ForEach(track => 
                {
                    track.Order = random.Next( values.Count*2);
                });
                var orderedList = values.OrderBy(x=>x.Order);
                long playlistId = values[0].Playlist.Id;
                int order = 0;
                foreach(Track track in orderedList)
                {
                    track.Order = order;
                    _multiSourcePlaylistRepository.PutTrack(track.Id,track);
                    ++order;
                }
            }
        }
        // POST api/values
        [HttpPost]
        [Authorize("Bearer")]
        public Playlist Post([FromBody]Playlist value)
        {
            var allPlaylists = _multiSourcePlaylistRepository.GetAllPlaylists();
            
            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            var user = _multiSourcePlaylistRepository.GetUser(userId);
            value.Owner = user;
            int lastOrder = 0;
            var lastPlaylist = allPlaylists.OrderByDescending(x => x.Order).FirstOrDefault();
            if(lastPlaylist != null)
            {
                lastOrder = lastPlaylist.Order +1;
            }
            value.Order = lastOrder;
            _multiSourcePlaylistRepository.PostPlaylist(value);
            return value;
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        [Authorize("Bearer")]
        public void Delete(int id)
        {

            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            var user = _multiSourcePlaylistRepository.GetUser(userId);
            var tracks = _multiSourcePlaylistRepository.GetUsersPlaylistTracks(id,userId);
            var mp3type = 3;
            foreach (var track in tracks)
            {
                if(track.Type == mp3type)
                {
                    var address = track.Address;
                    _multiSourcePlaylistRepository.DeleteTrack(track.Id);
                
                    if(!_multiSourcePlaylistRepository.GetTracksByTypeAndAddress(mp3type,address,userId).Any())
                    {
                        var filePath = Path.Combine(
                            _environment.ContentRootPath,
                            "uploads",
                            user.FileFolder,
                            address);
                        
                        _logger.LogCritical(filePath);
                        System.IO.File.Delete(filePath);
                    }
                }
            }
            
            _multiSourcePlaylistRepository.DeletePlaylist(id);
        }
    }
}
