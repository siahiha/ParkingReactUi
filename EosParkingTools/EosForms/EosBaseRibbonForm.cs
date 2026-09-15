using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net.Http;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using DevExpress.XtraBars.Ribbon;
using EosParking.Controllers;
using EosParking.Core.Helpers;
using EosParkingTools.EosControls;
using EosParkingTools.Interfaces;

namespace EosParkingTools.EosForms
{
    public partial class EosBaseRibbonForm : RibbonForm, IEosSendRecivedForm
    {
        private EosWaitPanel eosWaitPanel = new EosWaitPanel() { Visible = false };

        public string WebAddress { get; set; }
        public EosWaitPanel EosWaitPanel { get { return eosWaitPanel; } }
        public bool IsWaiting => Controls.Contains(eosWaitPanel) && eosWaitPanel.Visible;

        public EosBaseRibbonForm()
        {
            InitializeComponent();
            if (string.IsNullOrEmpty(WebAddress))
            {
                try
                {
                    WebAddress = ConfigurationManager.AppSettings["ServerAddress"];
                    if (!WebAddress.EndsWith("/"))
                        WebAddress = WebAddress + "/";
                }
                catch { }
            }
        }


        public void SetRounding(int radius, GraphicsHelper.RectangleCorners rectangleCorners = GraphicsHelper.RectangleCorners.All)
        {
            if (rectangleCorners == GraphicsHelper.RectangleCorners.None || radius == 0)
                Region = null;
            else
                Region = new Region(GraphicsHelper.CreateRoundRectangle(ClientRectangle, radius, GraphicsHelper.RectangleCorners.All));
            Refresh();
        }

        public virtual void MessageShowValidationError(string Details = "")
        {
            EosDialogForm.ShowError("لطفا مشخصات وارد شده را بصورت صحیح وارد کنید." + Details);
        }
        public virtual void MessageShowError(string message)
        {
            EosDialogForm.ShowError(message);
        }
        public virtual void MessageShowError(Exception message)
        {
            EosDialogForm.ShowError(message);
            if (message is SocketException)
                DialogResult = DialogResult.Retry;
        }

        public virtual void MessageShowError<T>(ResponseResultWeb<T> message)
        {
            if (message.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && message.Values == null)
            {
                MessageShowError("موردی یافت نشد.");
            }
            else if (message.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.NotSet)
            {
                MessageShowError("سرور در دسترس نیست.");
            }
            else
            {
                if (message.HttpResponseType != System.Net.HttpStatusCode.OK)
                    MessageShowError(message.ResponseResultType.DisplayString() + ".  خطایی در ارسال درخواست به سرور روی داده است");
                else
                    MessageShowError(message.ResponseResultType.DisplayString());
            }
        }

        public virtual void MessageShowWarning(string message)
        {
            EosDialogForm.ShowWarning(message,0);
        }
        public virtual void MessageShowInformation(string message)
        {
            EosDialogForm.ShowInformation(message);
        }
        public virtual DialogResult ShowQuestion(string caption = "هشدار", string message = "آیا میخواهید عملیات انجام گردد؟", bool AllowCancel = false)
        {
            return EosDialogForm.ShowQuestion(caption, message, AllowCancel);
        }

        public virtual ResponseResultWeb<T> PostJsonObjecToLink<T>(string apiAdress, object sendValue)
        {
            //if(typeof(T).IsValueType)
            return WebHelper.PostJsonObjecToLink<T>(WebAddress + apiAdress, sendValue);
        }
        public virtual ResponseResultWeb<T> PostJsonObjecToLinkAndWait<T>(string apiAdress, object sendValue, bool allowCancel, bool lockParent = true)
        {
            try
            {
                Waiting(true, allowCancel, lockParent);
                ResponseResultWeb<T> result = ResponseResultWeb<T>.FailResponse(new Exception());
                //if(typeof(T).IsValueType)
                Thread t = null;
                var task = Task.Factory.StartNew(() =>
                {
                    t = Thread.CurrentThread;
                    result = WebHelper.PostJsonObjecToLink<T>(WebAddress + apiAdress, sendValue);
                    return result;
                });
                task.Wait(10);
                while (!task.IsCompleted && !task.IsCanceled)
                {
                    if (eosWaitPanel != null && eosWaitPanel.IsCanceled)
                    {
                        if (t != null)
                            t.Abort();
                        result = ResponseResultWeb<T>.FailResponse(new Exception("Task canceled."));
                        result.ResponseResultType = EosParking.Core.Enums.ResponseResultTypes.NotSet;
                        break;
                        //task.Dispose();
                    }
                    Thread.Sleep(10);
                    Application.DoEvents();
                }
                Waiting(false, allowCancel);
                return result;
            }
            finally { Waiting(false, allowCancel); }
        }

