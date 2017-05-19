
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using System.Collections.Generic;
using System.Linq;

namespace PlayList.Controllers
{
    [Produces("application/json")]
    [Route("api/playlists")]
    public class PlaylistController : Controller
    {
        List<Playlist> playlists = new List<Playlist>();
        private string filePath = @"./playlist.json";
        List<Track> tracks = new List<Track>();
        private string trackfilePath = @"./tracks.json";
        public PlaylistController()
         : base()
        {
            playlists = GetPlaylistsFromFile();
        }



        // GET api/values
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public List<Playlist> Get()
        {
            return playlists;
        }
        // GET api/values/5
        [HttpGet("{id}")]
        public Playlist Get(int id)
        {
            return playlists.Find(x=>x.id == id);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]Playlist value)
        {
            Playlist updatePlaylist = playlists.Find(item => item.id == id);
            //updateInfo = value;
            updatePlaylist.name = value.name;
            updatePlaylist.order = value.order;
            updatePlaylist.owner = value.owner;
            SavePlaylistsToFile(playlists);
        }
        // POST api/values
        [HttpPost]
        public Playlist Post([FromBody]Playlist value)
        {
            Playlist lastPlaylist = playlists.OrderByDescending(x => x.id).First();
            int lastOrder = playlists.OrderByDescending(x => x.order).First().order + 1;
            value.order = lastOrder;
            value.id = lastPlaylist.id + 1;
            playlists.Add(value);
            SavePlaylistsToFile(playlists);
            return value;
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            var tracks = GetTracksFromFile();
            playlists.RemoveAll(x=>x.id==id);
            tracks.RemoveAll(x=>x.playlist == id);
            SavePlaylistsToFile(playlists);
            SaveTracksToFIle(tracks);
        }
        private void SavePlaylistsToFile(List<Playlist> playlist)
        {
            string json = JsonConvert.SerializeObject(playlist, Formatting.Indented);

            //write string to file
            System.IO.File.WriteAllText(filePath, json);
        }
        private List<Playlist> GetPlaylistsFromFile()
        {
            //List<Hero> heroesFromFile = new List<Hero>();
            string playlistsString = System.IO.File.ReadAllText(filePath);
            return JsonConvert.DeserializeObject<List<Playlist>>(playlistsString);
        }
        private void SaveTracksToFIle(List<Track> trackList)
        {
            string json = JsonConvert.SerializeObject(trackList, Formatting.Indented);

            //write string to file
            System.IO.File.WriteAllText(trackfilePath, json);
        }
        private List<Track> GetTracksFromFile()
        {
            //List<Hero> heroesFromFile = new List<Hero>();
            string tracksString = System.IO.File.ReadAllText(trackfilePath);
            return JsonConvert.DeserializeObject<List<Track>>(tracksString);
        }
    }
}
