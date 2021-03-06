
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PlayList.Models
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class User
    {
        public long Id { get; set; }
        public string Username { get; set; }

        public string Password { get; set; }

        public string Fname {get;set;}
        public string Lname {get;set;}
        public string FileFolder{get;set;}
        public ICollection<Playlist> Playlists { get; set; }
    
    }
}