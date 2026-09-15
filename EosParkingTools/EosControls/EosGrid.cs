using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Linq;
using System.Text;

namespace EosParkingTools.EosControls
{
    public class EosGrid:GridControl
    {
        public Color FocusRowSelectColor{ get; set; }
        public Color OddRowColor { get; set; }
        public Color EvenRowColor { get; set; }
        public EosGrid():base()
        {
            FocusRowSelectColor = Color.LightYellow;
            EvenRowColor = Color.LightSkyBlue;
        }

        protected override void SetDefaultView(BaseView view)
        {
            base.SetDefaultView(view);

            var viewC = view as GridView;
            viewC.Appearance.EvenRow.BackColor = EvenRowColor;
            viewC.Appearance.EvenRow.BackColor = OddRowColor;
            viewC.Appearance.FocusedRow.BackColor = FocusRowSelectColor;
        }
    }
}
