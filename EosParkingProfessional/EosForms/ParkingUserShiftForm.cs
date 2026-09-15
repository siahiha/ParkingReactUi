using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
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
using System.Threading.Tasks;
using System.Windows.Forms;
using EosParkingProfessional.Models;

namespace EosParkingProfessional.EosForms
{
    public partial class ParkingUserShiftForm : EosBaseForm
    {
        private List<UserWorkShiftEntity> editItems = new List<UserWorkShiftEntity>();
        private ParkingEntity parking;

        private void FilldoorsTextBox()
        {
            var task = Task.Factory.StartNew(() =>
            {
                var response = GetJsonObjecToLink<List<ParkingDoorEntity>>(ApiAddress.ParkingApi.GetParkingDoors, parking.Id);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    Invoke(new MethodInvoker(() =>
                    {
                        doorsTextBox.TextBoxObject.DataSource = response.Values;
                        doorsTextBox.TextBoxObject.DisplayMember = "Title";
                        doorsTextBox.TextBoxObject.ValueMember = "Id";
                    }));
                }
            });
            task.Wait(100);
            //else
            //    MessageShowError(response);
        }

        private void FillshiftRepositoryItemCombo()
        {
            var task = Task.Factory.StartNew(() =>
            {
                var response = GetJsonObjecToLink<List<UserEntity>>(ApiAddress.UserApi.Get);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    Invoke(new MethodInvoker(() =>
                    {
                        shiftRepositoryItemComboBox.Items.AddRange(response.Values);
                        shiftRepositoryItemComboBox.Items.Insert(0,new UserEntity { UserName="",Id=0});
                        //shiftRepositoryItemComboBox.displa = "UserName";
                        //shiftRepositoryItemComboBox.ValueMember = "Id";
                    }));
                }
            });
            task.Wait(100);
            //else
            //    MessageShowError(response);
        }

        private void FillGrid()
        {
            if(doorsTextBox.TextBoxObject?.SelectedValue==null)
            {
                MessageShowError("درب مورد نظر را انتخاب کنید");
                return;
            }
            var response = GetJsonObjecToLinkAndWait<List<UserWorkShiftEntity>>(ApiAddress.UserApi.GetUserWorkShifts, $"doorId={doorsTextBox.TextBoxObject.SelectedValue}&startDate={startDateTimePicker.TextBoxObject.MiladiDate?.Date.ToString("yyyy/MM/dd", CultureInfo.CreateSpecificCulture("en-US"))}&endDate={endDateTimePicker.TextBoxObject.MiladiDate?.Date.ToString("yyyy/MM/dd", CultureInfo.CreateSpecificCulture("en-US"))}");
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                gridControl1.DataSource = response.Values.OrderBy(q=>q.WorkDate).ToList();
            else
                MessageShowError(response);

            FullNameOnShift1GridColumn.Caption = "شیفت اول - " +("از " + parking.Shift1FromTime.Hours.ToString() + ":" + parking.Shift1FromTime.Minutes.ToString() + " تا " + parking.Shift1ToTime.Hours.ToString() + ":" + parking.Shift1ToTime.Minutes.ToString());
            FullNameOnShift1GridColumn.OptionsColumn.AllowEdit = PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingAssignedShiftAddOrEdit);

            FullNameOnShift2GridColumn.OptionsColumn.AllowEdit = parking.Shift2FromTime.HasValue &&  PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingAssignedShiftAddOrEdit);
            FullNameOnShift2GridColumn.ToolTip = "شیفت 2 در پارکینگ تعیین نگردیده";
            FullNameOnShift2GridColumn.Caption = "شیفت دوم - " + (!parking.Shift2FromTime.HasValue || parking.Shift2FromTime == TimeSpan.MinValue ? "غیر فعال" : ("از "+parking.Shift2FromTime.Value.Hours.ToString() + ":" + parking.Shift2FromTime.Value.Minutes.ToString() + " تا " + parking.Shift2ToTime.Value.Hours.ToString() + ":" + parking.Shift2ToTime.Value.Minutes.ToString()));

            FullNameOnShift3GridColumn.OptionsColumn.AllowEdit = parking.Shift3FromTime.HasValue && PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingAssignedShiftAddOrEdit);
            FullNameOnShift3GridColumn.ToolTip = "شیفت 3 در پارکینگ تعیین نگردیده";
            FullNameOnShift3GridColumn.Caption = "شیفت سوم - " + (!parking.Shift3FromTime.HasValue || parking.Shift3FromTime==TimeSpan.MinValue ? "غیر فعال" : ("از " + parking.Shift3FromTime.Value.Hours.ToString() + ":" + parking.Shift3FromTime.Value.Minutes.ToString() + " تا " + parking.Shift3ToTime.Value.Hours.ToString() + ":" + parking.Shift3ToTime.Value.Minutes.ToString()));
             
        }

        public ParkingUserShiftForm(ParkingEntity _parking)
        {
            InitializeComponent();
            parking = _parking;

            startDateTimePicker.TextBoxObject.MiladiDate = DateTime.Now;
            endDateTimePicker.TextBoxObject.MiladiDate = DateTime.Now.AddDays(30);
        }

        private void showButton_Click(object sender, EventArgs e)
        {
            FillGrid();
        }

        private void ParkingUserShiftForm_Load(object sender, EventArgs e)
        {
            FilldoorsTextBox();
            FillshiftRepositoryItemCombo();
        }

        private void shiftRepositoryItemComboBox_EditValueChanging(object sender, DevExpress.XtraEditors.Controls.ChangingEventArgs e)
        {
            try
            {
                //if (((gridControl1.MainView as GridView).GetFocusedRow() as UserWorkShiftEntity).WorkDate < DateTime.Now)
                //{
                //    e.Cancel = true;
                //}
                //else
                //{
                if(gridView1.FocusedColumn==FullNameOnShift1GridColumn)
                    ((gridControl1.MainView as GridView).GetFocusedRow() as UserWorkShiftEntity).UserIdOnShift1 = (e.NewValue as UserEntity)?.Id;
                else if (gridView1.FocusedColumn == FullNameOnShift2GridColumn)
                    ((gridControl1.MainView as GridView).GetFocusedRow() as UserWorkShiftEntity).UserIdOnShift2 = (e.NewValue as UserEntity)?.Id;
                else if (gridView1.FocusedColumn == FullNameOnShift3GridColumn)
                    ((gridControl1.MainView as GridView).GetFocusedRow() as UserWorkShiftEntity).UserIdOnShift3 = (e.NewValue as UserEntity)?.Id;

                e.NewValue = (e.NewValue as UserEntity).ToString();
                //}
            }
            catch { }
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            if (!SaveItem())
                return;
            Close();
        }

        private void gridView1_CellValueChanging(object sender, DevExpress.XtraGrid.Views.Base.CellValueChangedEventArgs e)
        {
            //if((gridControl1.DataSource as List<UserWorkShiftEntity>)[e.RowHandle].WorkDate<DateTime.Now)
                
        }

        private void gridView1_ValidateRow(object sender, DevExpress.XtraGrid.Views.Base.ValidateRowEventArgs e)
        {
            try
            {
                if (((gridControl1.MainView as GridView).GetFocusedRow() as UserWorkShiftEntity).WorkDate < DateTime.Now.Date)
                {
                    //e.Valid = false;
                    //e.ErrorText = "شیفت روزهای گذشته قابل تغیر نمی باشد";
                }
                else
                {
                    if(!editItems.Any(q=>q.WorkDate.Date==(e.Row as UserWorkShiftEntity).WorkDate.Date))
                    {
                        editItems.Add(e.Row as UserWorkShiftEntity);
                    }
                }
            }
            catch { }
        }

        private void gridView1_ValidatingEditor(object sender, DevExpress.XtraEditors.Controls.BaseContainerValidateEditorEventArgs e)
        {
            try
            {
                if (((gridControl1.MainView as GridView).GetFocusedRow() as UserWorkShiftEntity).WorkDate < DateTime.Now.Date)
                {
                    e.Valid = false;
                    e.ErrorText = "روزهای گذشته قابل ویرایش نمی باشد";
                    //(gridControl1.MainView as GridView).CancelUpdateCurrentRow();
                    //(gridControl1.MainView as GridView).CloseEditor();
                }
            }
            catch { }
        }


        private bool SaveItem()
        {
            if (!IsValidat())
                return false;
            try
            {
                foreach (var i in editItems)
                {
                    i.ParkingDoorId = (long)doorsTextBox.TextBoxObject.SelectedValue;
                    //if(i.Id>0)
                    {
                        i.UserIdOnShift1 = i.UserIdOnShift1 == 0 ? null : i.UserIdOnShift1;
                        i.UserIdOnShift2 = i.UserIdOnShift2 == 0 ? null : i.UserIdOnShift2;
                        i.UserIdOnShift3 = i.UserIdOnShift3 == 0 ? null : i.UserIdOnShift3;
                    }
                }

                ResponseResultWeb<bool> response =  PostJsonObjecToLinkAndWait<bool>(ApiAddress.UserApi.SaveUserWorkShifts, editItems, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (response.Values == true)
                        editItems.Clear();
                    //if (item.Id == 0)
                    //{
                    //    item.Id = response.Values;
                    //    (gridControl1.DataSource as List<ParkingDoorEntity>).Add(item);
                    //}
                    gridControl1.DataSource = null;
                    gridControl1.RefreshDataSource();
                    gridControl1.Refresh();
                    MessageShowSucsess();
                    return true;
                    //PropertyPanelFill(item, false);
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
            return false;
        }

        private bool IsValidat()
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingAssignedShiftAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return false;
            }
            if (gridView1.DataSource == null) { 
                MessageShowError("شیفتی انتخاب نشد است");
                return false;
            }
            //throw new NotImplementedException();
            return true;
        }

        private void shiftRepositoryItemComboBox_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
             
        }

        private void applyButton_Click(object sender, EventArgs e)
        {
            SaveItem();
        }

        private void gridView1_RowStyle(object sender, RowStyleEventArgs e)
        {
            if(e.RowHandle>0 && gridControl1.MainView.GetRow(e.RowHandle) as UserWorkShiftEntity!=null)
            if ((gridControl1.MainView.GetRow(e.RowHandle) as UserWorkShiftEntity).SolarDayOnWeekWork == "جمعه")
            {
                e.Appearance.BackColor = Color.FromArgb(250,200,200);
                e.Appearance.Options.UseBackColor = true;
                e.HighPriority = true;
            }
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            Close();
        }

        private void gridView1_KeyPress(object sender, KeyPressEventArgs e)
        {
            //if(e.Handled && e.KeyChar== 'e' && e.KeyChar == 'E')
            //{
            
            //}
        }

        private void popupCancelButton_Click(object sender, EventArgs e)
        {
            ClosePopup();
        }

        private void simpleButton1_Click(object sender, EventArgs e)
        {
            var row = gridView1.GetFocusedRow() as UserWorkShiftEntity;
            if (row != null)//editItems.Any(q => q.WorkDate.Date == row.WorkDate.Date))
            {
                shift1CheckBox.Enabled = true;
                shift1CheckBox.Checked = true;
                shift2CheckBox.Checked = !(!parking.Shift2FromTime.HasValue || parking.Shift2FromTime == TimeSpan.MinValue);
                shift2CheckBox.Enabled = !(!parking.Shift2FromTime.HasValue || parking.Shift2FromTime == TimeSpan.MinValue);
                shift3CheckBox.Checked = !(!parking.Shift3FromTime.HasValue || parking.Shift3FromTime == TimeSpan.MinValue);
                shift3CheckBox.Enabled = !(!parking.Shift3FromTime.HasValue || parking.Shift3FromTime == TimeSpan.MinValue);
                copyFromDateTimePicker.Value = row.WorkDate;
                copyToDateTimePicker.Value = (gridView1.DataSource as List<UserWorkShiftEntity>).Max(q => q.WorkDate);
                ShowPopup(false);
                //editItems.Add(row as UserWorkShiftEntity);
            }
        }

        private void panelControl2_Paint(object sender, PaintEventArgs e)
        {

        }

        private void popupOkButton_Click(object sender, EventArgs e)
        {
            var row = gridView1.GetFocusedRow() as UserWorkShiftEntity;
            for (var i=copyFromDateTimePicker.Value.Value; i<=copyToDateTimePicker.Value;i=i.Date.AddDays(1))
            {
                //
                var item=editItems.FirstOrDefault(q => q.WorkDate.Date == i);
                var rowItems= (gridView1.DataSource as List<UserWorkShiftEntity>).FirstOrDefault(q => q.WorkDate == i.Date);
                if (item==null)
                {
                    item = new UserWorkShiftEntity { ParkingDoorId = row.ParkingDoorId, WorkDate = i.Date, PersistOn = DateTime.Now };
                    editItems.Add(item);
                }
                if (shift1CheckBox.Checked)
                {
                    item.UserIdOnShift1 = row.UserIdOnShift1;
                    item.FullNameOnShift1 = row.FullNameOnShift1;
                    rowItems.UserIdOnShift1 = row.UserIdOnShift1;
                    rowItems.FullNameOnShift1 = row.FullNameOnShift1;
                }
                if (shift2CheckBox.Checked)
                {
                    item.UserIdOnShift2 = row.UserIdOnShift2;
                    item.FullNameOnShift2 = row.FullNameOnShift2;
                    rowItems.UserIdOnShift2 = row.UserIdOnShift2;
                    rowItems.FullNameOnShift2 = row.FullNameOnShift2;
                }
                if (shift3CheckBox.Checked)
                {
                    item.UserIdOnShift3 = row.UserIdOnShift3;
                    item.FullNameOnShift3 = row.FullNameOnShift3;
                    rowItems.UserIdOnShift3 = row.UserIdOnShift3;
                    rowItems.FullNameOnShift3 = row.FullNameOnShift3;
                }

                gridView1.RefreshData();
                ClosePopup();
            }
        }
    }
}
