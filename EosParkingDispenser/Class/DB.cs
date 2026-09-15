using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;

namespace EosParkingDispenser.Class
{
    public class DB
    {
        public static ANPRResult getPlate()
        {
            ANPRResult anprResult = new ANPRResult();
            anprResult.dbConnected = false;
            
            try
            {

                var con = ConfigurationManager.ConnectionStrings["EosParkingContextConnection"].ToString()
                    .Replace("@@password", "mj@12345678"); ;
                string cameraID = "3";
                int plateDetectedElpasedSecAgo = 15;
                try { cameraID = ConfigurationManager.AppSettings["CameraID"].ToString(); } catch { }
                try { plateDetectedElpasedSecAgo = Int16.Parse(ConfigurationManager.AppSettings["PlateDetectedElpasedSecAgo"].ToString()); } catch { }

                DateTime lastDateTime = DateTime.Now.AddSeconds(plateDetectedElpasedSecAgo * -1);

                using (SqlConnection myConnection = new SqlConnection(con))
                {
                    string query = "dbo.spSelectPlate '@lastDateTime',@CameraId, @elpasedSecond"
                                .Replace("@lastDateTime", lastDateTime.ToString("MM/dd/yyyy HH:mm:ss"))
                                .Replace("@CameraId", cameraID)
                                .Replace("@elpasedSecond", plateDetectedElpasedSecAgo.ToString());
                    SqlCommand oCmd = new SqlCommand(query, myConnection);
                    SqlCommand getTime = new SqlCommand("select getdate() as ServerTime , format(getdate(),'yyyy/MM/dd HH:mm:ss','fa') as ServerTime_Fa", myConnection);
                    myConnection.Open();
                    anprResult.dbConnected = (myConnection.State == ConnectionState.Open);
                    using (SqlDataReader oReader = oCmd.ExecuteReader())
                    {
                        while (oReader.Read())
                        {
                            anprResult.plateDetected = oReader["PlateId"].ToString();
                            anprResult.plateDetected_fa = oReader["PlateIdFA"].ToString();
                            anprResult.plateDetectedTime = Convert.ToDateTime(oReader["InsertTime"]);

                        }

                    }
                    using (SqlDataReader oReader = getTime.ExecuteReader())
                    {
                        while (oReader.Read())
                        {
                            anprResult.currentServerTime_Shamsi = oReader["ServerTime_Fa"].ToString();
                            anprResult.currentServerTime = Convert.ToDateTime(oReader["ServerTime"]);

                        }

                    }
                    myConnection.Close();
                }
            }
            catch (Exception ex)
            {
                anprResult.errorMessage = ex.Message;
            }
            return anprResult;
        }

