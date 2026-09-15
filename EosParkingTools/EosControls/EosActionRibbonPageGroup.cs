using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace EosParkingTools.EosControls
{
    //[DXToolboxItem(true)]
    //[DesignTimeVisible(true)]
    public partial class EosActionRibbonPageGroup : DevExpress.XtraBars.Ribbon.RibbonPageGroup
    {
        public DevExpress.XtraBars.BarButtonItem AddButtonItem { get { return addButtonItem; } set { addButtonItem = value; } }
        public DevExpress.XtraBars.BarButtonItem EditButtonItem { get { return editButtonItem; } set { editButtonItem = value; } }
        public DevExpress.XtraBars.BarButtonItem DeleteButtonItem { get { return deleteButtonItem; } set { deleteButtonItem = value; } }

        public event DevExpress.XtraBars.ItemClickEventHandler AddButtonItemClick { add { addButtonItem.ItemClick += value; } remove { addButtonItem.ItemClick -= value; } }
        public event DevExpress.XtraBars.ItemClickEventHandler EditButtonItemClick { add { editButtonItem.ItemClick += value; } remove { editButtonItem.ItemClick -= value; } }
        public event DevExpress.XtraBars.ItemClickEventHandler DeleteButtonItemClick { add { deleteButtonItem.ItemClick += value; } remove { deleteButtonItem.ItemClick -= value; } }

        public EosActionRibbonPageGroup()
        {
            InitializeComponent();
        }
    }
}
