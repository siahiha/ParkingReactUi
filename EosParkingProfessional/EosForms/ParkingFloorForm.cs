using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParkingProfessional.Models;

namespace EosParkingProfessional.EosForms
{
    public partial class ParkingFloorForm : EosBaseForm
    {
        ParkingEntity parking;
        List<ParkingParkSpaceEntity> changedParkSpaces = new List<ParkingParkSpaceEntity>();
        private void FillGrid()
        {
            deleteGridColumn.Visible = PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingFloorAddOrEdit);
            var response = GetJsonObjecToLinkAndWait<List<ParkingFloorDto>>(ApiAddress.ParkingApi.GetParkingFloors, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                gridControl1.DataSource = response.Values;
            else
                MessageShowError(response);
        }

        private ParkingFloorDto GetFloorById(long id)
        {
            var response = GetJsonObjecToLinkAndWait<ParkingFloorDto>(ApiAddress.ParkingApi.GetParkingFloorById, id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                return response.Values;
            else
                return null;
        }

        public ParkingFloorForm(ParkingEntity parking)
        {
            InitializeComponent();
            this.parking = parking;
        }


        private void ParkingFloorForm_Load(object sender, EventArgs e)
        {
            FillGrid();
            statusTextBox.TextBoxObject.Items.Clear();
            statusTextBox.TextBoxObject.DataSource = new List<string> { "فعال", "غیر فعال" };
            FillParkSpaceTypeCombo();
            propertyPanel.Enabled = false;
        }

        private void FillParkSpaceTypeCombo()
        {
            var response = GetJsonObjecToLinkAndWait<List<ParkingFloorDto>>(ApiAddress.ParkingApi.GetParkingParkSpaceKinds, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                parkSpaceTypeTextBox.TextBoxObject.DataSource = response.Values;
                parkSpaceTypeTextBox.TextBoxObject.DisplayMember = "Title";
                parkSpaceTypeTextBox.TextBoxObject.ValueMember = "Id";
            }
            else
                MessageShowError(response);
        }

        void ClearForm()
        { 
            titleTextBox.Text = "";
        }
        private void PropertyPanelFill(ParkingFloorDto entry, bool enable)
        {
            
            propertyPanel.Enabled = enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;
            if (entry == null)
            { 
                ClearForm();
                entry = new ParkingFloorDto() { Title="جدید",ParkingId=parking.Id};
            }
            infoLabel.Text = "تعداد جای پارک " + entry.ParkSpaces.Count + Environment.NewLine + "تعداد جای پارک فعال " + entry.ParkSpaces.Where(q => q.IsActive).Count().ToString();
            actionPanel.Tag = entry;
            descriptionTextBox.Text = entry.Description;
            floorTitleLabel.Text = entry.Title;
            titleTextBox.Text = entry.Title;
            parkSpacesGrid.DataSource = entry.ParkSpaces.ToList();
            parkSpacesGrid.RefreshDataSource();
            cancelButton.Visible = okButton.Visible = enable;
            changedParkSpaces?.Clear();
        }

        bool IsValidat()
        { 
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingFloorAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return false;
            }
            if (string.IsNullOrEmpty(titleTextBox.Text)  )
            {
                MessageShowError("لطفا اطلاعات را بصورت صحیح وارد کنید.");
                return false;
            }
            //if (repeatUserPassTextBox.Visible && userPassTextBox.Text != userPassTextBox.Text)
            //{
            //    MessageShowError("کلمه عبور نادرست می باشد");
            //    return false;
            //}
            //if (accessLevelTextBox.TextBoxObject.SelectedValue == null || accessLevelTextBox.TextBoxObject.SelectedValue.ToString() == "0")
            //{
            //    MessageShowError("سطح دسترسی را وارد نمایید");
            //    return false;
            //}

            return true;
        }

