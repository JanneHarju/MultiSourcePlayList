using System.Collections.Generic;

namespace PlayList.Models
{
    public class Playlist {
            public long id { get; set; }
            public int order { get; set; } 
            public User owner { get; set; } 
            public string name { get; set; } 
            public ICollection<Track> tracks { get; set; }
    }
}