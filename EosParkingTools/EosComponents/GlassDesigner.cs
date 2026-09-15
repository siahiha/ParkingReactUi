using System;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;
using EosParkingTools.Utils;

namespace EosParkingTools.EosComponents
{
    public partial class GlassDesigner : Component
    {
        private Bitmap bitmapBuffer;
        private Form glassForm;

        #region Properties
        public Form GlassForm
        {
            get { return glassForm; }
            set
            {
                if(value==null && glassForm!=null)
                {
                    //if (!DesignMode)
                    {
                        glassForm.Paint -= GlassForm_Paint;
                       // glassForm.Invalidated -= GlassForm_Invalidated;
                    }
                }
                glassForm = value;
                if (glassForm != null)
                {
                    //if (!DesignMode)
                    {
                        glassForm.Paint += GlassForm_Paint;
                       // glassForm.Invalidated += GlassForm_Invalidated;
                    }
                    glassForm.FormBorderStyle = FormBorderStyle.None;
                }
            }
        }

        private void GlassForm_Invalidated(object sender, InvalidateEventArgs e)
        {
            Draw();
        }

        private void GlassForm_Paint(object sender, PaintEventArgs e)
        {
            Draw();
        }

        public byte Opacity { get; set; }

        public Image BackGroundImage { get; set; }
        #endregion
        public static bool SetAlphaPixel(Form frm, Bitmap bmp, byte opacity)
        {
            bool br = true;
            IntPtr screenDC = Win32API.GetDC(IntPtr.Zero);
            var st = Win32API.GetWindowLong(frm.Handle, Win32API.GWL_EXSTYLE);
            Win32API.SetWindowLong(frm.Handle, Win32API.GWL_EXSTYLE, (IntPtr)(st | (uint)WindowStylesEx.WS_EX_LAYERED));

            IntPtr memDC = Win32API.CreateCompatibleDC(screenDC);

            IntPtr hbmp = bmp.GetHbitmap(Color.FromArgb(0));
            try
            {
                IntPtr oldhbmp = Win32API.SelectObject(memDC, hbmp);
                PointW32 psrc = new PointW32(0, 0);
                PointW32 toppo = new PointW32(frm.Left, frm.Top);
                Win32Size si = new Win32Size(bmp.Width, bmp.Height);
                BlendFunction b = new BlendFunction();
                b.AlphaFormat = 1;
                b.flags = 0;
                b.Opration = 0;
                b.srcConstAlpha = opacity;
                br = Win32API.UpdateLayeredWindow(frm.Handle, screenDC, ref toppo, ref si, memDC, ref psrc, 0, ref b, 2);
            }
            catch
            {
                return false;
            }
            finally
            {
                Win32API.ReleaseDC(IntPtr.Zero, screenDC);
                if (hbmp != IntPtr.Zero)
                    Win32API.DeleteObject(hbmp);
                Win32API.DeleteDC(memDC);
            }
            return br;
        }

        public GlassDesigner()
        {
            InitializeComponent();
        }

        public void Draw()
        {
            GenrateBuffer();
            if(GlassForm!=null && bitmapBuffer != null)
                SetAlphaPixel(GlassForm, bitmapBuffer, Opacity);
        }

        private void GenrateBuffer()
        {
            if (GlassForm == null || GlassForm.Handle == IntPtr.Zero)
                return;
            int width= BackGroundImage.Width, height = BackGroundImage.Height;
            try
            {
                Bitmap bmp = new Bitmap(GlassForm.Width, GlassForm.Height);
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.DrawImage(BackGroundImage, new Rectangle(0, 0, width, height));
                    foreach(Control c in GlassForm.Controls)
                    {
                        using (Bitmap b = new Bitmap(c.Width,c.Height))
                        {
                            c.DrawToBitmap(b, c.ClientRectangle);
                            g.DrawImage(b, c.Left, c.Top, c.Width, c.Height);
                        }
                    }
                }
                if (bitmapBuffer != null)
                    bitmapBuffer.Dispose();
                bitmapBuffer = bmp;
            }
            catch { }
        }

        public GlassDesigner(IContainer container)
        {
            container.Add(this);
            InitializeComponent();
            
        }


        
    }
}
