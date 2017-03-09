
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
        public PlaylistController()
         : base()
        {
            playlists = GetInfosFromFile();
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
            SaveToFIle(playlists);
        }
        // POST api/values
        [HttpPost]
        public void Post([FromBody]Playlist value)
        {
            Playlist lastPlaylist = playlists.OrderByDescending(x => x.id).First();
            value.id = lastPlaylist.id + 1;
            playlists.Add(value);
            SaveToFIle(playlists);
        }
        private void SaveToFIle(List<Playlist> playlist)
        {
            string json = JsonConvert.SerializeObject(playlist, Formatting.Indented);

            //write string to file
            System.IO.File.WriteAllText(filePath, json);
        }
        private List<Playlist> GetInfosFromFile()
        {
            //List<Hero> heroesFromFile = new List<Hero>();
            string heroString = System.IO.File.ReadAllText(filePath);
            return JsonConvert.DeserializeObject<List<Playlist>>(heroString);
        }
    }
}
