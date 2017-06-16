using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PlayList.Models
{
    public class Track {

        public long Id { get; set; }
        public string Address { get; set; } 
        public int Order { get; set; } 
        public int Type { get; set; } 
        public string Name { get; set; }
        public Playlist Playlist { get; set; }
    }
}