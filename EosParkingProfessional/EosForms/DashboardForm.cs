using DevExpress.XtraBars.Ribbon;
using DevExpress.XtraEditors;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Exceptions;
using EosParking.Core.Helpers;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParkingTools.EosControls.ReportFilterPanel;
using EosParkingTools.EosControls.Views;
using EosParkingTools.EosForms;
using EosParkingTools.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using EosParkingProfessional.Models;

namespace EosParkingProfessional.EosForms
{
    public partial class DashboardForm : EosBaseRibbonForm
    {
        public DashboardForm()
        {
            InitializeComponent();
        }

        private void simpleButton1_Click(object sender, EventArgs e)
        {

            var frm = new ParkingForm();
            if (frm.ShowDialog() == DialogResult.OK)
            {
                //,ImageAlignment= TileItemContentAlignment.Default,TextAlignment= TileItemContentAlignment.Default,
                AddParking(frm.Building);
            }
        }

        private void AddParking(ParkingEntity building)
        {
            var item = new TileItem
            {
                ItemSize = TileItemSize.Medium,
                Name = building.ParkingName,
                Text = building.ParkingName,
                ImageToTextAlignment = TileControlImageToTextAlignment.Top,
                ImageAlignment = TileItemContentAlignment.MiddleCenter,
                Tag = building,
                Image = Properties.Resources.Parking40,
            };
            item.ItemClick += parkingTileItem_ItemClick;
            parkingsTileControl.Groups[0].Items.Add(item);
            parkingsTileControl.Refresh();
        }

        private void parkingTileItem_ItemClick(object sender, DevExpress.XtraEditors.TileItemEventArgs e)
        {
            ParkingEntity Parkinging = (ParkingEntity)(sender as TileItem).Tag;

            Hide();
            var dialogResult=new MainForm(Parkinging).ShowDialog();
            if (dialogResult == DialogResult.Retry)
                DialogResult = dialogResult;
            else
                Show();
            FillParkings();
            //Close();
            //Show();
        }

        private void userTileItem_ItemClick(object sender, TileItemEventArgs e)
        {
            //var v = new UsersView() { Name = "user", Text = "کاربران" };
            //mainTabControl.ShowTabHeader = DevExpress.Utils.DefaultBoolean.False;
            //mainTabControl.TabPages.Clear();
            //mainTabControl.AddTabPage(v);
            //panelControl1.Hide();
            //v.CloseButtonClick += (object sendera, EventArgs ea) => { mainTabControl.TabPages.Clear(); panelControl1.Show(); };
            if(!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingUsers))
            {
                MessageShowError("شما به این قسمت دسترسی ندارید");
                return;
            }

            var dialogResult=new EosForms.UsersForm().ShowDialog();
            if (dialogResult == DialogResult.Retry)
                DialogResult = dialogResult;
        }

