
using System.IO;

using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.WindowsAzure.Storage; // Namespace for Storage Client Library
using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage.File; // Namespace for Azure File storage
namespace PlayList
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }
        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .ConfigureAppConfiguration((hostContext, config) =>
                {
                    IHostingEnvironment env = hostContext.HostingEnvironment;
                    // delete all default configuration providers
                    config.Sources.Clear();
                    config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                        .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
                        .AddJsonFile("config.json", optional: false, reloadOnChange: true)
                        .SetBasePath(env.ContentRootPath)
                        .AddEnvironmentVariables();
                })
                .Build();
    }
}
