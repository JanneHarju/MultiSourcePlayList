
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using PlayList.Repositories;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace PlayList.Controllers
{
    [Produces("application/json")]
    [Route("api/playlists")]
    public class PlaylistController : Controller
    {
        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly ILogger _logger;
        public PlaylistController(IMultiSourcePlaylistRepository multiSourcePlaylistRepository
            ,ILoggerFactory loggerFactory)
         : base()
        {
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _logger = loggerFactory.CreateLogger("PlaylistController");  
        }
        // GET api/values
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public List<Playlist> Get()
        {
            return _multiSourcePlaylistRepository.GetAllPlaylists();
        }
        // GET api/values/5
        [HttpGet("{id}")]
        public Playlist Get(int id)
        {
            return _multiSourcePlaylistRepository.GetPlaylist(id);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]Playlist value)
        {
            _multiSourcePlaylistRepository.PutPlaylist(id,value);
        }
        // POST api/values
        [HttpPost]
        public Playlist Post([FromBody]Playlist value)
        {
            var allPlaylists = _multiSourcePlaylistRepository.GetAllPlaylists();
            int lastOrder = 0;
            var lastPlaylist = allPlaylists.OrderByDescending(x => x.order).FirstOrDefault();
            if(lastPlaylist != null)
            {
                lastOrder = lastPlaylist.order +1;
            }
            value.order = lastOrder;
            _multiSourcePlaylistRepository.PostPlaylist(value);
            return value;
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            _multiSourcePlaylistRepository.DeletePlaylist(id);
        }
    }
}
