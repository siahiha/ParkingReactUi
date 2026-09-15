using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Data.Dto;
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
    public partial class UsersForm : EosBaseForm
    {
        private void FillGrid()
        {
            var response = GetJsonObjecToLinkAndWait<List<UserDto>>(ApiAddress.UserApi.Get);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                gridControl1.DataSource = response.Values;
            else
                MessageShowError(response);
        }

        private void GetAccessLevelList()
        {

            var selected = accessLevelTextBox.TextBoxObject.SelectedValue;
            var response = GetJsonObjecToLinkAndWait<List<AccessLevelDto>>(ApiAddress.AccessLevelApi.Get);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                accessLevelTextBox.TextBoxObject.DataSource = response.Values;
                accessLevelTextBox.TextBoxObject.DisplayMember = "Name";
                accessLevelTextBox.TextBoxObject.ValueMember = "Id";
                if (selected != null)
                    accessLevelTextBox.TextBoxObject.SelectedValue = selected;
            }




        }

        public UsersForm()
        {
            InitializeComponent();
            GetAccessLevelList();
            GetUserTypeList();
            FillGrid();

        }

        private void GetUserTypeList()
        {
            
            var selected = txbUserType.TextBoxObject.SelectedValue;
            //var response = GetJsonObjecToLinkAndWait<List<AccessLevelDto>>(ApiAddress.AccessLevelApi.Get);

            txbUserType.TextBoxObject.DisplayMember = "Description";
            txbUserType.TextBoxObject.ValueMember = "Value";
            txbUserType.TextBoxObject.DataSource = Enum.GetValues(typeof(UserTypes))
                .Cast<Enum>()
                .Select(value => new
                {
                    (Attribute.GetCustomAttribute(value.GetType().GetField(value.ToString()), typeof(DescriptionAttribute)) as DescriptionAttribute).Description,
                    value
                })
                .OrderBy(item => item.value)
                .ToList();


            if (selected != null)
                txbUserType.TextBoxObject.SelectedValue = selected;

        }

        void ClearForm()
        {
            nameTextBox.Text = "";
            userNameTextBox.Text = "";
            userPassTextBox.Text = "";
            familyTextBox4.Text = "";
            nationalCodeTextBox.Text = "";
            addressTextBox.Text = "";
            descriptionTextBox.Text = "";
            tellTextBox.Text = "";
            phoneTextBox.Text = "";
            fatherNameTextBox.Text = "";
            accessLevelTextBox.TextBoxObject.SelectedValue = "";
            txbUserType.TextBoxObject.SelectedValue = "";
            activeCheckBox.Enabled = true;
            accessLevelTextBox.Enabled = true;
            txbUserType.Enabled = true;
            simpleButton3.Enabled = true;

            //repeatUserPassTextBox.Visible = false;
            //repeatUserPassTextBox.Text = "";
            //userPassTextBox.Enabled = repeatUserPassTextBox.Visible;
            userPassTextBox.Text = "";
        }
        private void PropertyPanelFill(UserDto entry, bool enable)
        {
            ClearForm();
            propertyPanel.Enabled = enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;
            actionPanel.Tag = entry;
            cancelButton.Visible = okButton.Visible = enable;
            if (entry != null)
            {  
                nameTextBox.Text = entry.FirstName;
                userNameTextBox.Text = entry.UserName;
                userPassTextBox.Text = entry.UserPass.Decrypt(false);
                familyTextBox4.Text = entry.LastName;
                nationalCodeTextBox.Text = entry.NationalCode;
                addressTextBox.Text = entry.Address;
                descriptionTextBox.Text = entry.Description;
                tellTextBox.Text = entry.TellNumber.ToString();
                phoneTextBox.Text = entry.PhonNumber.ToString();
                fatherNameTextBox.Text = entry.FatherName;
                accessLevelTextBox.TextBoxObject.SelectedValue = entry.UserAccessLevelId;
                txbUserType.TextBoxObject.SelectedValue = entry.UserType;
                activeCheckBox.Checked= !entry.IsActive;

                activeCheckBox.Enabled = !entry.IsSystemType;
                accessLevelTextBox.Enabled = !entry.IsSystemType;
                txbUserType.Enabled = !entry.IsSystemType;
                simpleButton3.Enabled = !entry.IsSystemType;
            }
            else
            {
                ClearForm();
            }

        }

        bool IsValidat()
        {
            if (string.IsNullOrEmpty(userNameTextBox.Text) || string.IsNullOrEmpty(userPassTextBox.Text))
            {
                MessageShowError("نام کاربری و کلمه عبور را وارد کنید.");
                return false;
            }
            if (accessLevelTextBox.TextBoxObject.SelectedValue == null || accessLevelTextBox.TextBoxObject.SelectedValue.ToString() == "0")
            {
                MessageShowError("سطح دسترسی را وارد نمایید");
                return false;
            }
            if (txbUserType.TextBoxObject.SelectedValue == null ||
    string.IsNullOrWhiteSpace(txbUserType.TextBoxObject.SelectedValue.ToString()))
            {
                MessageShowError("نوع کاربری را انتخاب نمایید");
                return false;
            }
            return true;
        }

        private void SaveItem()
        {
            if (!IsValidat())
                return;
            try
            {
                var item = actionPanel.Tag as UserDto;
                if (item == null)
                {
                    item = new UserDto();
                }

                item.UserName = userNameTextBox.Text;
                item.UserPass = userPassTextBox.Text.Encrypt();
                item.TellNumber = string.IsNullOrEmpty(tellTextBox.Text)?0:long.Parse(tellTextBox.Text);
                item.PhonNumber = string.IsNullOrEmpty(phoneTextBox.Text) ? 0 : long.Parse(phoneTextBox.Text);
                item.LastName = familyTextBox4.Text;
                item.FirstName = nameTextBox.Text;
                item.FatherName = fatherNameTextBox.Text;
                item.Description = descriptionTextBox.Text;
                item.NationalCode = nationalCodeTextBox.Text;
                item.UserAccessLevelId = (long)accessLevelTextBox.TextBoxObject.SelectedValue;
                item.UserType = (UserTypes)txbUserType.TextBoxObject.SelectedValue;
                item.Address = addressTextBox.Text;
                item.IsActive = !activeCheckBox.Checked;
                item.PersistOn = DateTime.Now;

                //item.AccessPermissionValuePart1 = 281474976710655;
                //item.AccessPermissionValuePart2 = 281474976710655;

                var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.UserApi.Save, item, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (item.Id == 0)
                    {
                        item.Id = response.Values;
                        (gridControl1.DataSource as List<UserDto>).Add(item);
                    }
                    gridControl1.RefreshDataSource();
                    gridControl1.Refresh();
                    PropertyPanelFill(null, false);
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
        }

        private void eosEntityModifyToolsControl1_ClickNewButton(object sender, EventArgs e)
        {
            PropertyPanelFill(null, true);
            changeUserPassButton_Click(sender, e);
        }

        private void editGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = ((gridControl1.DataSource as List<UserDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion() != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<UserDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);

                if (entry.IsSystemType)
                {
                    MessageShowError("امکان حذف کاربر سیستمی وجود ندارد");
                    return;
                }

                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.UserApi.DeleteById, entry.Id);
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
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as UserDto;
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

        private void changeUserPassButton_Click(object sender, EventArgs e)
        {
        }

        private void simpleButton3_Click(object sender, EventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingUsers))
            {
                MessageShowError("شما به این قسمت دسترسی ندارید");
                return;
            }
            using (var frm = new EosForms.AccessLevelForm())
            {
                frm.ShowDialog();
                GetAccessLevelList();
            }
        }
    }
}