        public static FaceResult  getFace()
        {
            FaceResult faceResult = new FaceResult();
            faceResult.dbConnected = false;
            try
            {

                var con = ConfigurationManager.ConnectionStrings["EosParkingContextConnection"].ToString()
                    .Replace("@@password", "mj@12345678");
                int faceDetectedElpasedSecAgo = 30;
                try { faceDetectedElpasedSecAgo = Int16.Parse(ConfigurationManager.AppSettings["FaceDetectedElpasedSecAgo"].ToString()); } catch { }

                using (SqlConnection myConnection = new SqlConnection(con))
                {
                    string query = "dbo.spGetFaceEvent @elpasedEventTime"
                                .Replace("@elpasedEventTime", faceDetectedElpasedSecAgo.ToString());
                    SqlCommand oCmd = new SqlCommand(query, myConnection);
                    myConnection.Open();
                    faceResult.dbConnected = (myConnection.State == ConnectionState.Open);
                    using (SqlDataReader oReader = oCmd.ExecuteReader())
                    {
                        while (oReader.Read())
                        {
                            faceResult.faceEventID = oReader["faceEventID"].ToString();
                            faceResult.facePersonName = oReader["facePersonName"].ToString();
                            faceResult.parkingPersonName = oReader["parkingPersonName"].ToString();
                            faceResult.FaceTag = oReader["Tag"].ToString();
                            faceResult.facePersistOn = Convert.ToDateTime(oReader["PersistOn"]);
                            faceResult.facePersistOn_fa = oReader["PersistOn_fa"].ToString();
                            faceResult.faceDetectAgo = Int32.Parse(oReader["secAgo"].ToString());

                            if (DBNull.Value != oReader["parkingMemberID"])
                            {   faceResult.parkingMemberID = Int32.Parse(oReader["parkingMemberID"].ToString());    }

                            if (DBNull.Value != oReader["validFace"])
                            { faceResult.validFace = (Int32.Parse(oReader["validFace"].ToString()) == 1) ? true : false; }

                            if (DBNull.Value != oReader["elpasedEventTime"])
                            { faceResult.elpasedEventTime = Int32.Parse(oReader["elpasedEventTime"].ToString()); }

                            faceResult.CameraLastConnect = Convert.ToDateTime(oReader["CameraLastConnect"]);
                            faceResult.CameraLastConnect_fa = oReader["CameraLastConnect_fa"].ToString();
                            faceResult.ElpasedCameraLastConnectedSec = Int32.Parse(oReader["ElpasedCameraLastConnectedSec"].ToString());
                            faceResult.faceDetecActivate = (Int32.Parse(oReader["faceDetecActivate"].ToString()) == 1) ? true : false;


                            if (DBNull.Value != oReader["mustGetCard"])
                            { faceResult.mustGetCard = (Int32.Parse(oReader["mustGetCard"].ToString()) == 1) ? true : false; }

                            if (DBNull.Value != oReader["mustGetReceipt"])
                            { faceResult.mustGetReceipt = (Int32.Parse(oReader["mustGetReceipt"].ToString()) == 1) ? true : false; }


                            try
                            {
                                //faceResult.personImage = (byte[])oReader["PersonImage"];
                                byte[] imageData = (byte[])oReader["PersonImage"];

                                using (MemoryStream ms = new MemoryStream(imageData))
                                {
                                    faceResult.personImage = Image.FromStream(ms);
                                }

                            } catch { }
                        }

                    }
                    myConnection.Close();
                }
            }
            catch (Exception ex){
                faceResult.ErrorMessage = ex.Message;
            }
            return faceResult;
        }



        public static EnteranceResult enterCarToParking(int doorID , string plate, string cardNumber, string faceID, bool demoFace)
        {
            EnteranceResult enterResult = new EnteranceResult();
            //string msg = "";
            try
            {

                var con = ConfigurationManager.ConnectionStrings["EosParkingContextConnection"].ToString()
                    .Replace("@@password", "mj@12345678");
                
                using (SqlConnection myConnection = new SqlConnection(con))
                {
                    string query = "dbo.trafficDumps_Add_Dispenser2 N'@plate',@DoorId, N'@cardNumber', N'@faceID'"
                                .Replace("@plate", plate)
                                .Replace("@DoorId", doorID.ToString())
                                .Replace("@cardNumber", cardNumber)
                                .Replace("@faceID", faceID);

                    if (demoFace)
                    {

                        query = "dbo.trafficDumps_Add_Dispenser_face  N'@faceID'"
                                    .Replace("@faceID", faceID);
                    }
                    SqlCommand oCmd = new SqlCommand(query, myConnection);
                    myConnection.Open();
                    using (SqlDataReader oReader = oCmd.ExecuteReader())
                    {
                        while (oReader.Read())
                        {
                            enterResult.trafficDumpID = Convert.ToInt32(oReader["trafficID"].ToString());
                            enterResult.entranceTime = Convert.ToDateTime(oReader["enterTime"]);
                            enterResult.parkingID = Convert.ToInt32(oReader["parkingID"].ToString());
                            enterResult.parkingName = oReader["parkingName"].ToString();

                        }

                    }
                    myConnection.Close();
                }
            }
            catch (Exception ex)
            {
                var ss = ex.Message;
            }
            return enterResult;
        }

    }
}
