
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
using Microsoft.WindowsAzure.Storage; // Namespace for Storage Client Library
using Microsoft.WindowsAzure.Storage.File; // Namespace for Azure File storage
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

namespace PlayList.Controllers
{
    [Produces("application/json")]
    [Route("api/audio")]
    public class AudioController : Controller
    {
        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _environment;
        private IConfiguration _configuration { get; }
        public AudioController(
            IHostingEnvironment environment,
            IMultiSourcePlaylistRepository multiSourcePlaylistRepository
            ,ILoggerFactory loggerFactory,
            IConfiguration configuration)
         : base()
        {
            _environment = environment;
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _logger = loggerFactory.CreateLogger("AudioController");  
            _configuration = configuration;
        }
        // GET api/values
        //[ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]

        [HttpGet("{id}")]
        [Authorize]
        public async Task<FileStreamResult> Get(int id)
        {
            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            var user = _multiSourcePlaylistRepository.GetUser(userId);
            var track = _multiSourcePlaylistRepository.GetTrack(id);
            
            byte[] audioArray = new byte[0];
            
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(
                    _configuration["Production:StorageConnectionString"]);

            CloudFileClient fileClient = storageAccount.CreateCloudFileClient();
            // Get a reference to the file share we created previously.
            CloudFileShare share = fileClient.GetShareReference(user.FileFolder);
            CloudFileDirectory userDir = null;
            // Ensure that the share exists.
            if (await share.ExistsAsync())
            {
                // Get a reference to the root directory for the share.
                CloudFileDirectory rootDir = share.GetRootDirectoryReference();
                // Get a reference to the directory we created previously.
                userDir = rootDir.GetDirectoryReference("audio");
                // Ensure that the directory exists.
                if (await userDir.ExistsAsync())
                {
                    var audiofile = userDir.GetFileReference(track.Address);
                    if(await audiofile.ExistsAsync())
                    {

                        await audiofile.FetchAttributesAsync();
                        audioArray = new byte[audiofile.Properties.Length];
                        await audiofile.DownloadToByteArrayAsync(audioArray,0);
                    }
                }
                else
                {
                    return null;
                }
            }
            else{
                return null;
            }
            
            var stream = new MemoryStream(audioArray);

            return new FileStreamResult(stream, "audio/mp3")
            {
                FileDownloadName = track.Name
            };
        }
        
    }
}
