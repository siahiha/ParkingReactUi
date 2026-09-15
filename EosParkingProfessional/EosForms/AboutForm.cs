using EosParking.Core.Models;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Reflection;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    partial class AboutForm : EosBaseForm
    {
        private string imei = "";
        public AboutForm()
        {

            
            InitializeComponent();
            //this.Text = String.Format("About {0}", AssemblyTitle);
            this.labelProductName.Text = " سیستم مدیریت پارکینگ " + AssemblyVersion;// AssemblyProduct;

            this.lblInfoFromLock.Text += $" «موتور پلاک خوان: {LockOprator.ModuleType + 1}» ";

            if (LockOprator.HasCloudParking)
            {
                this.lblInfoFromLock.Text += " «سرویس ابری» ";
                imei = LockOprator.ProductIMEI;
                this.lblIMEI.Text = LockOprator.ProductIMEI + " :IMEI";
            }
            if (LockOprator.HasWebCartable)
            {
                this.lblInfoFromLock.Text += " «کارتابل مجوز خروج» ";
            }

            //this.labelVersion.Text = String.Format("نسخه: {0} ", AssemblyVersion);
            //this.labelCopyright.Text = AssemblyCopyright;
            //this.labelCompanyName.Text = AssemblyCompany;
            //this.textBoxDescription.Text = AssemblyDescription;
        }

        #region Assembly Attribute Accessors

        public string AssemblyTitle
        {
            get
            {
                object[] attributes = Assembly.GetExecutingAssembly().GetCustomAttributes(typeof(AssemblyTitleAttribute), false);
                if (attributes.Length > 0)
                {
                    AssemblyTitleAttribute titleAttribute = (AssemblyTitleAttribute)attributes[0];
                    if (titleAttribute.Title != "")
                    {
                        return titleAttribute.Title;
                    }
                }
                return System.IO.Path.GetFileNameWithoutExtension(Assembly.GetExecutingAssembly().CodeBase);
            }
        }

        public string AssemblyVersion
        {
            get
            {
                return Assembly.GetExecutingAssembly().GetName().Version.ToString();
            }
        }

        public string AssemblyDescription
        {
            get
            {
                object[] attributes = Assembly.GetExecutingAssembly().GetCustomAttributes(typeof(AssemblyDescriptionAttribute), false);
                if (attributes.Length == 0)
                {
                    return "";
                }
                return ((AssemblyDescriptionAttribute)attributes[0]).Description;
            }
        }

        public string AssemblyProduct
        {
            get
            {
                object[] attributes = Assembly.GetExecutingAssembly().GetCustomAttributes(typeof(AssemblyProductAttribute), false);
                if (attributes.Length == 0)
                {
                    return "";
                }
                return ((AssemblyProductAttribute)attributes[0]).Product;
            }
        }

        public string AssemblyCopyright
        {
            get
            {
                object[] attributes = Assembly.GetExecutingAssembly().GetCustomAttributes(typeof(AssemblyCopyrightAttribute), false);
                if (attributes.Length == 0)
                {
                    return "";
                }
                return ((AssemblyCopyrightAttribute)attributes[0]).Copyright;
            }
        }

        public string AssemblyCompany
        {
            get
            {
                object[] attributes = Assembly.GetExecutingAssembly().GetCustomAttributes(typeof(AssemblyCompanyAttribute), false);
                if (attributes.Length == 0)
                {
                    return "";
                }
                return ((AssemblyCompanyAttribute)attributes[0]).Company;
            }
        }
        #endregion

        private void linkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            Process.Start("http://www.elmosanat.com");
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void lblIMEI_DoubleClick(object sender, EventArgs e)
        {
            
        }

        private void lblIMEI_Click(object sender, EventArgs e)
        {

        }

        private void labelVersion_Click(object sender, EventArgs e)
        {

        }

        private void lblIMEI_DoubleClick_1(object sender, EventArgs e)
        {
            Clipboard.SetText(imei);
        }
    }
}
