
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
        List<Track> infos = new List<Track>();
        private string filePath = @"./info.json";
        public TrackController()
         : base()
        {
            infos = GetInfosFromFile();
        }



        // GET api/values
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public List<Track> Get()
        {
            return infos;
        }
        // GET api/values/5
        [HttpGet("{id}")]
        public Track Get(int id)
        {
            return infos.Find(x=>x.id == id);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]Track value)
        {
            Track updateInfo = infos.Find(item => item.id == id);
            //updateInfo = value;
            updateInfo.address = value.address;
            updateInfo.name = value.name;
            updateInfo.order = value.order;
            updateInfo.type = value.type;
            SaveToFIle(infos);
        }
        // POST api/values
        [HttpPost]
        public void Post([FromBody]Track value)
        {
            Track lastInfo = infos.OrderByDescending(x => x.id).First();
            value.id = lastInfo.id + 1;
            infos.Add(value);
            SaveToFIle(infos);
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
