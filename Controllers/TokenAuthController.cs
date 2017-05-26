using System;
//using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using PlayList.Models;
using PlayList.Repositories;
using Microsoft.Extensions.Logging;


namespace PlayList
{
    [Produces("application/json")]
    [Route("api/tokenauth")]
    public class TokenAuthController : Controller
    {
        private readonly IMultiSourcePlaylistRepository _multiSourcePlaylistRepository;
        private readonly ILogger _logger;
        public TokenAuthController(IMultiSourcePlaylistRepository multiSourcePlaylistRepository,
                ILoggerFactory loggerFactory)
        :base()
        {
            _multiSourcePlaylistRepository = multiSourcePlaylistRepository;
            _logger = loggerFactory.CreateLogger("TokenAuthController");  
        }
        [HttpPut("Login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody]User user)
        {
            _logger.LogCritical("user "+ JsonConvert.SerializeObject(user));
            User existUser = _multiSourcePlaylistRepository.GetAllUsers().FirstOrDefault(u => u.Username == user.Username && u.Password == user.Password);

            _logger.LogCritical("exists user "+ JsonConvert.SerializeObject(existUser));
            if (existUser != null)
            {

                var requestAt = DateTime.Now;
                var expiresIn = requestAt + TokenAuthOption.ExpiresSpan;
                var token = GenerateToken(existUser, expiresIn);

                return Json(new RequestResult
                {
                    State = RequestState.Success,
                    Data = new
                    {
                        requertAt = requestAt,
                        expiresIn = TokenAuthOption.ExpiresSpan.TotalSeconds,
                        tokeyType = TokenAuthOption.TokenType,
                        accessToken = token
                    }
                });
            }
            else
            {
                return Json(new RequestResult
                {
                    State = RequestState.Failed,
                    Msg = "Username or password is invalid"
                });
            }
        }
        [HttpPost("Register")]
        [AllowAnonymous]
        public IActionResult Register([FromBody]User user)
        {
            _logger.LogCritical("exists user "+ JsonConvert.SerializeObject(user));
            User existUser = _multiSourcePlaylistRepository.GetAllUsers().FirstOrDefault(u => u.Username == user.Username);

            _logger.LogCritical("exists user "+ JsonConvert.SerializeObject(existUser));
            if (existUser == null)
            {
                _multiSourcePlaylistRepository.PostUser(user);

                User newUser = _multiSourcePlaylistRepository.GetAllUsers().FirstOrDefault(u => u.Username == user.Username);
                
                _logger.LogCritical("exists user "+ JsonConvert.SerializeObject(newUser));
                if(newUser != null)
                {
                    var requestAt = DateTime.Now;
                    var expiresIn = requestAt + TokenAuthOption.ExpiresSpan;
                    var token = GenerateToken(newUser, expiresIn);

                    return Json(new RequestResult
                    {
                        State = RequestState.Success,
                        Data = new
                        {
                            requertAt = requestAt,
                            expiresIn = TokenAuthOption.ExpiresSpan.TotalSeconds,
                            tokeyType = TokenAuthOption.TokenType,
                            accessToken = token
                        }
                    });
                }
                else
                {
                    return Json(new RequestResult
                    {
                        State = RequestState.Failed,
                        Msg = "Adding new user failed."
                    });
                }
            }
            else
            {
                return Json(new RequestResult
                {
                    State = RequestState.Failed,
                    Msg = "Username is already in use."
                });
            }
        }

        private string GenerateToken(PlayList.Models.User user, DateTime expires)
        {
            var handler = new JwtSecurityTokenHandler();

            ClaimsIdentity identity = new ClaimsIdentity(
                new GenericIdentity(user.Username, "TokenAuth"),
                new[] { new Claim("Id", user.Id.ToString())}
            );
            HttpContext.Authentication.SignInAsync("Bearer",
                new ClaimsPrincipal(identity));
            var securityToken = handler.CreateToken(new SecurityTokenDescriptor
            {
                Issuer = TokenAuthOption.Issuer,
                Audience = TokenAuthOption.Audience,
                SigningCredentials = TokenAuthOption.SigningCredentials,
                Subject = identity,
                Expires = expires
            });
            return handler.WriteToken(securityToken);
        }

        [HttpGet]
        [Authorize("Bearer")]
        public IActionResult GetUserInfo()
        {
            var claimsIdentity = User.Identity as ClaimsIdentity;

            var Id = claimsIdentity.Claims.FirstOrDefault(claim => claim.Type == "Id").Value;
            return Json(new RequestResult
            {
                State = RequestState.Success,
                Data = new { Id = Id,
                            UserName = claimsIdentity.Name,
                            IsAuthenticated = claimsIdentity.IsAuthenticated }
            });
        }
    }
}
