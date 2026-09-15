using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DeviceHeartRate
{
    public class Utils
    {

        public static string GetDBConnection()
        {
            //string connection = ConfigurationManager.ConnectionStrings["EosParkingContextConnection"].ToString();
            string connection = ConfigurationManager.ConnectionStrings["DeviceHeartRate.Properties.Settings.EosParkingConnectionString"].ConnectionString;
            return connection; // @"Data Source=(Local)\sql2019;Initial Catalog=EosParking;Persist Security Info=True;User ID=sa;password=12345678";
        }

        public static void OpenGateByService(string ip, int port, int relay)
        {
            try
            {
                var connString = Utils.GetDBConnection();// @"Data Source=(Local)\sql2019;Initial Catalog=EosParking;Persist Security Info=True;User ID=sa;password=12345678";
                string query = @"INSERT INTO [dbo].[OpenGateRequest]([IP],[Port],[Relay],[RequestTime],[PersistOn])
     VALUES('%IP%',%Port%,%Relay%,getdate(), getdate())"
                                    .Replace("%IP%", ip)
                                    .Replace("%Port%", port.ToString())
                                    .Replace("%Relay%", relay.ToString());
                try
                {
                    SqlConnection connection = new SqlConnection(connString);
                    connection.Open();

                    SqlCommand command = new SqlCommand(query, connection);
                    command.ExecuteNonQuery();
                    connection.Close();
                    MessageBox.Show("درخواست بازکردن راهبند به سرویس ارسال گردید");
                }

                catch (Exception ex)
                {
                    MessageBox.Show("Send Error!" + Environment.NewLine + ex.Message);

                }
            }
            catch (Exception)
            {
                // ignored
            }
        }



        public static List<LastTraffic> GetLastTraffic()
        {
            string cs = GetDBConnection();
            List<LastTraffic> traffics = new List<LastTraffic>();
            using (SqlConnection conn = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand("dbo.spReportParking_Last10Traffic", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    LastTraffic tr = new LastTraffic();
                    tr.TrafficType = reader["TrafficType"].ToString();
                    tr.TrafficDateTime_FA = reader["TrafficDateTime_FA"].ToString();
                    tr.Plate = reader["Plate"].ToString();
                    tr.DoorName = reader["DoorName"].ToString();
                    tr.FullName = reader["Name"].ToString() + " " + reader["Family"].ToString();
                    traffics.Add(tr);
                }

            }

            return traffics;
        }

    }
}
