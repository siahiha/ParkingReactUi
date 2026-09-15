using DevExpress.XtraBars.Ribbon;
using DevExpress.XtraEditors;
using EosParking.Core.Enums;
using EosParking.Core.ImportData;
using EosParking.Core.Models;
using EosParking.Data.EF.Entities;
using EosParkingProfessional.Models;
using EosParkingTools.EosControls.ReportFilterPanel;
using EosParkingTools.EosForms;
using EosParkingTools.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class MainForm : EosBaseRibbonForm
    {
        private ParkingEntity _parking = null;
        private Form _currentOpenForm = null;
        private ManualTrafficControlForm frmManualTrafficControlForm = null;
        public MainForm(EosParking.Data.EF.Entities.ParkingEntity parking)
        {
            InitializeComponent();
            this._parking = parking;
            //if (_parking != null)
            //    PublicVariables.CurrentUser.CurrentParking = _parking.Id;

            RefreshTitle();
        }

        private void RefreshTitle()
        {
            ribbonControl1.Text = "سیستم مدیریت پارکینگ - " + _parking.ParkingName + "              کاربر جاری: " + PublicVariables.CurrentUser.UserName;
            Text = "سیستم مدیریت پارکینگ - " + _parking.ParkingName + "              کاربر جاری: " + PublicVariables.CurrentUser.UserName;

        }

        public DialogResult ShowForm(Form frm)
        {
            try
            {
                //if (_currentOpenForm != null && _currentOpenForm.GetType() == frm.GetType())
                //    return DialogResult.Cancel;

                _currentOpenForm = frm;
                var result = frm.ShowDialog();
                frm.Close();
                frm.Dispose();
                frm = null;
                // _currentOpenForm = null;
                return result;
            }
            catch (Exception ex){
                MessageShowError(ex);
                _currentOpenForm = null;
                return DialogResult.Abort; 
            }
        }

        private void changeUserButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            DialogResult = DialogResult.Retry;
            Close();
        }

        private void exitButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            DialogResult = DialogResult.OK;
            Close();
        }

        private void userActionRibbonPageGroup_AddButtonItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            
        }

        private void mainTabControl_CloseButtonClick(object sender, EventArgs e)
        {
            var tab = mainTabControl.SelectedTabPage;
            if (tab == null)
                return;
            //if (tab?.Controls[0] is EtsBaseView view)
            //{
                //view.IsClosed = true;
                //view.Dispose();
                tab.Dispose();
                GC.Collect();

                tab.Controls.Clear();

                mainTabControl.TabPages.Remove(tab);

                GC.Collect();
            //}

            //if (_preView?.Controls.Count > 0)
            //    mainTabControl.SelectedTabPage = _preView;
            //else 
            if (mainTabControl.TabPages.Count > 1)
                mainTabControl.SelectedTabPage = mainTabControl.TabPages.Last();
        }

        private void usersButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {

        }

        private void informationButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ParkingForm(_parking))
                ShowForm(frm);
            RefreshTitle();
        }

        private void equipmentButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new EquipmentForm(_parking))
                ShowForm(frm);

        }

        private void barButtonItem4_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ParkingFloorForm(_parking))
                ShowForm(frm);
        }

        private void doorButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ParkingDoorForm(_parking))
                ShowForm(frm);
        }

        private void zoonButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ParkingSectionForm(_parking))
                ShowForm(frm);
        }

        private void tariffButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ParkingTariffForm(_parking))
                ShowForm(frm);
        }

        private void memberRegisterKindButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new MemberKindForm(_parking))
                ShowForm(frm);
        }

        private void memberButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {

            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingMember))
            {
                MessageShowError("شما به این قسمت دسترسی ندارید");
                return;
            }
            

            using (var frm = new MemberForm(_parking))
                ShowForm(frm);
        }

        private void cardButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ParkingCardForm(_parking))
                ShowForm(frm);
        }

        private void shiftAssignedButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ParkingUserShiftForm(_parking))
                ShowForm(frm);
        }

        private void memberShipTileItem_ItemPress(object sender, TileItemEventArgs e)
        {
            memberButtonItem_ItemClick(sender, null);
        }

        private void assignShiftTileItem_ItemClick(object sender, TileItemEventArgs e)
        {
            shiftAssignedButtonItem_ItemClick(sender, null);
        }

        private void cardManagerTileItem_ItemClick(object sender, TileItemEventArgs e)
        {
            cardButtonItem_ItemClick(sender, null);
        }

        private void MainForm_Load(object sender, EventArgs e)
        { 
            eosParkingInfoControl1.Parking = _parking;
            eosParkingInfoControl1.CopName = LockOprator.CustomerName;
            Task.Factory.StartNew(()=> { eosParkingInfoControl1.GetFromServer(); }).Wait(100);
            eosParkingInfoControl1.StartScheduleGeting(10000);
            mainTabControl.ShowTabHeader = DevExpress.Utils.DefaultBoolean.False;
            SetAccess(this.Controls);

            SetAccessReport(accordionControl1);
            if (tarrifRibbonPage.Tag != null)
                tarrifRibbonPage.Visible = (PublicVariables.CurrentUser.AccessPermissionValuePart1 & long.Parse(tarrifRibbonPage.Tag.ToString())) == long.Parse(tarrifRibbonPage.Tag.ToString());
            if (actionRibbonPage.Tag != null)
                actionRibbonPage.Visible = (PublicVariables.CurrentUser.AccessPermissionValuePart1 & long.Parse(actionRibbonPage.Tag.ToString())) == long.Parse(actionRibbonPage.Tag.ToString());
            if (reportRibbonPage.Tag != null)
                reportRibbonPage.Visible = (PublicVariables.CurrentUser.AccessPermissionValuePart2 & long.Parse(reportRibbonPage.Tag.ToString())) == long.Parse(reportRibbonPage.Tag.ToString());
            reportTileItem.Visible = reportRibbonPage.Visible;
            //if (importRibbonPage.Tag != null)
            //{
            //    importRibbonPage.Visible = (PublicVariables.CurrentUser.AccessPermissionValuePart2 & long.Parse(importRibbonPage.Tag.ToString())) == long.Parse(importRibbonPage.Tag.ToString());
            //}
            importRibbonPage.Visible = (PublicVariables.CurrentUser.UserName.ToLower() == "admin");
        }

        private void SetAccess(Control.ControlCollection controls)
        { 
            var part1 = PublicVariables.CurrentUser.AccessPermissionValuePart1;
            foreach (Control c in controls)
            {
                try
                {
                    if ( c.Tag != null )
                        c.Enabled = (PublicVariables.CurrentUser.AccessPermissionValuePart1 & long.Parse(c.Tag.ToString())) == long.Parse(c.Tag.ToString());
                    if (c.Controls.Count > 0)
                        SetAccess(c.Controls);
                    else if (c is DevExpress.XtraEditors.TileControl)
                        SetAccess((c as DevExpress.XtraEditors.TileControl).Groups);
                    else if (c is DevExpress.XtraBars.Ribbon.RibbonControl)
                    {
                        SetAccess((c as RibbonControl).Items);
                        //foreach(RibbonPageCategory page in (c as RibbonControl).PageCategories)
                        //{
                        //    if(page.Tag!=null)
                        //        page.Visible = (PublicVariables.CurrentUser.AccessPermissionValuePart1 & long.Parse(page.Tag.ToString())) == long.Parse(page.Tag.ToString());
                        //}
                        
                    }

                    if ((!manualTrafficTileItem.Enabled) && (PublicVariables.CurrentUser.UserType == UserTypes.Parkban))
                    {
                        manualTrafficTileItem.Enabled = true;
                        manageTrafficButtonItem.Enabled = false;


                    }
                }
                catch { }
            }
        }

        private void SetAccess(RibbonBarItems items)
        {
            var part1 = PublicVariables.CurrentUser.AccessPermissionValuePart1;
            foreach (DevExpress.XtraBars.BarItem group in items)
            {
                if (group.Tag != null)
                    group.Enabled = (PublicVariables.CurrentUser.AccessPermissionValuePart1 & long.Parse(group.Tag.ToString())) == long.Parse(group.Tag.ToString());
                //foreach (TileItem c in group)
                //{
                //    try
                //    {
                //        if (c.Name == "manualTrafficTileItem" || c.Tag != null)
                //            c.Enabled = (PublicVariables.CurrentUser.AccessPermissionValuePart1 & long.Parse(c.Tag.ToString())) == long.Parse(c.Tag.ToString());
                //    }
                //    catch { }
                //}
            }
        }

        private void SetAccess(DevExpress.XtraEditors.TileGroupCollection controls)
        { 
            var part1 = PublicVariables.CurrentUser.AccessPermissionValuePart1;
            foreach (DevExpress.XtraEditors.TileGroup group in controls)
            {
                foreach (TileItem c in group.Items)
                {
                    try
                    {
                        if (c.Name == "manualTrafficTileItem" || c.Tag != null)
                        {
                            c.Enabled = (PublicVariables.CurrentUser.AccessPermissionValuePart1 & long.Parse(c.Tag.ToString())) == long.Parse(c.Tag.ToString());
                        }
                    }
                    catch { }
                }
            }
            memberShipTileItem.Enabled =   PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingMember);
                if (PublicVariables.CurrentUser.UserType == UserTypes.Parkban)
            {
                memberShipTileItem.Visible = cardManagerTileItem.Visible = assignShiftTileItem.Visible =
                    reportTileItem.Visible = manageTrafficButtonItem.Enabled = false;
                //injaaa
            }

        }
        private void SetAccessReport(DevExpress.XtraBars.Navigation.AccordionControl control)
        {
            var part1 = PublicVariables.CurrentUser.AccessPermissionValuePart2;
            foreach (DevExpress.XtraBars.Navigation.AccordionControlElement group in control.Elements)
            {
                foreach (DevExpress.XtraBars.Navigation.AccordionControlElement c in group.Elements)
                {
                    try
                    {
                        if (c.Tag != null)
                        {
                            c.Enabled = (PublicVariables.CurrentUser.AccessPermissionValuePart2 & long.Parse(c.Tag.ToString())) == long.Parse(c.Tag.ToString());
                        }
                    }
                    catch { }
                }
            }
            CargoControlElement.Visible = LockOprator.HasAccessToCargoAbility;
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            eosParkingInfoControl1.StopScheduleGeting();
        }

        private void barButtonItem3_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ParkingParkSpaceKindForm(_parking))
                ShowForm(frm);
        }

        private void blackListButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ControlListForm())
                ShowForm(frm);
        }

        private void manualTrafficButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            //#mj_added 1401-07-12
            if (_parking.Id != PublicVariables.CurrentUser.CurrentParking)
            {
                MessageShowError("در این زمان شیفتی روی این پارکینگ برای شما تعریف نگردیده است");
            }
            else
            {
                using (var frm = new ManualTrafficControlForm(_parking))
                    ShowForm(frm);
                
                /*
                frmManualTrafficControlForm = new ManualTrafficControlForm(_parking);
                ShowForm(frmManualTrafficControlForm);
                */
            }
        }

        private void manualTrafficTileItem_ItemClick(object sender, TileItemEventArgs e)
        {
            manualTrafficButtonItem_ItemClick(sender, null);
        }

        private void manageTrafficButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            if (PublicVariables.CurrentUser.UserType == UserTypes.Parkban)
            {
                manageTrafficButtonItem.Enabled = false;
                return;
            }

                using (var frm = new ManageTrafficRecordForm(_parking))
                ShowForm(frm);
        }

        private void monitoringButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new MonitoringForm(_parking))
                ShowForm(frm);
        }
        private void barButtonItemAnprMonitor_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingMonitoringAnpr))
            {
                MessageShowError("شما به مانیتورینگ تشخیص پلاک دسترسی ندارید");
                return;
            }
            using (var frm = new MonitoringAnprForm())
                ShowForm(frm);
        }

        private void ribbonControl1_SelectedPageChanged(object sender, EventArgs e)
        {
            if(ribbonControl1.SelectedPage==reportRibbonPage)
                mainTabControl.SelectedTabPage = reportTabPage;
            else
                mainTabControl.SelectedTabPage = mainTabPage;
        }

        private void memberElement_Click(object sender, EventArgs e)
        {
            try
            {
                captionReportLabel.Text = memberElement.Text;
                //reportFilterPanel.Controls.Clear();
                //reportFilterPanel.Controls.Add(new MembersFilterPanel(this, _parking.Id) { Dock = DockStyle.Left, Visible = true, StateValue = 0 });
                //flowLayoutPanel1.Visible = true;
                ShowReportFilter(new MembersFilterPanel(this, _parking.Id) { Dock = DockStyle.Left, Visible = true, StateValue = 0 });
            }
            catch { }

        }

        private void ThirdPartyConfigurationbarButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new ImportDataConfigurationForm(_parking))
                ShowForm(frm);
        }

        private void reportShowButton_Click(object sender, EventArgs e)
        {
            try
            {
                //Waiting(true, true, false);
                if( !(reportFilterPanel.Controls[0] as IFilterPanel).GetValues())
                {
                    MessageShowWarning("اطلاعاتی یافت نشد");
                    return;
                }

                (reportFilterPanel.Controls[0] as IFilterPanel).ShowReport();
            }
            catch
            {
                // ignored
            }
            finally {/* Waiting(false);*/ }
        }

        void ShowReportFilter(Control panel)
        {
            try
            {
                flowLayoutPanel1.Visible = false;
                reportFilterPanel.AutoSize = false;
                reportFilterPanel.Controls.Clear();
                reportFilterPanel.Height = panel.Height;
                reportFilterPanel.Width = panel.Width;
                reportFilterPanel.Controls.Add(panel);
                reportFilterPanel.Refresh();
                //reportFilterPanel.AutoSize = true;
                flowLayoutPanel1.Visible = true;
            }
            catch { }
        }

        private void activeMemberElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = activeMemberElement.Text;
            ShowReportFilter(new MembersFilterPanel(this, _parking.Id) { Dock = DockStyle.Left, Visible = true, StateValue = 1 });
        }

        private void deactiveMemberElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = deactiveMemberElement.Text;
            ShowReportFilter(new MembersFilterPanel(this, _parking.Id) { Dock = DockStyle.Left, Visible = true, StateValue = 2 }); 
        }

        private void flowLayoutPanel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void trafficElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = trafficElement.Text;
            ShowReportFilter(new TrafficDetailsFilterPanel(this, _parking.Id) { Dock = DockStyle.Left, Visible = true, StateValue = 2, ShowJustPresenceCheckBox = true, ShowParkingComboBox = false });
        } 

        private void trafficStatisticElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = trafficStatisticElement.Text;
            ShowReportFilter(new TrafficFilterPanel(this, _parking.Id,0) { Dock = DockStyle.Left, Visible = true });

        }

        private void memberRegisterHistoryElement_Click(object sender, EventArgs e)
        { 
            captionReportLabel.Text = memberRegisterHistoryElement.Text;
            ShowReportFilter(new MemberRegisterHistoryFilterPanel(this, _parking.Id) { Dock = DockStyle.Left, Visible = true});
        }

        private void memberCashElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = memberCashElement.Text;
            ShowReportFilter(new MemberCashFilterPanel(this, _parking.Id) { Dock = DockStyle.Left, Visible = true });
        }

        private void parkingIncomingElement_Click(object sender, EventArgs e)
        { 
            captionReportLabel.Text = parkingIncomingElement.Text;
            ShowReportFilter(new TrafficFilterPanel(this, _parking.Id,1) { Dock = DockStyle.Left, Visible = true });
        }

        private void totalParkingTimeElement_Click(object sender, EventArgs e)
        {

            captionReportLabel.Text = totalParkingTimeElement.Text;
            ShowReportFilter(new TrafficFilterPanel(this, _parking.Id,5) { Dock = DockStyle.Left, Visible = true });
        }

        private void userElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = userCashActivityElement.Text;
            ShowReportFilter(new UserFilterPanel(this, _parking.Id, 0) { Dock = DockStyle.Left, Visible = true });

            //captionReportLabel.Text = userCashActivityElement.Text;
            //ShowReportFilter(new UserFilterPanel(this, _parking.Id,PublicVariables.CurrentUser.Id) { Dock = DockStyle.Left, Visible = true });
        }
        private void monthlyIncomingElement_Click(object sender, EventArgs e)
        {

            captionReportLabel.Text = monthlyIncomingElement.Text;
            ShowReportFilter(new TrafficFilterPanel(this, _parking.Id,3) { Dock = DockStyle.Left, Visible = true });
        }

        private void ocupaidElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = ocupaidElement.Text;
            ShowReportFilter(new TrafficFilterPanel(this, _parking.Id, 4) { Dock = DockStyle.Left, Visible = true });
        }

        private void ocupancyAverageElement_Click(object sender, EventArgs e)
        { 
            captionReportLabel.Text = ocupancyAverageElement.Text;
            ShowReportFilter(new TrafficFilterPanel(this, _parking.Id, 6) { Dock = DockStyle.Left, Visible = true });
        }

        private void rotateRatioElement3_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = rotateRatioElement3.Text;
            ShowReportFilter(new TrafficFilterPanel(this, _parking.Id, 7) { Dock = DockStyle.Left, Visible = true });
        }

        private void distanceRatioElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = rotateRatioElement3.Text;
            ShowReportFilter(new TrafficFilterPanel(this, _parking.Id, 8) { Dock = DockStyle.Left, Visible = true });
        }

        private void reportTileItem_ItemClick(object sender, TileItemEventArgs e)
        {
            ribbonControl1.SelectedPage = reportRibbonPage;
        }

        private void lockBarButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            string message = "";
            if (LockOprator.ActivateLockService(out message))
                Application.Restart();
            else
                MessageShowError(message);
        }

        private void unLockBarButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            if (ShowQuestion(message: "آیا می خواهید غیر فعال سازی انجام گردد؟")!=DialogResult.OK) return;

            string message = "";
            if (LockOprator.DectivateLockService(out message))
                Environment.Exit(0);
            else
                MessageShowError(message);
        }

        private void aboutBarButtonItem_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            using (var frm = new AboutForm())
                ShowForm(frm);
        }

        private void MainForm_Activated(object sender, EventArgs e)
        {
            
        }

        private void membershipIncomingDetailsElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = membershipIncomingDetailsElement.Text;
            ShowReportFilter(new MembershipFilterPanel(this, _parking.Id) { Dock = DockStyle.Left, Visible = true });
        }

        private void CargoControlElement_Click(object sender, EventArgs e)
        {
            captionReportLabel.Text = CargoControlElement.Text;
            ShowReportFilter(new CargoDetailsFilterPanel(this) { Dock = DockStyle.Left, Visible = true });
        }

        private void EtsMemberUpdateItemBar_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            var path = _parking.EtsDataProviderURL;

            if(String.IsNullOrEmpty(path))
            {
                MessageShowError($"هیچ وب سرویس ETS تعریف نشده است");
                return;
            }

            using (var frm = new ImportMembersForm(_parking, new ETSData(path)))
                ShowForm(frm);
        }

        private void memberShipTileItem_ItemClick(object sender, TileItemEventArgs e)
        {

        }

        private void barButtonImportExcel_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            


            using (var frm = new ImportMembersForm(_parking))
                ShowForm(frm);
        }

        private void MainForm_Shown(object sender, EventArgs e)
        {
            if (PublicVariables.CurrentUser.UserType == UserTypes.Parkban)
            {
                manageTrafficButtonItem.Enabled = false;
                return;
            }
        }

        private void barButtonItem10_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {

        }

      
    }
}
