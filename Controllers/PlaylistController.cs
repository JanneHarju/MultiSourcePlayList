
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using PlayList.Repositories;
using System.Collections.Generic;
using System.Linq;

namespace PlayList.Controllers
{
    [Produces("application/json")]
    [Route("api/playlists")]
    public class PlaylistController : Controller
    {
        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        public PlaylistController(IMultiSourcePlaylistRepository multiSourcePlaylistRepository)
         : base()
        {
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
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
                lastOrder = lastPlaylist.id +1;
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
            //onko tämä tarpeen
            var templist = _multiSourcePlaylistRepository.GetTracks(id);
            _multiSourcePlaylistRepository.DeleteTracksByPlaylistId(id);
        }
    }
}
