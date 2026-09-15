using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Core.Models;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParking.Data.EF.PagingModel;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class ManageTrafficRecordForm : EosBaseForm
    {
        ParkingEntity _parking;
        void GetParkingTariffs()
        {
            var response = GetJsonObjecToLink<List<TariffDto>>(ApiAddress.TariffApi.GetByParkingId, _parking.Id);

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                
                tariffTextBox.TextBoxObject.DataSource = response.Values.OrderBy(q => q.IsCurrent).ToList();
                tariffTextBox.TextBoxObject.ValueMember = "Id";
                tariffTextBox.TextBoxObject.DisplayMember = "Title";
                if(response.Values.Count>0)
                    tariffTextBox.TextBoxObject.SelectedValue = response.Values.FirstOrDefault(q => q.IsCurrent)?.Id?? response.Values.FirstOrDefault()?.Id;
            }
        }

        void GetParkingDoors()
        {
            var response = GetJsonObjecToLink<List<ParkingDoorEntity>>(ApiAddress.ParkingApi.GetParkingDoors, _parking.Id);

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            { 
                doorTextBox.TextBoxObject.DataSource = response.Values.ToList();
                doorTextBox.TextBoxObject.ValueMember = "Id";
                doorTextBox.TextBoxObject.DisplayMember = "Title";
                if (response.Values.Count > 0)
                    tariffTextBox.TextBoxObject.SelectedValue = response.Values.FirstOrDefault()?.Id;
            }
        }

        public void GetTrafficDetailes(DateTime startDateTime, DateTime endDateTime,DumpRecordTypes dumpType,int PageNumber = 1, int PageSize = 500)
        {
            PageFilterModel<TrafficFilterModel> pageTrafficModel=new PageFilterModel<TrafficFilterModel>() { Filters=new TrafficFilterModel { EndDateTime= endDateTime,StartDateTime= startDateTime,DumpType=dumpType,ParkingId= _parking.Id } };
            pageTrafficModel.PageSize = PageSize;
            pageTrafficModel.PageNumber = PageNumber;
            var response = PostJsonObjecToLink<PageResult<ExitBillDto>>(ApiAddress.TrafficApi.GetAllTraffics, pageTrafficModel);
            var focuseItem = (trafficGrid.MainView as GridView).GetFocusedRow();
            if (trafficGrid.InvokeRequired)
                trafficGrid.Invoke(new MethodInvoker(() =>
                {
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        trafficGrid.DataSource = response.Values.Items.OrderByDescending(q => q.EnterDateTime).ToList();

                        try
                        {
                            (trafficGrid.MainView as GridView).FocusedRowHandle = (response.Values.Items.OrderByDescending(q => q.EnterDateTime).ToList().IndexOf(response.Values.Items.FirstOrDefault(q => q.DumpId == (focuseItem as ExitBillDto).DumpId)));
                        }
                        catch (Exception)
                        { 
                        }
                        eosPagingToolsGrid.TotalRecordCount = response.Values.TotalCount;
                    }
                    // MessageShowError(response);
                }));
            else
            {
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    trafficGrid.DataSource = response.Values.Items.OrderByDescending(q => q.EnterDateTime).ToList();
                    //(trafficGrid.MainView as GridView).SelectCell(response.Values.OrderBy(q=>q.DumpId).ToList().IndexOf(response.Values.FirstOrDefault(q => q.DumpId == (focuseItem as ExitBillDto).DumpId)), gridColumnMemberCode);
                    //(trafficGrid.MainView as GridView).SelectRow(response.Values.OrderBy(q => q.DumpId).ToList().IndexOf(response.Values.FirstOrDefault(q => q.DumpId == (focuseItem as ExitBillDto).DumpId)));
                    try
                    {
                        (trafficGrid.MainView as GridView).FocusedRowHandle = (response.Values.Items.OrderByDescending(q => q.EnterDateTime).ToList().IndexOf(response.Values.Items.FirstOrDefault(q => q.DumpId == (focuseItem as ExitBillDto).DumpId)));
                    }
                    catch (Exception)
                    {
                    }
                    eosPagingToolsGrid.TotalRecordCount = response.Values.TotalCount;
                }
            }
        }
        public void GetTrafficDetailesSync(DateTime startDateTime, DateTime endDateTime)
        {
            try
            {
                var from = fromDateTimePicker.TextBoxObject.MiladiDate.Value;
                var to = toDateTimePicker.TextBoxObject.MiladiDate.Value;
                var pageNumber = eosPagingToolsGrid.PageNumber;
                var pageCount = eosPagingToolsGrid.PageRecordCount;
                Task.Factory.StartNew(() =>
                {
                    GetTrafficDetailes(from, to, (DumpRecordTypes)sourceTypeTextBox.TextBoxObject.SelectedIndex,pageNumber, pageCount);
                }).Wait(100);
            }
            catch { }
        }

        void GetCarInfo(bool isplate, bool isCard, bool isMember)
        {
            if (isplate && (string.IsNullOrEmpty(eosPlateControl1.Plate) || !eosPlateControl1.IsValid))
                return;
            if (isCard && string.IsNullOrEmpty(cardTextBox.Text))
                return;
            if (isMember && string.IsNullOrEmpty(memberCodeTextBox.Text))
                return;
            var response = GetJsonObjecToLink<CarTrafficInfoDto>(ApiAddress.TrafficApi.GetCarTrafficInfo, $"parkingId={_parking.Id}&plate={(isplate ? eosPlateControl1.Plate : string.Empty)}&memberCard={(isCard ? cardTextBox.Text : string.Empty)}&memberCode={(isMember ? memberCodeTextBox.Text : string.Empty)}");

            //if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            //{
            //    //if (!string.IsNullOrEmpty(eosPlateControl1.Plate))
            //    //{
            //        //cardTextBox.Text = response.Values.MemberCard;
            //        //memberCodeTextBox.Text = response.Values.MemberCode;
            //        SetCarInfo(response.Values);
            //    //}
            //}
            //else
            SetFormCarInfo(response.Values, isplate, isCard, isMember);
        }

        public void SetFormCarInfo(CarTrafficInfoDto carInfo, bool isplate, bool isCard, bool isMember)
        {
            //if (carInfo == null)
            //    return;
            if (InvokeRequired)
                Invoke(new MethodInvoker(() =>
                {
                    SetFormCarInfo(carInfo, isplate, isCard, isMember);
                    return;
                }));

            if (isplate/*!string.IsNullOrEmpty(eosPlateControl1.Plate)*/)
            {
                //if(carInfo == null || carid)
                if (string.IsNullOrEmpty(cardTextBox.Text))
                    cardTextBox.Text = carInfo.CardNumber;
                //if (string.IsNullOrEmpty(memberCodeTextBox.Text))
                memberGroupBox.Visible = !string.IsNullOrEmpty(carInfo.MemberCode);
                memberCodeTextBox.Text = carInfo.MemberCode;
                memberNameLabel.Text ="نام عضو: "+ carInfo.MemberCode;
                cardTextBox.Text = carInfo.CardNumber;
                memberCardLabel.Text=string.IsNullOrEmpty(carInfo.CardNumber)? "شماره کارت عضو: " + carInfo.CardNumber:"";
                if (!eosPlateControl1.IsValid)
                    eosPlateControl1.Plate = carInfo?.Plate;
            }
            if (isMember/*!string.IsNullOrEmpty(memberCodeTextBox.Text)*/)
            {
                if (carInfo == null || carInfo.MemberId == 0)
                {
                    MessageShowError("عضوی با این مشخصات وجود ندارد");
                    return;
                }
                if (string.IsNullOrEmpty(eosPlateControl1.Plate))
                    eosPlateControl1.Plate = carInfo.Plate;
                //if (string.IsNullOrEmpty(cardTextBox.Text))
                cardTextBox.Text = carInfo.CardNumber;
                cardTextBox.Text = carInfo.CardNumber;
                //if (string.IsNullOrEmpty(memberCodeTextBox.Text))
                //memberCodeTextBox.Text = carInfo.MemberCode; 
            }
            if (isCard/*!string.IsNullOrEmpty(cardTextBox.Text)*/)
            {
                if (carInfo == null || carInfo.CardId == 0)
                {
                    MessageShowError("کارتی با این مشخصات وجود ندارد");
                    return;
                }
                if (string.IsNullOrEmpty(eosPlateControl1.Plate))
                    eosPlateControl1.Plate = carInfo.Plate;
                //if (string.IsNullOrEmpty(memberCodeTextBox.Text))
                memberCodeTextBox.Text = carInfo.MemberCode;
                cardTextBox.Text = carInfo.CardNumber;
            }
            memberCodeTextBox.Text = carInfo.MemberCode;
            memberNameLabel.Text = "نام عضو: " + carInfo.MemberCode;
            cardTextBox.Text = carInfo.CardNumber;

            //infoGridControl.DataSource = new List<CardInfoView>() { new CardInfoView
            //{
            //    EntranceDateTime = (carInfo.EnterDateTime == null || carInfo.EnterDateTime <= DateTime.MinValue) ? "" : /*Environment.NewLine+*/ carInfo.EnterDateTime.Value.ToPersianDatetime(),
            //    CarName=carInfo.CarName,
            //    CarType = eosPlateControl1.CarType.DisplayString(),
            //    CarColor = carInfo.CarColor,
            //    CarModle = carInfo.CarModel,
            //    MemberName=carInfo.MemberFullName
            //}};
            //infoGridControl.RefreshDataSource();
            //infoGridControl.Refresh();
            //carInfoLabel.Text += string.IsNullOrEmpty(carInfo.CarName) ? "" : $"نام خودرو:   {carInfo.CarName}" + Environment.NewLine + Environment.NewLine;
            //carInfoLabel.Text += string.IsNullOrEmpty(carInfo.MemberFullName) ? "" : $"نام عضو: {carInfo.MemberFullName}" + Environment.NewLine + Environment.NewLine;
            //carInfoLabel.Text += string.IsNullOrEmpty(carInfo.MemberTariffName) ? "" : $"نام تعرفه: {carInfo.MemberTariffName}" + Environment.NewLine + Environment.NewLine;
            ////carInfoLabel.Text += string.IsNullOrEmpty(carInfo.MemberTariffName) ? "" : $"نام تعرفه: {carInfo.MemberTariffName}" + Environment.NewLine + Environment.NewLine;

            //carPicture.Image = carInfo.EnteranceImage;

            //currentCarInfo = carInfo;
            //SetInfo(carInfo.MemberCars?.FirstOrDefault()?.DtoViewCarColorTitle, carInfo.MemberCars?.FirstOrDefault()?.DtoViewCarModelTitle, carInfo.CarName);

            panel1.Focus();
        }

        public ManageTrafficRecordForm(ParkingEntity parking)
        {
            InitializeComponent();
            _parking = parking;
            GetParkingTariffs();
            GetParkingDoors();
            GetTrafficDetailesSync(DateTime.Now.AddMonths(-1),DateTime.Now);
            newCargoColumn.Visible = LockOprator.HasAccessToCargoAbility;
            enterNewDateTimePicker.TimePicker = true;
            exitNewDateTimePicker.TimePicker = true;
            fromDateTimePicker.TimePicker = true;
            toDateTimePicker.TimePicker = true;
            fromDateTimePicker.Value = DateTime.Now.AddMonths(-1);
            toDateTimePicker.Value = DateTime.Now;
            exitNewDateTimePicker.Value = DateTime.Now;
            enterNewDateTimePicker.Value = DateTime.Now;
            editExitDateTimePicker.Value = DateTime.Now;
            editEnterDateTimePicker.Value = DateTime.Now;
            editExitDateTimePicker.TimePicker = true;
            editEnterDateTimePicker.TimePicker = true;
            sourceTypeTextBox.TextBoxObject.DataSource = /*new string[] { "ویرایش شده ها", "خروج ناقص","ورود ناقص"};//*/ EosParking.Core.Helpers.EnumHelper.EnumToListDisplayName(typeof(EosParking.Core.Enums.DumpRecordTypes), true);

        }

        private void eosPagingToolsGrid_OnChangePageNumber(object sender, EventArgs e)
        {
            GetTrafficDetailes(fromDateTimePicker.TextBoxObject.MiladiDate.Value.Add(toDateTimePicker.TextBoxObject.TimeValue ?? TimeSpan.MinValue), toDateTimePicker.TextBoxObject.MiladiDate.Value.Add(toDateTimePicker.TextBoxObject.TimeValue ?? TimeSpan.MinValue), (DumpRecordTypes)sourceTypeTextBox.TextBoxObject.SelectedIndex, eosPagingToolsGrid.PageNumber, eosPagingToolsGrid.PageRecordCount);
        }

        private void eosPagingToolsGrid_OnChangePageRecordCount(object sender, EventArgs e)
        {
            GetTrafficDetailes(fromDateTimePicker.TextBoxObject.MiladiDate.Value.Add(toDateTimePicker.TextBoxObject.TimeValue ?? TimeSpan.MinValue), toDateTimePicker.TextBoxObject.MiladiDate.Value.Add(toDateTimePicker.TextBoxObject.TimeValue ?? TimeSpan.MinValue), (DumpRecordTypes)sourceTypeTextBox.TextBoxObject.SelectedIndex, eosPagingToolsGrid.PageNumber, eosPagingToolsGrid.PageRecordCount);
        }

        private void eosPlateControl1_Validated(object sender, EventArgs e)
        {
            if (sender == eosPlateControl1)
                GetCarInfo(true, false, false);
            else
            {
               
                GetCarInfo(false, sender == cardTextBox, sender == memberCodeTextBox);
                
            }
            panel1.Focus();
        }

        private void simpleButton2_Click(object sender, EventArgs e)
        {
            GetTrafficDetailes(fromDateTimePicker.TextBoxObject.MiladiDate.Value.Add(fromDateTimePicker.TextBoxObject.TimeValue??TimeSpan.MinValue), toDateTimePicker.TextBoxObject.MiladiDate.Value.Add(toDateTimePicker.TextBoxObject.TimeValue ?? TimeSpan.MinValue), (DumpRecordTypes)sourceTypeTextBox.TextBoxObject.SelectedIndex, eosPagingToolsGrid.PageNumber, eosPagingToolsGrid.PageRecordCount);
        }

        private void saveRecordButton_Click(object sender, EventArgs e)
        {

            if(!eosPlateControl1.IsValid)
            {
                MessageShowError("مشخصات پلاک را کامل وارد نمایید");
                return;
            }
            if (!enterNewDateTimePicker.Value.HasValue && !exitNewDateTimePicker.Value.HasValue)
            {
                MessageShowError("زمان ورود و خروج را وارد نمایید");
                return;
            }
            //string plate, CarTypes carType, DateTime? enterDateTime, DateTime? exitDateTime
            CreateManualDump(eosPlateControl1.Plate,_parking.Id,eosPlateControl1.CarType,enterNewDateTimePicker.Value,exitNewDateTimePicker.Value, long.Parse(doorTextBox.TextBoxObject.SelectedValue.ToString()));
        }
        void CreateManualDump(string plate,long parkingId, CarTypes carType, DateTime? enterDateTime, DateTime? exitDateTime,long doorId)
        {
            
            //var dump = new TrafficDumpEntity
            //{
            //    DoorId = currentDoor.Id,
            //    CardId = currentCarInfo?.CardId,
            //    MemberId = currentCarInfo?.MemberId,
            //    CarPlate = eosPlateControl1.Plate,
            //    CarType = eosPlateControl1.CarType,
            //    Car = new CarEntity { Id = currentCarInfo?.CardId ?? 0, DtoViewCarColorTitle = currentCarInfo?.CarColor, DtoViewCarModelTitle = currentCarInfo?.CarModel },
            //    Id = currentCarInfo?.DumpId ?? 0,
            //    CarId = currentCarInfo?.CarId,
            //    SourceType = DumpSourceTypes.UserManual,
            //    IdOnDevice = 0,
            //    PersistBy = PublicVariables.CurrentUser.Id,
            //    TariffId = currentCarInfo.MemberTariffId
            //};

            var response = GetJsonObjecToLinkAndWait<KeyValuePair<long, EosParking.Data.EF.Entities.TrafficDumpEntity>>(ApiAddress.TrafficApi.CreateManualDump, $"plate={plate}&parkingId={parkingId}&carType={carType}&enterDateTime={(!enterDateTime.HasValue?"null":enterDateTime.Value.ToString("yyyy/MM/dd HH:mm:ss",CultureInfo.GetCultureInfo("Un").DateTimeFormat))}&exitDateTime={(!exitDateTime.HasValue?"null":exitDateTime.Value.ToString("yyyy/MM/dd HH:mm:ss", CultureInfo.GetCultureInfo("Un").DateTimeFormat))}&doorId={doorId}", false);
            //if (this.InvokeRequired)
            //Invoke(new MethodInvoker(() =>
            //{
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                MessageShowSucsess();
            }
            else
                MessageShowError(response);
            //}));
        }

        private void editRepositoryGridButton_ButtonClick(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = (trafficGrid.MainView as GridView).GetFocusedRow() as ExitBillDto;
            popupWinControl1.Tag = entry;
            editEnterDateTimePicker.Value = entry.EnterDateTime;
            editExitDateTimePicker.Value = entry.ExitDateTime??DateTime.Now;
            editEnterDateTimePicker.Enabled = (entry.SourceType == DumpSourceTypes.EnterEdited || entry.SourceType == DumpSourceTypes.Edited);
            editExitDateTimePicker.Enabled = (entry.SourceType == DumpSourceTypes.ExitEdited || entry.SourceType == DumpSourceTypes.Edited || !entry.ExitDateTime.HasValue);
            ShowPopup(false);
            editExitDateTimePicker.TimePicker = true;
            editEnterDateTimePicker.TimePicker = true;
        }

        private void editButton_Click(object sender, EventArgs e)
        {
            var entry = popupWinControl1.Tag as ExitBillDto;

            DumpSourceTypes srtype = entry.SourceType;
            switch(srtype)
            {
                case DumpSourceTypes.Camera:
                case DumpSourceTypes.Device:
                case DumpSourceTypes.UserManual:
                    if (!entry.ExitDateTime.HasValue)
                        srtype = DumpSourceTypes.ExitEdited;
                    break;
                case DumpSourceTypes.Edited:
                    break;
                case DumpSourceTypes.EnterEdited:
                    srtype = DumpSourceTypes.Edited;
                    break;
            }

            var item = new TrafficDumpEntity
            {
                Id = entry.DumpId,
                CarPlate=entry.CarPlate, 
                SourceType = srtype,
                CarType = entry.CarType,
                EnterDateTime = editEnterDateTimePicker.Value.Value,
                ExitDateTime = editExitDateTimePicker.Value.Value
                
            };
            var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.TrafficApi.Save,item , false);
            //if (this.InvokeRequired)
            //Invoke(new MethodInvoker(() =>
            //{
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                MessageShowSucsess();
                entry.EnterDateTime = item.EnterDateTime;
                entry.ExitDateTime = item.ExitDateTime;
                entry.SourceType = item.SourceType;
                gridView1.RefreshData();
                popupWinControl1.Tag = null;
                ClosePopup();
            }
            else
                MessageShowError(response);

        }

        private void editCancelButton_Click(object sender, EventArgs e)
        {
            popupWinControl1.Tag = null;
            ClosePopup();

        }

        private void gridView1_CustomDrawCell(object sender, DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs e)
        {
            if(e.Column== gridColumnEnterDateTime)
            {
                var entry = (gridView1.GetRow(e.RowHandle) as ExitBillDto);
                if (entry.SourceType==DumpSourceTypes.EnterEdited || entry.SourceType == DumpSourceTypes.Edited)
                    e.Appearance.ForeColor = ForeColor;
                else 
                    e.Appearance.ForeColor = Color.Red;
                e.DisplayText = entry.EnterDateTime.ToPersianDatetime();
            }
            else
                if (e.Column == gridColumnExitDateTime  )
            {
                var entry = (gridView1.GetRow(e.RowHandle) as ExitBillDto);
                if (entry.SourceType == DumpSourceTypes.ExitEdited || entry.SourceType == DumpSourceTypes.Edited)
                    e.Appearance.ForeColor = ForeColor;
                else
                    e.Appearance.ForeColor = Color.Red;
                e.DisplayText = entry.ExitDateTime?.ToPersianDatetime();
            }
            else
                e.Appearance.ForeColor = ForeColor;
        }

        private void deleteRepositoryGridButtonEdit1_ButtonClick(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = gridView1.GetFocusedRow() as ExitBillDto; 
            if(entry.SourceType!=DumpSourceTypes.Edited && !(entry.SourceType == DumpSourceTypes.EnterEdited && !entry.ExitDateTime.HasValue) )
            {
                MessageShowError("فقط رکورد هایی که ورود و خروجشان توسط کاربر ثبت شده باشد قابل حذف می باشند");
                return;
            }
            if (ShowQuestion(message: "آیا می خواهید حذف انجام گردد") != DialogResult.OK)
                return;

            var response = GetJsonObjecToLinkAndWait<bool>(ApiAddress.TrafficApi.DeleteById, entry.DumpId, false);
            //if (this.InvokeRequired)
            //Invoke(new MethodInvoker(() =>
            //{
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                if (response.Values)
                {
                    MessageShowSucsess();
                    gridView1.DeleteSelectedRows();
                }
                else
                    MessageShowError("متاسفانه حذف انجام نگردید");
            }
            else
                MessageShowError(response);
        }

        private void ManageTrafficRecordForm_Shown(object sender, EventArgs e)
        {

            if (tariffTextBox.TextBoxObject.DataSource == null || (tariffTextBox.TextBoxObject.DataSource as List<TariffDto>).Count == 0)
            {
                MessageShowError("تعرفه ای در سیستم تعریف نگردیده است");
                Close();
                return;
            }
        }

        private void clearDatePickerButton_Click(object sender, EventArgs e)
        {
            if (sender == clearDatePickerButton)
                enterNewDateTimePicker.TextBoxObject.MiladiDate = null;
            else
                exitNewDateTimePicker.TextBoxObject.MiladiDate = null;
        }

        private void cargoRepositoryGridButton_Click(object sender, EventArgs e)
        {
            var control = (Control)sender;
            Point position = control.PointToScreen(new Point(0, control.Height));
            cargoMenuStrip.Show(position);
        }

        private void inCargoMenuItem_Click(object sender, EventArgs e)
        {
            var dumpInfo = (gridView1.GetFocusedRow() as ExitBillDto);

            if (dumpInfo == null)
                return;

            try
            {
                NewCargoForm cargo = new NewCargoForm(dumpInfo, false);
                cargo.BringToFront();
                if (cargo.IsBeforeRegistered)
                    MessageShowError("قبلا بار ورودی ثبت گردیده است");
                else
                    cargo.ShowDialog();

                cargo.Dispose();
            }
            catch (Exception ex)
            {
                MessageShowError(ex);
            }
        }

        private void outCargoMenuItem_Click(object sender, EventArgs e)
        {
            var dumpInfo = (gridView1.GetFocusedRow() as ExitBillDto);

            if (dumpInfo == null)
                return;

            try
            {
                NewCargoForm cargo = new NewCargoForm(dumpInfo, true);
                cargo.BringToFront();

                if (cargo.IsBeforeRegistered)
                    MessageShowError("قبلا بار خروجی ثبت گردیده است");
                else
                    cargo.ShowDialog();

                cargo.Dispose();
            }
            catch (Exception ex)
            {
                MessageShowError(ex);
            }
        }
    }
}
