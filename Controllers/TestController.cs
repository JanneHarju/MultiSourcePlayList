
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
    [Route("api/test")]
    public class TestController : Controller
    {
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
    }
}
