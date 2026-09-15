using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
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
    public partial class MemberKindForm : EosBaseForm
    {
        ParkingEntity parking;
        private void FillGrid()
        {

            deleteGridColumn.Visible = PublicVariables.CheckUserAccess(AccessItemTypes.ParkingMemberKindDelete);
            var response = GetJsonObjecToLinkAndWait<List<MemberRegisterKindEntity>>(ApiAddress.MemberApi.GetMemberRegisterKindsByParkingId, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                gridControl1.DataSource = response.Values;
            else
                MessageShowError(response); 
        }


        void ClearForm()
        {
            // userNameTextBox.Text = "";
        }

        private void PropertyPanelFill(MemberRegisterKindEntity entry, bool enable)
        {
            bool isNewEntry = false;
            propertyPanel.Enabled = enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;

            if (entry == null)
            {
                ClearForm();
                entry = new MemberRegisterKindEntity() { Title = "جدید", ParkingId = parking.Id };
                isNewEntry = true;
            }

            actionPanel.Tag = entry;
            titleTextBox.Text = titleLabel.Text = entry.Title;
            membershipFeeTextBox.Text = entry.MembershipFee.ToString();
            //membershipFeeTextBox.Enabled = false;
            memberCreditTypeTextBox.TextBoxObject.SelectedIndex = (int)entry.MembershipCreditType;
            memberCreditTypeTextBox.Enabled = isNewEntry;
            memberTypeTextBox.TextBoxObject.SelectedIndex = (int)entry.MembershipType;
            memberTypeTextBox.Enabled = isNewEntry;
            durationTextBox.Text = entry.DurationDays.ToString();
            tariffGrid.DataSource = entry.Tariffs;
            refundDeadlineDayCountTextBox.Text = entry.RefundDeadlineDayCount.ToString("#,#");
            //item.TariffRanges
            //DateTime.Now =entry.PersistOn ;
            cancelButton.Visible = okButton.Visible = enable;
            memberTypeTextBox_SelectedIndexChanged(this, new EventArgs());
            memberCreditTypeTextBox_SelectedIndexChanged(this, new EventArgs());
            
        }

        public MemberKindForm(ParkingEntity parking)
        {
            InitializeComponent();
            this.parking = parking;
        }


        private void MemberKindForm_Load(object sender, EventArgs e)
        {
            propertyPanel.Enabled = false;
            FillGrid();

            memberCreditTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(MembershipCreditTypes), true);
            memberTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(MembershipTypes), true);
        }

        bool IsValidat()
        {
            if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingMemberKindAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return false;
            }
            if (string.IsNullOrEmpty(titleTextBox.Text))
            {
                MessageShowError("عنوان را وارد کنید.");
                return false;
            }

            var selectedMermbership = (MembershipCreditTypes)memberCreditTypeTextBox.TextBoxObject.SelectedIndex;

            if (selectedMermbership != MembershipCreditTypes.Credit && durationTextBox.IntValue <= 0)
            {
                MessageShowError("مدت زمان باید بزرگتر از صفر باشد");
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
                var item = actionPanel.Tag as MemberRegisterKindEntity;
                if (item == null)
                {
                    item = new MemberRegisterKindEntity();
                } 
                item.Title = titleTextBox.Text;
                item.ParkingId = parking.Id;
                item.DurationDays = durationTextBox.IntValue;
                item.MembershipFee = membershipFeeTextBox.LongValue;
                item.MembershipCreditType = (MembershipCreditTypes)memberCreditTypeTextBox.TextBoxObject.SelectedIndex;
                item.MembershipType= (MembershipTypes)memberTypeTextBox.TextBoxObject.SelectedIndex;
                item.RefundDeadlineDayCount = refundDeadlineDayCountTextBox.IntValue;

                var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.MemberApi.SaveMemberRegisterKind, item, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values > 0)
                {
                    if (item.Id == 0)
                    {
                        item.Id = response.Values;
                        (gridControl1.DataSource as List<MemberRegisterKindEntity>).Add(item);
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
            var entry = ((gridControl1.DataSource as List<MemberRegisterKindEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
           
            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<MemberRegisterKindEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.MemberApi.DeleteMemberRegisterKindById, entry.Id);
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
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as MemberRegisterKindEntity;
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

        private void memberCreditTypeTextBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            unLimitesLabel.Text = (memberCreditTypeTextBox.TextBoxObject.SelectedIndex == 0)?"نامحدود":"روز";
            durationTextBox.Enabled = memberCreditTypeTextBox.TextBoxObject.SelectedIndex != 0;
        }

        private void memberTypeTextBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (memberTypeTextBox.TextBoxObject.SelectedIndex == (int)(MembershipTypes.Owner))
            {
                memberCreditTypeTextBox.TextBoxObject.SelectedIndex = (int)(MembershipCreditTypes.LongTime);
                memberCreditTypeTextBox.Enabled = false;
            }
            else
                memberCreditTypeTextBox.Enabled = true && memberTypeTextBox.Enabled;
        }

    }
}
