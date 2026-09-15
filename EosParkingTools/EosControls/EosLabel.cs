using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace EosParkingTools.EosControls
{
    public class EosLabel : Label
    {
        private Color _borderColor = Color.Black;
        private int _borderWidth=1;

        public Border3DSide BorderSide { get; set; }
        public int BorderWidth { get => _borderWidth; set => _borderWidth = value; }
        public Color BorderColor { get => _borderColor; set => _borderColor = value; }
        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            try
            {
                var _borderPen = new Pen(_borderColor);
                _borderPen.Width= _borderWidth;
                if ((BorderSide & Border3DSide.Top) == Border3DSide.Top)
                {
                    e.Graphics.DrawLine(_borderPen, 0, 0, Width- _borderWidth, 0);
                }
                if ((BorderSide & Border3DSide.Left) == Border3DSide.Left)
                {
                    e.Graphics.DrawLine(_borderPen, 0, 0, 0, Height - _borderWidth);
                }
                if ((BorderSide & Border3DSide.Bottom) == Border3DSide.Bottom)
                {
                    e.Graphics.DrawLine(_borderPen, 0, Height- _borderWidth, Width- _borderWidth, Height- _borderWidth);
                }
                if ((BorderSide & Border3DSide.Right) == Border3DSide.Right)
                {
                    e.Graphics.DrawLine(_borderPen, Width- _borderWidth, 0, Width- _borderWidth, Height- _borderWidth);
                }
            }
            catch { }
        }
    }
}
