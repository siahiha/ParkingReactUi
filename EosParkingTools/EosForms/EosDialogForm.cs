using EosParking.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Windows.Forms;

namespace EosParkingTools.EosForms
{
    public partial class EosDialogForm : EosBaseDialogForm
    {

        public int CloseTime { get; set; } = 0;
        public EosDialogForm()
        {
            InitializeComponent();
        }

        public EosDialogForm(string caption, string message, MessageBoxButtons messageBoxButtons = MessageBoxButtons.OK, MessageBoxIcon messageBoxIcon = MessageBoxIcon.Information,int closeTime=0)
        {
            InitializeComponent();
            Text = caption;
            messageLabel.Text = message;
            switch (messageBoxIcon)
            {
                case MessageBoxIcon.Warning:
                    dialogPictureBox.Image = Properties.Resources.Caution80;
                    break;
                case MessageBoxIcon.Error:
                    dialogPictureBox.Image = Properties.Resources.Error80;
                    break;
                case MessageBoxIcon.Information:
                    dialogPictureBox.Image = Properties.Resources.Information80;
                    break;
                case MessageBoxIcon.Question:
                    dialogPictureBox.Image = Properties.Resources.Question80;
                    break;

                default:
                    dialogPictureBox.Visible = false;
                    break;

            }
            CloseTime = closeTime;
            closeTimer.Enabled = closeTime > 0;
            okButton.Text = (messageBoxButtons == MessageBoxButtons.OK || messageBoxButtons == MessageBoxButtons.OKCancel) ? "تایید" :"بله";
            cancelButton.Visible = (messageBoxButtons == MessageBoxButtons.OKCancel || messageBoxButtons == MessageBoxButtons.YesNoCancel);
            noButton.Visible = (messageBoxButtons == MessageBoxButtons.YesNo || messageBoxButtons == MessageBoxButtons.YesNoCancel);
        }

        public static void ShowError(Exception exception,string msg = "متاسفانه خطایی رخ داد" )
        {
            
            
            using (var frm = new EosDialogForm("خطا!", msg.TrimEnd('.'), MessageBoxButtons.OK, MessageBoxIcon.Warning))
            {
                frm.dialogPictureBox.Tag = exception.ToString();
                frm.ShowDialog();
            }
            //if (message is SocketException)
            //    DialogResult=DialogResult.Retry;
        } 

        public static DialogResult ShowWarning(string message,int closeTime)
        {
            using (var frm = new EosDialogForm("هشدار!", message.TrimEnd('.'), MessageBoxButtons.OK,MessageBoxIcon.Warning))
                return frm.ShowDialog();
        }
        public static DialogResult ShowQuestion(string caption,string message,bool AllowCancel=false)
        {
            using (var frm = new EosDialogForm(caption, message.TrimEnd('.'), (AllowCancel)?MessageBoxButtons.YesNoCancel:MessageBoxButtons.YesNo, MessageBoxIcon.Question))
                return frm.ShowDialog();
        }
        public static DialogResult ShowInformation(string message)
        {
            using (var frm = new EosDialogForm("توجه!", message.TrimEnd('.'), MessageBoxButtons.OK, MessageBoxIcon.Information))
                return frm.ShowDialog();
        }
        public static void ShowError(string message,int closeTime=0)
        {
            using (var frm = new EosDialogForm("خطا!", message.TrimEnd('.'), MessageBoxButtons.OK, MessageBoxIcon.Error,closeTime))
                frm.ShowDialog();
        }

        private void dialogPictureBox_DoubleClick(object sender, EventArgs e)
        {
            if (dialogPictureBox.Tag != null)
                MessageShowInformation(dialogPictureBox.Tag.ToString());
        }

        private void closeTimer_Tick(object sender, EventArgs e)
        {
            if (CloseTime > 0)
                CloseTime--;
            else
                DialogResult = DialogResult.Cancel;
        }
    }
}
