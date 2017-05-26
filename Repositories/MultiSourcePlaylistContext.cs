using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using PlayList.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using System;
using Microsoft.Data.Sqlite;

namespace PlayList.Repositories
{
/* 
    public class MultiSourcePlaylistContextFactory : IDbContextFactory<MultiSourcePlaylistContext>
    {
        */
        /*public IConfigurationRoot Configuration { get; set;}
        public MultiSourcePlaylistContext Create()
        {
            var environmentName = 
            Environment.GetEnvironmentVariable(
            "Hosting:Environment");

            var basePath = AppContext.BaseDirectory;

            return Create(basePath, environmentName);
        }
        private MultiSourcePlaylistContext Create(string basePath, string environmentName)
        {
            var builder = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json")
            .AddJsonFile($"appsettings.{environmentName}.json", true)
            .AddEnvironmentVariables();

            var config = builder.Build();

            var connstr = config.GetConnectionString("(default)");

            if (String.IsNullOrWhiteSpace(connstr) == true)
            {
                throw new InvalidOperationException(
                "Could not find a connection string named '(default)'.");
            }
            else
            {
                return Create(connstr);
            }
        }
        private MultiSourcePlaylistContext Create(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
            throw new ArgumentException(
            $"{nameof(connectionString)} is null or empty.",
            nameof(connectionString));

            var optionsBuilder =
            new DbContextOptionsBuilder<MultiSourcePlaylistContext>();

            optionsBuilder.UseSqlServer(connectionString);

            return new MultiSourcePlaylistContext(optionsBuilder.Options);
        }
        public MultiSourcePlaylistContext Create(DbContextFactoryOptions options)
        {
            return Create(
            options.ContentRootPath, 
            options.EnvironmentName);
        }*/
        /*if (setting == null || setting.Length == 0)
                throw new ArgumentException(
                $"{nameof(setting)} is null or empty.",
                nameof(setting));
            var connection = setting[0];*/
//DbContextFactoryOptions
/* 
        public MultiSourcePlaylistContext Create(string[] setting)
        {
            
            */
            /*var builder = new ConfigurationBuilder()
                    .AddJsonFile("config.json")
                    .AddEnvironmentVariables();
            Configuration = builder.Build();
            var connection = Configuration["Production:SqliteConnectionString"];*/
            /* 
            var contextbuilder = new DbContextOptionsBuilder<MultiSourcePlaylistContext>();
            string connection = "Data Source=//Users//paiviharju//Documents//Database//MSPL.sqlite";
            contextbuilder.UseSqlite(connection);
            return new MultiSourcePlaylistContext(contextbuilder.Options);
        }
    }*/
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
        public DbSet<User> Users { get; set; }
       
        protected override void OnModelCreating(ModelBuilder builder)
        { 
            builder.Entity<Track>()
                .HasKey(m => m.id); 
            /*builder.Entity<ApplicationUser>()
                .HasKey(m => m.Id); */
            builder.Entity<Track>()
                .HasOne(track=>track.playlist)
                .WithMany(playlist => playlist.tracks)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<Playlist>().HasKey(m => m.id); 

            builder.Entity<User>().HasKey(m => m.Id); 
            builder.Entity<Playlist>()
                .HasOne(track=>track.owner)
                .WithMany(user => user.Playlists) 
                .OnDelete(DeleteBehavior.Cascade);
            //builder.Entity<Playlist>().HasMany(playlist=>playlist.tracks).WithOne(track => track.playlist); 
            base.OnModelCreating(builder); 
        } 
    }
}