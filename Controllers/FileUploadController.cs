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
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Http;
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
        public FileUploadController(
            IHostingEnvironment environment,
            ILoggerFactory loggerFactory,
            IMultiSourcePlaylistRepository multiSourcePlaylistRepository)
        {
            _environment = environment;
            _logger = loggerFactory.CreateLogger("FileUploadController");  
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
        }
        [HttpPost("{id}")]
        [Authorize("Bearer")]
        public async Task<string> FileUpload(long id, IFormFile[] files)
        {
            _logger.LogCritical(_environment.WebRootPath);
            
            _logger.LogCritical(UriHelper.GetDisplayUrl(Request));
            _logger.LogCritical(id.ToString());
            var claimsIdentity = User.Identity as ClaimsIdentity;
            var userId =  Convert.ToInt64(claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value);
            var user = _multiSourcePlaylistRepository.GetUser(userId);

            var filePath = Path.Combine(
                "uploads",
                user.FileFolder);
            var uploads = Path.Combine(
                _environment.WebRootPath,
                filePath);
            string url = UriHelper.GetDisplayUrl(Request);//http://localhost:8080/api/fileupload/1
            var urlParts = url.Split(new[] { "api/fileupload" }, StringSplitOptions.None);
            var baseUrl = urlParts[0];
            var playlist = _multiSourcePlaylistRepository.GetPlaylist(id);

            var allTracks = _multiSourcePlaylistRepository.GetAllTracks();
            int lastOrder = 0;
            List<Track> temp = new List<Track>();
            if(allTracks != null)
                temp = allTracks.Where(y=>y.playlist.id==id).ToList();
            if(temp != null && temp.Any())
            {
                lastOrder = temp.OrderByDescending(x => x.order).FirstOrDefault().order + 1;
            }
            
            //@string.Format("{0}://{1}{2}{3}", Context.Request.Scheme, Context.Request.Host, Context.Request.Path, Context.Request.QueryString)
            
            foreach(var file in files)
            {
                try {
                    var filename = file.FileName;
                    var fullpath = Path.Combine(
                            uploads,
                            filename);
                    if(!System.IO.File.Exists(fullpath))
                    {
                        if (file.Length > 0)
                        {
                            using(var fileStream = new FileStream(fullpath, FileMode.Create))
                            {
                                
                                await file.CopyToAsync(fileStream);
                                fileStream.Flush();
                                fileStream.Dispose();
                                
                            }
                        }
                    }
                    string fp = Path.Combine(
                        uploads,
                        filename);
                    Track fileTrack = new Track();
                    /*crit: FileUploadController[0]
                    [1]       /Users/paiviharju/Documents/Jannen kansio/MultiSourcePlayList/wwwroot
                    [1] crit: FileUploadController[0]
                    [1]       
                    [1] crit: FileUploadController[0]
                    [1]       1*/
                    fileTrack.address = filename;
                    fileTrack.playlist = playlist;
                    fileTrack.type = 3;
                    fileTrack.order = lastOrder;
                    fileTrack.name = getTrackName(fp);//hanki bändi ja kappale mp3 tiedoston metasta
                    _multiSourcePlaylistRepository.PostTrack(fileTrack);

                } catch {
                    return null;
                }
            }
            return "File was Uploaded";
        }
        private string getTrackName(string file)
        {
            string trackname= "";
            //var fileStream = await (StorageFile)file.OpenStreamForReadAsync();
            _logger.LogCritical("filenimi" + file);
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
            }
        }
    }
}