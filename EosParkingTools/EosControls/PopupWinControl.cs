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
    //[Designer("System.Windows.Forms.Design.PanelDesigner, System.Design, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a")]
    [Docking(DockingBehavior.Ask)] 
    public partial class PopupWinControl : Panel
    {
        public const int WM_NCLBUTTONDOWN = 0xA1;
        public const int HT_CAPTION = 0x2;

        [System.Runtime.InteropServices.DllImportAttribute("user32.dll")]
        public static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);
        [System.Runtime.InteropServices.DllImportAttribute("user32.dll")]
        public static extern bool ReleaseCapture();

        bool dropInDesign = false;
        bool designMode = (LicenseManager.UsageMode == LicenseUsageMode.Designtime);
        private int _rounding = 10;
        private Color _captionColor= System.Drawing.SystemColors.ActiveCaption;
        private int _oldHeight = 0;

        [Browsable(false)]
        public bool IsNewItem { get; set; }


        public int RealHeigth { get=> _oldHeight; set { _oldHeight = value; } }
        
        public Color CaptionColor { get => _captionColor; set => _captionColor = value; }
        public string CaptionText { get => label1.Text; set => label1.Text = value; }
        public ContentAlignment CaptionAlignment { get => label1.TextAlign; set => label1.TextAlign = value; }

        public int Rounding { get => _rounding; set => _rounding = value; }

        public PopupWinControl()
        {
            InitializeComponent();
            if (!Controls.Contains(label1))
            {
                this.Controls.Add(label1);
                label1.BringToFront();
            }
            if (!Controls.Contains(eosLabel1) && designMode)
            {
                this.Controls.Add(eosLabel1);
                eosLabel1.Visible = designMode;
            }
        }

        protected override void OnControlAdded(ControlEventArgs e)
        {
            base.OnControlAdded(e);
            if (!designMode)
            {
                Height = Math.Max(_oldHeight, (Controls.Cast<Control>().OrderByDescending(q => q.Bottom).FirstOrDefault()?.Bottom ?? 0) + 5);
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


        protected override void OnPaint(PaintEventArgs e)
        {
            if (!designMode)
            {
                Height = Math.Max(_oldHeight, (Controls.Cast<Control>().OrderByDescending(q => q.Bottom).FirstOrDefault()?.Bottom ?? 0) + 5);
                //dropInDesign = Height <= 40;
                
                //    _oldHeight = Math.Max(_oldHeight, (Controls.Cast<Control>().OrderByDescending(q => q.Bottom).FirstOrDefault()?.Bottom ?? 0) + 5);
                //    Size = new Size(Width, _oldHeight);
                
            }
            eosLabel1.Location = new Point(Width - eosLabel1.Width-8, 3);
            eosLabel1.BringToFront();
            base.OnPaint(e);
            Pen p = new Pen(Color.Black);
            p.Width = 1;
            e.Graphics.FillRectangle(new Pen(_captionColor).Brush,0,0,label1.Width,label1.Height);
            e.Graphics.DrawPath(p, GraphicsHelper.CreateRoundRectangle(new Rectangle(0, 0, Width - 1, Height - 1), _rounding, GraphicsHelper.RectangleCorners.All));
        }

        protected override void OnResize(EventArgs eventargs)
        {
            //if ( !designMode)
            //    Height =  Math.Max(_oldHeight, (Controls.Cast<Control>().OrderByDescending(q => q.Bottom).FirstOrDefault()?.Bottom ?? 0)+ 5); 
            //else
            //{
            //    //if (dropInDesign)
            //    //{
            //    //    //dropInDesign = false;
            //    //    //eosLabel1.Text = "^";
            //    //    _oldHeight = Height;
            //    //}
            //}
            
            base.OnResize(eventargs);

            SetRounding(_rounding, GraphicsHelper.RectangleCorners.All);
        }

        private void eosLabel1_Click(object sender, EventArgs e)
        {
            dropInDesign = !dropInDesign;

            if (dropInDesign)
            {
                RealHeigth = Height;
                Size = new Size(Width, label1.Height);
                eosLabel1.Text = "v";
            }
            else
            {
                _oldHeight = Math.Max(_oldHeight, (Controls.Cast<Control>().OrderByDescending(q => q.Bottom).FirstOrDefault()?.Bottom ?? 0) + 5);
                Size = new Size(Width, _oldHeight);
                eosLabel1.Text = "^";
            }
        }

        protected override void OnMouseClick(MouseEventArgs e)
        { 
            base.OnMouseClick(e);
        }

        protected override void OnClick(EventArgs e)
        {
            base.OnClick(e);
        }
        protected override void WndProc(ref Message m)
        {
           if (m.Msg == 0x210 && m.WParam.ToInt32() == 513)

            {
                if (designMode)
                {
                    Point mousPos = this.PointToClient(Cursor.Position);
                    if (mousPos.X > eosLabel1.Left && mousPos.Y <= eosLabel1.Bottom)
                        eosLabel1_Click(this, null);
                }
            }
            base.WndProc(ref m);
        }

        private void label1_MouseDown(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                ReleaseCapture();
                SendMessage(Handle, WM_NCLBUTTONDOWN, HT_CAPTION, 0);
            }
        }
    }
}
