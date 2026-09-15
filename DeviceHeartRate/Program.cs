using DeviceHeartRate.Forms;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DeviceHeartRate
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            //Application.Run(new frmMain());


            switch ((ConfigurationManager.AppSettings["ViewModel"]?.Trim().ToLower()))
            {
                case "heartrate":
                    Application.Run(new frmMain());
                    break;

                case "lasttraffic":
                    Application.Run(new LastTrafficViewer());
                    break;
            }

        }
    }
}
