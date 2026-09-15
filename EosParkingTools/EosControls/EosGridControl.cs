using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraBars.Docking2010.Views;
using DevExpress.XtraGrid.Views.Base;

namespace EosParkingTools.EosControls
{
    [ToolboxItem(true)]
    public class EosGridControl
        : GridControl
    {
      
        private Color _evenRowColor;
        private Color _oddRowColor;
        private Color _focusRowSelectColor;
        private bool _showRowNumber;
        
        
        public bool ShowRowNumber { get => _showRowNumber; set => _showRowNumber = value; }
        public Color FocusRowSelectColor
        {
            get => _focusRowSelectColor;
            set { _focusRowSelectColor = value; ChageRowColor(); }
        }
        public Color OddRowColor
        {
            get => _oddRowColor;
            set { _oddRowColor = value; ChageRowColor(); }
        }
        public Color EvenRowColor
        {
            get => _evenRowColor;
            set { _evenRowColor = value; ChageRowColor(); }
        }

        void ChageRowColor()
        {
            try
            {
                foreach (var view in this.Views)
                {
                    var viewC = view as GridView;
                    viewC.Appearance.EvenRow.BackColor = EvenRowColor;
                    viewC.Appearance.OddRow.BackColor = OddRowColor;
                    viewC.Appearance.FocusedRow.BackColor = FocusRowSelectColor;

                    viewC.Appearance.FocusedRow.Options.UseBackColor = true;
                    viewC.Appearance.OddRow.Options.UseBackColor = true;
                    viewC.Appearance.EvenRow.Options.UseBackColor = true;

                    viewC.OptionsView.EnableAppearanceEvenRow = true;
                    viewC.OptionsView.EnableAppearanceOddRow = true;
                    viewC.OptionsSelection.EnableAppearanceFocusedRow = true;
                }
            }
            catch { }
        }

        protected override void SetDefaultView(DevExpress.XtraGrid.Views.Base.BaseView view)
        {
            base.SetDefaultView(view);
            (view as GridView).CustomDrawRowIndicator += new RowIndicatorCustomDrawEventHandler((object sender, RowIndicatorCustomDrawEventArgs e) =>
            {
                try
                {
                    if (_showRowNumber && e.RowHandle >= 0)
                        e.Info.DisplayText = e.RowHandle.ToString();
                }
                catch { }
            });
            ChageRowColor();
            //    (view as DevExpress.XtraGrid.Views.Grid.GridView).CustomDrawFilterPanel += new CustomDrawObjectEventHandler((object o, CustomDrawObjectEventArgs ev) => { ev.Appearance.Name = ""; });
            var gridView1 = (view as DevExpress.XtraGrid.Views.Grid.GridView);
            gridView1.ActiveFilterEnabled = false;
            gridView1.OptionsCustomization.AllowFilter = false;
            gridView1.OptionsFilter.AllowFilterEditor = false;
            gridView1.OptionsView.HeaderFilterButtonShowMode = DevExpress.XtraEditors.Controls.FilterButtonShowMode.SmartTag;
            gridView1.OptionsView.ShowFilterPanelMode = DevExpress.XtraGrid.Views.Base.ShowFilterPanelMode.Never;
        }
        public EosGridControl()
        {
            //InitializeComponent();
            FocusRowSelectColor = Color.LightBlue;
            EvenRowColor = Color.AliceBlue;
        }

    }
}
