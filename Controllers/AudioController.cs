
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
    [Route("api/audio")]
    public class AudioController : Controller
    {
        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _environment;
        public AudioController(
            IHostingEnvironment environment,
            IMultiSourcePlaylistRepository multiSourcePlaylistRepository
            ,ILoggerFactory loggerFactory)
         : base()
        {
            _environment = environment;
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _logger = loggerFactory.CreateLogger("AudioController");  
        }
        // GET api/values
        //[ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]

        [HttpGet("{id}")]
        [Authorize]
        public IActionResult Get(int id)
        {
            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            var user = _multiSourcePlaylistRepository.GetUser(userId);
            var track = _multiSourcePlaylistRepository.GetTrack(id);
            var filePath = Path.Combine(
                _environment.ContentRootPath,
                "uploads",
                user.FileFolder,
                track.Address);
            
            var file = System.IO.File.ReadAllBytes(filePath);
            long fSize = file.Length;
            long startbyte = 0;
            long endbyte = fSize - 1;
            int statusCode = 200;
            var rangeRequest = Request.Headers["Range"].ToString();

            if (rangeRequest != "")
            {
                string[] range = Request.Headers["Range"].ToString().Split(new char[] { '=', '-' });
                startbyte = Convert.ToInt64(range[1]);
                if (range.Length > 2 && range[2] != "") endbyte = Convert.ToInt64(range[2]);
                if (startbyte != 0 || endbyte != fSize - 1 || range.Length > 2 && range[2] == "")
                { statusCode = 206; }
            }

            long desSize = endbyte - startbyte + 1;
            Response.StatusCode = statusCode;
            Response.ContentType = "audio/mp3";
            Response.Headers.Add("Content-Accept", Response.ContentType);
            Response.Headers.Add("Content-Length", desSize.ToString());
            Response.Headers.Add("Content-Range", string.Format("bytes {0}-{1}/{2}", startbyte, endbyte, fSize));
            Response.Headers.Add("Accept-Ranges", "bytes");
            Response.Headers.Remove("Cache-Control");
            var stream = new MemoryStream(file, (int)startbyte, (int)desSize);

            return File(stream, Response.ContentType);
        }
        
    }
}
