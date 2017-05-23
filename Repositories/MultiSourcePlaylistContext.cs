using Microsoft.EntityFrameworkCore;
using PlayList.Models;

namespace PlayList.Repositories
{
    // >dotnet ef migration add testMigration
    public class MultiSourcePlaylistContext : DbContext
    {
        public MultiSourcePlaylistContext(DbContextOptions<MultiSourcePlaylistContext> options) :base(options)
        { 
            
            //this.Configuration.LazyLoadingEnabled = false; 
        }
        /*protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            options.UseSqlite
        }*/
        public DbSet<Track> Tracks { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
       
        protected override void OnModelCreating(ModelBuilder builder)
        { 
            builder.Entity<Track>().HasKey(m => m.id); 
            builder.Entity<Track>().HasOne(track=>track.playlist).WithMany(playlist => playlist.tracks); 
            builder.Entity<Playlist>().HasKey(m => m.id); 
            //builder.Entity<Playlist>().HasMany(playlist=>playlist.tracks).WithOne(track => track.playlist); 
            base.OnModelCreating(builder); 
        } 
    }
}