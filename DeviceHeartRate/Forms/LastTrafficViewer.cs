using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DeviceHeartRate.Forms
{
    public partial class LastTrafficViewer : Form
    {
        public LastTrafficViewer()
        {
            InitializeComponent();
        }

        private void timerGetTraffics_Tick(object sender, EventArgs e)
        {
            var traffics = Utils.GetLastTraffic();
            if (traffics.Count >= 1)
            {
                trafficView1.Visible = true;
                trafficView1.Plate = traffics[0].Plate;
                trafficView1.TrafficTime = traffics[0].TrafficDateTime_FA;
                trafficView1.TrafficType = traffics[0].TrafficType;
            }
            else
            {
                trafficView1.Visible = false;
            }

            if (traffics.Count >= 2)
            {
                trafficView2.Visible = true;
                trafficView2.Plate = traffics[1].Plate;
                trafficView2.TrafficTime = traffics[1].TrafficDateTime_FA;
                trafficView2.TrafficType = traffics[1].TrafficType;
            }
            else
            {
                trafficView2.Visible = false;
            }

            if (traffics.Count >= 3)
            {
                trafficView3.Visible = true;
                trafficView3.Plate = traffics[2].Plate;
                trafficView3.TrafficTime = traffics[2].TrafficDateTime_FA;
                trafficView3.TrafficType = traffics[2].TrafficType;
            }
            else
            {
                trafficView3.Visible = false;
            }



        }
    }
}
