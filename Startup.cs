using System;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft;
using Microsoft.AspNetCore.Authentication.Cookies;
using Newtonsoft.Json;
using PlayList.Controllers;
using PlayList.Repositories;
using PlayList.Models;

namespace PlayList
{
    public class Startup
    {

        private IHostingEnvironment CurrentEnvironment{ get; set; } 
        
        public Startup(IConfiguration configuration, IHostingEnvironment environment)
        {
            Configuration = configuration;
            CurrentEnvironment = environment;
        }
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            if(CurrentEnvironment.IsDevelopment())
            {
                var connection = Configuration["Development:SqliteConnectionString"];
                services.AddDbContext<MultiSourcePlaylistContext>(options =>
                    options.UseSqlite(connection)
                );
            }
            else
            {
                var connection = Configuration["Production:SqlServerConnectionString"];
                services.AddDbContext<MultiSourcePlaylistContext>(options =>
                    options.UseSqlServer(connection)
                );
            }
            services.AddSingleton<IConfiguration>(Configuration);
            // Enable the use of an [Authorize("Bearer")] attribute on methods and classes to protect.
            services.AddAuthorization(auth =>
            {
                auth.AddPolicy("Bearer", new AuthorizationPolicyBuilder()
                    .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme‌​)
                    .RequireAuthenticatedUser().Build());
            });
            var tokenValidationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = TokenAuthOption.Key,
                ValidAudience = TokenAuthOption.Audience,
                ValidIssuer = TokenAuthOption.Issuer,
                // When receiving a token, check that we've signed it.
                ValidateIssuerSigningKey = true,
                // When receiving a token, check that it is still valid.
                ValidateLifetime = true,
                // This defines the maximum allowable clock skew - i.e. provides a tolerance on the token expiry time 
                // when validating the lifetime. As we're creating the tokens locally and validating them on the same 
                // machines which should have synchronised time, this can be set to zero. Where external tokens are
                // used, some leeway here could be useful.
                ClockSkew = TimeSpan.FromMinutes(0)
            };
            // If you don't want the cookie to be automatically authenticated and assigned to HttpContext.User, 
            // remove the CookieAuthenticationDefaults.AuthenticationScheme parameter passed to AddAuthentication.
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options => 
                {
                    options.Cookie.Name = "access_token";
                    options.Cookie.SameSite = SameSiteMode.None;
                })
                .AddJwtBearer(options => 
                {
                    options.TokenValidationParameters = tokenValidationParameters;
                });
            
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins",
                    builder =>
                    {
                        builder
                            .AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                    });
            });
            services.AddScoped<IMultiSourcePlaylistRepository, MultiSourcePlaylistRepository>();

            // Add framework services.
            services.AddMvc().AddJsonOptions(options =>
            {
                options.SerializerSettings.ContractResolver = new DefaultContractResolver();
                options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            });
            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();
            var log = loggerFactory.CreateLogger("Startup");
            
            app.UseAuthentication();
            
            var angularRoutes = new[] {
                "/login",
                "/main"
            };
            app.Use(async (context, next) =>
            {
                await next();

                if (context.Response.StatusCode == 404 &&
                    !Path.HasExtension(context.Request.Path.Value) &&
                    !context.Request.Path.Value.StartsWith("/api/"))
                {
                    context.Request.Path = "/index.html";
                    await next();
                }
                else if (context.Request.Path.HasValue && null != angularRoutes.FirstOrDefault(
                    ar => context.Request.Path.Value.StartsWith(ar, StringComparison.OrdinalIgnoreCase)))
                {
                    context.Request.Path = new PathString("/");
                }
            });

            app.UseCors("AllowAllOrigins");
            //app.UseCors("AllowAllOriginsForMusiple");
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
