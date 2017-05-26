using System;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System.Collections.Generic;

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
        public ICollection<Playlist> Playlists { get; set; }
    
    }
}