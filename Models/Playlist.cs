using System.Collections.Generic;

namespace PlayList.Models
{
    public class Playlist {
            public long id { get; set; }
            public int order { get; set; } 
            public int owner { get; set; } 
            public string name { get; set; } 
            public List<Track> tracks { get; set; }
    }
}