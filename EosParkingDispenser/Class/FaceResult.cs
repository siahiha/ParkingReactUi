using System;
using System.Drawing;

namespace EosParkingDispenser.Class
{
    public class FaceResult
    {
        public string faceEventID { get; set; }
        public string facePersonName { get; set; }
        public string parkingPersonName { get; set; }
        public string FaceTag { get; set; }
        public DateTime facePersistOn { get; set; }
        public string facePersistOn_fa { get; set; }
        public int faceDetectAgo { get; set; }
        public int parkingMemberID { get; set; }
        public bool validFace { get; set; }
        public int elpasedEventTime { get; set; }
        public bool dbConnected { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime CameraLastConnect { get; set; }
        public string CameraLastConnect_fa { get; set; }
        public int ElpasedCameraLastConnectedSec { get; set; }
        public bool faceDetecActivate { get; set; }
        public bool mustGetCard { get; set; }
        public bool mustGetReceipt { get; set; }
        public Image personImage { get; set; }

    }
}