        private void SaveItem()
        {
            if (!IsValidat())
                return;
            try
            {
                var item = actionPanel.Tag as ParkingFloorDto;
                var ds = item.ParkSpaces.ToList();
                if (item == null)
                {
                    item = new ParkingFloorDto();
                }
                item.Title = titleTextBox.Text;
                
                item.PersistOn = DateTime.Now;
                item.Description = descriptionTextBox.Text;
                item.ParkSpaces = changedParkSpaces;


                var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.ParkingApi.SaveParkingFloor, item, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values > 0)
                {
                    if (item.Id == 0)
                    {
                        item.Id = response.Values;
                        (gridControl1.DataSource as List<ParkingFloorDto>).Add(item);
                    }
                    gridControl1.RefreshDataSource();
                    gridControl1.Refresh();
                    if (item.Id > 0)
                    {
                        var f = GetFloorById(item.Id);
                        if (f != null)
                            item.ParkSpaces = f.ParkSpaces;
                        else
                            item.ParkSpaces = ds;
                    }
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
            var entry = ((gridControl1.DataSource as List<ParkingFloorDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingFloorDelete))
            {
                MessageShowErrorUserPermision();
                return ;
            }
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<ParkingFloorDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.ParkingApi.DeleteParkingFloor, entry.Id);
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
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as ParkingFloorDto;
                PropertyPanelFill(entry, false);
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

        private void repositoryStatusItemButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {

        }

        private void groupCheckEdit_CheckedChanged(object sender, EventArgs e)
        {
            panel1.Enabled = groupCheckEdit.Checked;
        }

        private void eosEntityModifyToolsControl2_ClickNewButton(object sender, EventArgs e)
        {
            groupCheckEdit.Visible = panel1.Visible = true;
            parkSpaceTitleTextBox.Text = "";
            fromTextBox.Text = "";
            toTextBox.Text = "";
            groupCheckEdit.Checked = false;
            ShowPopup(true);
            parkSpaceTitleTextBox.Focus();
        }

        private void popupCancelButton_Click(object sender, EventArgs e)
        {
            ClosePopup();
        }

        private void popupOkButton_Click(object sender, EventArgs e)
        {
            
            if(string.IsNullOrEmpty(parkSpaceTitleTextBox.Text)|| string.IsNullOrEmpty(parkSpaceTypeTextBox.Text) || ((string.IsNullOrEmpty(fromTextBox.Text) || string.IsNullOrEmpty(toTextBox.Text)) && groupCheckEdit.Checked))
            {
                MessageShowValidationError();
                return;
            }
            int result = -1;
                        var floor = (actionPanel.Tag as ParkingFloorDto);
                        var parkSpaces = parkSpacesGrid.DataSource as List<ParkingParkSpaceEntity>;

            try
            {
                if (PopupControl.Tag == null)
                {
                    if (groupCheckEdit.Checked)
                    {
                        

                        for (int i = int.Parse(fromTextBox.Text.Replace(",","")); i <= int.Parse(toTextBox.Text.Replace(",", "")); i++)
                            if (floor == null || parkSpaces.Any(q => q.Title == parkSpaceTitleTextBox.Text + i.ToString()))
                            {
                                MessageShowError($"عنوان '{parkSpaceTitleTextBox.Text + i.ToString()}' تکراری می باشد");
                                return;
                            }

                        for (int i = int.Parse(fromTextBox.Text.Replace(",", "")); i <= int.Parse(toTextBox.Text.Replace(",", "")); i++)
                        {
                            AddParkSpace(0, parkSpaceTitleTextBox.Text + i.ToString(), statusTextBox.TextBoxObject.SelectedIndex == 0,(long)parkSpaceTypeTextBox.TextBoxObject.SelectedValue , parkSpaceTypeTextBox.TextBoxObject.Text);
                        }

                    }
                    else
                        result = AddParkSpace(0, parkSpaceTitleTextBox.Text, statusTextBox.TextBoxObject.SelectedIndex == 0, (long)parkSpaceTypeTextBox.TextBoxObject.SelectedValue, parkSpaceTypeTextBox.TextBoxObject.Text);
                }
                else
                {
                    if ((PopupControl.Tag as ParkingParkSpaceEntity).Id > 0)
                    {
                        result = AddParkSpace((PopupControl.Tag as ParkingParkSpaceEntity).Id, parkSpaceTitleTextBox.Text, statusTextBox.TextBoxObject.SelectedIndex == 0, (long)parkSpaceTypeTextBox.TextBoxObject.SelectedValue, parkSpaceTypeTextBox.TextBoxObject.Text);
                    }
                    else
                    {
                        if ((PopupControl.Tag as ParkingParkSpaceEntity).Title != parkSpaceTitleTextBox.Text && (floor == null || parkSpaces.Any(q => ((PopupControl.Tag as ParkingParkSpaceEntity).Id==0 || q.Id != (PopupControl.Tag as ParkingParkSpaceEntity).Id) && q.Title == parkSpaceTitleTextBox.Text)))
                        {
                            MessageShowError($"عنوان تکراری می باشد");
                            return;
                        }
                        (PopupControl.Tag as ParkingParkSpaceEntity).Title = parkSpaceTitleTextBox.Text;
                        (PopupControl.Tag as ParkingParkSpaceEntity).IsActive = statusTextBox.TextBoxObject.SelectedIndex == 0;
                        (PopupControl.Tag as ParkingParkSpaceEntity).ParkingParkSpaceKindId = (long)parkSpaceTypeTextBox.TextBoxObject.SelectedValue;
                        (PopupControl.Tag as ParkingParkSpaceEntity).ParkingParkSpaceKindTitle = parkSpaceTypeTextBox.TextBoxObject.Text;
                    }
                }

            }
            catch { }
            if(result==0)
            {
                MessageShowError($"عنوان تکراری می باشد");
                return;
            }
            ClosePopup();
            gridView2.RefreshData();
            //PropertyPanelFill(actionPanel.Tag as ParkingFloorDto,true);

        }

        private int AddParkSpace(long parkSpaceId, string title, bool status, long parkSpaceTypeId,string parkingParkSpaceKindTitle)
        {
            try
            {
                var floor = (actionPanel.Tag as ParkingFloorDto);
                var parkSpaces = parkSpacesGrid.DataSource as List<ParkingParkSpaceEntity>;

                if (floor == null || parkSpaces.Any(q => (q.Id!=parkSpaceId || parkSpaceId==0) && q.Title == title))
                {
                    return 0;
                }
                else
                {
                    if (parkSpaceId == 0)
                    {
                        parkSpaces.Add(new ParkingParkSpaceEntity
                        {
                            Id = 0,
                            Title = title,
                            IsActive = status,
                            PersistOn = DateTime.Now,
                            ParkingFloorId = floor.Id,
                            PersistBy = PublicVariables.CurrentUser.Id,
                            ParkingParkSpaceKindId = parkSpaceTypeId,
                            ParkingParkSpaceKindTitle = parkingParkSpaceKindTitle
                        });
                        if (changedParkSpaces.Any(q => q.Id == 0 && q.Title == title))
                        {
                            var sp = changedParkSpaces.FirstOrDefault(q => q.Id == 0 && q.Title == title);
                            sp = new ParkingParkSpaceEntity { Id = 0, Title = title, IsActive = status, PersistOn = DateTime.Now, ParkingFloorId = floor.Id, PersistBy = PublicVariables.CurrentUser.Id, ParkingParkSpaceKindId = parkSpaceTypeId };

                        }
                        else
                            changedParkSpaces.Add(new ParkingParkSpaceEntity { Id = 0, Title = title, IsActive = status, PersistOn = DateTime.Now, ParkingFloorId = floor.Id, PersistBy = PublicVariables.CurrentUser.Id, ParkingParkSpaceKindId = parkSpaceTypeId });
                        return 1;
                    }
                    else
                    {
                        var ps = parkSpaces.FirstOrDefault(q => q.Id == parkSpaceId);
                        ps.Title = title;
                        ps.ParkingParkSpaceKindId = parkSpaceTypeId;
                        ps.ParkingParkSpaceKindTitle = parkingParkSpaceKindTitle;
                        ps.IsActive = status;
                        if(!changedParkSpaces.Any(q=>q.Id==ps.Id))
                            changedParkSpaces.Add(ps);
                        return 1;
                    }
                }
            }
            catch { return -1; }
        }

        private void deleteRepositoryGridButton2_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف جای پارک")==DialogResult.OK)
            {
                var item=((parkSpacesGrid.MainView as GridView).GetFocusedRow() as ParkingParkSpaceEntity);
                if (item.Id > 0 && !changedParkSpaces.Contains(new ParkingParkSpaceEntity { Id = -item.Id }))
                {
                    changedParkSpaces.RemoveAll(q => q.Id == item.Id && q.Title == item.Title);
                    changedParkSpaces.Add(new ParkingParkSpaceEntity { Id = -item.Id });
                }
                else
                    changedParkSpaces.RemoveAll(q => q.Id == 0 && q.Title == item.Title);
                (parkSpacesGrid.MainView as GridView).DeleteSelectedRows();
            }
        }

