using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Data.EF.Entities;
using EosParking.Devices;
using EosParkingTools.EosForms;
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
    public partial class ParkingDoorForm : EosBaseForm
    {
        List<EquipmentEntity> Equipments = new List<EquipmentEntity>();
        private ParkingEntity parking=null;

        List<ParkingDoorEntity> DeleteParkSpaces = new List<ParkingDoorEntity>();
        private void FillGrid()
        {
            deleteGridColumn.Visible = PublicVariables.CheckUserAccess(AccessItemTypes.ParkingDoorDelete);
            var response = GetJsonObjecToLinkAndWait<List<ParkingDoorEntity>>(ApiAddress.ParkingApi.GetParkingDoors, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                gridControl1.DataSource = response.Values;
            else
                MessageShowError(response);
        }

        public ParkingDoorForm(ParkingEntity parking)
        {
            InitializeComponent();
            this.parking = parking;
        }

        private void ParkingDoorForm_Load(object sender, EventArgs e)
        {
            FillGrid();
            typeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(DoorTypes), true);
            trafficTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(DoorTrafficTypes), true);
            trafficTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(EntryAuthorizaitionTypes), true);
            FillEquipments();
            propertyPanel.Enabled = false;
        }

        private void FillEquipments()
        {
            Task.Factory.StartNew(() =>
            {
                try
                {
                    var response = GetJsonObjecToLinkAndWait<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, parking.Id);
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        Equipments = response.Values;
                        if (Equipments == null)
                            Equipments = new List<EquipmentEntity>();
                        Equipments.Insert(0, new EquipmentEntity { Id = 0, DeviceName = "انتخاب نشده" });
                    }
                    ChangeEquipments();
                }
                catch { }
            });
            //else
            //    MessageShowError(response);
        }

        private void ChangeEquipments()
        {
            if(InvokeRequired)
            {
                Invoke(new MethodInvoker(ChangeEquipments));
                return;
            }
            var selectDevice = gateEnteranceDeviceTextBox.TextBoxObject.SelectedValue;
            var selectDevice2 = gateExitDeviceTextBox.TextBoxObject.SelectedValue;
            var selectQr= qrEnteranceDeviceTextBox.TextBoxObject.SelectedValue;
            var selectQrExit = qrExitDeviceTextBox.TextBoxObject.SelectedValue;

            var selectCamera = cameraEnterTextBox.TextBoxObject.SelectedValue;
            var selectExitCamera = cameraExitTextBox.TextBoxObject.SelectedValue;

            gateEnteranceDeviceTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.Gate  || q.Id==0).ToList();
            gateEnteranceDeviceTextBox.TextBoxObject.DisplayMember = "DeviceName";
            gateEnteranceDeviceTextBox.TextBoxObject.ValueMember = "Id";

            gateExitDeviceTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.Gate  || q.Id == 0).ToList();
            gateExitDeviceTextBox.TextBoxObject.DisplayMember = "DeviceName";
            gateExitDeviceTextBox.TextBoxObject.ValueMember = "Id";

            qrEnteranceDeviceTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.OnlineQrCode || q.Id == 0).ToList();
            qrEnteranceDeviceTextBox.TextBoxObject.DisplayMember = "DeviceName";
            qrEnteranceDeviceTextBox.TextBoxObject.ValueMember = "Id";

            qrExitDeviceTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.OnlineQrCode || q.Id == 0).ToList();
            qrExitDeviceTextBox.TextBoxObject.DisplayMember = "DeviceName";
            qrExitDeviceTextBox.TextBoxObject.ValueMember = "Id";

            //if(actionPanel.Tag!=null )
            //    devicesGrid.DataSource = Equipments.Where(q => q.DeviceType != EquipmentTypes.Gate && q.DeviceType != EquipmentTypes.Camera).Select(q => new ParkingDoorDeviceEntity() { Id = 0, EquipmentId = q.Id, EquipmentTitle = q.DeviceName, TrafficType = DoorTrafficTypes.All }).ToList();
            //else
            devicesGrid.DataSource= Equipments.Where(q =>q.DeviceType != EquipmentTypes.Gate && q.DeviceType != EquipmentTypes.Camera &&
            !((gridControl1.DataSource as List<ParkingDoorEntity>)?.Any(d => d.DtoViewParkingDoorDevices?.Any(de => de.EquipmentId == q.Id) ?? false) ?? false) || q.Id == 0/*!((doorDevicesGrid.DataSource as List<ParkingDoorDeviceEntity>)?.Any(li=>li.EquipmentId==q.Id)??false)*/)
                .Select(q=>new ParkingDoorDeviceEntity() { Id=0,EquipmentId=q.Id,EquipmentTitle=q.DeviceName,TrafficType=DoorTrafficTypes.All} ).ToList();
            if (selectDevice != null)
                gateEnteranceDeviceTextBox.TextBoxObject.SelectedValue = selectDevice;
            if (selectDevice2 != null)
                gateExitDeviceTextBox.TextBoxObject.SelectedValue = selectDevice2;

            if (selectQr != null)
                qrEnteranceDeviceTextBox.TextBoxObject.SelectedValue = selectDevice;
            if (selectQrExit != null)
                qrExitDeviceTextBox.TextBoxObject.SelectedValue = selectDevice;

            cameraEnterTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.Camera || q.Id == 0).ToList();
            cameraEnterTextBox.TextBoxObject.DisplayMember = "DeviceName";
            cameraEnterTextBox.TextBoxObject.ValueMember = "Id";

            cameraExitTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.Camera || q.Id == 0).ToList();
            cameraExitTextBox.TextBoxObject.DisplayMember = "DeviceName";
            cameraExitTextBox.TextBoxObject.ValueMember = "Id";
            if (selectCamera != null)
                cameraEnterTextBox.TextBoxObject.SelectedValue = selectCamera;
            if (selectExitCamera != null)
                cameraExitTextBox.TextBoxObject.SelectedValue = selectExitCamera;

            pcPosTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.Pos || q.Id == 0).ToList();
            pcPosTextBox.TextBoxObject.DisplayMember = "DeviceName";
            pcPosTextBox.TextBoxObject.ValueMember = "Id";

            uhfReaderTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.UHF_LongRangeReader || q.Id == 0).ToList();
            uhfReaderTextBox.TextBoxObject.DisplayMember = "DeviceName";
            uhfReaderTextBox.TextBoxObject.ValueMember = "Id";

            cardReaderTextBox.TextBoxObject.DataSource = Equipments.Where(q => q.DeviceType == EquipmentTypes.CardReader || q.Id == 0).ToList();
            cardReaderTextBox.TextBoxObject.DisplayMember = "DeviceName";
            cardReaderTextBox.TextBoxObject.ValueMember = "Id";


        }

        void ClearForm()
        {
            titleTextBox.Text = "";
        }
        private void PropertyPanelFill(ParkingDoorEntity entry, bool enable)
        {
            propertyPanel.Enabled = enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;
            if (entry == null)
            {
                ClearForm();
                entry = new ParkingDoorEntity() { Title = "جدید", ParkingId = parking.Id,PersistOn=DateTime.Now };
            } 
            actionPanel.Tag = entry;
            floorTitleLabel.Text = entry.Title;
            titleTextBox.Text = entry.Title;
            descriptionTextBox.Text = entry.Description;

            gateEnteranceDeviceTextBox.TextBoxObject.SelectedValue = entry.GateEntranceDeviceId ?? 0;

            gateExitDeviceTextBox.TextBoxObject.SelectedValue = entry.GateExitDeviceId ?? 0;

            qrEnteranceDeviceTextBox.TextBoxObject.SelectedValue = entry.QrEntranceDeviceId ?? 0;

            qrExitDeviceTextBox.TextBoxObject.SelectedValue = entry.QrExitDeviceId ?? 0;

            cameraEnterTextBox.TextBoxObject.SelectedValue = entry.EnteranceCameraId ?? 0;

            cameraExitTextBox.TextBoxObject.SelectedValue = entry.ExitCameraId ?? 0;

            pcPosTextBox.TextBoxObject.SelectedValue = entry.PcPosId ?? 0;

            uhfReaderTextBox.TextBoxObject.SelectedValue = entry.UHF_LongRangeReaderId ?? 0;

            cardReaderTextBox.TextBoxObject.SelectedValue = entry.CardReaderId ?? 0;

            lcdPriceCheckBox.Checked = entry.HaveLcdPrice;
            lcdPricePortTextBox.Enabled = lcdPriceCheckBox.Checked;
            lcdPricePortTextBox.Text = entry.LcdPricePort.ToString();
            codeTextBox.Text= entry.DoorCode.ToString();
            //trafficTextBox.TextBoxObject.SelectedIndex = (int)entry.DoorTrafficType;
            typeTextBox.TextBoxObject.SelectedIndex = (int)entry.DoorType;
            trafficTypeTextBox.TextBoxObject.SelectedIndex = (int)entry.EntryAuthorizaitionType;
            cancelButton.Visible = okButton.Visible = enable;

            doorDevicesGrid.DataSource = entry.DtoViewParkingDoorDevices?.ToList()??new List<ParkingDoorDeviceEntity>();
            devicesGrid.DataSource = Equipments.Where(q =>  q.DeviceType != EquipmentTypes.Gate && q.DeviceType != EquipmentTypes.Pos && q.DeviceType != EquipmentTypes.Camera).Where(q=> !((gridControl1.DataSource as List<ParkingDoorEntity>)?.Any(d => d.DtoViewParkingDoorDevices?.Any(de => de.EquipmentId == q.Id) ?? false) ?? false)).Select(q => new ParkingDoorDeviceEntity() { Id = 0, EquipmentId = q.Id, EquipmentTitle = q.DeviceName, TrafficType = DoorTrafficTypes.All }).ToList();
        }

        bool IsValidat()
        {
            if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingDoorAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return false;
            }
            if (string.IsNullOrEmpty(titleTextBox.Text))
            {
                MessageShowError("نام کاربری و کلمه عبور را وارد کنید.");
                return false;
            } 
            if(gateEnteranceDeviceTextBox.TextBoxObject.SelectedValue!= null && gateEnteranceDeviceTextBox.TextBoxObject.SelectedValue== gateExitDeviceTextBox.TextBoxObject.SelectedValue)
            {
                MessageShowError("راهبند ورود و خروج نمیتواند یکسان باشد.");
                return false;
            }
            if (qrEnteranceDeviceTextBox.TextBoxObject.SelectedValue != null && qrEnteranceDeviceTextBox.TextBoxObject.SelectedValue == qrExitDeviceTextBox.TextBoxObject.SelectedValue)
            {
                MessageShowError("راهبند ورود و خروج نمیتواند یکسان باشد.");
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
                var item = actionPanel.Tag as ParkingDoorEntity;
                if (item == null)
                {
                    item = new ParkingDoorEntity();
                    item.PersistOn = DateTime.Now;
                }

                item.DoorType = (DoorTypes)typeTextBox.TextBoxObject.SelectedIndex;

                if (cameraEnterTextBox.TextBoxObject.SelectedValue == null || item.DoorType == DoorTypes.Exit)
                    item.EnteranceCameraId = null;
                else
                    item.EnteranceCameraId = (long)cameraEnterTextBox.TextBoxObject.SelectedValue;
                if (cameraExitTextBox.TextBoxObject.SelectedValue == null || item.DoorType == DoorTypes.Entrance)
                    item.ExitCameraId = null;
                else
                    item.ExitCameraId = (long)cameraExitTextBox.TextBoxObject.SelectedValue;

                if (gateEnteranceDeviceTextBox.TextBoxObject.SelectedValue == null || item.DoorType == DoorTypes.Exit)
                    item.GateEntranceDeviceId = null;
                else
                    item.GateEntranceDeviceId= (long)gateEnteranceDeviceTextBox.TextBoxObject.SelectedValue;

                if (gateExitDeviceTextBox.TextBoxObject.SelectedValue == null || item.DoorType == DoorTypes.Entrance)
                    item.GateExitDeviceId = null;
                else
                    item.GateExitDeviceId = (long)gateExitDeviceTextBox.TextBoxObject.SelectedValue;

                if (qrEnteranceDeviceTextBox.TextBoxObject.SelectedValue == null || item.DoorType == DoorTypes.Exit)
                    item.QrEntranceDeviceId = null;
                else
                    item.QrEntranceDeviceId = (long)qrEnteranceDeviceTextBox.TextBoxObject.SelectedValue;

                if (qrExitDeviceTextBox.TextBoxObject.SelectedValue == null || item.DoorType == DoorTypes.Entrance)
                    item.QrExitDeviceId = null;
                else
                    item.QrExitDeviceId = (long)qrExitDeviceTextBox.TextBoxObject.SelectedValue;

                if (pcPosTextBox.TextBoxObject.SelectedValue == null)
                    item.PcPosId = null;
                else
                    item.PcPosId = (long)pcPosTextBox.TextBoxObject.SelectedValue;

                if (uhfReaderTextBox.TextBoxObject.SelectedValue == null)
                    item.UHF_LongRangeReaderId = null;
                else
                    item.UHF_LongRangeReaderId = (long)uhfReaderTextBox.TextBoxObject.SelectedValue;

                if (cardReaderTextBox.TextBoxObject.SelectedValue == null)
                    item.CardReaderId = null;
                else
                    item.CardReaderId = (long)cardReaderTextBox.TextBoxObject.SelectedValue;

                item.ParkingId = parking.Id;
                //item.DoorTrafficType=(DoorTrafficTypes)trafficTextBox.TextBoxObject.SelectedIndex ;
                item.EntryAuthorizaitionType = (EntryAuthorizaitionTypes)trafficTypeTextBox.TextBoxObject.SelectedIndex;
                item.Title = titleTextBox.Text;
                item.Description = descriptionTextBox.Text;
                item.PersistOn = DateTime.Now;
                item.DtoViewParkingDoorDevices = doorDevicesGrid.DataSource as List<ParkingDoorDeviceEntity>;
                item.HaveLcdPrice = lcdPriceCheckBox.Checked;
                item.LcdPricePort= lcdPricePortTextBox.IntValue;
                item.DoorCode = codeTextBox.LongValue;
                var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.ParkingApi.SaveParkingDoor, item, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (item.Id == 0)
                    {
                        item.Id = response.Values;
                        (gridControl1.DataSource as List<ParkingDoorEntity>).Add(item);
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
            var entry = ((gridControl1.DataSource as List<ParkingDoorEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<ParkingDoorEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.ParkingApi.DeleteParkingDoor, entry.Id);
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
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as ParkingDoorEntity;
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
            var entry = (gridControl1.MainView as GridView).GetFocusedRow() as ParkingDoorEntity;
            PropertyPanelFill(entry, false);
        }

        private void propertyPanel_Paint(object sender, PaintEventArgs e)
        {

        }

        private void newDeviceButton2_Click(object sender, EventArgs e)
        {
            using (var frm = new EquipmentForm(parking))
            {
                frm.ShowDialog();
                try
                {
                    Equipments = frm.EquipmentsList.ToList();
                    ChangeEquipments();
                }
                catch { }
            }
        }

        private void equipmentRepositoryGridButtonEdit_Click(object sender, EventArgs e)
        {
            var entry = (devicesGrid.DefaultView as GridView).GetFocusedRow() as ParkingDoorDeviceEntity;
            entry.DoorId = (actionPanel.Tag as ParkingDoorEntity).Id;
            (devicesGrid.DefaultView as GridView).DeleteSelectedRows();
            (doorDevicesGrid.DataSource as List<ParkingDoorDeviceEntity>).Add(entry);
            doorDevicesGrid.RefreshDataSource();
            devicesGrid.RefreshDataSource();
        }

        private void removeDeviceRepositoryGridButtonEdit_Click(object sender, EventArgs e)
        {
            //if(ShowQuestion(message:"")
            var entry = (doorDevicesGrid.DefaultView as GridView).GetFocusedRow() as ParkingDoorDeviceEntity;
            entry.DoorId = (actionPanel.Tag as ParkingDoorEntity).Id;
            entry.Id = 0;
            (devicesGrid.DataSource as List<ParkingDoorDeviceEntity>).Add(entry);
            (doorDevicesGrid.DefaultView as GridView).DeleteSelectedRows();
            doorDevicesGrid.RefreshDataSource();
            devicesGrid.RefreshDataSource();
        }

        private void lcdPriceCheckBox_CheckedChanged(object sender, EventArgs e)
        {
            panel1.Enabled = lcdPriceCheckBox.Checked;
            lcdPricePortTextBox.Enabled = true;
        }

        private void typeTextBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            cameraEnterTextBox.Enabled = typeTextBox.TextBoxObject.SelectedIndex == 0 || typeTextBox.TextBoxObject.SelectedIndex == 2 || typeTextBox.TextBoxObject.SelectedIndex == (int)DoorTypes.EnternalDoor;
            gateEnteranceDeviceTextBox.Enabled = typeTextBox.TextBoxObject.SelectedIndex == 0 || typeTextBox.TextBoxObject.SelectedIndex == 2 || typeTextBox.TextBoxObject.SelectedIndex == (int)DoorTypes.EnternalDoor;
            qrEnteranceDeviceTextBox.Enabled = typeTextBox.TextBoxObject.SelectedIndex == 0 || typeTextBox.TextBoxObject.SelectedIndex == 2 || typeTextBox.TextBoxObject.SelectedIndex == (int)DoorTypes.EnternalDoor;
            
            cameraExitTextBox.Enabled = typeTextBox.TextBoxObject.SelectedIndex == 1 || typeTextBox.TextBoxObject.SelectedIndex == 2 || typeTextBox.TextBoxObject.SelectedIndex == (int)DoorTypes.EnternalDoor;
            gateExitDeviceTextBox.Enabled = typeTextBox.TextBoxObject.SelectedIndex == 1 || typeTextBox.TextBoxObject.SelectedIndex == 2 || typeTextBox.TextBoxObject.SelectedIndex == (int)DoorTypes.EnternalDoor;
            qrExitDeviceTextBox.Enabled = typeTextBox.TextBoxObject.SelectedIndex == 1 || typeTextBox.TextBoxObject.SelectedIndex == 2 || typeTextBox.TextBoxObject.SelectedIndex == (int)DoorTypes.EnternalDoor;

           
        }

        private void simpleButton1_Click(object sender, EventArgs e)
        {
            try
            {
                SevenSegmentDisplayDevice sev = new SevenSegmentDisplayDevice(lcdPricePortTextBox.IntValue);
                sev.DisplayCapacitySync("999999");
            }
            catch { }
        }

        private void eosEntityModifyToolsControl1_Load(object sender, EventArgs e)
        {

        }
    }
}
