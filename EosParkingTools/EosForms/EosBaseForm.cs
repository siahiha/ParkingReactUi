using DevExpress.XtraEditors;
using EosParking.Controllers;
using EosParking.Core.Helpers;
using EosParkingTools.EosControls;
using EosParkingTools.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EosParkingTools.EosForms
{
    public partial class EosBaseForm : XtraForm, IEosSendRecivedForm
    {
        
        private EosWaitPanel eosWaitPanel = new EosWaitPanel() { Visible = false };
        private Control _popupControl;
        private string _culture = "Fa-IR";
        private bool _tabOnPressEnter = true;
        private bool serviceIsAvalable = true;
        public Control PopupControl { get => _popupControl; set => _popupControl = value; }
        public string WebAddress { get; set; }
        public EosWaitPanel EosWaitPanel { get { return eosWaitPanel; } }
        public bool IsWaiting => Controls.Contains(eosWaitPanel) && eosWaitPanel.Visible;

        public bool WaitingLockForm { get; set; } = true;

        public string Culture { get => _culture; set { _culture = value; ChangeCulture(); } }

        public bool TabOnPressEnter { get => _tabOnPressEnter; set => _tabOnPressEnter = value; }

        public void ChangeCulture()
        {
            System.Globalization.CultureInfo Language =
            new System.Globalization.CultureInfo(_culture);

            InputLanguage.CurrentInputLanguage = InputLanguage.FromCulture(Language);

            //Thread.CurrentThread.CurrentUICulture = new CultureInfo(_culture);
            //Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture;
        }

        public EosBaseForm()
        {
            ChangeCulture();
            InitializeComponent();
            if (string.IsNullOrEmpty(WebAddress))
            {
                try
                {
                    WebAddress = ConfigurationManager.AppSettings["ServerAddress"];
                    if (!WebAddress.EndsWith("/"))
                        WebAddress = WebAddress + "/";
                    this.KeyPreview = true;
                    this.KeyUp += new KeyEventHandler(on_keyup);

                }
                catch { }
            }
        }

        //#mj_added in 1401-07-04 15:22 : با زدن key#27 فرم هایی که از این کلاس استفاده می کنند بسته می شوند
        void on_keyup(object sender, KeyEventArgs e)
        //private void KeyUp(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Escape)
            {
                this.Close();
            }
        }


        private Bitmap GetScreenShot()
        {
            Bitmap backgroundBitmap = new Bitmap(Width, Height);

            SuspendLayout();
            Application.DoEvents();
            Refresh();
            //DrawToBitmap(backgroundBitmap, new Rectangle(0, 0, Width, Height));
            //foreach(Control c in Controls)
            //{
            //    c.DrawToBitmap(backgroundBitmap, c.ClientRectangle);
            //}
            using (Graphics gfxScreenshot = Graphics.FromImage(backgroundBitmap))
            {
                // Take the screenshot from the upper left corner to the right bottom corner
                gfxScreenshot.CopyFromScreen(Left, Top, 0, 0, Size, CopyPixelOperation.SourceCopy);
            }
            //backgroundBitmap.Save("d:\\xx.bmp");
            return backgroundBitmap;
        }

        public void ShowPopup(bool IsNewItem)
        {
            if (Controls.ContainsKey("BasePopupControl") && Controls["BasePopupControl"].Visible)
            {
                Controls["BasePopupControl"].BringToFront();
                return;
            }
            try
            {
                _popupControl.Visible = false;
                Panel panel = new Panel();
                panel.Name = "BasePopupControl";
                panel.Controls.Add(_popupControl);
                if (_popupControl is PopupWinControl)
                    (_popupControl as PopupWinControl).IsNewItem = IsNewItem;
                //Refresh();

                if (panel.BackgroundImage != null)
                {
                    panel.BackgroundImage.Dispose();
                    panel.BackgroundImage = null;
                }
                Bitmap backgroundBitmap = GetScreenShot();
                using (Graphics g = Graphics.FromImage(backgroundBitmap))
                    g.FillRectangle(new Pen(Color.FromArgb(100, Color.Gray)).Brush, 0, 0, Width, Height);
                if (!panel.Controls.Contains(_popupControl))
                    panel.Controls.Add(_popupControl);
                //_popupControl.Invalidate();
                //_popupControl.Left = (this.Width - _popupControl.Width) / 2;
                //_popupControl.Top = (this.Height - _popupControl.Height) / 2;
                _popupControl.Show();
                ResumeLayout(true);
                panel.Padding = new Padding(0);
                panel.BackgroundImage = backgroundBitmap.Clone(new Rectangle(1, Height - ClientRectangle.Height - 1, ClientRectangle.Width, ClientRectangle.Height), backgroundBitmap.PixelFormat);
                panel.Height = Height;
                panel.Width = Width;
                panel.Top = 0;
                panel.Left = 0;
                panel.Hide();

                Controls.Add(panel);
                //panel.Anchor = AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Top;
                panel.Show();
                _popupControl.TabIndex = 1;
                _popupControl.Refresh();
                _popupControl.Left = (this.Width - _popupControl.Width) / 2;
                _popupControl.Top = (this.Height - _popupControl.Height) / 2;
                //_popupControl.Focus();
                backgroundBitmap.Dispose();

                panel.BringToFront();
                //this.Parent.Select();
                //panel.Focus();
                _popupControl.Select();
                _popupControl.Focus();
                this.ActiveControl = _popupControl;
                _popupControl.BringToFront();
            }
            catch { BackgroundImage = null; }
        }

        public void ClosePopup()
        {
            if (_popupControl == null)
                return;
            if (this.InvokeRequired)
            {
                Invoke(new MethodInvoker(() => { ClosePopup(); }));
                return;
            }
            if (Controls["BasePopupControl"] != null)
            {
                var c = Controls["BasePopupControl"];
                Controls.Remove(c);
                c.Hide();
                //Controls.Add(c);
                c.SendToBack();
                c.Hide();
                c.Controls.Clear();
                c.Hide();
                c.Dispose();
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
            EosDialogForm.ShowError("لطفا مشخصات وارد شده را بصورت صحیح وارد کنید " + Details);
        }
        public virtual void MessageShowError(string message, int closeTime = 0)
        {
            EosDialogForm.ShowError(message, closeTime);
        }
        public virtual void MessageShowError(Exception message)
        {
            EosDialogForm.ShowError(message.ToString());
        }

        public virtual void MessageShowErrorUserPermision(string message = "شما اجازه دسترسی به این قسمت را ندارید")
        {
            EosDialogForm.ShowError(message);
        }

        public virtual void MessageShowError<T>(ResponseResultWeb<T> message)
        {
            if (message == null)
            {
                MessageShowError("پاسخی دریافت نشد.");
            }
            if (message.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && message.Values == null)
            {
                MessageShowError("موردی یافت نشد.");
            }
            else if (message.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.NotSet || message.HttpResponseType == System.Net.HttpStatusCode.ServiceUnavailable)
            {
                MessageShowError("سرور در دسترس نیست.");
            }
            else
            {
                if (message.HttpResponseType == System.Net.HttpStatusCode.Unauthorized)
                    MessageShowError(message.ResponseResultType.DisplayString() + ".اجازه دسترسی به سرور لغو گردیده. لطفا مجدد وارد شوید");
                else if (message.HttpResponseType != System.Net.HttpStatusCode.OK)
                    MessageShowError(message.ResponseResultType.DisplayString() + ".  خطایی در ارسال درخواست به سرور روی داده است");
                else
                    MessageShowError((string.IsNullOrEmpty(message.Message)) ? message.ResponseResultType.DisplayString() : message.Message);
            }
        }

        public virtual void MessageShowWarning(string message, int closeTime = 0)
        {
            EosDialogForm.ShowWarning(message, closeTime);
        }
        public virtual void MessageShowSucsess(string message = "عملیات با موفقیت انجام شد")
        {
            EosDialogForm.ShowInformation(message);
        }
        public virtual void MessageShowInformation(string message)
        {
            EosDialogForm.ShowInformation(message);
        }
        public virtual DialogResult ShowQuestion(string caption = "هشدار", string message = "آیا میخواهید عملیات انجام گردد؟", bool AllowCancel = false)
        {
            return EosDialogForm.ShowQuestion(caption, message, AllowCancel);
        }

        public virtual DialogResult ShowExitQuestion(string caption = "هشدار", string message = "آیا میخواهید از این قسمت خارج شوید؟", bool AllowCancel = false)
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
           

            // #mj_added save all service api log
            try
            {
               // EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "PostJson: " + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(sendValue));
            }
            finally { }
            try
            {
                Waiting(true, allowCancel, lockParent);
                ResponseResultWeb<T> result = ResponseResultWeb<T>.FailResponse(new Exception());
                //if(typeof(T).IsValueType)
                Thread t = null;
                var task = Task.Factory.StartNew(() =>
                  {
                      Thread.CurrentThread.Name = $"PostRequest: {apiAdress}";
                      t = Thread.CurrentThread;
                      t.IsBackground = true;
                      result = WebHelper.PostJsonObjecToLink<T>(WebAddress + apiAdress, sendValue);
                      // #mj_added save all service api log
                      try
                      {
                          string sendJSON = Newtonsoft.Json.JsonConvert.SerializeObject(sendValue);
                          string resultJSON = Newtonsoft.Json.JsonConvert.SerializeObject(result);
                          EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "SendJson: " + WebAddress + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(sendValue));
                          EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "ResultJson: " + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(result));
                      }
                      finally { }

                      return result;
                  });

                task.Wait(10);
                var time = DateTime.Now.TimeOfDay;
                while (!task.IsCompleted && !task.IsCanceled)
                {
                    if (eosWaitPanel != null && eosWaitPanel.IsCanceled)
                    {
                        if (t != null || (DateTime.Now - time).Second > 150)
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
                 Thread.CurrentThread.Name = $"GetRequest: {apiAdress}";
                 t = Thread.CurrentThread;
                 t.IsBackground = true;
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
                if (result.HttpResponseType == System.Net.HttpStatusCode.ServiceUnavailable)
                {
                    serviceIsAvalable = false;
                    DialogResult = DialogResult.Retry;
                    //Close();
                }
                return result;
            }
            finally { Waiting(false, allowCancel); }
        }

        public void DoWorkAsyncAndWait(Action action, bool allowCancel = true, bool lockParent = true)
        {
            try
            {
                Waiting(true, allowCancel, lockParent);

                Thread t = null;
                var task = Task.Factory.StartNew(() =>
                {
                    t = Thread.CurrentThread;
                    t.IsBackground = true;
                    action.Invoke();
                });

                task.Wait(10);
                while (!task.IsCompleted && !task.IsCanceled)
                {
                    if (eosWaitPanel != null && eosWaitPanel.IsCanceled)
                    {
                        if (t != null)
                            t.Abort();
                        break;
                    }
                    Thread.Sleep(10);
                    Application.DoEvents();
                }
                Waiting(false, allowCancel);
            }
            finally { Waiting(false, allowCancel); }
        }


        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            if (!serviceIsAvalable)
                DialogResult = DialogResult.Retry;
        }
        public virtual ResponseResultWeb<T> GetJsonObjecToLink<T>(string apiAdress, object sendValue = null, bool allowCancel = true)
        {
            int start = Environment.TickCount;
            ResponseResultWeb<T> result = ResponseResultWeb<T>.FailResponse(new Exception());
            try
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "GetJson: (START)" + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(sendValue));
            }
            finally { }

            result = WebHelper.SendJsonObjecToLink<T>(WebAddress + apiAdress, HttpMethod.Get, sendValue);



            // #mj_added save all service api log
            try
            {
                int duration = Environment.TickCount - start;
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"GetJson: (E N D) duration:({duration})" + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(sendValue));
                //EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "ResultJson: " + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(result));
            }
            finally { }


            return result;
        }

        public void Waiting(bool isWait, bool showCancelButton = false, bool lockParent = true)
        {
            if (!WaitingLockForm)
                return;
            if (InvokeRequired)
            {
                Invoke(new MethodInvoker(() => { Waiting(isWait, showCancelButton, lockParent); }));
                return;
            }
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

        private void EosBaseForm_Load(object sender, EventArgs e)
        {

        }
    }
}

