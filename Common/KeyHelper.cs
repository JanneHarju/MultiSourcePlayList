using System.Security.Cryptography;
using System;

namespace PlayList
{
     public class KeyHelper
    {
        public static byte[] GenerateKey()
        {
            return Guid.NewGuid().ToByteArray();
        }
    }
}