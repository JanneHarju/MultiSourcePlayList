
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using PlayList.Repositories;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Web;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text;
using System;

namespace PlayList.Controllers
{
    [Route("api/bandcamp")]
    public class BandCampController : Controller
    {
        private readonly ILogger _logger;
        public BandCampController(
            ILoggerFactory loggerFactory)
         : base()
        {
            _logger = loggerFactory.CreateLogger("AudioController");
        }

        [HttpGet]
        [Authorize("Bearer")]
        public async Task<string> Get([FromQuery]string q, [FromQuery]int page)
        {
            string encodedQuery = HttpUtility.UrlEncode(q);
            string url = $"https://bandcamp.com/search?q={encodedQuery}&page={page}";
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(url);
                
                var res = response.Content.ReadAsStringAsync().Result;
                return res;
            }
        }
        [HttpGet("albuminfo/{url}")]
        [Authorize("Bearer")]
        public async Task<string> AlbumInfo(string url)
        {
            byte[] data = Convert.FromBase64String(url);
            string decodedUrl = Encoding.UTF8.GetString(data);
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(decodedUrl);
                var res = response.Content.ReadAsStringAsync().Result;
                return res;
            }
        }

        [HttpGet("albumurls/{url}")]
        [Authorize("Bearer")]
        public async Task<string> AlbumUrls(string url)
        {
            byte[] data = Convert.FromBase64String(url);
            string decodedUrl = Encoding.UTF8.GetString(data);
            string fullUrl = decodedUrl + "/music";
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(fullUrl);
                var res = response.Content.ReadAsStringAsync().Result;
                return res;
            }
        }
    }
}
