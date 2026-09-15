using DevExpress.XtraEditors.Controls;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Exceptions;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;
using EosParking.Core.Models;
using EosParkingProfessional.Models;

namespace EosParkingProfessional.EosForms
{
    public partial class ParkingTariffForm : EosBaseForm
    { 
        ParkingEntity parking;
        private bool bHasCloudParking;
        List<TariffDto> DeleteParkSpaces = new List<TariffDto>();

        List<ParkingParkSpaceEntity> parkSpaceKindDatasource ;
     
        private void FillGrid()
        {
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "FillGrid: Start" );

            deleteGridColumn.Visible = PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingTariffDelete);
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "FillGrid: Step #1");

            //isCurrentRepositoryGridButton.Visible = PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingTariffDelete);
            
            var response = GetJsonObjecToLink<List<TariffDto>>(ApiAddress.TariffApi.GetByParkingId, parking.Id);
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "FillGrid: Step #2");
            if (this.InvokeRequired)
            {
                Invoke(new MethodInvoker(() =>
                {
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                        gridControl1.DataSource = response.Values;
                    else
                        MessageShowError(response);
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "FillGrid: Step #3a");
                    try
                    {
                        propertyPanel.Visible = gridControl1.DataSource != null && (gridControl1.DataSource as List<TariffDto>).Count > 0;
                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "FillGrid: End.");
                    }
                    catch { }

                }));
            }
            else
            {
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    gridControl1.DataSource = response.Values;
                else
                    MessageShowError(response);
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "FillGrid: Step #3b");
                try
                {
                    propertyPanel.Visible = gridControl1.DataSource != null && (gridControl1.DataSource as List<TariffDto>).Count > 0;
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "FillGrid: End.");
                }
                catch { }

            }
            //try
            //{
            //    propertyPanel.Visible = gridControl1.DataSource != null && (gridControl1.DataSource as List<TariffDto>).Count > 0;
            //    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "FillGrid: End.");
            //}
            //catch { }

        }
        private void FillmemberRegisterKind()
        {
            Task.Factory.StartNew(() =>
            {
                var response = GetJsonObjecToLink<List<MemberRegisterKindEntity>>(ApiAddress.MemberApi.GetMemberRegisterKindsByParkingId, parking.Id);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (memberRegisterKindTextBox.InvokeRequired)
                    {
                        memberRegisterKindTextBox.Invoke(new MethodInvoker(() => {
                            memberRegisterKindTextBox.TextBoxObject.DataSource = response.Values;
                            memberTypeCheckedListBox.DataSource = response.Values;
                            memberRegisterKindTextBox.TextBoxObject.DisplayMember = "Title";
                            memberRegisterKindTextBox.TextBoxObject.ValueMember = "Id";
                            memberTypeCheckedListBox.DisplayMember = "Title";
                            memberTypeCheckedListBox.ValueMember = "Id";
                        }));
                    }
                    else
                    {
                        memberTypeCheckedListBox.DataSource = response.Values;
                        memberRegisterKindTextBox.TextBoxObject.DataSource = response.Values;
                        memberRegisterKindTextBox.TextBoxObject.DisplayMember = "Title";
                        memberRegisterKindTextBox.TextBoxObject.ValueMember = "Id";
                        memberTypeCheckedListBox.DisplayMember = "Title";
                        memberTypeCheckedListBox.ValueMember = "Id";
                    }
                }
            }).Wait(100);
            //else
            //    MessageShowError(response);
        }

        private void GetparkSpaceKind()
        {
            Task.Factory.StartNew(() =>
            {
                var response = GetJsonObjecToLink<List<ParkingParkSpaceEntity>>(ApiAddress.ParkingApi.GetParkingParkSpaceKinds, parking.Id);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    //if (response.Values.Count > 0)
                    //    response.Values.Insert(0, new ParkingParkSpaceEntity { Title = "عمومی", Id = 0 });
                    parkSpaceKindDatasource = response.Values.ToList();
                    
                }
                //else
                //    MessageShowError(response);
            }).Wait(100);
        }

        private void FillparkSpaceKind()
        {

            if (memberRegisterKindTextBox.InvokeRequired)
            {
                memberRegisterKindTextBox.Invoke(new MethodInvoker(() =>
                {
                    FillparkSpaceKind();
                }));
                return;
            }
            if (dailytabPane.Pages.Count == 0)
            {
                var pageCommon1 = new DevExpress.XtraBars.Navigation.TabNavigationPage();
                pageCommon1.Caption = "عمومی";
                pageCommon1.Tag = 0L;
                dailytabPane.Pages.Add(pageCommon1);  
                foreach (var range in parkSpaceKindDatasource.Where(q => (actionPanel.Tag as TariffDto).TariffRanges.Any(z => z.ParkSpaceId == q.Id) && !dailytabPane.Pages.Select(p => (long)p.Tag).Any(p => p == q.Id)).ToList())
                {
                    var page = new DevExpress.XtraBars.Navigation.TabNavigationPage();
                    page.Caption = range.Title;
                    page.Tag = range.Id;
                    dailytabPane.Pages.Add(page);
                } 
            }
            if (hosterlyTabPane.Pages.Count==0)
            { 
                var pageCommon2 = new DevExpress.XtraBars.Navigation.TabNavigationPage();
                pageCommon2.Caption = "عمومی";
                pageCommon2.Tag = 0L;
                hosterlyTabPane.Pages.Add(pageCommon2); 
                foreach (var hosterlry in parkSpaceKindDatasource.Where(q => (actionPanel.Tag as TariffDto).TariffHostelryDetails.Any(z => z.ParkSpaceKindId == q.Id) && !hosterlyTabPane.Pages.Select(p => (long)p.Tag).Any(p => p == q.Id)).ToList())
                {
                    var page = new DevExpress.XtraBars.Navigation.TabNavigationPage();
                    page.Caption = hosterlry.Title;
                    page.Tag = hosterlry.Id;
                    hosterlyTabPane.Pages.Add(page);
                }
            }
                if (actionPanel.Tag == null)
                {
                    parkSpaceKind1TextBox.TextBoxObject.DataSource = parkSpaceKindDatasource.ToList();
                    parkSpaceKind2TextBox.TextBoxObject.DataSource = parkSpaceKindDatasource.ToList();
                }
                else
                {
                    parkSpaceKind1TextBox.TextBoxObject.DataSource = parkSpaceKindDatasource.Where(q => !(actionPanel.Tag as TariffDto).TariffRanges.Any(z => z.ParkSpaceId== q.Id) && !dailytabPane.Pages.Select(p => (long)p.Tag).Any(p=>p==q.Id)).ToList();
                    parkSpaceKind2TextBox.TextBoxObject.DataSource = parkSpaceKindDatasource.Where(q => !(actionPanel.Tag as TariffDto).TariffHostelryDetails.Any(z => z.ParkSpaceKindId == q.Id) && !hosterlyTabPane.Pages.Select(p => (long)p.Tag).Any(p => p == q.Id)).ToList();
                }

                parkSpaceKind1TextBox.TextBoxObject.DisplayMember = "Title";
                parkSpaceKind1TextBox.TextBoxObject.ValueMember = "Id";
                parkSpaceKind2TextBox.TextBoxObject.DisplayMember = "Title";
                parkSpaceKind2TextBox.TextBoxObject.ValueMember = "Id";

            tabNavigationPage2.Tag = 0L;
            tabNavigationPage1.Tag = 0L;
            dailytabPane.Left = 159;
            hosterlyTabPane.Left = 195;
        }

        private bool SetActiveTariff(long id,bool isActive)
        {
            try
            {
                var response = GetJsonObjecToLinkAndWait<bool>(ApiAddress.TariffApi.SetActive, $"{id}&value={isActive}", false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values )
                {
                    return response.Values;
                }
                else
                    MessageShowError(response);
                return false;
            }
            catch (Exception ex) { MessageShowError(ex); return false; }
        }
        private bool SetCurrentTariff(long id, bool isCurrent)
        {
            try
            {
                if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingTariffCurrent))
                {
                    MessageShowErrorUserPermision();
                    return false;
                }
                var response = GetJsonObjecToLinkAndWait<bool>(ApiAddress.TariffApi.SetCurrent, $"{id}&value={isCurrent}", false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values)
                {
                    return response.Values;
                }
                else
                    MessageShowError(response);
                return false;
            }
            catch (Exception ex) { MessageShowError(ex); return false; }
        }

        public ParkingTariffForm(ParkingEntity parking)
        {
                Thread.CurrentThread.CurrentUICulture = new CultureInfo("fa-IR");
                Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture;
            Thread.CurrentThread.CurrentCulture.NumberFormat = new CultureInfo("en-US", false).NumberFormat;

            InitializeComponent();
            
            this.parking = parking;


            InVisibleCloudingVersion(LockOprator.HasCloudParking);
            









        }

        private void InVisibleCloudingVersion(bool hasCloudParking)
        {
            //injaaaaaaaaaaaa
            // dont run for debuging tariff
            
            bHasCloudParking = hasCloudParking;
            //editRepositoryGridButtonEdit.Buttons.FirstOrDefault().Visible = !bHasCloudParking;
            deleteRepositoryGridButtonEdit.Buttons.FirstOrDefault().Visible = !bHasCloudParking;

            isMemberKindTariffCheckBox.Visible = !bHasCloudParking;
            memberKindGroupControl.Visible = !bHasCloudParking;
            eosEntityModifyToolsControl2.Visible = !bHasCloudParking;
            //okButton.Visible = !bHasCloudParking;
            eosEntityModifyToolsControl1.Visible = !bHasCloudParking;
            filterTextBox.Visible = !bHasCloudParking;

        }

        void ClearForm()
        {
           // userNameTextBox.Text = "";
        }

        private void PropertyPanelFill(TariffDto entry, bool enable)
        {

            propertyPanel.Enabled = enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;
            propertyPanel.Visible = true;
            if (entry == null)
            {
                ClearForm();
                entry = new TariffDto() { Title = "جدید",IsActive=true, MaximumHostelryDuration=(int)parking.MinOfHostelryHours, ParkingId = parking.Id };
            }
            actionPanel.Tag = entry;
            titleTextBox.Text=tariffTitleLabel.Text= entry.Title;
            
            //entry.IsTemplate = false;
            //startDateTextBox.TextBoxObject.MiladiDate = (entry.StartDate==DateTime.MinValue)?DateTime.Now: entry.StartDate;//.ToString("yyyy-MM-dd");
             
            entranceCarOneMinuteCostTextBox.Text = entry.EntranceCarOneMinuteCost.ToString();
            entranceMotorOneMinuteCostTextBox.Text = entry.EntranceMotorOneMinuteCost.ToString();
            entranceMiniBusOneMinuteCostTextBox.Text = entry.EntranceMiniBusOneMinuteCost.ToString();
            entranceTruckOneMinuteCostTextBox.Text = entry.EntranceTruckOneMinuteCost.ToString();
            entranceTrailyOneMinuteCostTextBox.Text = entry.EntranceTrailyOneMinuteCost.ToString();
            descriptionTextBox.Text=entry.Description;
            entranceDurationTextBox.Text = entry.EntranceDurationMinutes.ToString();
            entranceFreeTextBox.Text = entry.EntranceFreeMinutes.ToString();
            roundingBorderTextBox.Text = entry.RoundingBorder.ToString();
            roundingValueTextBox2.Text = entry.RoundingValue.ToString();
            maximumHostelryDurationTextBox.Text = entry.MaximumHostelryDuration.ToString();
            rangeGrid.DataSource = entry.TariffRanges.ToList();// new List <TariffRangeDto> { new TariffRangeDto { EndTime = new TimeSpan(1, 20, 15), StartTime = new TimeSpan(2, 20, 15) } };
            hostelryDetailGridControl.DataSource = entry.TariffHostelryDetails.ToList();
            memberKindGrid.DataSource = entry.MemberRegisterKinds.ToList();
            getEnteranceInHasterlyCheckBox.Checked= !entry.GetEnteranceInHostelryPark;
            try
            {
                foreach (MemberRegisterKindEntity i in (List<MemberRegisterKindEntity>)memberTypeCheckedListBox.DataSource??new List<MemberRegisterKindEntity>())
                    memberTypeCheckedListBox.SetItemChecked(((List<MemberRegisterKindEntity>)memberTypeCheckedListBox.DataSource).IndexOf(i), entry.MemberRegisterKinds.Any(q => q.Id == (long)i.Id));
            }
            catch { }
            isMemberKindTariffCheckBox.Checked = entry.IsMemberRegisterKindTariff;
            //item.TariffRanges
            //DateTime.Now =entry.PersistOn ;
            cancelButton.Visible = okButton.Visible = enable;
            //okButton.Visible = !LockOprator.HasCloudParking;


            hosterlyTabPane.Pages.Clear();
            dailytabPane.Pages.Clear();
            FillparkSpaceKind();
        }

        bool IsValidat()
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingTariffAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return false;
            }
            if (string.IsNullOrEmpty(titleTextBox.Text))
            {
                MessageShowError("نام کاربری و کلمه عبور را وارد کنید.");
                return false;
            }
            if (string.IsNullOrEmpty(maximumHostelryDurationTextBox.Text) || maximumHostelryDurationTextBox.IntValue==0)
            {
                MessageShowError("حد اقل مدت زمان محاسبه شبانه روز را وارد کنید");
                return false;
            }

            //if (startDateTextBox.TextBoxObject.MiladiDate< DateTime.Now.Date)
            //{
            //    MessageShowError("تاریخ اجرا نباید کوچکتر از امروز باشد.");
            //    return false;
            //}
            if (!(rangeGrid.DataSource as List<TariffRangeDto>).Any())
            {
                MessageShowError("حد اقل یک بازه برای نرخ ساعتی روزانه نیاز می باشد");
                return false;
            }
            if (!(hostelryDetailGridControl.DataSource as List<TariffHostelryDetailEntity>).Any())
            {
                MessageShowError("حد اقل یک مورد برای نرخ شبانه روزی نیاز می باشد");
                return false;
            }
            
            if (entranceFreeTextBox.IntValue>entranceDurationTextBox.IntValue)
            {
                MessageShowError("بازه رایگان نمی تواند از ورودی بیشتر باشد.");
                return false;
            }
            //if (accessLevelTextBox.TextBoxObject.SelectedValue == null || accessLevelTextBox.TextBoxObject.SelectedValue.ToString() == "0")
            //{
            //    MessageShowError("سطح دسترسی را وارد نمایید");
            //    return false;
            //}

            return true;
        }

        private void SaveItem()
        {
            if (LockOprator.HasCloudParking)
            {
                MessageShowError("ایجاد تغییرات در تعرفه امکان پذیر نمی باشد");
                return;
            }

            if (!IsValidat())
                return;
            try
            {
                var item = actionPanel.Tag as TariffDto;
                if (item == null)
                {
                    item = new TariffDto()
                    {
                        IsCurrent = (gridControl1.DataSource as List<TariffDto>)?.Count() == 0,
                        IsActive = true
                    };
                }
                
                item.Title = titleTextBox.Text;
                item.ParkingId = parking.Id;
                item.IsMemberRegisterKindTariff = false;
                //item.StartDate = startDateTextBox.TextBoxObject.MiladiDate.Value; 
                item.EntranceDurationMinutes = int.Parse(entranceDurationTextBox.Text);
                item.EntranceCarOneMinuteCost= entranceCarOneMinuteCostTextBox.LongValue;
                item.EntranceMotorOneMinuteCost= entranceMotorOneMinuteCostTextBox.LongValue;
                item.EntranceMiniBusOneMinuteCost= entranceMiniBusOneMinuteCostTextBox.LongValue;
                item.EntranceTruckOneMinuteCost= entranceTruckOneMinuteCostTextBox.LongValue;
                item.EntranceTrailyOneMinuteCost= entranceTrailyOneMinuteCostTextBox.LongValue;

                item.EntranceFreeMinutes = int.Parse(entranceFreeTextBox.Text);
                item.RoundingBorder = int.Parse(roundingBorderTextBox.Text);
                item.RoundingValue = int.Parse(roundingValueTextBox2.Text);
                item.TariffRanges = rangeGrid.DataSource as List<TariffRangeDto>;
                item.PersistOn = DateTime.Now;
                item.IsMemberRegisterKindTariff = isMemberKindTariffCheckBox.Checked;
                item.MaximumHostelryDuration=maximumHostelryDurationTextBox.IntValue;
                item.GetEnteranceInHostelryPark = !getEnteranceInHasterlyCheckBox.Checked;
                item.TariffHostelryDetails = hostelryDetailGridControl.DataSource as List<TariffHostelryDetailEntity>;
                item.MemberRegisterKinds = new List<MemberRegisterKindEntity>();
                item.Description = descriptionTextBox.Text;

                foreach (MemberRegisterKindEntity i in memberTypeCheckedListBox.DataSource as List<MemberRegisterKindEntity>)
                    if (memberTypeCheckedListBox.GetItemChecked((memberTypeCheckedListBox.DataSource as List<MemberRegisterKindEntity>).IndexOf(i)))
                        item.MemberRegisterKinds.Add(i);

                //item.MemberRegisterKinds = memberKindGrid.DataSource as List<MemberRegisterKindEntity>;
                var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.TariffApi.Save, item, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values > 0)
                {
                    if (item.Id == 0)
                    {
                        item.Id = response.Values;
                        (gridControl1.DataSource as List<TariffDto>).Add(item);
                    }
                    gridControl1.RefreshDataSource();
                    gridControl1.Refresh();
                    PropertyPanelFill(item, false);
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
        }

        private void eosEntityModifyToolsControl1_ClickNewButton(object sender, EventArgs e)
        {
            PropertyPanelFill(null, true);
        }

        private void editGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = ((gridControl1.DataSource as List<TariffDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
            if (entry.IsUsing && false)
            {
                entry = entry.Clone();
                entry.Id = 0;
                foreach(var i in entry.TariffHostelryDetails)
                    i.Id = 0;
                foreach (var i in entry.TariffRanges)
                    i.Id = 0;
                okButton.Text = "رونوشت";
            }
            else
            {
                
                okButton.Text = "تایید";
            }
            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<TariffDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                if (entry.PersistOn < DateTime.Now.Date)
                {
                    MessageShowError("به علت استفاده در سیستم، تعرفه قابل حذف نیست.");
                    return;
                }
                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.TariffApi.DeleteById, entry.Id);
                if (result.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && result.Values)
                    (gridControl1.MainView as GridView).DeleteSelectedRows();
                else
                    MessageShowError(result);
            }
            catch (Exception ex)
            {
                MessageShowError(ex);
            }
        }

        private void gridView1_FocusedRowChanged(object sender, DevExpress.XtraGrid.Views.Base.FocusedRowChangedEventArgs e)
        {
            try
            {
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as TariffDto;
                PropertyPanelFill(entry, false);
                if (entry.IsUsing && false)
                    editRepositoryGridButtonEdit.Buttons.FirstOrDefault().ImageOptions.Image = Properties.Resources.Copy21;
                else
                    editRepositoryGridButtonEdit.Buttons.FirstOrDefault().ImageOptions.Image = Properties.Resources.Edit21;
                if (entry.IsMemberRegisterKindTariff)
                    isCurrentRepositoryGridButton.Buttons[0].Enabled = false;
                else
                    isCurrentRepositoryGridButton.Buttons[0].Enabled = true;
            }
            catch { }
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            //UserDto d = new UserDto() { UserName = "eosLogin1.UserName", UserPass = "eosLogin1.Password.Encrypt()" };
            //var response = PostJsonObjecToLink<AccessLevelEntity>(ApiAddress.AccessLevelApi.AccessLevelSave, d);
            //          PostJsonObjecToLinkAndWait<object>(ApiAddress.UserApi.Login, d, true);
            SaveItem();
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            PropertyPanelFill(null, false);
        }

        private void popupWinControl1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void eosEntityModifyToolsControl3_ClickNewButton(object sender, EventArgs e)
        {
            if (LockOprator.HasCloudParking)
            {
                MessageShowError("ایجاد تغییرات در تعرفه امکان پذیر نمی باشد");
                return;
            }

            var ds = (dailyDetailsGridControl.DataSource as List<TariffRangeDetailEntity>).OrderBy(q => q.ToMinute).ToList();
            var lastItem = ds.LastOrDefault();
            ds.Add(new TariffRangeDetailEntity()
            {
                FromMinute = lastItem?.ToMinute ?? 0,
                ToMinute = (lastItem?.ToMinute ?? 0) + maxMinDetailTextBox.IntValue,
                CarOneMinuteCost = lastItem?.CarOneMinuteCost ?? 0,
                MiniBusOneMinuteCost = lastItem?.MiniBusOneMinuteCost ?? 0,
                MotorOneMinuteCost= lastItem?.MotorOneMinuteCost ?? 0,
                TrailyOneMinuteCost = lastItem?.TrailyOneMinuteCost ?? 0,
                TruckOneMinuteCost = lastItem?.TruckOneMinuteCost ?? 0,
                TariffRangeId = (popupWinControl1.Tag as TariffRangeDto).Id,
            });
            dailyDetailsGridControl.DataSource = ds;
            dailyDetailsGridControl.RefreshDataSource();
            (dailyDetailsGridControl.MainView as GridView).SelectRow(ds.Count);
            (dailyDetailsGridControl.MainView as GridView).MoveLast();
            (dailyDetailsGridControl.MainView as GridView).SetFocusedRowModified();
        }

        private void eosEntityModifyToolsControl2_ClickNewButton(object sender, EventArgs e)
        {
            var tariffRange = new TariffRangeDto()
            {
                
                ParkSpaceId = (long)dailytabPane.SelectedPage.Tag// (parkSpaceKind1TextBox.TextBoxObject.SelectedValue != null ? long.Parse(parkSpaceKind1TextBox.TextBoxObject.SelectedValue.ToString()) : 0)
            };
            if (propertyPanel.Tag != null)
                tariffRange.TariffId = (propertyPanel.Tag as TariffDto).Id;
            popupWinControl1.Tag = tariffRange;
            fromDetailTextBox.Text = tariffRange.StartTime.ToString();
            toDetailTextBox.Text = tariffRange.EndTime.ToString();
            maxMinDetailTextBox.Text = tariffRange.CalculateCostRange.ToString();

            dailyDetailsGridControl.DataSource = tariffRange.TariffRangeDetails;
            ShowPopup(true);
            
        }

        private void simpleButton1_Click(object sender, EventArgs e)
        {
            popupWinControl1.Tag = null;
            ClosePopup();
        }

        private void simpleButton2_Click(object sender, EventArgs e)
        {

            if (LockOprator.HasCloudParking)
            {
                MessageShowError("ایجاد تغییرات در تعرفه امکان پذیر نمی باشد");
                return;
            }
            if (fromDetailTextBox.TimeValue >= toDetailTextBox.TimeValue)
            {
                MessageShowError("زمان شروع بازه باید از زمان خاتمه بازه بزرگتر باشد.");
                return;
            }

            if (popupWinControl1.Tag != null)
            {
                var tariffRange = popupWinControl1.Tag as TariffRangeDto;

                tariffRange.StartTime = fromDetailTextBox.TimeValue.Value;
                tariffRange.EndTime = toDetailTextBox.TimeValue.Value;
                tariffRange.CalculateCostRange = maxMinDetailTextBox.IntValue;

                tariffRange.TariffRangeDetails=dailyDetailsGridControl.DataSource as List<TariffRangeDetailEntity>;
                    var ds = (rangeGrid.DataSource as List<TariffRangeDto>);

                    if (ds.Any(q => q.Id != tariffRange.Id && q.ParkSpaceId==tariffRange.ParkSpaceId &&
                    ((q.StartTime < tariffRange.StartTime && q.EndTime > tariffRange.EndTime) || (q.StartTime > tariffRange.StartTime && q.EndTime < tariffRange.EndTime)
                    || (tariffRange.StartTime < q.StartTime && q.StartTime < tariffRange.EndTime) 
                    || (tariffRange.StartTime < q.EndTime && q.EndTime < tariffRange.EndTime))))
                    {
                        MessageShowError("بازه های انتخاب شده با دیگر موارد تداخل دارند.");
                        return;
                    }
                if (popupWinControl1.IsNewItem)
                {
                    ds.Add(tariffRange);
                    rangeGrid.DataSource = null;
                    rangeGrid.RefreshDataSource();
                    rangeGrid.Refresh();
                    rangeGrid.DataSource = ds.ToList();
                }
            }
            ClosePopup();
            rangeGrid.RefreshDataSource();
            rangeGrid.Refresh();
        }

        private void editDailyRepositoryGridButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var tariffRange = ((rangeGrid.DataSource as List<TariffRangeDto>)[(rangeGrid.MainView as GridView).GetFocusedDataSourceRowIndex()]) ;
            popupWinControl1.Tag = tariffRange;
            fromDetailTextBox.Text = tariffRange.StartTime.ToString();
            toDetailTextBox.Text = tariffRange.EndTime.ToString();
            maxMinDetailTextBox.Text = tariffRange.CalculateCostRange.ToString();

            dailyDetailsGridControl.DataSource = tariffRange.TariffRangeDetails;
            ShowPopup(false);
        }

        private void deleteDetailRepositoryGridButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            var item = (dailyDetailsGridControl.MainView as GridView).GetRow((dailyDetailsGridControl.MainView as GridView).GetFocusedDataSourceRowIndex()) as TariffRangeDetailEntity;
            var nextItem = (dailyDetailsGridControl.MainView as GridView).GetRow((dailyDetailsGridControl.MainView as GridView).GetFocusedDataSourceRowIndex()+1) as TariffRangeDetailEntity;
            if (item != null && nextItem != null)
                nextItem.FromMinute = item.FromMinute;
            (dailyDetailsGridControl.MainView as GridView).DeleteSelectedRows();
            //(dailyDetailsGridControl.DataSource as List<TariffRangeDto>).RemoveAt((dailyDetailsGridControl.MainView as GridView).GetFocusedDataSourceRowIndex());
            //dailyDetailsGridControl.RefreshDataSource();
        }

        private void hostelryEntityModifyToolsControl_ClickNewButton(object sender, EventArgs e)
        {
            long parkSpaceId = (long)hosterlyTabPane.SelectedPage.Tag;// (parkSpaceKind2TextBox.TextBoxObject.SelectedValue != null ? long.Parse(parkSpaceKind2TextBox.TextBoxObject.SelectedValue.ToString()) : 0);
            var ds = (hostelryDetailGridControl.DataSource as List<TariffHostelryDetailEntity>).OrderBy(q => q.ToDay).ToList();
            var lastItem = ds.Where(q=>q.ParkSpaceKindId== parkSpaceId).LastOrDefault();
            var hostelry = new TariffHostelryDetailEntity()
            { 
                ParkSpaceKindId = parkSpaceId,
                FromDay = lastItem?.FromDay ?? 0,
                ToDay = (lastItem?.FromDay ?? 0) + 1,
                CarOneMinuteCost = lastItem?.CarOneMinuteCost ?? 0,
                MiniBusOneMinuteCost = lastItem?.MiniBusOneMinuteCost ?? 0,
                MotorOneMinuteCost = lastItem?.MotorOneMinuteCost ?? 0,
                TrailyOneMinuteCost = lastItem?.TrailyOneMinuteCost ?? 0,
                TruckOneMinuteCost = lastItem?.TruckOneMinuteCost ?? 0,
                //TariffId = (actionPanel.Tag as TariffDto).Id,
            };
            if (actionPanel.Tag != null)
                hostelry.TariffId = (actionPanel.Tag as TariffDto).Id;
            ds.Add(hostelry);
            hostelryDetailGridControl.DataSource = null;
            hostelryDetailGridControl.DataSource = ds;
            hostelryDetailGridControl.RefreshDataSource();
            (hostelryDetailGridControl.MainView as GridView).SelectRow(ds.Count);
            (hostelryDetailGridControl.MainView as GridView).MoveLast();
            (hostelryDetailGridControl.MainView as GridView).SetFocusedRowModified();
        }

        private void deleteRepositoryHostelryGridButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            try
            {
                (hostelryDetailGridControl.MainView as GridView).DeleteSelectedRows();
            }
            catch (Exception ex)
            {
                MessageShowError(ex);
            }
        }
         

        private void isMemberKindTariffCheckBox_CheckedChanged(object sender, EventArgs e)
        {
            memberKindGroupControl.Enabled = isMemberKindTariffCheckBox.Checked;
        }

        private void deleteMemberKingRepositoryGridButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            try
            {
                (memberKindGrid.MainView as GridView).DeleteSelectedRows();
            }
            catch (Exception ex)
            {
                MessageShowError(ex);
            }
        }

        private void simpleButton3_Click(object sender, EventArgs e)
        {
            
            var ds = (memberKindGrid.DataSource as List<MemberRegisterKindEntity>);
            if (ds!=null && ds.Any(q => q.Id == (long)memberRegisterKindTextBox.TextBoxObject.SelectedValue))
                return;
            ds.Add(new MemberRegisterKindEntity() { Title=memberRegisterKindTextBox.Text,ParkingId=parking.Id,PersistOn=DateTime.Now,Id=((long)memberRegisterKindTextBox.TextBoxObject.SelectedValue)});
            memberKindGrid.DataSource = ds;
            memberKindGrid.RefreshDataSource();
            (memberKindGrid.MainView as GridView).SelectRow(ds.Count);
            (memberKindGrid.MainView as GridView).MoveLast();
            //(memberKindGrid.MainView as GridView).SetFocusedRowModified();
        }

        private void eosTextBox1_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (filterTextBox.TextBoxObject.SelectedIndex == 0)
                (gridControl1.MainView as GridView).ActiveFilterString = "";
            else if (filterTextBox.TextBoxObject.SelectedIndex == 1)
                (gridControl1.MainView as GridView).ActiveFilterString = "IsMemberRegisterKindTariff = false";
            else
                (gridControl1.MainView as GridView).ActiveFilterString = "IsMemberRegisterKindTariff = true";// "IsMemberRegisterKindTariff=true";
            //(gridControl1.MainView as GridView).ApplyFindFilter("IsMemberRegisterKindTariff = 0");
            (gridControl1.MainView as GridView).OptionsView.ShowFilterPanelMode = ShowFilterPanelMode.Never;
        }

        private void deleteRepositoryGridButtonEdit2_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var tariffRange = ((rangeGrid.DataSource as List<TariffRangeDto>)[(rangeGrid.MainView as GridView).GetFocusedDataSourceRowIndex()]);
            (rangeGrid.DataSource as List<TariffRangeDto>).RemoveAt((rangeGrid.MainView as GridView).GetFocusedDataSourceRowIndex());
            rangeGrid.RefreshDataSource();
        }

        public void DoInBackground()
        {
            try
            {
                if (this.InvokeRequired)
                {
                    Invoke(new MethodInvoker(() =>
                    {
                        var stopwatch1 = new Stopwatch();
                        stopwatch1.Start();
                        FillGrid();
                        FillmemberRegisterKind();
                        //dailytabPane.Location = new Point(25, dailytabPane.Top);
                        filterTextBox.TextBoxObject.DataSource = new List<string> { "همه تعرفه ها", "تعرفه عمومی", "تعرفه اعضا" };
                        GetparkSpaceKind();
                        tabNavigationPage2.Tag = 0L;
                        tabNavigationPage1.Tag = 0L;
                        dailytabPane.Left = 159;
                        hosterlyTabPane.Left = 195;
                        gridControl1.Enabled = true;
                        eosEntityModifyToolsControl1.Enabled = true;
                        stopwatch1.Stop();
                        long GetparkSpaceKind_elapsed_time = stopwatch1.ElapsedMilliseconds;
                        //MessageBox.Show(String.Format("elapsed_time: {0:n} ", GetparkSpaceKind_elapsed_time));
                    }));
                
           
                }
            }
            catch { }
        }

        private void ParkingTariffForm_Shown(object sender, EventArgs e)
        {
            propertyPanel.Enabled = false;
            gridControl1.Enabled = false;
            eosEntityModifyToolsControl1.Enabled= false;
            Task.Run(DoInBackground);
            //Thread t = new Thread(DoInBackground);
            //t.Start();
        }

        private void parkSpaceAddButton_Click(object sender, EventArgs e)
        {
            var page = new DevExpress.XtraBars.Navigation.TabNavigationPage();
            page.Caption= parkSpaceKind1TextBox.Text;
            page.Tag = parkSpaceKind1TextBox.TextBoxObject.SelectedValue;
            dailytabPane.Pages.Add(page);
            //(parkSpaceKind1TextBox.TextBoxObject.DataSource as List<ParkingParkSpaceEntity>)
            //    .Remove((parkSpaceKind1TextBox.TextBoxObject.DataSource as List<ParkingParkSpaceEntity>)
            //    .FirstOrDefault(q => q.Id == (long)parkSpaceKind1TextBox.TextBoxObject.SelectedValue)
            //    );
            dailytabPane.Refresh();
            FillparkSpaceKind();
        }

        private void hosterlyAddButton_Click(object sender, EventArgs e)
        {
            var page = new DevExpress.XtraBars.Navigation.TabNavigationPage();
            page.Caption = parkSpaceKind2TextBox.Text;
            page.Tag = parkSpaceKind2TextBox.TextBoxObject.SelectedValue;
            hosterlyTabPane.Pages.Add(page);
            //(parkSpaceKind1TextBox.TextBoxObject.DataSource as List<ParkingParkSpaceEntity>)
            //    .Remove((parkSpaceKind1TextBox.TextBoxObject.DataSource as List<ParkingParkSpaceEntity>)
            //    .FirstOrDefault(q => q.Id == (long)parkSpaceKind1TextBox.TextBoxObject.SelectedValue)
            //    );
            hosterlyTabPane.Refresh();
            FillparkSpaceKind();
        }

        private void hosterlyTabPane_SelectedPageChanged(object sender, DevExpress.XtraBars.Navigation.SelectedPageChangedEventArgs e)
        {

            try
            {
                ((GridView)hostelryDetailGridControl.MainView).ActiveFilterString = "isnull(ParkSpaceKindId,0) = " + (e.Page as DevExpress.XtraBars.Navigation.TabNavigationPage)?.Tag;
                ((GridView)hostelryDetailGridControl.MainView).OptionsView.ShowFilterPanelMode = ShowFilterPanelMode.Never;
            }
            catch { }
        }

        private void dailytabPane_SelectedPageChanged(object sender, DevExpress.XtraBars.Navigation.SelectedPageChangedEventArgs e)
        {
            try
            {
                ((GridView)rangeGrid.MainView).ActiveFilterString = "isnull(ParkSpaceId,0) = " + (e.Page as DevExpress.XtraBars.Navigation.TabNavigationPage)?.Tag;
                ((GridView)rangeGrid.MainView).OptionsView.ShowFilterPanelMode = ShowFilterPanelMode.Never;
            }
            catch { }
        }

        private void memberTypeCheckedListBox_ItemChecking(object sender, ItemCheckingEventArgs e)
        {
            if(memberTypeCheckedListBox.Enabled && e.NewValue==CheckState.Checked)
            {
                var entry = actionPanel.Tag as TariffDto;
                if ((memberTypeCheckedListBox.DataSource as List<MemberRegisterKindEntity>)[e.Index].Tariffs.Count(q => q.Key != entry.Id) > 0)
                {
                    if (ShowQuestion(message: "این نوع عضویت دارای تعرفه می باشد. آیا میخواهید تعرفه این نوع عضو تغییر یابد؟") == DialogResult.OK)
                        e.NewValue = CheckState.Checked;
                    else
                        e.NewValue = CheckState.Unchecked;
                }
            }
        }

        private void isActiveRepositoryGridCheckEdit_CheckedChanged(object sender, EventArgs e)
        {
            
        }

        private void gridView1_CellValueChanged(object sender, CellValueChangedEventArgs e)
        {
            try
            {
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as TariffDto;

                if(e.Column== isActiveGridColumn)
                {
                    if (entry.IsCurrent)
                        entry.IsActive = true;
                    if (!SetActiveTariff(entry.Id, entry.IsActive))
                        if (!SetActiveTariff(entry.Id, entry.IsActive))
                        {
                            MessageShowError("متاسفانه تغیرات انجام نگردید.");
                            entry.IsActive = !entry.IsActive;
                        }
                } 
            }
            catch { }
        }

        private void isCurrentRepositoryGridButton_Click(object sender, EventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingTariffCurrent))
            {
                MessageShowErrorUserPermision();
                return ;
            }
            var entry = (gridControl1.MainView as GridView).GetFocusedRow() as TariffDto;
            if (entry.IsCurrent || entry.IsMemberRegisterKindTariff)
                return;
            if (ShowQuestion(message: "آیا می خواهید تعرفه پیش فرض تغییر یابد؟") != DialogResult.OK)
                return;
            entry.IsCurrent = (SetCurrentTariff(entry.Id, true));
            if (entry.IsCurrent)
                foreach (var i in (gridControl1.MainView as GridView).DataSource as List<TariffDto>)
                {
                    if (i.Id != entry.Id)
                        i.IsCurrent = false;
                }
            gridControl1.RefreshDataSource();
            gridControl1.Refresh();
        }

        private void gridView1_RowStyle(object sender, RowStyleEventArgs e)
        {
            //if(e.State==GridRowCellState.)
            try
            {
                var entry = (gridControl1.MainView as GridView).GetRow(e.RowHandle) as TariffDto;
                if (entry !=null)
                { 
                    if (entry.IsCurrent)
                    {
                        e.Appearance.BackColor = Color.LightGreen;
                        e.HighPriority = true;
                    }
                    else
                        { 
                        e.HighPriority = false;
                        }
                }
            }
            catch (Exception)
            { 
            }

        }

        private void gridView3_RowUpdated(object sender, RowObjectEventArgs e)
        {
            try
            {
                var ds = gridView3.DataSource as List<TariffRangeDetailEntity>;
                var row = gridView3.GetRow(e.RowHandle) as TariffRangeDetailEntity;
                var nextRow = gridView3.GetRow(e.RowHandle+1) as TariffRangeDetailEntity;
                if (nextRow == null)
                    return;
                nextRow.FromMinute = row.ToMinute;
            }
            catch { }
        }

        private void deleteRepositoryHostelryGridButton_ButtonPressed_1(object sender, ButtonPressedEventArgs e)
        { 
           //var tariffRange = ((hostelryDetailGridControl.DataSource as List<TariffRangeDto>)[(hostelryDetailGridControl.MainView as GridView).GetFocusedDataSourceRowIndex()]);
            (hostelryDetailGridControl.DataSource as List<TariffHostelryDetailEntity>).RemoveAt((hostelryDetailGridControl.MainView as GridView).GetFocusedDataSourceRowIndex());
            hostelryDetailGridControl.RefreshDataSource();
        }

        private void gridView4_CustomDrawCell(object sender, RowCellCustomDrawEventArgs e)
        {
            try
            {
                if(e.Column== fromDayGridColumn)
                {
                    e.DisplayText = (gridView4.GetRow(e.RowHandle - 1) as TariffHostelryDetailEntity)?.FromDay.ToString() ?? "0";
                }
            }
            catch { }
        }

        private void ParkingTariffForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            eosEntityModifyToolsControl1.Focus();
        }

        private void ParkingTariffForm_Load(object sender, EventArgs e)
        {

        }

        private void eosEntityModifyToolsControl2_Load(object sender, EventArgs e)
        {

        }

        private void hostelryEntityModifyToolsControl_Load(object sender, EventArgs e)
        {

        }

        private void eosEntityModifyToolsControl3_Load(object sender, EventArgs e)
        {

        }
    }
}
