using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using EosParking.Core.Helpers;
using EosParking.Core.Models;
using EosParking.Data.EF;
using EosParking.Data.EF.Entities;
using EosParking.Data.EF.Repository;
using EosParkingProfessional.Models;

namespace EosParkingProfessional
{
    public partial class Splash : EosParkingTools.EosForms.EosBaseForm
    {
        public string AssemblyVersion
        {
            get
            {
                return Assembly.GetExecutingAssembly().GetName().Version.ToString();
            }
        }
        private void SetProgressText(string text)
        {
            if (InvokeRequired)
                Invoke(new MethodInvoker(()=> { SetProgressText(text); }));
            progressLabel.Text = text;
            progressLabel.Refresh();
        }
        private bool FadeIn(int sleep=50)
        {
            this.Opacity = 0;
            FormBorderEffect = DevExpress.XtraEditors.FormBorderEffect.None;
            for(int i=0;i<100;i+=5)
            {
                this.Opacity = i/100.0;
                System.Threading.Thread.Sleep(sleep);
                Application.DoEvents();
            }
            FormBorderEffect = DevExpress.XtraEditors.FormBorderEffect.Shadow;
            return true;
        }
        private bool FadeOut(int sleep=50)
        {
            this.Opacity = 1;
            FormBorderEffect = DevExpress.XtraEditors.FormBorderEffect.None;
            for (int i = 100; i >0; i-=5)
            {
                this.Opacity = i/100.0;
                System.Threading.Thread.Sleep(sleep);
                Application.DoEvents();
            }
            FormBorderEffect = DevExpress.XtraEditors.FormBorderEffect.Shadow;
            return true;
        }

        [DllImport("gdi32.dll", EntryPoint = "AddFontResourceW", SetLastError = true)]
        public static extern int AddFontResource([In][MarshalAs(UnmanagedType.LPWStr)]
                                         string lpFileName);

        private static bool IsFontInstalled(string name)
        {
            using (System.Drawing.Text.InstalledFontCollection fontsCollection = new System.Drawing.Text.InstalledFontCollection())
            {
                var c = fontsCollection.Families.Select(x => x.Name).ToList();
                return fontsCollection.Families
                    .Any(x => x.Name.Equals(name, StringComparison.CurrentCultureIgnoreCase));
            }
        }

        bool InstallFonts()
        {
            try
            {
                bool resultInstal = false;
                if (!IsFontInstalled("EntezareZohoor C3"))
                {
                    var result = AddFontResource(Application.StartupPath + @"\Font\EntezarC3_v2.0.1.ttf");
                    var error = Marshal.GetLastWin32Error();
                    resultInstal = error == 0;
                }
                if (!IsFontInstalled("EntezareZohoor D8"))
                {
                    var result = AddFontResource(Application.StartupPath + @"\Font\EntezarD8_v2.0.1.ttf");
                    var error = Marshal.GetLastWin32Error();
                    resultInstal = error == 0;
                }
                if (!IsFontInstalled("EntezareZohoor D5"))
                {
                    var result = AddFontResource(Application.StartupPath + @"\Font\EntezarD5_v2.0.1.ttf");
                    var error = Marshal.GetLastWin32Error();
                    resultInstal = error == 0;
                }
            return resultInstal ;
            }
            catch { return false; }
        }

        public Splash()
        {
            InitializeComponent();
            //EosParkingTools.EosForms.EosDialogForm.ShowQuestion("آیا مطمئنید؟", true);
            //MessageBox.Show("آیا مطمئنید؟", "");
            //using (var c = new EosParkingContext())
            //{
            //    //c.Users.Add(new UserEntity { PersistOn = DateTime.Now });
            //}
            AllowTransparency = true;
            this.Opacity = 0;
            SetRounding(5);
            //glassDesigner1.Draw();
            //using (var r = new UserRepository())
            //{
            //    r.GetAll();
            //}
            labelVersion.Text= String.Format("نسخه {0}", AssemblyVersion);
        }

        private void Splash_Shown(object sender, EventArgs e)
        {
            FadeIn();
            Loading();
        }

        public class hi
        {
            public string s{ get; set; }
        }
        private void Loading()
        {

            SetProgressText("بررسی فونت های برنامه");
            InstallFonts();
            for(int i=0; i<=20;i++)
            {
                System.Threading.Thread.Sleep(50);
                Application.DoEvents();
            }
            SetProgressText("درحال دریافت تنظیمات اولیه");
            if (!PublicVariables.RefreshVlaues())
            {
                EosParkingTools.EosForms.EosDialogForm.ShowError("تنظیمات اولیه سیستم پارکینگ صحیص نیست. لطفا تنظیمات را بررسی نمایید.");
                Close();
                Application.Exit();

            }

            try
            {
                SetProgressText("درحال بررسی قفل: اتصال به سرویس");
                string lockError;
                if (!LockOprator.Start(out lockError))
                {
                    MessageShowError(lockError);
                    Application.Exit();
                }
            }
            catch (Exception ex) { MessageShowError(ex); Application.Exit(); }


            SetProgressText("درحال اتصال به سرور");
            for(int i=0; i<=20;i++)
            {
                System.Threading.Thread.Sleep(50);
                Application.DoEvents();
            }
            try
            {
                var x = WebHelper.GetFromLink(PublicVariables.ServerAddress + "api/Utils/hi?key=asd");
            }
            catch(Exception ex)
            {
                EosParkingTools.EosForms.EosDialogForm.ShowError(ex ,"اتصال با سرویس پارکینگ برقرار نشد." );
                Close();
                Application.Exit();
            }
            try
            {
                PublicVariables.GetParkingTitles();
            }
            catch { }
            DialogResult = DialogResult.OK;
           // Close();
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            //FadeOut();
            //Application.DoEvents();
            //FadeIn();
        }

        private void Splash_Load(object sender, EventArgs e)
        {

        }

        private void labelVersion_Click(object sender, EventArgs e)
        {

        }
    }
}
