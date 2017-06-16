using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace PlayList.Models
{
    public class Playlist {

        public long Id { get; set; }
        public int Order { get; set; } 
        public User Owner { get; set; } 
        public string Name { get; set; } 
        public ICollection<Track> Tracks { get; set; }
    }
}