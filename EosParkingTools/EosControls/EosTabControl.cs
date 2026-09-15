using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using DevExpress.Utils;
using DevExpress.XtraTab;

namespace EosParkingTools.EosControls
{
    [DXToolboxItem(DXToolboxItemKind.Free)]
    [ToolboxItem(true)]
    
    public partial class EosTabControl : DevExpress.XtraTab.XtraTabControl
    {
        public EosTabControl()
        {
            InitializeComponent();
            ClosePageButtonShowMode = ClosePageButtonShowMode.InActiveTabPageHeader;
        }

        public virtual void AddTabPage(EosBaseView page)
        {

            var tabPage = TabPages.Where(q => q.Text == page.Text).FirstOrDefault();  //new XtraTabPage { Padding = new Padding(3), Size = new System.Drawing.Size(0, 0), Text = page.Text, Name = page.Name };
            if (tabPage != null)
            {
                SelectedTabPage = tabPage;
                return;
            }

            tabPage = TabPages.Add(page.Text);
            tabPage.Controls.Clear();
            tabPage.Controls.Add(page);
            page.Dock = DockStyle.Fill;
            //page.InitializeParent();
            tabPage.Text = page.Text;
            tabPage.Name = page.Name;
            BackgroundImage = null;
            LookAndFeel.UseDefaultLookAndFeel = true;
            LookAndFeel.Style = DevExpress.LookAndFeel.LookAndFeelStyle.Skin;

            ShowHeaderFocus = DefaultBoolean.True;
            SelectedTabPage = tabPage;

        }
    }
}
