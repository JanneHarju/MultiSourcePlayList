using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;


namespace PlayList
{
    public class CustomJwtDataFormat : ISecureDataFormat<AuthenticationTicket>
    {
        private readonly string algorithm;
        private readonly ILogger _logger;
        private readonly TokenValidationParameters validationParameters;

        public CustomJwtDataFormat(
            string algorithm,
            TokenValidationParameters validationParameters
            ,ILoggerFactory loggerFactory)
        {
            this.algorithm = algorithm;
            this.validationParameters = validationParameters;
            _logger = loggerFactory.CreateLogger("CustomJwtDataFormat");  
        }

        public AuthenticationTicket Unprotect(string protectedText)
            => Unprotect(protectedText, null);

        public AuthenticationTicket Unprotect(string protectedText, string purpose)
        {
            _logger.LogCritical("Täällä ollaan.");
            var handler = new JwtSecurityTokenHandler();
            ClaimsPrincipal principal = null;
            SecurityToken validToken = null;

            try
            {

                _logger.LogCritical("Kukkuu ollaan.");
                principal = handler.ValidateToken(protectedText, this.validationParameters, out validToken);

                _logger.LogCritical("Kukkuu ollaan2.");
                var validJwt = validToken as JwtSecurityToken;

                if (validJwt == null)
                {
                    throw new ArgumentException("Invalid JWT");
                }

                if (!validJwt.Header.Alg.Equals(algorithm, StringComparison.Ordinal))
                {
                    throw new ArgumentException($"Algorithm must be '{algorithm}'");
                }
            }
            catch (SecurityTokenValidationException)
            {

                _logger.LogCritical("Täällä ollaan2.");
                return null;
            }
            catch (ArgumentException)
            {

                _logger.LogCritical("Täällä ollaan3.");
                return null;
            }

            // VALIDATION PASSED
            return new AuthenticationTicket(principal, new AuthenticationProperties(), "Cookie");
        }
        
        public string Protect(AuthenticationTicket data)
        {
            throw new NotImplementedException();
        }

        public string Protect(AuthenticationTicket data, string purpose)
        {
            throw new NotImplementedException();
        }
    }
}