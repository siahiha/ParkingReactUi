using EosParkingProfessional.EosForms;
using System;
using System.Threading;
using System.Windows.Forms;

namespace EosParkingProfessional
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Thread.CurrentThread.CurrentUICulture =
            new System.Globalization.CultureInfo("fa-IR");
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            if( new Splash().ShowDialog()!=DialogResult.OK)
                return;

            Application.Run(new LoginForm());
        }
    }
}
