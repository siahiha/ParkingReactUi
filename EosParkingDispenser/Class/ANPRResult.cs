using System;
using System.Drawing;

namespace EosParkingDispenser.Class
{
    public class ANPRResult
    {
        public DateTime currentServerTime { get; set; }
        public string currentServerTime_Shamsi { get; set; }
        public string plateDetected { get; set; }
        public string plateDetected_fa { get; set; }
        public Image plateImage { get; set; }
        public Image carImage { get; set; }
        public DateTime plateDetectedTime { get; set; }
        public bool dbConnected { get; set; }
        public string errorMessage { get; set; }

    }
}