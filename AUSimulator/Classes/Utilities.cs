using System;
using System.Text;

namespace AUSimulator.Classes
{
    public class Utilities
    {
        public static string Base64Encoder(String cToEncode)
        {
            var encoder = new UTF8Encoding();

            var cByteArray = encoder.GetBytes(cToEncode);

            var result = Convert.ToBase64String(cByteArray);
            return result;

        }
    }
}