        public virtual ResponseResultWeb<T> GetJsonObjecToLinkAndWait<T>(string apiAdress, object sendValue = null, bool allowCancel = true, bool lockParent = true)
        {
            try
            {
                Waiting(true, allowCancel, lockParent);
                ResponseResultWeb<T> result = ResponseResultWeb<T>.FailResponse(new Exception());
                //if(typeof(T).IsValueType)
                Thread t = null;
                var task = Task.Factory.StartNew(() =>
                {
                    t = Thread.CurrentThread;
                    result = WebHelper.SendJsonObjecToLink<T>(WebAddress + apiAdress, HttpMethod.Get, sendValue);
                    return result;
                });
                task.Wait(10);
                while (!task.IsCompleted && !task.IsCanceled)
                {
                    if (eosWaitPanel != null && eosWaitPanel.IsCanceled)
                    {
                        if (t != null)
                            t.Abort();
                        result = ResponseResultWeb<T>.FailResponse(new Exception("Task canceled."));
                        result.ResponseResultType = EosParking.Core.Enums.ResponseResultTypes.NotSet;
                        break;
                        //task.Dispose();
                    }
                    Thread.Sleep(10);
                    Application.DoEvents();
                }
                Waiting(false, allowCancel);
                return result;
            }
            finally { Waiting(false, allowCancel); }
        }
        public virtual ResponseResultWeb<T> GetJsonObjecToLink<T>(string apiAdress, object sendValue = null, bool allowCancel = true)
        {
            ResponseResultWeb<T> result = ResponseResultWeb<T>.FailResponse(new Exception());

            result = WebHelper.SendJsonObjecToLink<T>(WebAddress + apiAdress, HttpMethod.Get, sendValue);
            return result;
        }

        public void Waiting(bool isWait, bool showCancelButton = false, bool lockParent = true)
        {
            if (InvokeRequired)
                Invoke(new MethodInvoker(() => { Waiting(isWait, showCancelButton, lockParent); }));
            //eosWaitPanel.Visible = false;
            try
            {
                if (eosWaitPanel.BackgroundImage != null)
                {
                    eosWaitPanel.BackgroundImage.Dispose();
                    eosWaitPanel.BackgroundImage = null;
                }
            }
            catch { }
            if (isWait)
                if (lockParent)
                {
                    eosWaitPanel.Height = Height;
                    eosWaitPanel.Width = Width;
                    eosWaitPanel.Left = 0;
                    eosWaitPanel.Top = 0;
                    eosWaitPanel.SetBestSize(eosWaitPanel.ShowCancelButton);
                    eosWaitPanel.GenerateParent(this);
                    eosWaitPanel.Enabled = true;
                }
                else
                {
                    //eosWaitPanel.SetBestSize(true);
                    eosWaitPanel.Size = new Size(157, 79);
                    eosWaitPanel.Left = Width / 2 - eosWaitPanel.Width / 2;
                    eosWaitPanel.Top = Height / 2 - eosWaitPanel.Height / 2;
                }
            eosWaitPanel.ShowCancelButton = showCancelButton;
            eosWaitPanel.Visible = isWait;
            eosWaitPanel.SendToBack();

            if (isWait)
            {
                if (!Controls.Contains(eosWaitPanel))
                {
                    Controls.Add(eosWaitPanel);
                    eosWaitPanel.BringToFront();
                    //ActiveControl = eosWaitPanel;
                    eosWaitPanel.Refresh();
                    Application.DoEvents();
                }
            }
            else
                Controls.Remove(eosWaitPanel);

            this.Focus();
        }

        protected override void OnControlAdded(ControlEventArgs e)
        {
            //if (e.Control.Parent == this)
            //    e.Control.Parent = MainPanel;
            base.OnControlAdded(e);
        }
    }
}
