
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
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;

namespace PlayList.Controllers
{
    [Produces("application/json")]
    [Route("api/test")]
    public class TestController : Controller
    {

        //private string callbackUrl = "http://localhost:5000/callback.html";
        private string callbackUrl = "http://muusiple.azurewebsites.net/callback.html";
        public TestController()
         : base()
        { 
        }

        [HttpGet]
        public List<string> Get()
        {
            var temp = new List<string>();
            temp.Add("plaa");
            temp.Add("joojoo");
            return temp;
        }
        [HttpGet("{id}")]
        public string Get(int id)
        {
            if(id==0)
                return "eka";
            else if(id==1)
            {
                return "toka";
            }
            else
            {
                return "vika";
            }
        }
        [HttpGet("code/{code}")]
        [Authorize("Bearer")]
        public async Task<string> code(string code)
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
                    client.BaseAddress = new Uri("https://accounts.spotify.com");
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authorization);
                    
                    var url = "/api/token?redirect_uri="+callbackUrl+"&grant_type=authorization_code&code="+code;
                    HttpResponseMessage response = await client.PostAsync
                        (url, null);
                    
                    var res = response.Content.ReadAsStringAsync().Result;
                    return res;
                }
            }
            catch(Exception ex)
            {
                return ex.Message;
            }
        }

        [HttpGet("refreshtoken/{refreshtoken}")]
        [Authorize("Bearer")]
        public async Task<string> refreshtoken(string refreshtoken)
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
                    client.BaseAddress = new Uri("https://accounts.spotify.com");
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authorization);
                    
                    var url = "/api/token?redirect_uri="+callbackUrl+"&grant_type=refresh_token&refresh_token="+refreshtoken;
                    HttpResponseMessage response = await client.PostAsync
                        (url, null);
                    
                    var res = response.Content.ReadAsStringAsync().Result;
                    return res;
                }
            }
            catch(Exception ex)
            {
                return ex.Message;
            }
        }
    }
}
