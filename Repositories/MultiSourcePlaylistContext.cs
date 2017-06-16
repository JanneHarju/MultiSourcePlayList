using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using PlayList.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using System;
using Microsoft.Data.Sqlite;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.SqlClient;

namespace PlayList.Repositories
{
    public class MultiSourcePlaylistContext : DbContext
    {
        public MultiSourcePlaylistContext(DbContextOptions<MultiSourcePlaylistContext> options) :base(options)
        { 
        }
        public DbSet<Track> Tracks { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<User> Users { get; set; }
       
        protected override void OnModelCreating(ModelBuilder builder)
        { 
            builder.Entity<Track>()
                .HasOne(track=>track.Playlist)
                .WithMany(playlist => playlist.Tracks)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<Playlist>()
                .HasOne(track=>track.Owner)
                .WithMany(user => user.Playlists) 
                .OnDelete(DeleteBehavior.Cascade);
            base.OnModelCreating(builder); 
        } 
    }
}