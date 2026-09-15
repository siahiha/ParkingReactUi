using System;

namespace EosParkingDispenser.Class
{
    public class EnteranceResult
    {
        public DateTime entranceTime { get; set; }
        public Int32 trafficDumpID { get; set; }
        public Int64 parkingID { get; set; }
        public string parkingName { get; set; }

        public string msg { get; set; }

    }
}