using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using DevExpress.XtraWaitForm;
using EosParking.Core.Helpers;

namespace EosParkingTools.EosControls
{
    public partial class EosWaitPanel : UserControl
    {
        private EventHandler cancelButtonClick;
        private bool isCanceled = false;
        public string Caption { get { return progressPanel.Caption; } set { progressPanel.Caption=value; } }
        public string Text { get { return progressPanel.Description; } set { progressPanel.Description = value; } }
        public ProgressPanel ProgressPanelControl { get { return progressPanel; } set { progressPanel = value; } }
        public bool ShowCancelButton
        {
            get { return cancelButton.Visible; }
            set
            {
                if (value) cancelButton.Show(); else cancelButton.Hide();
                SetBestSize(value);
            }
        }

        public event EventHandler CancelButtonClick { add { cancelButtonClick = value; } remove { cancelButtonClick = null; } }

        public bool  IsCanceled { get { return isCanceled; } }

        public void SetBestSize(bool value)
        {
            if (cancelButton.InvokeRequired)
            {
                this.Invoke(new MethodInvoker(() => { SetBestSize(value); }));
                return;
            }
            if (value)
                panel1.Size = new Size(157, 79);
            else
                panel1.Size = new Size(157, 62);
            cancelButton.Visible = value;
            if (value)
            {
                Focus();
                panel1.Focus();
                cancelButton.Focus();
                this.ActiveControl = panel1;
            }
        }
        public EosWaitPanel()
        {
            InitializeComponent();
            ProgressPanelControl.Region =new Region(GraphicsHelper.CreateRoundRectangle(ProgressPanelControl.ClientRectangle, 25));
        }

        protected override void OnResize(EventArgs e)
        {
            base.OnResize(e);
            if(Height>panel1.Height)
            panel1.Top = Height / 2 - panel1.Height/2;
            
            if(Width>panel1.Width)
            panel1.Left = Width / 2 - panel1.Width / 2;
        }

        public void GenerateParent(Control parent)
        {
            try
            {
                SendToBack();
                parent.Refresh();
                if (parent != null)
                {
                    if (BackgroundImage != null)
                    {
                        BackgroundImage.Dispose();
                        BackgroundImage = null;
                    }
                    Bitmap backgroundBitmap = new Bitmap(parent.Width, parent.Height );

                    if (BackgroundImage != null)
                    {
                        BackgroundImage.Dispose();
                        BackgroundImage = null;
                    }

                    parent.DrawToBitmap(backgroundBitmap, new Rectangle(0,  0, parent.Width, parent.Height));
                    parent.DrawToBitmap(backgroundBitmap, new Rectangle(0, 0, parent.Width, parent.Height));
                    //backgroundBitmap.Save("d:\\xx.bmp");
                    using (Graphics g = Graphics.FromImage(backgroundBitmap))
                        g.FillRectangle(new Pen(Color.FromArgb(100, Color.Gray)).Brush, 0, 0, parent.Width, parent.Height);
                    BackgroundImage = backgroundBitmap.Clone(new Rectangle(parent.Width - parent.ClientRectangle.Width, parent.Height - parent.ClientRectangle.Height, parent.Width- (parent.Width - parent.ClientRectangle.Width), parent.Height - (parent.Height - parent.ClientRectangle.Height)),backgroundBitmap.PixelFormat);
                    backgroundBitmap.Dispose();
                }
                BringToFront();
                //for (int i = 0; i < 500;i++)
                //{
                //    System.Threading.Thread.Sleep(10);
                //    this.Validate();
                //    Application.DoEvents();
                //}
                //BackgroundImage.Save("d:\\xx.bmp");
            }
            catch { BackgroundImage = null; }

        } 

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            //if(Parent!=null && backgroundBitmap!=null)
            //{
            //    e.Graphics.DrawImage(backgroundBitmap, 0,Parent.Top+Height- Parent.Bottom  );
                 
            //}
        }

        public virtual void OnCancelButtonClick(object sender, EventArgs e)
        {
            isCanceled = true;
            if (cancelButtonClick != null)
                cancelButtonClick(sender, e);
            else
                Visible = false;
        }

        protected override void OnVisibleChanged(EventArgs e)
        {
            base.OnVisibleChanged(e);
            if (Visible == true)
                isCanceled = false;
        }
    }
}
