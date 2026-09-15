using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraTab;
using EosClocks;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Data.EF.Entities;
using EosParking.Devices;
using EosParkingProfessional.Models;
using EosParkingTools.EosForms;
using Intek.PcPosLibrary;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Text;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class EquipmentForm : EosBaseForm
    {
        ParkingEntity parking;

        public List<EquipmentEntity> EquipmentsList { get { return gridControl1.DataSource as List<EquipmentEntity>; } }
        private void FillGrid()
        {
            deleteGridColumn.Visible = PublicVariables.CheckUserAccess(AccessItemTypes.ParkingEquipmentDelete);

            var response = GetJsonObjecToLinkAndWait<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, parking.Id);
            //var response = GetJsonObjecToLinkAndWait<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                gridControl1.DataSource = response.Values;
            else
                MessageShowError(response);
        }


        void ClearForm()
        {
            //userNameTextBox.Text = "";
            deviceNameTextBox.Text = "";
            ipTextBox.Text = "";
            cameraIpTextBox.Text = "";
            writeTimeOutTextBox.Text = "3000";
            readTimeOutTextBox.Text = "3000";
            portTextBox.Text = "1001";
            comPortTextBox.Text = "";
        }

        private void PropertyPanelFill(EquipmentEntity entry, bool enable)
        {

            propertyPanel.Enabled = enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;
            deviceInfoLabel.Text = "";
            if (entry == null)
            {
                ClearForm();
                entry = new EquipmentEntity() { DeviceName = "جدید", ParkingId = parking.Id, DetectionWidth = 350, DetectionHeight = 250, DetectionLeft = 200, DetectionTop = 400 };
            }

            actionPanel.Tag = entry;
            deviceNameTextBox.Text = titleLabel.Text = entry.DeviceName;
            connectionTypeTextBox.TextBoxObject.SelectedIndex = (int)entry.ConnectionType;
            equipmentTypeTextBox.TextBoxObject.SelectedIndex = (int)entry.DeviceType;
            serverControlCheckBox.Checked = entry.ControlByServer;
            detectionServerTextBox.Text = entry.DetectionServerAddress;
            leftUpDown.Value = entry.DetectionLeft;
            topUpDown.Value = entry.DetectionTop;
            widhtUpDown.Value = entry.DetectionWidth;
            heightUpDown.Value = entry.DetectionHeight;
            if (entry.DeviceType == EquipmentTypes.Camera)
            {
                cameraPortTextBox.Text = entry.Port.ToString();
                cameraIpTextBox.Text = entry.Ip;
                cameraUserTextBox.Text = entry.CameraUserName;
                cameraPassTextBox.Text = entry.CameraPassword;
            }
            else
            {
                relayTextBox.Text = entry.Relay.ToString();

                portTextBox.Text = entry.Port.ToString();
                comPortTextBox.Text = entry.ComPort.ToString();
                ipTextBox.Text = entry.Ip;
                boudRateTextBox.Text = entry.BoudRate.ToString();
                readTimeOutTextBox.Text = entry.ReadTimeOut.ToString();
                writeTimeOutTextBox.Text = entry.WriteTimeOut.ToString();
                pcCheckCheckBox.Checked = entry.IsPcCheck;
                checkEditGateByService.Checked = entry.ByService;
            }
            statusTextBox.TextBoxObject.SelectedIndex = entry.Disabled ? 1 : 0;

            equipmentTypeTextBox.TextBoxObject.SelectedIndex = (int)entry.DeviceType;
            //durationTextBox.Text = entry.DurationDays.ToString();
            //tariffGrid.DataSource = entry.Tariffs;

            //item.TariffRanges
            //DateTime.Now =entry.PersistOn ;
            cancelButton.Visible = okButton.Visible = enable;

        }

        public EquipmentForm(ParkingEntity parking)
        {
            InitializeComponent();
            this.parking = parking;

        }


        private void EquipmentForm_Load(object sender, EventArgs e)
        {
            FillGrid();

            equipmentTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(EquipmentTypes), true);
            connectionTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(EosParking.Core.Enums.ConnectionTypes), true);
            statusTextBox.TextBoxObject.Items.Clear();
            statusTextBox.TextBoxObject.DataSource = new string[2] { "فعال", "غیر فعال" };
            //cmeraRegionTextBox.TextBoxObject.DataSource = new string[] { "مرکز", "بالا","پایین","چپ","راست" };
            deviceInfoTabControl.ShowTabHeader = DevExpress.Utils.DefaultBoolean.False;
            licensePlateDetectionSystemTypeXtraTabControl.ShowTabHeader = DevExpress.Utils.DefaultBoolean.False;
            boudRateTextBox.TextBoxObject.DataSource = new string[] { "9600", "19200", "38400", "57600", "115200", "230400" };
            
        }

        bool IsValidat()
        {

            if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingEquipmentAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return false;
            }
            if (string.IsNullOrEmpty(deviceNameTextBox.Text))
            {
                MessageShowError("نام را وارد کنید.");
                return false;
            }
            IPAddress iPAddress;
            if (((EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex == EquipmentTypes.Camera && string.IsNullOrEmpty(cameraIpTextBox.Text)) ||
                 ((EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex != EquipmentTypes.Camera && !IPAddress.TryParse(ipTextBox.Text, out iPAddress) && connectionTypeTextBox.TextBoxObject.SelectedIndex == 1))
            {
                MessageShowError("آدرس شبکه درست نمی باشد");
                return false;
            }
            /*if (((EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex != EquipmentTypes.Camera && portTextBox.IntValue <= 0))
            {
                MessageShowError("پورت را وارد کنید");
                return false;
            }*/

            return true;
        }

        private void SaveItem()
        {
            if (!IsValidat())
                return;
            try
            {
                var item = actionPanel.Tag as EquipmentEntity;
                if (item == null)
                {
                    item = new EquipmentEntity();
                }
                item.DeviceName = deviceNameTextBox.Text;
                item.ParkingId = parking.Id;
                item.ConnectionType = (EosParking.Core.Enums.ConnectionTypes)connectionTypeTextBox.TextBoxObject.SelectedIndex;
                item.DeviceType = (EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex;
                item.ControlByServer = serverControlCheckBox.Checked;
                item.DetectionServerAddress = detectionServerTextBox.Text;
                item.DetectionHeight = (int)heightUpDown.Value;
                item.DetectionWidth = (int)widhtUpDown.Value;
                item.DetectionTop = (int)topUpDown.Value;
                item.DetectionLeft = (int)leftUpDown.Value;
                item.ComPort = comPortTextBox.IntValue;


                if (item.DeviceType == EquipmentTypes.Camera)
                {
                    item.Port = cameraPortTextBox.IntValue;
                    item.Ip = cameraIpTextBox.Text;
                    item.CameraUserName = cameraUserTextBox.Text;
                    item.CameraPassword = cameraPassTextBox.Text;
                }
                else
                {
                    item.Port = portTextBox.IntValue;
                    item.Ip = ipTextBox.Text;
                    item.Relay = relayTextBox.IntValue;
                    //item.RelayBuzzer = relayBuzzerCheckBox.Checked;
                    item.ReadTimeOut = readTimeOutTextBox.IntValue;
                    item.WriteTimeOut = writeTimeOutTextBox.IntValue;
                    item.IsPcCheck = pcCheckCheckBox.Checked;
                    item.ByService = checkEditGateByService.Checked;

                }
                item.BoudRate = boudRateTextBox.IntValue;
                item.Disabled = statusTextBox.TextBoxObject.SelectedIndex > 0;
                var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.ParkingApi.SaveParkingEquipment, item, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values > 0)
                {
                    if (item.Id == 0)
                    {
                        item.Id = response.Values;
                        (gridControl1.DataSource as List<EquipmentEntity>).Add(item);
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
            var entry = ((gridControl1.DataSource as List<EquipmentEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);

            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("حذف!") != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<EquipmentEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.ParkingApi.DeleteEquipmentById, entry.Id);
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
                var entry = ((gridControl1.DataSource as List<EquipmentEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
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

        private void equipmentTypeTextBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            if ((EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex == EquipmentTypes.Camera)
            {
                deviceInfoTabControl.SelectedTabPage = ipCamTabPage;
                deviceInfoTabControl.SelectedTabPageIndex = deviceInfoTabControl.TabPages.IndexOf(ipCamTabPage);

                ipCamTabPage.Show();
            }
            else
            {
                //relayTextBox.Visible = ((EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex == EquipmentTypes.GateG4);
                //relayBuzzerCheckBox.Visible = relayTextBox.Visible;
                deviceInfoTabControl.SelectedTabPage = clockTabPage;
                deviceInfoTabControl.SelectedTabPageIndex = deviceInfoTabControl.TabPages.IndexOf(clockTabPage);
                //if ((EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex == EquipmentTypes.ShineTrafficControler || (EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex == EquipmentTypes.PoroTrafficControler)
                //    pcCheckCheckBox.Show();
                //else
                //    pcCheckCheckBox.Hide();

                clockTabPage.Show();
            }
            checkEditGateByService.Visible = ((EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex == EquipmentTypes.Gate);
            deviceInfoTabControl.Refresh();
            deviceInfoTabControl.Update();

        }

        private void connectionTypeTextBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            ipTextBox.Enabled = EosParking.Core.Enums.ConnectionTypes.TcpIp == (EosParking.Core.Enums.ConnectionTypes)connectionTypeTextBox.TextBoxObject.SelectedIndex;
            boudRateTextBox.Enabled = !ipTextBox.Enabled;
        }


        DeviceManager device;
        private void simpleButton1_Click(object sender, EventArgs e)
        {
            var item = new EquipmentEntity();
            deviceInfoLabel.Text = "";
            item.DeviceName = deviceNameTextBox.Text;
            item.ParkingId = parking.Id;
            item.ConnectionType = (EosParking.Core.Enums.ConnectionTypes)connectionTypeTextBox.TextBoxObject.SelectedIndex;
            item.DeviceType = (EquipmentTypes)equipmentTypeTextBox.TextBoxObject.SelectedIndex;
            item.BoudRate = boudRateTextBox.IntValue;
            item.Disabled = statusTextBox.TextBoxObject.SelectedIndex > 0;
            try
            {
                if (item.DeviceType == EquipmentTypes.Camera)
                {
                    item.Port = cameraPortTextBox.IntValue;
                    item.Ip = cameraIpTextBox.Text;
                    item.CameraUserName = cameraUserTextBox.Text;
                    item.CameraPassword = cameraPassTextBox.Text;
                }
                else if (item.DeviceType == EquipmentTypes.Pos)
                {
                    TestPcPos(ipTextBox.Text, portTextBox.IntValue);
                    return;

                    /*
                    item.Port = portTextBox.IntValue;
                    item.Ip = ipTextBox.Text;
                    item.ReadTimeOut = readTimeOutTextBox.IntValue;
                    item.WriteTimeOut = writeTimeOutTextBox.IntValue;
                    device = new PcPosManager(item);
                    */
                }
                else if (item.DeviceType == EquipmentTypes.CardReader)
                {
                    try
                    {
                        Waiting(true);

                        OnlineEncoder reader;

                        if (item.ConnectionType == EosParking.Core.Enums.ConnectionTypes.SerialConnection)
                            reader = new OnlineEncoder("COM" + comPortTextBox.IntValue.ToString(), false, Application.StartupPath);
                        else
                            reader = new OnlineEncoder(ipTextBox.Text.Trim(), portTextBox.IntValue, false, Application.StartupPath);

                        if (reader.Connect())
                        {
                            MessageShowSucsess("ارتباط با کارت خوان برقرار شد");
                            reader.Disconnect();
                            reader.Dispose();
                        }
                        else
                        {
                            MessageShowError("ارتباط با کارت خوان برقرار نشد");
                        }
                    }
                    catch
                    {
                        MessageShowError("ارتباط با کارت خوان برقرار نشد");
                    }
                    finally
                    {
                        Waiting(false);
                    }

                    return;
                }
                else
                {

                    item.ComPort = comPortTextBox.IntValue;
                    item.Port = portTextBox.IntValue;
                    item.Ip = ipTextBox.Text;
                    item.Relay = relayTextBox.IntValue;
                    //item.RelayBuzzer = relayBuzzerCheckBox.Checked;
                    item.ReadTimeOut = readTimeOutTextBox.IntValue;
                    item.WriteTimeOut = writeTimeOutTextBox.IntValue;
                    device = new DeviceManager(item);
                }
                try
                {
                    Waiting(true);
                    int connectState = 0;
                    System.Threading.Tasks.Task.Factory.StartNew(() =>
                    {
                        try
                        {
                            if (device is PcPosManager)
                            {

                                (device as PcPosManager).Pay(1000, 1010);
                            }
                            else
                            {
                                var ss = device.FirmwareVersion;
                                device.Connect();
                                connectState = 1;
                            }
                        }
                        catch { connectState = -1; }
                    });
                    while (connectState == 0)
                        Application.DoEvents();
                    if (connectState > 0 && device.IsConnect)
                    {
                        MessageShowSucsess("ارتباط با دستگاه برقرار شد " /*+ Environment.NewLine + device.GetDateTime().ToString()*/);
                        deviceInfoLabel.Text = device.GetDeviceInfo();
                    }
                    else
                        throw new Exception();
                }
                finally
                {
                    try
                    {
                        device.Stop();
                        device.Dispose();
                    }
                    catch { }
                    Waiting(false);
                }

                //device.OnRecordRecived += new RecordRecivedEventHandler((DeviceManager senderClock, RecordRecivedArg arg) =>
                //{ 
                //    device.ValidUserIds = new List<string> { "3" };
                //});
                //device.OnSentValidUserIds += new EventHandler((object s, EventArgs ee) =>
                //{
                //    device.Stop();
                //    device.Disconnect();
                //});
                //device.Start();


            }
            catch {
                //if ((item.DeviceType == EquipmentTypes.GateG4) & (!String.IsNullOrWhiteSpace(device.FirmwareVersion)))
                    if ((item.DeviceType == EquipmentTypes.Gate) & (!String.IsNullOrWhiteSpace(device.FirmwareVersion)))
                    {

                        //if (!String.IsNullOrWhiteSpace(device.FirmwareVersion))
                        //{ 

                        //}
                        MessageShowError("ارتباط برقرار شد" + " \n " + device.FirmwareVersion);
                }
                else
                { 
                    MessageShowError("ارتباط برقرار نشد");
                }
            }
        }

        private void TestPcPos(string ip , int port)
        {
            PCPOS pcPos = new PCPOS();
            pcPos.ConnectionType = PCPOS.cnType.LAN;
            pcPos.Ip = ip;
            pcPos.Port = port;
            string message_ = "";
            if (pcPos.TestConnection())
            {
                message_ = "ارتباط با دستگاه پوز برقرار شد";
                pcPos.Amount = "2000";
                pcPos.PrCode = "000000";
                pcPos.send_transaction();
            }
            else
            {
                message_ = "عدم ارتباط با دستگاه!";
            }
            MessageShowSucsess(message_);
        }

        private void cameraConnectButton_Click(object sender, EventArgs e)
        {
            try
            {
                eosIpCamView1.Stop();
                eosIpCamView1.VideoSize = new Size(int.Parse(ConfigurationManager.AppSettings["VideoWidth"] ?? "0"), int.Parse(ConfigurationManager.AppSettings["VideoHeight"] ?? "0"));
                eosIpCamView1.IpCamUrl = cameraIpTextBox.Text;
                eosIpCamView1.UserName = cameraUserTextBox.Text;
                eosIpCamView1.Password = cameraPassTextBox.Text;
                eosIpCamView1.Port = cameraPortTextBox.IntValue;
                var rect = new Rectangle((int)leftUpDown.Value, (int)topUpDown.Value, (int)widhtUpDown.Value, (int)heightUpDown.Value);
                eosIpCamView1.DetectPlateRegion = rect;
                eosIpCamView1.Start(cameraIpTextBox.Text, cameraUserTextBox.Text, cameraPassTextBox.Text, cameraPortTextBox.IntValue);
                //eosIpCamView1.StartPreview(cameraIpTextBox.Text, cameraUserTextBox.Text, cameraPassTextBox.Text, cameraPortTextBox.IntValue);
                eosIpCamView1.CapturBitmap(true);
                eosIpCamView1.ActiveRegionSelector = true;
                if (eosIpCamView1.IsConnect)
                {
                    // MessageShowSucsess("ارتباط با دستگاه برقرار شد ");
                }
                else
                {
                    MessageShowError("ارتباط برقرار نشد");
                }
                // eosIpCamView1.Stop();
            }
            catch { MessageShowError("ارتباط برقرار نشد"); }

        }

        private void eosIpCamView1_OnFrameBitmapRecived(object sender, Bitmap image)
        {
        }

        private void propertyPanel_Paint(object sender, PaintEventArgs e)
        {

        }

        private void gridView1_RowStyle(object sender, RowStyleEventArgs e)
        {
            try
            {
                var entry = gridView1.GetRow(e.RowHandle) as EquipmentEntity;
                if (entry != null && entry.Disabled)
                {
                    e.Appearance.FontStyleDelta = FontStyle.Strikeout;
                    e.Appearance.ForeColor = Color.Red;
                    e.HighPriority = true;
                }
                else
                {
                    e.Appearance.FontStyleDelta = FontStyle.Regular;
                    e.Appearance.ForeColor = gridControl1.ForeColor;
                    e.HighPriority = false;
                }


            }
            catch { }
        }

        private void gridView1_SelectionChanged(object sender, DevExpress.Data.SelectionChangedEventArgs e)
        {
            try
            {
                var entry = ((gridControl1.DataSource as List<EquipmentEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                PropertyPanelFill(entry, false);
            }
            catch (Exception)
            {

            }
        }

        private void eosIpCamView1_OnSelectNewDetectPlateRegion(object sender, EventArgs e)
        {
            // var rect = new Rectangle((int), (int)topUpDown.Value, (int)widhtUpDown.Value, (int)heightUpDown.Value);
            leftUpDown.Value = eosIpCamView1.DetectPlateRegion.X;
            topUpDown.Value = eosIpCamView1.DetectPlateRegion.Y;
            widhtUpDown.Value = eosIpCamView1.DetectPlateRegion.Width;
            heightUpDown.Value = eosIpCamView1.DetectPlateRegion.Height;
        }

        #region popup Plate detector service Tools
        private void settingPlateDetectorSimpleButton_Click(object sender, EventArgs e)
        {
            licensePlateDetectionType.TextBoxObject.DataSource = licensePlateDetectionSystemTypeXtraTabControl.TabPages;
            licensePlateDetectionType.TextBoxObject.DisplayMember = "Text";
             
            PreparePopupLicensePlateDetectionType();
        }

        private void PreparePopupLicensePlateDetectionType()
        {
            ClearPopup();
            var detectionServer = detectionServerTextBox.Text.ToLower();

            if (detectionServer.StartsWith("db://"))
            {
                try
                {
                    serverDataTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "ip");
                    portDataTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "port");
                    userIdTDataTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "user");
                    passwordDataTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "password");
                    cameraIdDataTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "cameraid");
                    imagePortDataTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "imageport");

                }
                catch { ClearPopup(); MessageShowError("مشخصات وارد شده معتبر نمی باشد"); }
                licensePlateDetectionSystemTypeXtraTabControl.SelectedTabPage = dataServiceTabPage;
                licensePlateDetectionType.TextBoxObject.SelectedItem = dataServiceTabPage;
            }
            else if (detectionServer.StartsWith("ws://"))
            {
                try
                {
                    webSocketIPTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "ip");
                    portWebSocketTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "port");
                    imagePortWebSocketTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "imageport");
                    cameraIdWebSocketTextBox.Text = LicensePlateDetectionHelpers.FindKeyOnPlateDectorAddress(detectionServer, "cameraid");
                }
                catch { ClearPopup(); MessageShowError("مشخصات وارد شده معتبر نمی باشد"); }
                licensePlateDetectionSystemTypeXtraTabControl.SelectedTabPage = webServiceTabPage;
                licensePlateDetectionType.TextBoxObject.SelectedItem = webServiceTabPage;
            }
            else if (!string.IsNullOrEmpty(detectionServer))
            {
                try
                {

                }
                catch { ClearPopup(); MessageShowError("مشخصات وارد شده معتبر نمی باشد"); }

                licensePlateDetectionSystemTypeXtraTabControl.SelectedTabPage = ipServiceTabPage;
                licensePlateDetectionType.TextBoxObject.SelectedItem = ipServiceTabPage;
            }
            else
                ClearPopup();
            PopupControl = popupWinControl1;
            ShowPopup(false);
        }

        private void ClearPopup()
        {
            serverDataTextBox.TextBoxObject.Text = portDataTextBox.TextBoxObject.Text = userIdTDataTextBox.TextBoxObject.Text
                = passwordDataTextBox.TextBoxObject.Text = cameraIdDataTextBox.TextBoxObject.Text = imagePortDataTextBox.TextBoxObject.Text
                = webSocketIPTextBox.TextBoxObject.Text = portWebSocketTextBox.TextBoxObject.Text = imagePortWebSocketTextBox.TextBoxObject.Text
                = cameraIdWebSocketTextBox.TextBoxObject.Text = ipServiceAddressTextBox.TextBoxObject.Text =
                PortIpServiceTextBox.TextBoxObject.Text = string.Empty;

        }

        private void cancelLicensePlateDetectionButton_Click(object sender, EventArgs e)
        {
            ClosePopup();
        }

        private void licensePlateDetectionType_SelectedValueChanged(object sender, EventArgs e)
        {

            if (licensePlateDetectionType.TextBoxObject.SelectedItem is XtraTabPage tabPage)
            {
                licensePlateDetectionSystemTypeXtraTabControl.SelectedTabPage = tabPage;
            }
        }

        private void acceptLicensePlateDetectionButton_Click(object sender, EventArgs e)
        {
            if (!ValidateLicensePlateDetection())
                return;

            if (licensePlateDetectionType.TextBoxObject.SelectedItem == ipServiceTabPage)
            {
                detectionServerTextBox.TextBoxObject.Text = $"{ipServiceAddressTextBox.TextBoxObject.Text}:" +
                    $"{PortIpServiceTextBox.TextBoxObject.Text}";
            }
            else if (licensePlateDetectionType.TextBoxObject.SelectedItem == webServiceTabPage)
            {
                detectionServerTextBox.TextBoxObject.Text = $"ws://ip={webSocketIPTextBox.TextBoxObject.Text};" +
                    $"port={portWebSocketTextBox.TextBoxObject.Text};" +
                    $"imageport={imagePortWebSocketTextBox.TextBoxObject.Text};" +
                    $"cameraid={cameraIdWebSocketTextBox.TextBoxObject.Text}";
            }
            else
            {
                detectionServerTextBox.TextBoxObject.Text = $"db://ip={serverDataTextBox.TextBoxObject.Text};" +
                    $"port={portDataTextBox.TextBoxObject.Text};" +
                    $"imageport={imagePortDataTextBox.TextBoxObject.Text};" +
                    $"user={userIdTDataTextBox.TextBoxObject.Text};" +
                    $"password={passwordDataTextBox.TextBoxObject.Text};" +
                    $"cameraid={cameraIdDataTextBox.TextBoxObject.Text}";
            }

            ClosePopup();
        }

        private bool ValidateLicensePlateDetection()
        {
            if (licensePlateDetectionType.TextBoxObject.SelectedItem == ipServiceTabPage)
            {
                if (!IPAddress.TryParse(ipServiceAddressTextBox.TextBoxObject.Text, out _))
                {
                    MessageShowError("آی پی وارد شده صحیح نمی باشد");
                    return false;
                }

                if (!(Int32.TryParse(PortIpServiceTextBox.Text, out int num) && num > 0 && num <= 65535))
                {
                    MessageShowError("پورت وارد شده صحیح نمی باشد");
                }
            }
            else if (licensePlateDetectionType.TextBoxObject.SelectedItem == webServiceTabPage)
            {
                if (!IPAddress.TryParse(webSocketIPTextBox.TextBoxObject.Text, out _))
                {
                    MessageShowError("آدرس سرویس صحیح نمی باشد");
                    return false;
                }

                if (!(Int32.TryParse(portWebSocketTextBox.TextBoxObject.Text, out int portWebSocket) && portWebSocket > 0 && portWebSocket <= 65535))
                {
                    MessageShowError("پورت سرویس صحیح نمی باشد");
                    return false;
                }

                if (!(Int32.TryParse(imagePortWebSocketTextBox.TextBoxObject.Text, out int imagePort) && imagePort > 0 && imagePort <= 65535))
                {
                    MessageShowError("پورت تصویر صحیح نمی باشد");
                    return false;
                }

                if (!(Int32.TryParse(cameraIdWebSocketTextBox.TextBoxObject.Text, out int cameraId) && cameraId > 0))
                {
                    MessageShowError("شماره دوربین معتبر نمی باشد");
                    return false;
                }
            }
            else
            {
               if (String.IsNullOrEmpty(serverDataTextBox.TextBoxObject.Text) ||
               String.IsNullOrEmpty(portDataTextBox.TextBoxObject.Text) ||
               String.IsNullOrEmpty(userIdTDataTextBox.TextBoxObject.Text) ||
               String.IsNullOrEmpty(passwordDataTextBox.TextBoxObject.Text))
                {
                    MessageShowError("لطفا تمامی مشخصات وارد شود");
                    return false;
                }

                if (!IPAddress.TryParse(serverDataTextBox.TextBoxObject.Text, out _))
                {
                    MessageShowError("آدرس سرویس صحیح نمی باشد");
                    return false;
                }

                if (!(Int32.TryParse(portDataTextBox.TextBoxObject.Text, out int portWebSocket) && portWebSocket > 0 && portWebSocket <= 65535))
                {
                    MessageShowError("پورت سرویس صحیح نمی باشد");
                    return false;
                }

                if (!(Int32.TryParse(imagePortDataTextBox.TextBoxObject.Text, out int imagePort) && imagePort > 0 && imagePort <= 65535))
                {
                    MessageShowError("پورت تصویر صحیح نمی باشد");
                    return false;
                }

                if (!(Int32.TryParse(cameraIdDataTextBox.TextBoxObject.Text, out int cameraId) && cameraId > 0))
                {
                    MessageShowError("شماره دوربین معتبر نمی باشد");
                    return false;
                }

            }

            return true;

        }

        private void testDbConnectionSimpleButton_Click(object sender, EventArgs e)
        {
            try
            {
                if (!ValidateLicensePlateDetection())
                    return;

                DbPlateExtract testConnection = new DbPlateExtract(new DbPlateInfo()
                {
                    ServerName = serverDataTextBox.TextBoxObject.Text,
                    Port = portDataTextBox.TextBoxObject.Text,
                    UserId = userIdTDataTextBox.TextBoxObject.Text,
                    Password = passwordDataTextBox.TextBoxObject.Text,
                    Catalog = "",
                });

                if (testConnection.IsConnected())
                    MessageShowSucsess("ارتباط برقرار می باشد");
                else
                    throw new Exception();
            }
            catch(Exception)
            {
                MessageShowError("امکان ارتباط با دیتابیس برقرار نیست");
            }
        }

        #endregion

        private void equipmentTypeTextBox_Load(object sender, EventArgs e)
        {

        }
    }
}
