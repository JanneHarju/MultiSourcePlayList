
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
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System;
using System.Text;
using System.Net;

namespace PlayList.Controllers
{
    //[Produces("application/json")] Perkele
    [Route("api/spotifyaccount")]
    public class SpotifyAccountController : Controller
    {
        private string callbackUrl = "/callback.html";
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _environment;
        public SpotifyAccountController(
            IHostingEnvironment environment,
            IMultiSourcePlaylistRepository multiSourcePlaylistRepository
            ,ILoggerFactory loggerFactory)
         : base()
        {
            _environment = environment;
            _logger = loggerFactory.CreateLogger("SpotifyAccountController");  
        }

        [HttpGet("code/{code}/{redirectUrl}")]
        [Authorize("Bearer")]
        public async Task<string> code(string code, string redirectUrl)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var clientSecret = "6184cc25e3eb4dbb8b29c5a0feca99a8";
                    var clientId = "5ab10cb4fa9045fca2b92fcd0a97545c";
                    var auth = clientId + ":" + clientSecret;
                    var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(auth);
                    var authorization = System.Convert.ToBase64String(plainTextBytes);
                    
                    byte[] data = Convert.FromBase64String(redirectUrl);
                    string decodedUrl = Encoding.UTF8.GetString(data);
                    client.BaseAddress = new Uri("https://accounts.spotify.com");
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authorization);
                    var url = "/api/token";
                    string query = "redirect_uri="+ decodedUrl+ "&grant_type=authorization_code&code="+code;
                    _logger.LogWarning("query: " + query);
                    HttpResponseMessage response = await client.PostAsync
                        (url, new StringContent(query,Encoding.UTF8, "application/x-www-form-urlencoded"));
                    
                    var res = response.Content.ReadAsStringAsync().Result;
                    return res;
                }
            }
            catch(Exception ex)
            {
                return ex.Message;
            }
        }

        [HttpGet("refreshtoken/{refreshtoken}/{redirectUrl}")]
        [Authorize("Bearer")]
        public async Task<string> refreshtoken(string refreshtoken, string redirectUrl)
        {
            using (HttpClient client = new HttpClient())
            {
                var clientSecret = "6184cc25e3eb4dbb8b29c5a0feca99a8";
                var clientId = "5ab10cb4fa9045fca2b92fcd0a97545c";
                var auth = clientId + ":" + clientSecret;
                var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(auth);
                var authorization = System.Convert.ToBase64String(plainTextBytes);
                client.BaseAddress = new Uri("https://accounts.spotify.com");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authorization);
                
                byte[] data = Convert.FromBase64String(redirectUrl);
                string decodedUrl = Encoding.UTF8.GetString(data);
                var url = "/api/token";
                HttpResponseMessage response = await client.PostAsync
                    (url, new StringContent("redirect_uri="+ decodedUrl + "&grant_type=refresh_token&refresh_token="+refreshtoken, Encoding.UTF8, "application/x-www-form-urlencoded"));
                
                var res = response.Content.ReadAsStringAsync().Result;
                return res;
            }
        }
        
    }
}
