
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using PlayList.Repositories;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System;
using System.IO;

namespace PlayList.Controllers
{


    [Produces("application/json")]
    [Route("api/tracks")]
    public class TrackController : Controller
    {

        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _environment;
        private IConfiguration _configuration { get; }
        public TrackController(
            IHostingEnvironment environment,
            IMultiSourcePlaylistRepository multiSourcePlaylistRepository,
            ILoggerFactory loggerFactory,
            IConfiguration configuration)
         : base()
        {
            _environment = environment;
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _logger = loggerFactory.CreateLogger("TrackController");
            _configuration = configuration;
        }

        // GET api/values
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
            Playlist pl = _multiSourcePlaylistRepository.AttachPlaylist(value.Playlist.Id);
            value.Playlist = pl;
            _multiSourcePlaylistRepository.PutTrack(id,value);
        }

        // PUT api/values/5
        [HttpPut]
        [Authorize("Bearer")]
        public void UpdateOrder([FromBody]Track[] values)
        {
            if(values != null && values.Any())
            {
                long playlistId = values[0].Playlist.Id;
                int order = 0;
                Playlist pl = _multiSourcePlaylistRepository.AttachPlaylist(playlistId);
                List<Track> updateTracks = new List<Track>();
                foreach(Track track in values)
                {
                    track.Playlist = pl;
                    track.Order = order;
                    ++order;
                    updateTracks.Add(track);
                }
                _multiSourcePlaylistRepository.PutManyTracks(0,updateTracks);
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
            //_logger.LogCritical("PÖÖÖÖÖÖÖ "+ JsonConvert.SerializeObject(someTrack));
            List<Track> temp = new List<Track>();
            if(allTracks != null)
                temp = allTracks.Where(y=>y.Playlist.Id==someTrack.Playlist.Id).ToList();
            if(temp != null && temp.Any())
            {
                lastOrder = temp.OrderByDescending(x => x.Order).FirstOrDefault().Order + 1;
            }
            Playlist pl = new Playlist();
            if(temp == null || !temp.Any())
            {
                 pl = _multiSourcePlaylistRepository.AttachPlaylist(someTrack.Playlist.Id);
            }
            List<Track> newTracks = new List<Track>();

            foreach(Track newtrack in values)
            {
                newtrack.Order = lastOrder;
                if(temp == null || !temp.Any())
                {
                    newtrack.Playlist = pl;
                }
                ++lastOrder;
                newTracks.Add(newtrack);
            }
            _multiSourcePlaylistRepository.PostManyTracks(newTracks);
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        [Authorize("Bearer")]
        public async Task<string> Delete(int id)
        {
            var track = _multiSourcePlaylistRepository.GetTrack(id);
            var address = track.Address;
            var type = track.Type;
            _multiSourcePlaylistRepository.DeleteTrack(id);
            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            var user = _multiSourcePlaylistRepository.GetUser(userId);
            var mp3type = 3;
            if(type == mp3type)
            {
                if(!_multiSourcePlaylistRepository.GetTracksByTypeAndAddress(mp3type,address,userId).Any())
                {
                    if(!await CloudHelper.RemoveFileFromCloud(
                        _configuration["Production:StorageConnectionString"],
                        user.FileFolder,
                        address))
                    {
                        return "FAILED";
                    }
                }
            }
            return "SUCCESS";
        }
        
    }
}
