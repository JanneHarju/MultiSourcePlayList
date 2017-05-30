
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using PlayList.Repositories;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;

namespace PlayList.Controllers
{


    [Produces("application/json")]
    [Route("api/tracks")]
    public class TrackController : Controller
    {

        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly ILogger _logger;
        public TrackController(IMultiSourcePlaylistRepository multiSourcePlaylistRepository,
                ILoggerFactory loggerFactory)
         : base()
        {
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _logger = loggerFactory.CreateLogger("TrackController");  
        }

        // GET api/values
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        [Authorize("Bearer")]
        public List<Track> Get()
        {
            return _multiSourcePlaylistRepository.GetAllTracks();
        }
        // GET api/values/5
        [HttpGet("{id}")]
        [Authorize("Bearer")]
        public Track Get(int id)
        {
            return _multiSourcePlaylistRepository.GetTrack(id);
        }
        [HttpGet("{id}/{playlist}")]
        [Authorize("Bearer")]
        public List<Track> GetById(int id, string playlist)
        {

            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            return _multiSourcePlaylistRepository.GetUsersPlaylistTracks(id, userId);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        [Authorize("Bearer")]
        public void Put(int id, [FromBody]Track value)
        {
            Playlist pl = _multiSourcePlaylistRepository.AttachPlaylist(value.playlist.id);
            value.playlist = pl;
            _multiSourcePlaylistRepository.PutTrack(id,value);
        }

        // PUT api/values/5
        [HttpPut]
        [Authorize("Bearer")]
        public void UpdateOrder([FromBody]Track[] values)
        {
            if(values != null && values.Any())
            {
                long playlistId = values[0].playlist.id;
                int order = 0;
                Playlist pl = _multiSourcePlaylistRepository.AttachPlaylist(playlistId);
                foreach(Track track in values)
                {
                    track.playlist = pl;
                    track.order = order;
                    _multiSourcePlaylistRepository.PutTrack(track.id,track);
                    ++order;
                }
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
        [Authorize("Bearer")]
        public void Post([FromBody]Track[] values)
        {
            Track someTrack = values[0];
            var allTracks = _multiSourcePlaylistRepository.GetAllTracks();
            int lastOrder = 0;
            _logger.LogCritical("PÖÖÖÖÖÖÖ "+ JsonConvert.SerializeObject(someTrack));
            List<Track> temp = new List<Track>();
            if(allTracks != null)
                temp = allTracks.Where(y=>y.playlist.id==someTrack.playlist.id).ToList();
            if(temp != null && temp.Any())
            {
                lastOrder = temp.OrderByDescending(x => x.order).FirstOrDefault().order + 1;
            }
            Playlist pl = new Playlist();
            if(temp == null || !temp.Any())
            {
                 pl = _multiSourcePlaylistRepository.AttachPlaylist(someTrack.playlist.id);
            }
            foreach(Track newtrack in values)
            {
                newtrack.order = lastOrder;
                if(temp == null || !temp.Any())
                {
                    newtrack.playlist = pl;
                }
                if(newtrack.type == 3)
                {
                    //hae tässä kappale koneelta tai kaikki kappaleet kansiosta ja lisää ne
                    // miten kappaleitten nimet silloin kun lisätään kansiosta
                }
                _multiSourcePlaylistRepository.PostTrack(newtrack);
                ++lastOrder;
            }
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        [Authorize("Bearer")]
        public void Delete(int id)
        {
            _multiSourcePlaylistRepository.DeleteTrack(id);
        }
        
    }
}
