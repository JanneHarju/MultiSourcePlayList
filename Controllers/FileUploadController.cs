using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PlayList.Models;
using PlayList.Repositories;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.WindowsAzure.Storage; // Namespace for Storage Client Library
using Microsoft.WindowsAzure.Storage.File; // Namespace for Azure File storage
using System;
using System.IO;
using System.Threading.Tasks;
using TagLib;
using Microsoft.WindowsAzure.Storage.Blob;

namespace PlayList.Controllers
{

    [Produces("application/json")]
    [Route("api/fileupload")]
    public class FileUploadController: Controller {
        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly IHostingEnvironment _environment;
        private readonly ILogger _logger;
        private IConfiguration _configuration { get; }
        public FileUploadController(
            IHostingEnvironment environment,
            ILoggerFactory loggerFactory,
            IMultiSourcePlaylistRepository multiSourcePlaylistRepository,
            IConfiguration configuration)
        {
            _environment = environment;
            _logger = loggerFactory.CreateLogger("FileUploadController");  
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _configuration = configuration;
        }
        [HttpPost("{id}")]
        [Authorize("Bearer")]
        [RequestSizeLimit(100_000_000)]
        public async Task<string> FileUpload(long id, IFormFile[] files)
        {
            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            var user = _multiSourcePlaylistRepository.GetUser(userId);
            var filePath = Path.Combine(
                "uploads",
                user.FileFolder);
            var uploads = Path.Combine(
                _environment.ContentRootPath,
                filePath);

            //string url = UriHelper.GetDisplayUrl(Request);//http://localhost:8080/api/fileupload/1
            //var urlParts = url.Split(new[] { "api/fileupload" }, StringSplitOptions.None);
            //var baseUrl = urlParts[0];
            var playlist = _multiSourcePlaylistRepository.GetPlaylist(id);

            var allTracks = _multiSourcePlaylistRepository.GetAllTracks();
            int lastOrder = 0;
            List<Track> temp = new List<Track>();
            if(allTracks != null)
                temp = allTracks.Where(y=>y.Playlist.Id==id).ToList();
            if(temp != null && temp.Any())
            {
                lastOrder = temp.OrderByDescending(x => x.Order).FirstOrDefault().Order + 1;
            }
            //@string.Format("{0}://{1}{2}{3}", Context.Request.Scheme, Context.Request.Host, Context.Request.Path, Context.Request.QueryString)
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(
                _configuration["Production:StorageConnectionString"]);
            CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
            CloudBlobContainer container = blobClient.GetContainerReference(user.FileFolder);
            
            // Ensure that the share exists.
            if (await container.ExistsAsync())
            {
                int bytesToMegaBytes = 1048576;
                var totalSize = await isThereDiscSpaceInAzure(container);
                if((totalSize)/bytesToMegaBytes > 10000)
                {
                    return "NO_DISC_SPACE";
                }
            }
            else
            {
                return "User container doesn't exists.";
            }
            foreach(var file in files)
            {
                try {
                    var filename = file.FileName;
                    var fullpath = Path.Combine(uploads, filename);
                    CloudBlockBlob blob = container.GetBlockBlobReference(filename);
                    if(!await blob.ExistsAsync())
                    {
                        if (file.Length > 0)
                        {
                            using(var fileStream = file.OpenReadStream())
                            {
                                await blob.UploadFromStreamAsync(fileStream);
                            }
                        }
                    }
                    using(var fileStream = new FileStream(fullpath, FileMode.Create))
                    {
                        await file.CopyToAsync(fileStream);
                        fileStream.Flush();
                        fileStream.Dispose();
                    }
                    
                    Track fileTrack = new Track();
                    fileTrack.Address = file.FileName;
                    fileTrack.Playlist = playlist;
                    fileTrack.Type = 5;
                    fileTrack.Order = lastOrder;
                    fileTrack.Name = getTrackName(fullpath);//hanki bändi ja kappale mp3 tiedoston metasta
                    _multiSourcePlaylistRepository.PostTrack(fileTrack);
                    ++lastOrder;
                    System.IO.File.Delete(fullpath);
                    
                } catch(Exception ex) {
                    return ex.Message;
                }
            }
            return "File was Uploaded";
        }

        private async Task<long> isThereDiscSpaceInAzure(CloudBlobContainer cloudBlobContainer)
        {
            var blobresults = new List<IListBlobItem>();
            try
            {
                BlobContinuationToken blobContinuationToken = null;
                do
                {
                    BlobResultSegment resultSegment = await cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
                    // Get the value of the continuation token returned by the listing call.
                    blobresults.AddRange(resultSegment.Results);
                    blobContinuationToken = resultSegment.ContinuationToken;
                } while (blobContinuationToken != null); // Loop while the continuation token is not null.
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Console.ReadKey();
            }
            long sizeInBytes = 0;
            blobresults.ForEach(async x=>
            {
                if (x is CloudBlob)
                {
                    var cloudBlob = (CloudBlob) x;
                    await cloudBlob.FetchAttributesAsync();
                    sizeInBytes += cloudBlob.Properties.Length;
                }
            });
            return sizeInBytes;
        }

        private string getTrackName(string file)
        {
            string trackname= "";
            var tempFile = new LocalFileAbstraction(file, false);
            var tagFile = TagLib.File.Create(tempFile);

            var tags = tagFile.GetTag(TagTypes.Id3v2);
            var artist = tagFile.Tag.Performers[0];
            var title = tagFile.Tag.Title;
            tagFile.Dispose();
            tempFile.CloseStream(tempFile.ReadStream);
            _logger.LogCritical(artist);
            _logger.LogCritical(title);
            trackname = artist +" - "+title;
            return trackname;
        }
    }
    public class LocalFileAbstraction : TagLib.File.IFileAbstraction
    {
        public LocalFileAbstraction(string path, bool openForWrite = false)
        {
            Name = Path.GetFileName(path);
            var fileStream = openForWrite ? System.IO.File.Open(path, FileMode.Open, FileAccess.ReadWrite) : System.IO.File.OpenRead(path);
            ReadStream = WriteStream = fileStream;
        }

        public string Name { get; private set; }

        public Stream ReadStream { get; private set; }

        public Stream WriteStream { get; private set; }

        public void CloseStream(Stream stream)
        {
            if (stream != null)
            {
                stream.Flush();
                stream.Dispose();
            }
        }
    }
}