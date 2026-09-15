using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParking.Data.Dto;
using EosParkingTools.Interfaces;

namespace EosParkingTools.EosControls.Views
{
    public partial class UsersView : EosBaseView, IBaseView
    {
        private UserDto currentUser = null;
        private EventHandler closeButtonClick;

        public event EventHandler CloseButtonClick { add { closeButtonClick += value; }  remove { closeButtonClick -= value; } }
        public UsersView()
        {
            InitializeComponent();
            
        }

        public UsersView(List<UserDto> users)
        {
            InitializeComponent();
            FillView(users);
        }

        public void FillView(object bindingData)
        {
//            userGrid.DataSource = bindingData;
        }

        public void FillViewData(object bindingData)
        {
            //userGrid.DataSource = bindingData;
        }

        private void pagingToolsGridControl1_OnChangePageNumber(object sender, EventArgs e)
        {
            
        }

        private void simpleButton1_Click(object sender, EventArgs e)
        {
            if (closeButtonClick != null)
                closeButtonClick(sender, e);
        }
    }
}
