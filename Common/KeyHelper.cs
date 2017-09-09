using System.Security.Cryptography;
using System;

namespace PlayList
{
     public class KeyHelper
    {
        public static byte[] GenerateKey()
        {
            return (new Guid("1e283e11-fe6b-43b8-a042-b46cc3873f0d")).ToByteArray();
        }
    }
}