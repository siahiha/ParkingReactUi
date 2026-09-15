using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.ComponentModel.Design;
using System.ComponentModel.Design.Serialization;
using System.Runtime.InteropServices;
using System.IO;
using DevExpress.XtraGrid;

namespace EosParkingTools.EosControls
{
    [Designer("System.Windows.Forms.Design.ParentControlDesigner, System.Design", typeof(IDesigner))]
    [ComVisible(true)]
    //[Designer("System.Windows.Forms.Design.FlowLayoutPanelDesigner, System.Design, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a")]
    [Docking(DockingBehavior.Ask)]
    [IODescriptionAttribute("DescriptionEosGroupGridControl")]
    public partial class EosGroupGridControl : UserControl
    {
        private GridControl gridView=null;

        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public virtual DevExpress.XtraGrid.GridControl GridView
        {
            get { return gridView; }
            set
            {
                gridView = value;
                if (this.Controls.IndexOf(gridView) < 0)
                    Controls.Add(gridView);
                gridView.Dock = DockStyle.Fill;
                entityModifyToolsControl.SendToBack();
                pagingToolsGridControl.BringToFront();
                gridView.BringToFront();
            }
        }
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public virtual EosPagingToolsGridControl EosPagingToolsGrid { get => pagingToolsGridControl; set => pagingToolsGridControl = value; }
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public virtual EosEntityModifyToolsControl EntityModifyTools { get => entityModifyToolsControl; set => entityModifyToolsControl = value; }

        public EosGroupGridControl()
        {
            InitializeComponent();
            //DevExpress.XtraGrid.Design.ControlGridDesigner;
        }

        protected override void OnControlAdded(ControlEventArgs e)
        {
            base.OnControlAdded(e);
            if (e.Control is GridControl)
                GridView = e.Control as GridControl;
        }
    }
}
