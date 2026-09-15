using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParking.Core.Helpers;

namespace EosParkingTools.EosControls
{
    public partial class BillCheckerControl : UserControl
    {
        #region event
        public event EventHandler ClickOkButton;
        public event EventHandler ClickCancelButton;
        #endregion

        #region properties
        public long Id { get; set; }
        public DateTime EnterDateTime { get; set; }

        public bool IsValidBillIdNumbers { get; private set; }

        public string IdsBillControl { get; private set; }
        #endregion


        #region protected

        protected override void OnGotFocus(EventArgs e)
        {
            base.OnGotFocus(e);
            idNumber1TextBox.TextBoxObject.Focus();
        }
        protected override void OnEnter(EventArgs e)
        {
            base.OnEnter(e);
            idNumber1TextBox.TextBoxObject.Focus();
        }
        #endregion

        public BillCheckerControl()
        {
            InitializeComponent();
        }


        public void Clear()
        {
            idNumber1TextBox.Text = String.Empty;
            idNumber2TextBox.Text = String.Empty;
            IsValidBillIdNumbers = false;
            IdsBillControl = String.Empty;
            errorLabel.Text = String.Empty;
        }
        private void okButton_Click(object sender, EventArgs e)
        {
            if (Int64.TryParse(idNumber1TextBox.Text, out long num1) && Int64.TryParse(idNumber2TextBox.Text, out long num2))
            {
                if (SecurityHelper.IsValidBillControlNumbers(Id, EnterDateTime, num1, num2))
                {
                    IsValidBillIdNumbers = true;
                    IdsBillControl = $"شناسه های کنترلی 1 : {num1}، شناسه کنترلی 2 : {num2}";

                    ClickOkButton?.Invoke(this, new EventArgs());

                }
                else
                {
                    IsValidBillIdNumbers = false;
                    errorLabel.Text = "شناسه های وارد شده معتبر نمی باشد";
                }
            }
            else
            {
                errorLabel.Text = "لطفا برای هر دو شناسه عدد وارد نمایید";
            }
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            IsValidBillIdNumbers = false;
            ClickCancelButton?.Invoke(this, new EventArgs());
        }

        private void idNumber1TextBox_TextValueChanged(object sender, EventArgs e)
        {
            if ((sender as Control).Text.Length > 3 && (sender as Control).Text.Replace("!@^", "\t").Count(q => q == '\t') > 1 /*(sender as Control).Text.StartsWith("!@^") && (sender as Control).Text.EndsWith("!@^")*/)
            {
                int first = (sender as Control).Text.Replace("!@^", "\t").IndexOf("");
                int end = (sender as Control).Text.Replace("!@^", "\t").LastIndexOf("\t") - 1;
                var textValue = (sender as Control).Text.Replace("!@^", "").Substring(first, end - first);
                var qr = SecurityHelper.QRCoderDecrypt(textValue.Replace("!@^", ""));
                var qrcode = qr.Split('#');
                try
                {
                        if (!String.IsNullOrEmpty(qrcode[4]) && qrcode[4].Substring(0, 1) == "1")
                    {
                        idNumber1TextBox.TextBoxObject.Text = qrcode[4].Substring(1);
                        if (String.IsNullOrEmpty(idNumber2TextBox.TextBoxObject.Text))
                        {
                            idNumber2TextBox.Select();
                            idNumber2TextBox.Focus();                        
                        }
                    }

                }
                catch
                {

                }
                (sender as Control).ForeColor = Color.Black;

            }
            else if ((sender as Control).Text.Replace("!@^", "\t").Count(q => q == '\t') > 0)
            { (sender as Control).ForeColor = (sender as Control).BackColor; }
        }

        private void idNumber2TextBox_TextValueChanged(object sender, EventArgs e)
        {
            if ((sender as Control).Text.Length > 3 && (sender as Control).Text.Replace("!@^", "\t").Count(q => q == '\t') > 1 /*(sender as Control).Text.StartsWith("!@^") && (sender as Control).Text.EndsWith("!@^")*/)
            {
                int first = (sender as Control).Text.Replace("!@^", "\t").IndexOf("");
                int end = (sender as Control).Text.Replace("!@^", "\t").LastIndexOf("\t") - 1;
                var textValue = (sender as Control).Text.Replace("!@^", "").Substring(first, end - first);
                var qr = SecurityHelper.QRCoderDecrypt(textValue.Replace("!@^", ""));
                var qrcode = qr.Split('#');
                try
                {
                    if (!String.IsNullOrEmpty(qrcode[4]) && qrcode[4].Substring(0, 1) == "2")
                    {
                        idNumber2TextBox.TextBoxObject.Text = qrcode[4].Substring(1);
                        if (String.IsNullOrEmpty(idNumber1TextBox.TextBoxObject.Text))
                        {
                            idNumber1TextBox.TextBoxObject.Select();
                            idNumber1TextBox.TextBoxObject.Focus();
                        }
                        
                    }

                }
                catch
                {

                }
                (sender as Control).ForeColor = Color.Black;
            }
            else if ((sender as Control).Text.Replace("!@^", "\t").Count(q => q == '\t') > 0)
            { (sender as Control).ForeColor = (sender as Control).BackColor; }
        }

        private void BillCheckerControl_Load(object sender, EventArgs e)
        {
            idNumber1TextBox.Focus();
        }

        private void cancelButton_TabIndexChanged(object sender, EventArgs e)
        {
            idNumber1TextBox.TextBoxObject.Focus();
        }
    }
}
