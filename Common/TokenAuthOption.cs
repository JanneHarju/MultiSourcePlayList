
using Microsoft.IdentityModel.Tokens;
using System;


 
 namespace PlayList
{
  public class TokenAuthOption
    {
        public static string Audience { get; } = "MyAudience";
        public static string Issuer { get; } = "MyIssuer";
        public static SymmetricSecurityKey Key { get; } = new SymmetricSecurityKey(KeyHelper.GenerateKey());
        public static SigningCredentials SigningCredentials { get; } = new SigningCredentials(Key, Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature);

        public static TimeSpan ExpiresSpan { get; } = TimeSpan.FromHours(12);
        public static TimeSpan ExtendedExpiresSpan { get; } = TimeSpan.FromDays(365*10);
        public static TimeSpan GetExpiresSpan(bool rememberme)
        {
            return rememberme ? ExtendedExpiresSpan : ExpiresSpan;
        }
        public static string TokenType { get; } = "Bearer"; 
    }
   
}