        private void accessLevelTileItem_ItemClick(object sender, TileItemEventArgs e)
        {
            if(!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingAccessLevels))
            {
                MessageShowError("شما به این قسمت دسترسی ندارید");
                return;
            }
            new EosForms.AccessLevelForm().ShowDialog();
        }

        private void DashboardForm_Shown(object sender, EventArgs e)
        {
            //reportTileItem.Visible = false;
            var testData = PublicVariables.CurrentUser;
            tileItem10.Visible = false;
            if (PublicVariables.CurrentUser.UserType == UserTypes.ExitPermissionManager)
            {
                simpleButton1.Visible = false;
                exitPermission.Visible = true;

            }
            else if (PublicVariables.CurrentUser.UserType == UserTypes.Parkban)
            {
                userTileItem.Visible = accessLevelTileItem.Visible = tileItem10.Visible =
                    reportTileItem.Visible= exitPermission.Visible = false;
                FillParkings();
            }
           
            else
            {
                exitPermission.Visible = false;
                FillParkings();
            }
        }

        private void FillParkings()
        {
            ResponseResultWeb<List<ParkingEntity>> response = null;

            response = GetJsonObjecToLink<List<ParkingEntity>>(ApiAddress.ParkingApi.Get, null, false);

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                if(PublicVariables.CurrentUser.CurrentParking>0 && response.Values.Any(q => q.Id == PublicVariables.CurrentUser.CurrentParking) && !AccessItemDto.HassAccess(EosParking.Core.Enums.AccessItemTypes.DashbordManaging, PublicVariables.CurrentUser.AccessPermissionValuePart1))
                {
                    ParkingEntity Parkinging = response.Values.FirstOrDefault(q=>q.Id== PublicVariables.CurrentUser.CurrentParking);
                    Hide();
                    //new MainForm(Parkinging).Show();
                    DialogResult = new MainForm(Parkinging).ShowDialog();
                    //Show();
                    //DialogResult = DialogResult.Retry;
                    Close();
                    return;
                }
                parkingTileGroup.Items.Clear();
                foreach (var item in response.Values)
                    AddParking(item);
            }
            //else
            //{
            //    MessageShowError(response);
            //    DialogResult = DialogResult.OK;
            //}
        }


        void ShowReportFilter(Control panel)
        {
            try
            {
                showButtonPanel.Visible = false;
                flowLayoutPanel1.Visible = false;
                reportFilterPanel.Controls.Clear();
                reportFilterPanel.Controls.Add(panel);
                reportFilterPanel.AutoSize = false;
                reportFilterPanel.Height = panel.Height;
                reportFilterPanel.Width = panel.Width;
                //reportFilterPanel.AutoSize = true;
                flowLayoutPanel1.Visible = true;
                showButtonPanel.Visible = true;
            }
            catch { }
        }

        private void incomingOnYearsElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = incomingOnYearsElement.Text;
            ShowReportFilter(new IncomeFilterPanel(this,0) { Dock = DockStyle.Left, Visible = true/*, StateValue = 1*/ });
        }

        private void reportShowButton_Click(object sender, EventArgs e)
        {
            try
            {
                // Waiting(true)
                if (!(reportFilterPanel.Controls[0] as IFilterPanel).GetValues())
                {
                    MessageShowError("اطلاعاتی یافت نشد");
                    return;
                }

                (reportFilterPanel.Controls[0] as IFilterPanel).ShowReport();
            }
            catch (EosValidationDataException ex) { MessageShowError(ex.Message); }
            catch { }
            finally { /*Waiting(false);*/ }
        }

        private void reportTileItem_ItemClick(object sender, TileItemEventArgs e)
        {
            reportPanel.Show();
        }

        private void incomeOnYearsElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = incomeOnYearsElement.Text;
            ShowReportFilter(new IncomeFilterPanel(this,1) { Dock = DockStyle.Left, Visible = true/*, StateValue = 1*/ });
        }

        private void returnButton3_Click(object sender, EventArgs e)
        {
            reportPanel.Hide();
        }

        private void incomingOnYearesElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = incomingOnYearesElement.Text;
            ShowReportFilter(new IncomeFilterPanel(this,2) { Dock = DockStyle.Left, Visible = true/*, StateValue = 1*/ });

        }

        private void userActivityCashElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = userActivityCashElement.Text;
            ShowReportFilter(new UserFilterPanel(this,0, 0) { Dock = DockStyle.Left, Visible = true });
        }

        private void incomingDetailsParkingsElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = incomingDetailsParkingsElement.Text;
            ShowReportFilter(new TrafficDetailsFilterPanel(this, 0) 
            { Dock = DockStyle.Left, Visible = true, ShowJustPresenceCheckBox = false, ShowParkingComboBox = true, ShowImageCheckBox = false });
        }

        private void exitPermission_ItemClick(object sender, TileItemEventArgs e)
        {
            if (PublicVariables.CurrentUser.UserType != UserTypes.ExitPermissionManager)
            {
                MessageShowError("شما به این قسمت دسترسی ندارید");
                return;
            }

            var dialogResult = new EosForms.ExitPermissionForm().ShowDialog();
            if (dialogResult == DialogResult.Retry)
                DialogResult = dialogResult;

        }
    }
}
