using DevExpress.XtraGrid.Views.Grid;
using EosClocks;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Data.Dto;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParkingProfessional.Models;
using EosParkingTools.EosControls;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class MemberForm : EosBaseForm
    {
        //public MemberForm()
        //{
        //    InitializeComponent();
        //}

        private ParkingEntity parking;
        private bool allParkSpacesChange;
        private ParkingDoorEntity currentDoor;
        private List<MemberRegisterEntity> deleteItems = new List<MemberRegisterEntity>();
        private byte[] pesonalImageArray;
        private Image noPersonalImage;
        private List<UserDto> usersExitPermissioner;
        private bool CardReaderReady = false;
        private OnlineEncoder _cardReader = null;
        private bool cancellingEdit;

        private void FillGrid()
        {
            deleteGridColumn.Visible = PublicVariables.CheckUserAccess(AccessItemTypes.ParkingMemberDelete);
            cancelMembershipColumn.Visible = PublicVariables.CheckUserAccess(AccessItemTypes.ParkingMembersCreditCancellation);
            propertyPanel.Enabled = false;
            var response = GetJsonObjecToLinkAndWait<List<MemberDto>>(ApiAddress.MemberApi.GetByParkingId, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                gridControl1.DataSource = response.Values;
                //propertyPanel.Enabled= response.Values.Count()>0;
            }
            else
            {
                MessageShowError(response);
                //#mj_changed با لغو فرم بسته شود و یا هر پیام خطای دیگری
                this.Close();
            }
        }

        private MemberDto GetMember(long memberId)
        {
            var response = GetJsonObjecToLinkAndWait<MemberDto>(ApiAddress.MemberApi.GetById, memberId);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                return response.Values;
            }
            else
            {
                response = GetJsonObjecToLinkAndWait<MemberDto>(ApiAddress.MemberApi.GetById, memberId);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    return response.Values;
                }
            }
            return null;
            //else
            //    MessageShowError(response);
        }

        private void FillKindCombo()
        {
            var t = Task.Factory.StartNew(() =>
              {
                  var response = GetJsonObjecToLink<List<MemberRegisterKindEntity>>(ApiAddress.MemberApi.GetMemberRegisterKindsByParkingId, parking.Id);
                  if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                  {
                      Invoke(new MethodInvoker(() =>
                      {
                          memberRegisterTypeTextBox.TextBoxObject.DataSource = response.Values;
                          memberRegisterTypeTextBox.TextBoxObject.ValueMember = "Id";
                          memberRegisterTypeTextBox.TextBoxObject.DisplayMember = "Title";
                      }));
                  }
              });
            t.Wait(100);
        }

        private void FillCardNumberCombo()
        {
            var t = Task.Factory.StartNew(() =>
            {
                var response = GetJsonObjecToLink<List<CardEntity>>(ApiAddress.CardApi.GetActiveCardsByParkingId, parking.Id);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    Invoke(new MethodInvoker(() =>
                    {
                        response.Values.Insert(0, new CardEntity { CardNumber = "فاقد کارت" });
                        var text = memberCardTextBox.Text;
                        memberCardTextBox.TextBoxObject.DataSource = response.Values;

                        memberCardTextBox.TextBoxObject.ValueMember = "Id";
                        memberCardTextBox.TextBoxObject.DisplayMember = "CardNumber";
                        if (!string.IsNullOrEmpty(text))
                            memberCardTextBox.Text = text;
                    }));
                }
            });
            t.Wait(100);
        }

        private void FillAllParkSpacesGridControl()
        {
            try
            {
                var t = Task.Factory.StartNew(() =>
                {
                    var response = GetJsonObjecToLink<List<ParkSpaceDto>>(ApiAddress.ParkingApi.GetParkingParkSpacesById, parking.Id);
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        Invoke(new MethodInvoker(() =>
                        {
                            allParkSpacesGridControl.DataSource = response.Values;
                            allParkSpacesChange = false;
                            floorsTextBox.TextBoxObject.DataSource = response.Values.GroupBy(q => new { q.FloorId, q.FloorTitle }).Select(q => new { q.FirstOrDefault().FloorId, q.FirstOrDefault().FloorTitle }).ToList();
                            floorsTextBox.TextBoxObject.DisplayMember = "FloorTitle";
                            floorsTextBox.TextBoxObject.ValueMember = "FloorId";
                        }));
                    }
                });
                t.Wait(100);
            }
            catch { }
        }

        private void GetUserDoor()
        {
            var response = GetJsonObjecToLink<ParkingDoorEntity>(ApiAddress.ParkingApi.GetParkingDoor, PublicVariables.CurrentUser.DoorShift);

            //if (this.InvokeRequired)
            //Invoke(new MethodInvoker(() =>
            //{
            if (response == null || response.ResponseResultType != EosParking.Core.Enums.ResponseResultTypes.Ok)
                response = GetJsonObjecToLink<ParkingDoorEntity>(ApiAddress.ParkingApi.GetParkingDoor, PublicVariables.CurrentUser.DoorShift);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                currentDoor = response.Values;
                currentDoor.PcPos = response.Values.DtoViewEquipments.FirstOrDefault(q => q.Key.DeviceType == EquipmentTypes.Pos).Key;
            }
            else
                currentDoor = null;
            // MessageShowError(response);
            //}));
        }

        private void ClearForm()
        {
            // userNameTextBox.Text = "";
            //PropertyPanelFill(null, false);
            carNameTextBox.Text = "";
            carTypeTextBox.Text = "";
            eosPlateControl1.Clear();
            memberRegisterTypeTextBox.Text = "";
            deleteItems.Clear();
            //GetUserDoor();
        }

        private void ParkSpaceCheckForFree(MemberDto entry)
        {
            var activeRegister = entry.MemberRegisters.Where(q => (q.EndDate == null || q.EndDate == q.StartDate || q.EndDate >= DateTime.Now.Date) && q.IsActive).ToList();
            var memberKind = (memberRegisterTypeTextBox.TextBoxObject.DataSource as List<MemberRegisterKindEntity>).FirstOrDefault(k => k.Id == activeRegister.OrderByDescending(q => q.PersistOn).FirstOrDefault()?.MemberRegisterKindId)?.MembershipType;
            tableLayoutPanel2.Enabled = activeRegister.Count >= 0 && memberKind != null && memberKind != MembershipTypes.Member;
        }

        private void PropertyPanelFill(MemberDto entry, bool enable)
        {
            if (memberRegisterTypeTextBox.TextBoxObject.DataSource == null)
            {
                FillKindCombo();
            }
            propertyPanel.Enabled = enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;

            if (entry == null)
            {
                ClearForm();
                entry = new MemberDto() { Name = "عضو جدید", ParkingId = parking.Id, Code = (gridControl1.DataSource as List<MemberDto>)?.Count > 0 ? ((gridControl1.DataSource as List<MemberDto>)?.Select(q => long.Parse(q.Code)).Max() + 1).ToString() : "1001", MemberParkSpaces = new List<ParkSpaceDto>() };
            }
            //#mj_changed 1401/06/30 حذف پرش حین پیمایش اطلاعات جدول
            ////else entry = GetMember(entry.Id);

            titleTextBox.Text = titleLabel.Text = entry.Name;
            addressTextBox.Text = entry.Address;
            codeTextBox.Text = entry.Code;
            //codeTextBox.Enabled = entry.Id == 0;
            familyTextBox.Text = entry.Family;
            nationalCodeTextBox.Text = entry.NationalCode;
            eosTextBoxFaceTag.Text = entry.FaceTag;
            checkBoxIsMemberBlock.Checked = (entry?.IsMemberBlock ?? false);

            phoneNumberTextBox.Text = entry.PhoneNumber.ToString();
            cashAmountTextBox.Text = entry.CashAmount.ToString("#,#");
            if ((entry.MemberCards.LastOrDefault()?.Id ?? 0) != 0 && memberCardTextBox.TextBoxObject.DataSource != null)
                memberCardTextBox.TextBoxObject.SelectedValue = entry.MemberCards.Where(q => !q.IsExpier).LastOrDefault()?.CardId ?? 0;
            else
                memberCardTextBox.TextBoxObject.Text = entry.MemberCards.LastOrDefault()?.CardNumber ?? "فاقد کارت";

            long exitPermissionAccepter = 0;
            if (entry.ExitPermissionAccepter != null)
                exitPermissionAccepter = (long)entry.ExitPermissionAccepter;
            if (exitPermissionAccepter != 0 && txbUserCanExitPermi.TextBoxObject.DataSource != null)
                txbUserCanExitPermi.TextBoxObject.SelectedValue = exitPermissionAccepter;
            else
                txbUserCanExitPermi.TextBoxObject.Text = "انتخاب نشده";

            ParkSpaceCheckForFree(entry);

            LoadPersonalPhoto(entry.PersonalPhoto);

            carGrid.DataSource = entry.Cars.ToList();

            memberRegisterGrid.DataSource = entry.MemberRegisters.ToList();
            memberParkSpaceGridControl.DataSource = entry.MemberParkSpaces.ToList();
            actionPanel.Tag = entry;
            //item.TariffRanges
            //DateTime.Now =entry.PersistOn ;
            cancelButton.Visible = okButton.Visible = enable;
        }

        private void LoadPersonalPhoto(byte[] personalPhoto)
        {
            if (personalPhoto != null)
            {
                pesonalImageArray = personalPhoto;
                using (MemoryStream memstr = new MemoryStream(personalPhoto))
                {
                    Image img = Image.FromStream(memstr);
                    pictureBoxPersonal.Image = img;
                }
            }
            else
            {
                pictureBoxPersonal.Image = noPersonalImage;
            }
        }

        public MemberForm(ParkingEntity parking)
        {
            InitializeComponent();
            this.parking = parking;
            propertyPanel.Enabled = false;
        }

        private void MemberForm_Shown(object sender, EventArgs e)
        {
            FillKindCombo();
            FillCardNumberCombo();
            FillCanExitPermiCombo();

            FillGrid();
            tabPane1.Left = 78;
            //carTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(CarTypes), true);
            tabControl1.ShowTabHeader = DevExpress.Utils.DefaultBoolean.False;
            FillAllParkSpacesGridControl();
            GetUserDoor();
        }

        private void FillCanExitPermiCombo()
        {
            var response = GetJsonObjecToLinkAndWait<List<UserDto>>(ApiAddress.UserApi.Get);
            //response.Values.Insert(0, new UserDto { UserName = "تعریف نشده", UserType= UserTypes.ExitPermissionManager });
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                usersExitPermissioner = response.Values.Where(p => p.UserType == UserTypes.ExitPermissionManager).ToList();
                usersExitPermissioner.Add(new UserDto { UserName = "تعریف نشده", UserType = UserTypes.ExitPermissionManager });

                txbUserCanExitPermi.TextBoxObject.DataSource = usersExitPermissioner;
                txbUserCanExitPermi.TextBoxObject.ValueMember = "Id";
                txbUserCanExitPermi.TextBoxObject.DisplayMember = "UserName";
            }
            else
                MessageShowError(response);
        }
     
        
        private bool IsValidat()
        {
            //if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingEquipmentAddOrEdit))
            if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingMemberAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return false;
            }
            if (string.IsNullOrEmpty(titleTextBox.Text))
            {
                MessageShowError("عنوان را وارد کنید.");
                return false;
            }

            // پاک کردن فاصله‌ها
           string code = nationalCodeTextBox.Text.Trim();

            // بررسی طول
            if (code.Length != 10)
            {
                MessageShowError("کد ملی نادرست است");
                return false;
            }

            // بررسی اینکه همه اعداد هستند
            if (!code.All(char.IsDigit))
            {
                MessageShowError("کد ملی نادرست است");
                return false;
            }

            // بررسی رقم کنترلی
            int sum = 0;
            for (int i = 0; i < 9; i++)
                sum += (code[i] - '0') * (10 - i);

            int remainder = sum % 11;
            int checkDigit = code[9] - '0';

            if ((remainder < 2 && checkDigit == remainder) ||
                (remainder >= 2 && checkDigit == 11 - remainder))
                return true;

            MessageShowError("کد ملی نادرست است");
            return false; 
        }

        private bool SaveItem(bool closeEdit = true)
        {
            if (!IsValidat())
                return false;
            try
            {
                var item = actionPanel.Tag as MemberDto;
                if (item == null)
                {
                    item = new MemberDto();
                }

                item.Name = titleTextBox.Text;
                item.Address = addressTextBox.Text;
                item.Code = codeTextBox.Text;
                item.Family = familyTextBox.Text;
                item.NationalCode = nationalCodeTextBox.Text;
                item.FaceTag = eosTextBoxFaceTag.Text;
                item.PhoneNumber = phoneNumberTextBox.LongValue;
                item.PersistOn = DateTime.Now;
                item.ParkingId = parking.Id;
                item.PersonalPhoto = pesonalImageArray;
                item.Cars = carGrid.DataSource as List<CarEntity>;
                item.ExitPermissionAccepter = long.Parse(txbUserCanExitPermi.TextBoxObject.SelectedValue.ToString());
                item.IsMemberBlock = checkBoxIsMemberBlock.Checked;
                //item.IsMemberBlock = checkBoxMemberDisabled.Checked;
                if ((gridControl1.DataSource as List<MemberDto>).Any(q => q.Code == item.Code && q.Id != item.Id))
                {
                    MessageShowError("کد عضویت تکراری می باشد");
                    return false;
                }
                //item.MemberRegisters = (memberRegisterGrid.DataSource as List<MemberRegisterEntity>).ToList();
                foreach (var i in deleteItems)
                    item.MemberRegisters.Add(i);
                if (item.MemberCards.Where(q => !q.IsExpier).OrderByDescending(q => q.PersistOn).Select(q => q.CardId).FirstOrDefault() != long.Parse((memberCardTextBox.TextBoxObject.SelectedValue ?? 0).ToString()))
                {
                    item.MemberCards.Add(new MemberCardEntity
                    {
                        MemberId = item.Id,
                        CardId = long.Parse(memberCardTextBox.TextBoxObject.SelectedValue.ToString()),
                        Card = new CardEntity { Id = long.Parse(memberCardTextBox.TextBoxObject.SelectedValue.ToString()), CardNumber = memberCardTextBox.Text }
                    });
                }
                else
                {
                    if (memberCardTextBox.TextBoxObject.SelectedValue == null)
                        foreach (var i in item.MemberCards)
                            i.IsExpier = true;
                }
                item.MemberParkSpaces = (memberParkSpaceGridControl.DataSource as List<ParkSpaceDto>);
                var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.MemberApi.Save, item, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values > 0)
                {
                    item.MemberRegisters = (memberRegisterGrid.DataSource as List<MemberRegisterEntity>).ToList();
                    if (item.Id == 0)
                    {
                        item.Id = response.Values;
                        (gridControl1.DataSource as List<MemberDto>).Add(item);
                    }
                    else
                    {
                        item.Id = response.Values;
                        //item = GetMember(response.Values);
                        var dbs = ((gridControl1.MainView as GridView).DataSource as List<MemberDto>);
                        var db = dbs.FirstOrDefault(q => q.Id == item.Id);
                        dbs[dbs.IndexOf(db)] = item;
                        db = item;
                    }
                    gridControl1.MainView.RefreshData();
                    //gridControl1.DataSource = ((gridControl1.MainView as GridView).DataSource as List<MemberDto>).ToList();
                    gridControl1.RefreshDataSource();
                    gridControl1.Refresh();
                    PropertyPanelFill(item, !closeEdit);
                    return true;
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
            return false;
        }

        private MemberRegisterResultDto AddRegisterItem(MemberRegisterEntity memberRegister)
        {
            //if (!IsValidat())
            //    return false;
            try
            {
                var response = PostJsonObjecToLinkAndWait<MemberRegisterResultDto>(ApiAddress.MemberApi.AddMemberRegister, memberRegister, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && (response.Values?.Id > 0 || !memberRegister.DoSave))
                {
                    if (memberRegister.DoSave)
                        memberRegister.Id = response.Values.Id;
                    else
                        memberRegister.TransferCreditAmount = response.Values.TransferAmount;
                    return response.Values;
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
            return null;
        }

        private void eosEntityModifyToolsControl1_ClickNewButton(object sender, EventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingMemberAddOrEdit))
            {
                MessageBox.Show("شما به این بخش دسترسی ندارید");
                return;
            }
            PropertyPanelFill(null, true);
        }

        private void editGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingMemberAddOrEdit))
            {
                MessageBox.Show("شما به این بخش دسترسی ندارید");
                return;
            }

            var entry = ((gridControl1.DataSource as List<MemberDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);

            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingMemberDelete))
            {
                MessageBox.Show("شما به این بخش دسترسی ندارید");
                return;
            }

            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<MemberDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.MemberApi.DeleteById, entry.Id);
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
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as MemberDto;
                PropertyPanelFill(entry, false);
            }
            catch { }
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            //UserDto d = new UserDto() { UserName = "eosLogin1.UserName", UserPass = "eosLogin1.Password.Encrypt()" };
            //var response = PostJsonObjecToLink<AccessLevelEntity>(ApiAddress.AccessLevelApi.AccessLevelSave, d);
            //          PostJsonObjecToLinkAndWait<object>(ApiAddress.UserApi.Login, d, true);
            if (SaveItem())
                ClearForm();
            if (allParkSpacesChange)
                FillAllParkSpacesGridControl();
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            // #mj_changed در زمان لغو ویرایش جزئیات را نمایش نمی داد این باگ برطرف شد
            try
            {
                cancellingEdit = true;
                var item = actionPanel.Tag as MemberDto;
                PropertyPanelFill(item, false);
            }
            catch (Exception ex) { MessageShowError(ex); }

            //PropertyPanelFill(null, false);
            //if (allParkSpacesChange)
            //    FillAllParkSpacesGridControl();
        }

        private void carEntityModifyToolsControl_ClickNewButton(object sender, EventArgs e)
        {
            tabControl1.SelectedTabPage = xtraTabPage1;
            var entry = new CarEntity() { MemberId = (actionPanel.Tag as MemberDto).Id };
            popupWinControl1.Tag = entry;
            carNameTextBox.Text = entry.Name;
            carModelTextBox.Text = entry.DtoViewCarModelTitle;
            carColorTextBox.Text = entry.DtoViewCarColorTitle;
            //carTypeTextBox.TextBoxObject.SelectedIndex = (int)entry.CarType;
            eosPlateControl1.CarType = entry.CarType;
            eosPlateControl1.Plate = entry.Plate ?? "";
            popupWinControl1.CaptionText = "مشخصات خودرو";
            ShowPopup(true);
        }

        private void deleteCarrepositoryGridButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            (carGrid.MainView as GridView).DeleteSelectedRows();
        }

        private void editCarRepositoryGritButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            tabControl1.SelectedTabPage = xtraTabPage1;
            var entry = (carGrid.MainView as GridView).GetFocusedRow() as CarEntity;
            popupWinControl1.Tag = entry;
            carNameTextBox.Text = entry.Name;
            carModelTextBox.Text = entry.DtoViewCarModelTitle;
            carColorTextBox.Text = entry.DtoViewCarColorTitle;
            //carTypeTextBox.TextBoxObject.SelectedIndex = (int)entry.CarType;
            eosPlateControl1.CarType = entry.CarType;
            eosPlateControl1.Plate = entry.Plate;
            ShowPopup(false);
        }

        private void popupCancelButton_Click(object sender, EventArgs e)
        {
            popupWinControl1.Tag = null;
            ClosePopup();
        }

        private void popupOkButton_Click(object sender, EventArgs e)
        {
            if (popupWinControl1.Tag is CarEntity)
            {
                if (!eosPlateControl1.IsValid || string.IsNullOrEmpty(eosPlateControl1.Plate))
                {
                    MessageShowError("لطفا پلاک خودرو را بصورت صحیح وارد کنید");
                    return;
                }
                var ds = (carGrid.DataSource as List<CarEntity>);
                var entry = popupWinControl1.Tag as CarEntity;
                entry.Name = carNameTextBox.Text;
                entry.CarType = eosPlateControl1.CarType;
                entry.Plate = eosPlateControl1.Plate;
                entry.DtoViewCarColorTitle = carColorTextBox.Text;
                entry.DtoViewCarModelTitle = carModelTextBox.Text;

                if (popupWinControl1.IsNewItem)
                {
                    if (ds.Any(q => q.Plate == eosPlateControl1.Plate))
                    {
                        MessageShowError("خودرو با این شماره پلاک قبلا وارد شده است");
                        return;
                    }
                    ds.Add(entry);
                    //(carGrid.MainView as GridView).SetFocusedRowModified();
                }
                else
                {
                    if (ds.Any(q => q.Id != entry.Id && q.Plate == eosPlateControl1.Plate))
                    {
                        MessageShowError("خودرو با این شماره پلاک قبلا وارد شده است");
                        return;
                    }
                }
                carGrid.RefreshDataSource();
                ClosePopup();
            }
            else if (popupWinControl1.Tag is MemberRegisterEntity memberRegister &&
                tabControl1.SelectedTabPage == membershipCancellationTabPage)
            {
                if (cancelMembershipTypeComboBox.TextBoxObject.SelectedIndex < 0)
                    MessageShowError("لطف نوع لغو ماموریت را انتخاب نمایید");

                memberRegister.CancellingMembershipType = (CancellingMembershipTypes)Enum.Parse(typeof(CancellingMembershipTypes),
                    cancelMembershipTypeComboBox.TextBoxObject.SelectedValue.ToString());

                if (!cancelMemberShipItem(memberRegister))
                    return;
                else
                {
                    MessageShowSucsess("عضویت مورد نظر لغو گردید");
                    if (actionPanel.Tag is MemberDto entry)
                        PropertyPanelFill(entry, true);

                    ClosePopup();
                }
            }
            else
            {
                if (string.IsNullOrEmpty(memberRegisterTypeTextBox.TextBoxObject.Text) || memberRegisterTypeTextBox.TextBoxObject.SelectedValue == null || memberRegisterTypeTextBox.TextBoxObject.SelectedValue == null)
                {
                    MessageShowError("نوع را انتخاب کنید");
                    return;
                }
                var entry = popupWinControl1.Tag as MemberRegisterEntity;
                var regKind = (memberRegisterTypeTextBox.TextBoxObject.DataSource as List<MemberRegisterKindEntity>).FirstOrDefault(q => q.Id == int.Parse(memberRegisterTypeTextBox.TextBoxObject.SelectedValue.ToString()));
                if (regKind == null)
                {
                    MessageShowError("نوع عضویت انتخاب نشده است");
                    return;
                }
                entry.TaxValue = regKind.TaxValue;
                if (regKind.MembershipType == MembershipTypes.Member)
                    if (ShowQuestion(message: "درصورت ثبت این عضویت در زمان اعمال عضویت تمامی جای پارک های این عضو آزاد خواهد شد. آیا میخواهید ادامه دهید؟") != DialogResult.OK)
                    { return; }
                    else
                    {
                        tableLayoutPanel2.Enabled = false;
                        memberParkSpaceGridControl.DataSource = new List<ParkSpaceDto>();
                    }
                //if(!SaveItem())
                //{
                //    MessageShowError("متاسفانه اطلاعات عضو ذخیره نشد.");
                //    return;
                //}
                entry.MemberRegisterKindId = (long)regKind.Id;
                entry.StartDate = memberRegisterStartDatePicker.TextBoxObject.MiladiDate ?? DateTime.Now;
                entry.EndDate = memberRegisterEndDatePicker.TextBoxObject.MiladiDate ?? DateTime.MinValue;
                entry.CreditAmount = memberRegisterCreditTextBox.LongValue;
                entry.MemberRegisterKindTitle = memberRegisterTypeTextBox.Text;
                entry.PersistOn = DateTime.Now;
                entry.DoSave = false;
                var result = AddRegisterItem(entry);
                if (result != null)
                {
                    var payDetails = Environment.NewLine + Environment.NewLine + "    کدعضویت: " + (actionPanel.Tag as MemberDto).Code
                        + Environment.NewLine + Environment.NewLine + "        ثبت عضویت " + entry.MemberRegisterKindTitle + Environment.NewLine + Environment.NewLine + Environment.NewLine
                        + "           حق عضویت : " + (entry.CreditAmount).ToString("0,0") + Environment.NewLine
                        + "          مالیات: " + (entry.TaxValue).ToString("0,0") + Environment.NewLine
                        + "          مبلغ انتقال : " + (entry.TransferCreditAmount).ToString("0,0") + Environment.NewLine
                        + "          --------------------------------------------------" + Environment.NewLine
                        + "           مبلغ قابل پرداخت : " + result.TotalAmount.ToString("0,0");
                    var receiptCode = PayForm.ShowPay(entry.CreditAmount + entry.TaxValue - entry.TransferCreditAmount, payDetails, (actionPanel.Tag as MemberDto).Id, currentDoor, "ثبت عضویت", ShowPayButtonForFree: true);
                    if (!string.IsNullOrEmpty(receiptCode))
                    {
                        entry.DoSave = true;
                        result = AddRegisterItem(entry);
                        if (result == null || result.Id <= 0)
                        {
                            MessageShowError("متاسفانه ذخیره نشد!");
                            return;
                        }
                        if (popupWinControl1.IsNewItem)
                        {
                            var ds = (memberRegisterGrid.DataSource as List<MemberRegisterEntity>);
                            if (entry.IsActive)
                                foreach (var i in ds)
                                    i.IsActive = false;
                            ds.Add(entry);
                            //(carGrid.MainView as GridView).SetFocusedRowModified();
                        }
                        memberRegisterGrid.RefreshDataSource();
                        var item = (actionPanel.Tag as MemberDto);
                        item = GetMember(item.Id);
                        var db = ((gridControl1.MainView as GridView).DataSource as List<MemberDto>).FirstOrDefault(q => q.Id == item.Id);
                        db = item;
                        gridControl1.RefreshDataSource();
                        gridControl1.Refresh();
                        PropertyPanelFill(item, true);
                        //ParkSpaceCheckForFree(actionPanel.Tag as MemberDto);
                        ClosePopup();
                    }
                }
            }
            //(carGrid.MainView as GridView).MoveLast();
        }

        private bool cancelMemberShipItem(MemberRegisterEntity memberRegister)
        {
            try
            {
                var status = PostJsonObjecToLink<bool>(ApiAddress.MemberApi.MembershipCreditCancellation, memberRegister);

                if (status.HttpResponseType == System.Net.HttpStatusCode.OK && status.Values)
                    return true;
                else
                    MessageShowError(String.IsNullOrEmpty(status.Message) ? status.RealMessage : status.Message);
            }
            catch (Exception ex)
            {
                MessageShowError(ex.Message);
            }
            return false;
        }

        private void eosEntityModifyToolsControl3_ClickNewButton(object sender, EventArgs e)
        {
            var member = (actionPanel.Tag as MemberDto);
            var activeRegister = (memberRegisterGrid.DataSource as List<MemberRegisterEntity>).Where(q => (q.EndDate == null || q.EndDate == q.StartDate || q.EndDate >= DateTime.Now.Date) && q.IsActive).ToList();

            if (activeRegister.Count != 0)
            {
                var memberRegister = (memberRegisterGrid.DataSource as List<MemberRegisterEntity>).Where(q => ((/*q.EndDate == null || q.EndDate == q.StartDate || */q.PersistOn > activeRegister.FirstOrDefault()?.PersistOn) && !q.IsActive)).ToList();
                if (memberRegister.Count() > 0)
                {
                    MessageShowError("هر عضو بیشتر از یک عضویت رزرو نمی تواند داشته باشد");
                    return;
                }
            }
            bool isActive = false;
            if (activeRegister.Count > 0 && ShowQuestion(message: "عضویت فعالی برای این عضو موجود است. آیا میخواهید عضویت قبلی لغو گردد؟") == DialogResult.OK)
            {
                isActive = true;
                //return;
            }
            else
            {
                if (activeRegister.Count() == 0)
                    isActive = true;
            }
            if (member.Id == 0)
            {
                if (ShowQuestion(message: "ابتدا باید مشخصات عضو را ثبت کنید. آیا میخواهید مشخصات ذخیره گردد؟") == DialogResult.OK)
                {
                    if (!SaveItem(false))
                        return;
                }
                else
                    return;
            }

            tabControl1.SelectedTabPage = xtraTabPage2;
            popupWinControl1.Tag = new MemberRegisterEntity() { MemberId = member.Id, IsActive = isActive, PersistOn = DateTime.Now };
            memberRegisterTypeTextBox.Text = "";
            memberRegisterStartDatePicker.TextBoxObject.MiladiDate = DateTime.Now;
            if (activeRegister.Count > 0)
                memberRegisterStartDatePicker.TextBoxObject.MiladiDate = activeRegister.OrderByDescending(q => q.PersistOn).FirstOrDefault()?.EndDate;
            memberRegisterEndDatePicker.TextBoxObject.MiladiDate = null;
            popupWinControl1.CaptionText = "ثبت عضویت جدید";
            ShowPopup(true);
        }

        private void memberRegisterTypeTextBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            var entry = memberRegisterTypeTextBox.TextBoxObject.SelectedItem as MemberRegisterKindEntity;
            if (entry != null)
            {
                //memberRegisterStartDatePicker.Enabled = entry.MembershipType != MembershipTypes.Credit;
                //memberRegisterEndDatePicker.Enabled = entry.MembershipType != MembershipTypes.Credit;
                //memberRegisterStartDatePicker.TextBoxObject.MiladiDate = DateTime.Now;
                memberRegisterEndDatePicker.TextBoxObject.MiladiDate = memberRegisterStartDatePicker.TextBoxObject.MiladiDate?.AddDays(entry.DurationDays);
                memberRegisterCreditTextBox.Text = entry.MembershipFee.ToString();
                memberRegisterCreditTextBox.FormatString = "#,#";
                taxTextBox.Text = entry.TaxValue.ToString();
                taxTextBox.FormatString = "#,#";
            }
        }

        private void editMemberRegisterRepositoryGridButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = (memberRegisterGrid.DataSource as List<MemberRegisterEntity>)[(memberRegisterGrid.MainView as GridView).GetFocusedDataSourceRowIndex()];
            if (entry.Id != 0 && (entry.IsActive || entry.StartDate <= DateTime.Now))
            {
                MessageShowError("به دلیل استفاده از این عضویت، قادر به انجام ویرایش نمی باشید");
                return;
            }
            tabControl1.SelectedTabPage = xtraTabPage2;
            popupWinControl1.Tag = entry;
            memberRegisterTypeTextBox.Text = entry.MemberRegisterKindTitle;
            memberRegisterStartDatePicker.TextBoxObject.MiladiDate = entry.StartDate;
            memberRegisterEndDatePicker.TextBoxObject.MiladiDate = entry.EndDate;
            ShowPopup(false);
        }

        private void deleteMemberRepositoryGridButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var item = (memberRegisterGrid.DataSource as List<MemberRegisterEntity>)[(memberRegisterGrid.MainView as GridView).GetFocusedDataSourceRowIndex()];
            if (item.Id != 0 && (item.IsActive || item.StartDate <= DateTime.Now))
            {
                MessageShowError("به دلیل استفاده از این عضویت، قادر به انجام حذف نمی باشید");
                return;
            }
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            if (item.Id != 0)
            {
                item.Id = -item.Id;
                deleteItems.Add(item);
            }
            (memberRegisterGrid.DataSource as List<MemberRegisterEntity>).RemoveAt((memberRegisterGrid.MainView as GridView).GetFocusedDataSourceRowIndex());
            memberRegisterGrid.RefreshDataSource();
        }

        private void memberRegisterTypeTextBox_Enter(object sender, EventArgs e)
        {
            if (memberRegisterTypeTextBox.TextBoxObject.DataSource == null)
            {
                FillKindCombo();
            }
        }

        private void memberCardTextBox_Enter(object sender, EventArgs e)
        {
            if (memberCardTextBox.TextBoxObject.DataSource == null)
            {
                FillCardNumberCombo();
            }
        }

        private void memberCardTextBox_Validating(object sender, CancelEventArgs e)
        {
            if (string.IsNullOrEmpty(memberCardTextBox.Text) || memberCardTextBox.Text == "فاقد کارت")
                return;
            if (cancellingEdit)
                return;
            //var t = Task.Factory.StartNew(() =>
            //{
            var member = (actionPanel.Tag as MemberDto);
            var response = GetJsonObjecToLink<CardStatuses>(ApiAddress.CardApi.GetCardStatus, parking.Id + $"&memberId={member.Id}&cardNumber={memberCardTextBox.Text}");
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                //Invoke(new MethodInvoker(() =>
                //{
                if (response.Values == CardStatuses.Blocked)
                { MessageShowError("این کارت مسدود می باشد. لطفا کارت دیگری انتخاب کنید"); try { e.Cancel = true; } catch { } }
                else if (response.Values == CardStatuses.Ocupped)
                { MessageShowError("این کارت در اختیار عضو دیگری می باشد. لطفا کارت دیگری انتخاب کنید"); try { e.Cancel = true; } catch { } }
                else if (response.Values == CardStatuses.OcuppedAndNoCredit)
                {
                    if (ShowQuestion("انتقال کارت", "این کارت در اختیار عضو دیگری می باشد. آیا میخواهید کارت را منتقل کنید؟") != DialogResult.OK)
                        try { e.Cancel = true; } catch { }
                }
                if (response.Values == CardStatuses.Undefined)
                {
                    if (ShowQuestion("ایجاد کارت", "این کارت در لیست کارت های مجموعه موجود نمی باشد. آیا میخواهید به کارت ها اضافه گردد؟") != DialogResult.OK)
                        try { e.Cancel = true; } catch { }
                    else
                    {
                        try
                        {
                            Cursor = Cursors.WaitCursor;
                            var newcard = new CardEntity { ParkingId = parking.Id, PersistOn = DateTime.Now, CardNumber = memberCardTextBox.Text };
                            var cardResponse = PostJsonObjecToLink<long>(ApiAddress.CardApi.Save, newcard);
                            if (cardResponse != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                            {
                                newcard.Id = cardResponse.Values;
                                var ds = (memberCardTextBox.TextBoxObject.DataSource as List<CardEntity>);
                                ds.Add(newcard);
                                memberCardTextBox.TextBoxObject.DataSource = null;
                                memberCardTextBox.TextBoxObject.DataSource = ds;
                                memberCardTextBox.TextBoxObject.ValueMember = "Id";
                                memberCardTextBox.TextBoxObject.DisplayMember = "CardNumber";
                                memberCardTextBox.TextBoxObject.Refresh();
                                memberCardTextBox.TextBoxObject.Text = newcard.CardNumber;
                            }
                        }
                        catch { }
                        finally { Cursor = Cursors.Default; }
                    }
                }

                //}));
            }
            ;
            //});
            //t.Wait(100);
            //cardTextBox.Text = "";
        }

        private void addRepositoryGridButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = (allParkSpacesGridControl.DataSource as List<ParkSpaceDto>)[(allParkSpacesGridControl.MainView as GridView).GetFocusedDataSourceRowIndex()];
            if ((memberParkSpaceGridControl.DataSource as List<ParkSpaceDto>) == null)
                memberParkSpaceGridControl.DataSource = new List<ParkSpaceDto>();
            (memberParkSpaceGridControl.DataSource as List<ParkSpaceDto>).Add(entry);
            (allParkSpacesGridControl.DataSource as List<ParkSpaceDto>).Remove(entry);
            memberParkSpaceGridControl.RefreshDataSource();
            allParkSpacesGridControl.RefreshDataSource();
            allParkSpacesChange = true;
        }

        private void removerepositoryParkspaceItemButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = (memberParkSpaceGridControl.DataSource as List<ParkSpaceDto>)[(memberParkSpaceGridControl.MainView as GridView).GetFocusedDataSourceRowIndex()];

            (allParkSpacesGridControl.DataSource as List<ParkSpaceDto>).Add(entry);
            (memberParkSpaceGridControl.DataSource as List<ParkSpaceDto>).Remove(entry);
            memberParkSpaceGridControl.RefreshDataSource();
            allParkSpacesGridControl.RefreshDataSource();
            allParkSpacesChange = true;
        }

        private void floorsTextBox_TextValueChanged(object sender, EventArgs e)
        {
            try
            {
                (allParkSpacesGridControl.MainView as GridView).ActiveFilterString = $"FloorTitle like '%{floorsTextBox.Text}%' ";
            }
            catch { }
            //(allParkSpacesGridControl.MainView as GridView).SetAutoFilterValue(floorTitlegridColumn, floorsTextBox.Text, DevExpress.XtraGrid.Columns.AutoFilterCondition.Contains);
        }

        private void gridView3_RowStyle(object sender, RowStyleEventArgs e)
        {
            try
            {
                if (e.RowHandle < 0)
                    return;
                var item = (memberRegisterGrid.DataSource as List<MemberRegisterEntity>)[e.RowHandle];
                if (item.IsActive && (item.StartDate == item.EndDate || item.EndDate >= DateTime.Now) && !(memberRegisterGrid.DataSource as List<MemberRegisterEntity>).Any(q => q.Id != item.Id && q.Id == 0 && q.StartDate >= item.StartDate && q.IsActive))
                {
                    e.Appearance.BackColor = Color.LightGreen;
                    e.HighPriority = true;
                }
                else
                    e.HighPriority = false;
            }
            catch { }
        }

        private void popupWinControl1_Paint(object sender, PaintEventArgs e)
        {
        }

        private void gridView2_CustomDrawCell(object sender, DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs e)
        {
            if (e.Column == plateGridColumn)
            {
                try { e.DisplayText = SmsHelper.PlateFormat(e.CellValue.ToString()); } catch { }
            }
        }

        private void gridView3_CustomDrawCell(object sender, DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs e)
        {
            if (e.Column == startDateColumn || e.Column == endDateColumn)
            {
                try { e.DisplayText = ((DateTime)e.CellValue).ToPersianDate(); } catch { }
            }
        }

        private void cancelMembershipButton_Click(object sender, EventArgs e)
        {
        }

        private void cancelMembershipRepositoryItemButtonEdit_ButtonClick(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var selectedMemberRegister = (memberRegisterGrid.MainView as GridView).GetFocusedRow() as MemberRegisterEntity;

            if (selectedMemberRegister == null)
            {
                MessageShowError("هیچ عضویتی انتخاب نشده است");
                return;
            }

            var response = GetJsonObjecToLinkAndWait<List<MemberCreditDto>>(ApiAddress.TrafficApi.GetMemberCurrentCreditInfo,
                selectedMemberRegister.MemberId, false, true);

            if (response.HttpResponseType != System.Net.HttpStatusCode.OK)
                MessageShowError(response.Message);

            var memberInfo = response.Values?.Where(q => q.MemberRegisterId == selectedMemberRegister.Id).FirstOrDefault();

            if (memberInfo == null)
            {
                MessageShowError("امکان لغو عضویت، برای اعتبار های به اتمام رسیده میسر نمی باشد");
                return;
            }

            selectedMemberRegister.Member = (actionPanel.Tag as MemberDto).Get();
            popupWinControl1.Tag = selectedMemberRegister;

            tabControl1.SelectedTabPage = membershipCancellationTabPage;

            popupWinControl1.CaptionText = "لغو عضویت";
            statusCreditLabel.Text = selectedMemberRegister.IsActive ? "فعال" : "رزرو";
            creditTypeLabel.Text = memberInfo.MembershipCreditType.DisplayString();

            FillCancelMembershipTypeComboBox();

            ShowPopup(true);
        }

        private void FillCancelMembershipTypeComboBox()
        {
            cancelMembershipTypeComboBox.TextBoxObject.DataSource = EnumHelper.EnumToList(typeof(CancellingMembershipTypes), true);
            cancelMembershipTypeComboBox.TextBoxObject.ValueMember = "key";
            cancelMembershipTypeComboBox.TextBoxObject.DisplayMember = "Value";
        }

        private void eosEntityModifyToolsControl1_Load(object sender, EventArgs e)
        {
        }

        private void eosEntityModifyToolsControl3_Load(object sender, EventArgs e)
        {
        }

        private void btnSelectPersonalPhoto_Click(object sender, EventArgs e)
        {
            var dialog = new OpenFileDialog();

            dialog.Title = "انتخاب عکس پرسنلی";
            dialog.Filter = "PNG files (*.png)|*.png";
            string imageFilePath = "";
            if (dialog.ShowDialog() == DialogResult.OK)
            {
                imageFilePath = dialog.FileName;
                long fileLength = new System.IO.FileInfo(imageFilePath).Length;
                if (fileLength > (100 * 1024)) //100KB
                {
                    MessageBox.Show("حجم تصویر انتخابی نباید بیشتر از 100 کیلوبایت باشد");
                    return;
                }
                //var PictureBox1 = new PictureBox();
                Image img = Image.FromFile(imageFilePath);
                //byte[] pesonalImageArray;
                using (MemoryStream ms = new MemoryStream())
                {
                    img.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                    pesonalImageArray = ms.ToArray();
                }
                pictureBoxPersonal.Image = img;
            }
        }

        private void MemberForm_Load(object sender, EventArgs e)
        {
            noPersonalImage = pictureBoxPersonal.Image;
        }

        private void txbUserCanExitPermi_Enter(object sender, EventArgs e)
        {
            if (txbUserCanExitPermi.TextBoxObject.DataSource == null)
            {
                FillCanExitPermiCombo();
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            buttonConnectReader.Visible = false;
            labelCardReaderName.Text = "در حال ارتباط";
            var connectingReader = new Thread(() => ConnectReader());
            connectingReader.Start();
        }

        private void PassCardID2(RecordEvent.InstantRecord record)
        {
            string log = String.Empty;

            log = "PassCardID2--> " + record.Data.ToString();

            try
            {
                ////string recordDate = record.DateTime.ToString("yyyy/MM/dd HH:mm:ss");
                if (cardTextBox.InvokeRequired)
                {
                    cardTextBox.Invoke(new MethodInvoker(() =>
                    {
                        cardTextBox.Text = record.Data.ToString();
                        //cardTextBox.Focus();
                        //cardTextBox.Validate();
                    }));
                }
                else
                {
                    cardTextBox.Text = record.Data.ToString();
                    //cardTextBox.Focus();
                    //cardTextBox.Validate();
                }
            }
            catch (Exception ex)
            {
                log = "PassCardID2 ERR--> " + ex.Message.ToString();
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> " + log);
        }

        private void ProcessGetRecordFromCardReader(object sender, RecordEvent.RecordEventArgs e)
        {
            string log = String.Empty;
            try
            {
                log = "CardReader--> ";
                if (!string.IsNullOrEmpty(e?.RecordData?.Data))
                {
                    PassCardID2(e.RecordData);
                    log += $" ID:{e.RecordData.Data.ToString()} * DateTime:{e.RecordData.DateTime.ToString("yyyy/MM/dd HH:mm:ss")}";
                }
                else
                {
                    log += " NoData!";
                }
            }
            catch (Exception ex)
            {
                log = "ProcessGetRecordFromCardReader ERR--> " + ex.Message.ToString();
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> " + log);
        }

        private void ConnectReader()
        {
            var response = GetJsonObjecToLink<List<DeviceInfoDto>>(ApiAddress.ParkingApi.GetParkingDoorDevices, PublicVariables.CurrentUser.DoorShift);
            response.Values = response.Values.Where(q => q.Disabled == false).ToList();
            var responseReader = response.Values.Where(q => q.DeviceType == EquipmentTypes.CardReader).ToList();
            long readerDeviceID = -1;
            string readerName = "-";
            try
            {
                if (responseReader.Count() > 0)
                {
                    var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                        .Values.Where(q => q.Id == responseReader[0].DeviceId).ToList();
                    if (!responseEquipments[0].Disabled)
                    {
                        readerDeviceID = responseEquipments[0].Id;
                        if (_cardReader != null)
                        {
                            _cardReader.Dispose();
                            _cardReader = null;
                        }

                        string connectionMode = "";

                        if (responseEquipments[0].ConnectionType == EosParking.Core.Enums.ConnectionTypes.SerialConnection)
                        {
                            _cardReader = new OnlineEncoder("COM" + responseEquipments[0].ComPort.ToString(), false, Application.StartupPath);
                            connectionMode = "[COM]";
                            _cardReader.GetRecordRaised += ProcessGetRecordFromCardReader;
                        }
                        else
                        {
                            connectionMode = "[IP]";
                            _cardReader = new OnlineEncoder(responseEquipments[0].Ip, responseEquipments[0].Port, false, Application.StartupPath);
                            _cardReader.GetRecordRaised += ProcessGetRecordFromCardReader;
                            if (_cardReader.Connect())
                            {
                                //lblConnect.Text = "Connected";
                                _cardReader?.Start();
                                //timer1.Enabled = true;
                            }
                        }

                        if (_cardReader.Connect())
                        {
                            readerName = $"Reader 1.0 {connectionMode}";

                            if (cardTextBox.InvokeRequired)
                            {
                                cardTextBox.Invoke(new MethodInvoker(() =>
                                {
                                    panelCardReaderData.Visible = true;
                                }));
                            }
                            else
                            {
                                panelCardReaderData.Visible = true;
                            }
                        }
                        else
                        {
                            readerName = "یافت نشد";
                            _cardReader.Disconnect();
                            _cardReader.Dispose();
                            _cardReader = null;
                        }

                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo CardReader ({readerName})= COM{responseEquipments[0].ComPort.ToString()}");
                    }
                }
                else
                {
                    readerName = "کارت خوان تعریف نشده!";
                }
            }
            catch (Exception ex)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo CardReader Exception: {ex.Message}");
            }

            if (cardTextBox.InvokeRequired)
            {
                cardTextBox.Invoke(new MethodInvoker(() =>
                {
                    labelCardReaderName.Text = readerName;
                }));
            }
            else
            {
                labelCardReaderName.Text = readerName;
            }
        }

        private void cardTextBox_TextChanged(object sender, EventArgs e)
        {
            if (checkBoxAutoInsertCardNumber.Checked)
            {
                cardTextBox_DoubleClick(sender, e);
            }
        }

        private void cardTextBox_DoubleClick(object sender, EventArgs e)
        {
            if (memberCardTextBox.CanFocus && memberCardTextBox.Enabled && !String.IsNullOrEmpty(memberCardTextBox.Text.Trim()))
            {
                memberCardTextBox.Text = cardTextBox.Text;
                System.Threading.Thread.Sleep(500);
                memberCardTextBox_Validating(sender, null);
                //memberCardTextBox.Validate();
                //memberCardTextBox.Text = "";
            }
        }

        private void propertyPanel_Paint(object sender, PaintEventArgs e)
        {
        }

        private void memberRegisterCreditTextBox_DoubleClick(object sender, EventArgs e)
        {
            //memberRegisterCreditTextBox.Enabled= true;
        }
    }
}