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

namespace PlayList.Controllers
{

    [Produces("application/json")]
    [Route("api/fileupload")]
    public class FileUploadController: Controller {
        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly IHostingEnvironment _environment;
        private readonly ILogger _logger;
        private static long bytesToMegaBytes = 1048576;
        private IConfigurationRoot _configuration { get; }
        public FileUploadController(
            IHostingEnvironment environment,
            ILoggerFactory loggerFactory,
            IMultiSourcePlaylistRepository multiSourcePlaylistRepository,
            IConfigurationRoot configuration)
        {
            _environment = environment;
            _logger = loggerFactory.CreateLogger("FileUploadController");  
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _configuration = configuration;
        }
        [HttpPost("{id}")]
        [Authorize("Bearer")]
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
                if (!await userDir.ExistsAsync())
                {
                    return "User audio directory doesn't exists.";
                    /*totalSize = await isThereDiscSpaceInAzure(userDir);
                    if((totalSize)/bytesToMegaBytes > 1000)
                    {
                        return "NO_DISC_SPACE";
                    }*/
                }
                
            }
            foreach(var file in files)
            {
                try {
                    var filename = file.FileName;
                    var fullpath = Path.Combine(uploads, filename);

                    CloudFile newfile = userDir.GetFileReference(filename);
                    
                    if(!await newfile.ExistsAsync())
                    {
                        if (file.Length > 0)
                        {
                            try{
                                using(var fileStream = file.OpenReadStream())
                                {
                                    await newfile.UploadFromStreamAsync(fileStream);
                                    
                                }
                            }
                            catch(Exception ex)
                            {
                                return "NO_DISC_SPACE";
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
                    fileTrack.Type = 3;
                    fileTrack.Order = lastOrder;
                    fileTrack.Name = getTrackName(fullpath);//hanki bändi ja kappale mp3 tiedoston metasta
                    _multiSourcePlaylistRepository.PostTrack(fileTrack);
                    ++lastOrder;
                    System.IO.File.Delete(fullpath);
                } catch {
                    return null;
                }
            }
            return "File was Uploaded";
        }

        private async Task<long> isThereDiscSpaceInAzure(CloudFileDirectory userDir)
        {
            var results = new List<IListFileItem>();
            FileContinuationToken token = null;
            try
            {
                do
                {
                    FileResultSegment resultSegment = await userDir.ListFilesAndDirectoriesSegmentedAsync(token);
                    results.AddRange(resultSegment.Results);
                    token = resultSegment.ContinuationToken;
                }
                while (token != null);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Console.ReadKey();
            }
            long sizeInBytes = 0;
            results.ForEach(async x=>
            {
                if (x is CloudFile)
                {
                    var cloudFile = (CloudFile) x;
                    await cloudFile.FetchAttributesAsync();
                    sizeInBytes += cloudFile.Properties.Length;
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
        private bool isThereDiscSpace(string path, IFormFile file)
        {
            var directoryInfo = new DirectoryInfo(path);
            var sizeInBytes = directoryInfo.EnumerateFiles().Sum(fil=> fil.Length);
            var totalSizeInBytes = sizeInBytes + file.Length;
            var sizeInMb = totalSizeInBytes / 1048576;
            return sizeInMb < 1000;
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
            }
        }
    }
}