        private void editRepositoryGridButton2_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var item=(parkSpacesGrid.MainView as GridView).GetFocusedRow() as ParkingParkSpaceEntity;
            PopupControl.Tag = item;
            parkSpaceTitleTextBox.Text = item.Title;
            parkSpaceTypeTextBox.TextBoxObject.SelectedValue = item.ParkingParkSpaceKindId;
            statusTextBox.TextBoxObject.SelectedIndex = item.IsActive ? 0 : 1;
            groupCheckEdit.Visible = panel1.Visible = false;
            ShowPopup(false);
        }

        private void gridView2_RowUpdated(object sender, DevExpress.XtraGrid.Views.Base.RowObjectEventArgs e)
        {
            var item = (parkSpacesGrid.MainView as GridView).GetFocusedRow() as ParkingParkSpaceEntity;
            if (!changedParkSpaces.Any(q=>q.Id==item.Id || q.Title==item.Title) && !changedParkSpaces.Any(q=>q.Id*-1==item.Id))
                changedParkSpaces.Add(item);
        }

        private void eosEntityModifyToolsControl3_ClickDeleteButton(object sender, EventArgs e)
        {
            try
            {
                if (ShowQuestion("حذف جای پارک") == DialogResult.OK)
                {

                    if (!CheckUsedParkingSpace())
                    {
                        MessageShowError("امکان حذف جای پارک به دلیل استفاده در سیستم میسر نمی باشد");
                        return;
                    }

                    var selectedRow = (parkSpacesGrid.MainView as GridView).GetSelectedRows();
                    foreach (var currentRow in selectedRow)
                    {
                        var item = (parkSpacesGrid.MainView.GetRow(currentRow) as ParkingParkSpaceEntity);
                        if (item.Id > 0 && !changedParkSpaces.Contains(new ParkingParkSpaceEntity { Id = -item.Id }))
                        {
                            changedParkSpaces.RemoveAll(q => q.Id == item.Id && q.Title == item.Title);
                            changedParkSpaces.Add(new ParkingParkSpaceEntity { Id = -item.Id });
                        }
                        else
                            changedParkSpaces.RemoveAll(q => q.Id == 0 && q.Title == item.Title);
                        //(parkSpacesGrid.MainView as GridView).DeleteSelectedRows();
                    }
                    (parkSpacesGrid.MainView as GridView).DeleteSelectedRows();
                }
            }
            catch (Exception)
            {
                MessageShowError("امکان حذف جای پارک در حال حاضر میسر نمی باشد");
            }
        }

        private bool CheckUsedParkingSpace()
        {
            
            var parkingSpaceList = new List<ParkingParkSpaceEntity>();
            var selectedRow = (parkSpacesGrid.MainView as GridView).GetSelectedRows();
            foreach (var currentRow in selectedRow)
            {
                var item = (parkSpacesGrid.MainView.GetRow(currentRow) as ParkingParkSpaceEntity);
                if (item.Id > 0)
                {
                    parkingSpaceList.Add(item);
                }              
            }

            if (parkingSpaceList.Count > 0)
            {
                var result = PostJsonObjecToLinkAndWait<List<MemberParkSpaceEntity>>(ApiAddress.ParkingApi.CheckUsedParkingSpace, parkingSpaceList,false);
                if (result.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && result.Values?.Count == 0)
                    return true;
                else
                    return false;
            }
            else
                return false;
        }
        private void eosEntityModifyToolsControl3_Load(object sender, EventArgs e)
        {

        }
    }
}
