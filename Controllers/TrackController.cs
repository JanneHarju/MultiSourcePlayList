
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using System.Collections.Generic;
using System.Linq;

namespace PlayList.Controllers
{
    [Produces("application/json")]
    [Route("api/tracks")]
    public class TrackController : Controller
    {
        List<Track> tracks = new List<Track>();
        private string filePath = @"./tracks.json";
        public TrackController()
         : base()
        {
            tracks = GetInfosFromFile();
        }



        // GET api/values
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public List<Track> Get()
        {
            return tracks;
        }
        // GET api/values/5
        [HttpGet("{id}")]
        public Track Get(int id)
        {
            return tracks.Find(x=>x.id == id);
        }
        [HttpGet("{id}/{playlist}")]
        public List<Track> GetById(int id, string playlist)
        {
            return tracks.
                FindAll(x=>x.playlist == id).
                OrderBy(x=>x.order).
                ToList();
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]Track value)
        {
            Track updateInfo = tracks.Find(item => item.id == id);
            //updateInfo = value;
            updateInfo.address = value.address;
            updateInfo.name = value.name;
            updateInfo.order = value.order;
            updateInfo.type = value.type;
            SaveToFIle(tracks);
        }

        // PUT api/values/5
        [HttpPut]
        public void UpdateOrder([FromBody]Track[] values)
        {
            if(values != null && values.Any())
            {
                int playlistId = values[0].playlist;
                tracks.RemoveAll(track => track.playlist == playlistId);
                int order = 0;
                foreach(Track track in values)
                {
                    track.order = order;
                    tracks.Add(track);
                    ++order;
                }
                SaveToFIle(tracks);
            }
        }
        // POST api/values
        /*[HttpPost]
        public void Post([FromBody]Track value)
        {
            Track lastInfo = tracks.OrderByDescending(x => x.id).First();
            value.id = lastInfo.id + 1;
            if(value.type == 3)
            {
                //hae tässä kappale koneelta tai kaikki kappaleet kansiosta ja lisää ne
                // miten kappaleitten nimet silloin kun lisätään kansiosta
            }
            tracks.Add(value);
            SaveToFIle(tracks);
        }*/

        //[ActionName("addMultiple")]
        [HttpPost]
        public void Post([FromBody]Track[] values)
        {
            //tarkista tämä
            Track lastInfo = tracks.OrderByDescending(x => x.id).First();
            int lastOrder = tracks.OrderByDescending(x => x.order).First().order + 1;
            int newidIndex = 1;
            foreach(Track newtrack in values)
            {
                newtrack.id = lastInfo.id + newidIndex;
                newtrack.order = lastOrder;
                if(newtrack.type == 3)
                {
                    //hae tässä kappale koneelta tai kaikki kappaleet kansiosta ja lisää ne
                    // miten kappaleitten nimet silloin kun lisätään kansiosta
                }
                tracks.Add(newtrack);
                ++newidIndex;
                ++lastOrder;
            }
            
            SaveToFIle(tracks);
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            tracks.RemoveAll(x=>x.id==id);
            SaveToFIle(tracks);
        }
        private void SaveToFIle(List<Track> info)
        {
            string json = JsonConvert.SerializeObject(info, Formatting.Indented);

            //write string to file
            System.IO.File.WriteAllText(filePath, json);
        }
        private List<Track> GetInfosFromFile()
        {
            //List<Hero> heroesFromFile = new List<Hero>();
            string heroString = System.IO.File.ReadAllText(filePath);
            return JsonConvert.DeserializeObject<List<Track>>(heroString);
        }
    }
}
