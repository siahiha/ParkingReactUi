using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DeviceHeartRate
{
    public partial class frmMain : Form
    {
        public frmMain()
        {
            InitializeComponent();
        }

        private void frmMain_Load(object sender, EventArgs e)
        {
            // TODO: This line of code loads data into the 'eosParking_workDataSet.spViewDiviceHeartRate' table. You can move, or remove it, as needed.
            this.spViewDiviceHeartRateTableAdapter.Fill(this.eosParking_workDataSet.spViewDiviceHeartRate);

        }

        private void timerRefreshData_Tick(object sender, EventArgs e)
        {
            eosParking_workDataSet.Clear();
            eosParking_workDataSet.spViewDiviceHeartRate.Clear();
            spViewDiviceHeartRateTableAdapter.Fill(eosParking_workDataSet.spViewDiviceHeartRate);
        }

        private void btnOpen_Click(object sender, EventArgs e)
        {
            //OpenGateByService();
        }


        private string GetDBConnection()
        {
            //string connection = ConfigurationManager.ConnectionStrings["EosParkingContextConnection"].ToString();
            string connection = ConfigurationManager.ConnectionStrings["DeviceHeartRate.Properties.Settings.EosParkingConnectionString"].ConnectionString;
            return connection; // @"Data Source=(Local)\sql2019;Initial Catalog=EosParking;Persist Security Info=True;User ID=sa;password=12345678";
        }

        private void OpenGateByService(string ip, int port, int relay)
        {
            try
            {
                var connString = GetDBConnection();// @"Data Source=(Local)\sql2019;Initial Catalog=EosParking;Persist Security Info=True;User ID=sa;password=12345678";
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

        private void dataGridView1_DoubleClick(object sender, EventArgs e)
        {
            try
            {
                var deviceType = dataGridView1.CurrentRow.Cells[4].Value.ToString();
                if (deviceType.ToLower() == "g4")
                {
                    var ip = dataGridView1.CurrentRow.Cells[0].Value.ToString();
                    var port = dataGridView1.CurrentRow.Cells[1].Value.ToString();
                    var relay = dataGridView1.CurrentRow.Cells[2].Value.ToString();
                    if (!String.IsNullOrEmpty(ip))
                    {
                        OpenGateByService(ip, Int32.Parse(port), Int32.Parse(relay));
                    }
                }
            }
            catch (Exception)
            {
                // ignored
            }
        }
    }
}
