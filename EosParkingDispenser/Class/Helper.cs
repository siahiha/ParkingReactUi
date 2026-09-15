using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net.Sockets;

namespace EosParkingDispenser.Class
{
    class Helper
    {

        public static string DispenserHexToCardID(string s)
        {
            string sResult = "0";
            try
            {
                string s1 = s.Substring(0, 4);
                string s2 = s.Substring(4, 4);
                long n1 = Int64.Parse(s1, System.Globalization.NumberStyles.HexNumber);
                long n2 = Int64.Parse(s2, System.Globalization.NumberStyles.HexNumber);
                sResult = $"{n2.ToString().PadLeft(5, '0')}{n1.ToString().PadLeft(5, '0')}";
            }
            catch (Exception)
            {
                // ignored
            }

            return sResult;
        }
        public static bool IsPortOpen(string host, int port, int timeoutSec)
        {
            bool ret_ = false;
            try
            {
                TimeSpan timeout_ = DateTime.Now.AddSeconds(timeoutSec) - DateTime.Now;
                using (var client = new TcpClient())
                {
                    var result = client.BeginConnect(host, port, null, null);
                    var success = result.AsyncWaitHandle.WaitOne(timeout_);
                    ////client.EndConnect(result);
                    //return success;
                    ret_ = success;
                }
            }
            catch
            {
                ret_ = false;
                //return false;
            }
            return ret_;
        }

    }
}
