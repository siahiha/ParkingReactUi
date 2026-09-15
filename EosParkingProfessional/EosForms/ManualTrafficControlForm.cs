using DevExpress.XtraGrid.Views.Grid;
using EosClocks;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Core.Models;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParking.Devices;
using EosParkingProfessional.Models;
using EosParkingTools.EosControls.Views;
using EosParkingTools.EosForms;
using Intek.PcPosLibrary;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class ManualTrafficControlForm : EosBaseForm
    {
        private string _lastDetectedPlate = "";
        private DateTime _lastDetectedPlateTime = DateTime.MinValue;
        private string _lastAutoEnterPlate = "";
        private DateTime _lastAutoEnterTime = DateTime.MinValue;
        private ParkingDoorEntity currentDoor = null;
        private bool _useSimilarPlateForMember;
        CarTrafficInfoDto currentCarInfo = null;
        private List<DeviceManager> deviceManagers;
        private int clockTimeDifSecond = 200;
        private BillControlTypes _billControlType = BillControlTypes.Normal;

        private System.Media.SoundPlayer player = null;
        bool _needCard = false;
        bool _needPlate = false;
        private ParkingEntity _parking;
        private int recivedPlateFromExitCamera = -1;
        private int messageTimeOut = PublicVariables.MessageDialogTimeoutSecond;
        private RelayDataGate4 relayData = null;
        private bool settingPanelChanged = false;
        private PayForm currentPayForm;


        private bool GateIsReady = false;
        private GateControler _gateG4 = null;
        private bool StPro2000IsReady = false;
        private Clock _clockStPro2000 = null;
        private List<Clock> clockStPro2000_all;


        private Thread threadStPro2000;
        private bool pauseReadingStPro2000 = false;
        private UHFControler _gateUHF = null;

        private List<UHFControler> gateUHF_all;
        private List<RecordEvent.InstantRecord> uhfListData = null;
        private PCPOS pcPos;

        private string currentTarrifTitle = "";
        private List<TariffDto> tarrifList;

        private bool pauseReadingReader = false;
        private bool CardReaderReady = false;
        private OnlineEncoder _cardReader = null;
        private OnlineEncoder _cardReader2 = null;
        private List<OnlineEncoder> cardReader_all;
        public List<KeyValuePair<string, DateTime>> _cardReaderDetectList = new List<KeyValuePair<string, DateTime>>();


        private long topGateDeviceID = 0;




        private int _gateG4Relay = 0;

        private bool activeplateDetector_eosIpCamView1;
        private bool activeplateDetector_eosExitIpCamView;
        private PlateDetectedList frmPlateDetect;
        private string lastUpdateTimeGridDataSource = "";
        private List<GateClass> allGates = new List<GateClass>();
        private int reconnectStPro = 0;
        List<DeviceInfoDto> deviceDataSource = new List<DeviceInfoDto>();

        private List<KeyValuePair<string, DateTime>> cardIDList = new List<KeyValuePair<string, DateTime>>();



        internal void EnablePlateListButton()
        {
            try
            {
                platelistButton.Enabled = true;
                eosIpCamView1.ActivePlateDetector = activeplateDetector_eosIpCamView1;
                eosExitIpCamView2.ActivePlateDetector = activeplateDetector_eosExitIpCamView;
            }
            catch { }
        }
        internal void SetPlate(string plate_)
        {
            try
            {
                eosPlateControl1.Plate = plate_;
            }
            catch { }
        }
        protected override bool ProcessDialogKey(Keys keyData)
        {
            bool accessChangeTarrif = PublicVariables.CheckUserAccess(AccessItemTypes.ParkingManualIOSetTarrif);
            //accessChangeTarrif = true; // for DEBUG only
            if (keyData == (Keys.Control | Keys.W) && accessChangeTarrif)
            {
                tariffTextBox.TextBoxObject.DropDownStyle = ComboBoxStyle.DropDownList;
                tariffTextBox.TextBoxObject.DroppedDown = true;
                if (tariffTextBox.TextBoxObject.Items.Count != 0 && (tariffTextBox.TextBoxObject.Items.Count > tariffTextBox.TextBoxObject.SelectedIndex + 1))
                    tariffTextBox.TextBoxObject.SelectedIndex = tariffTextBox.TextBoxObject.SelectedIndex + 1;
                if (tariffTextBox.TextBoxObject.Items.Count != 0 && (tariffTextBox.TextBoxObject.Items.Count == tariffTextBox.TextBoxObject.SelectedIndex + 1))
                    tariffTextBox.TextBoxObject.SelectedIndex = 0;
                //tariffTextBox.TextBoxObject.Refresh();
                currentTarrifTitle = tarrifList.Where(q => q.Id == long.Parse(tariffTextBox.TextBoxObject.SelectedValue.ToString())).Select(q => q.Title).FirstOrDefault();
                FillForm();
            }
            else if (keyData == (Keys.Control | Keys.Q) && accessChangeTarrif)
            {
                tariffTextBox.TextBoxObject.DropDownStyle = ComboBoxStyle.DropDownList;
                tariffTextBox.TextBoxObject.DroppedDown = true;
                if (tariffTextBox.TextBoxObject.Items.Count != 0 && (tariffTextBox.TextBoxObject.SelectedIndex > 0))
                    tariffTextBox.TextBoxObject.SelectedIndex = tariffTextBox.TextBoxObject.SelectedIndex - 1;
                if (tariffTextBox.TextBoxObject.Items.Count != 0 && (0 == tariffTextBox.TextBoxObject.SelectedIndex))
                    tariffTextBox.TextBoxObject.SelectedIndex = tariffTextBox.TextBoxObject.Items.Count - 1;
                //tariffTextBox.TextBoxObject.Refresh();
                currentTarrifTitle = tarrifList.Where(q => q.Id == long.Parse(tariffTextBox.TextBoxObject.SelectedValue.ToString())).Select(q => q.Title).FirstOrDefault();
                FillForm();
            }
            return base.ProcessDialogKey(keyData);
        }
        private void PlaySound()
        {
            try
            {
                if (player == null)
                    player = new System.Media.SoundPlayer(Application.StartupPath + "\\Sounds\\Bell.wav");
                player.Play();
            }
            catch { }
        }
        void GetDoorTrafficDetailes()
        {






            try
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> GetDoorTrafficDetailes (START) ");

                int start = Environment.TickCount;


                if (currentDoor == null)
                    return;
                var response = GetJsonObjecToLink<List<ExitBillDto>>(ApiAddress.TrafficApi.GetTraffics, currentDoor?.Id);
                var focuseItem = (trafficGrid.MainView as GridView).GetFocusedDataSourceRowIndex();
                long rowDumpID = 0;
                try
                {
                    if (trafficGrid.DataSource != null)
                    {
                        rowDumpID = ((List<ExitBillDto>)trafficGrid.DataSource)[focuseItem].DumpId;
                    }
                }
                catch (Exception)
                {
                    // ignored
                }

                if (this.InvokeRequired)
                    Invoke(new MethodInvoker(() =>
                    {
                        if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                        {
                            ////trafficGrid.DataSource = response.Values.OrderByDescending(q => q.DumpId).ToList();
                            if (SetTrafficGridDataSource(response.Values.OrderByDescending(q => q.EnterDateTime).ToList()))
                            {
                                if (rowDumpID == 0)
                                {
                                    (trafficGrid.MainView as GridView).FocusedRowHandle = focuseItem;//(response.Values.OrderBy(q => q.DumpId).ToList().IndexOf(response.Values.FirstOrDefault(q => q.DumpId == (focuseItem as ExitBillDto).DumpId)));
                                }
                                else
                                {
                                    GoToRowDump(rowDumpID);
                                }
                            }
                            ///(trafficGrid.MainView as GridView).SetFocusedRowCellValue("MemberCode", focuseItem);
                        }
                        // MessageShowError(response);
                    }));
                else
                {
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        ////trafficGrid.DataSource = response.Values.OrderByDescending(q => q.DumpId).ToList();
                        if (SetTrafficGridDataSource(response.Values.OrderByDescending(q => q.EnterDateTime).ToList()))
                        {
                            if (rowDumpID == 0)
                            {
                                (trafficGrid.MainView as GridView).FocusedRowHandle = focuseItem;//(response.Values.OrderBy(q => q.DumpId).ToList().IndexOf(response.Values.FirstOrDefault(q => q.DumpId == (focuseItem as ExitBillDto).DumpId)));
                            }
                            else
                            {
                                GoToRowDump(rowDumpID);
                            }
                        }

                        //(trafficGrid.MainView as GridView).SelectCell(response.Values.OrderBy(q=>q.DumpId).ToList().IndexOf(response.Values.FirstOrDefault(q => q.DumpId == (focuseItem as ExitBillDto).DumpId)), gridColumnMemberCode);
                        //(trafficGrid.MainView as GridView).SelectRow(response.Values.OrderBy(q => q.DumpId).ToList().IndexOf(response.Values.FirstOrDefault(q => q.DumpId == (focuseItem as ExitBillDto).DumpId)));
                    }
                }

                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetDoorTrafficDetailes (E N D) duraion:({Environment.TickCount - start})");

            }
            catch { }

            try
            {
                this.Invoke((MethodInvoker)delegate
                {
                    scaduleTimer.Enabled = true;
                });
            }
            catch (Exception)
            {
                // ignored
            }
        }

        private void GoToRowDump(long rowDumpID)
        {
            for (var i = 0; i < (trafficGrid.MainView as GridView).RowCount; i++)
            {
                var rowData = trafficGrid.MainView.GetRow(i);
                if ((rowData as ExitBillDto).DumpId == rowDumpID)
                {
                    (trafficGrid.MainView as GridView).FocusedRowHandle = i;
                    return;
                }

                //(trafficGrid.MainView as GridView)
            }

        }

        private bool SetTrafficGridDataSource(List<ExitBillDto> lists)
        {
            bool dtsChanged = false;


            try
            {
                trafficGrid.DataSource = lists;
                lastUpdateTimeGridDataSource = DateTime.Now.ToString("HH:mm:ss");
                FillForm();
                dtsChanged = true;
                return dtsChanged;
            }
            catch (Exception)
            {
                // ignored
            }

            try
            {
                List<ExitBillDto> currentList = (List<ExitBillDto>)trafficGrid.DataSource;
                bool isCompare = true;
                int differentCount = 0;
                if (currentList != null)
                {
                    var difList = currentList.Where(a => !lists.Any(a1 => a1.DumpId == a.DumpId && a1.EnterDateTime == a.EnterDateTime && a1.ExitDateTime == a.ExitDateTime))
                        .Union(lists.Where(a => !currentList.Any(a1 => a1.DumpId == a.DumpId && a1.EnterDateTime == a.EnterDateTime && a1.ExitDateTime == a.ExitDateTime)));
                    if (difList != null)
                    {
                        differentCount = difList.Count();
                    }

                    if ((differentCount > 0) || (currentList.Count != lists.Count))
                        isCompare = false;

                }
                else
                {
                    isCompare = false;
                }


                if (!isCompare)
                {
                    trafficGrid.DataSource = lists;
                    lastUpdateTimeGridDataSource = DateTime.Now.ToString("HH:mm:ss");
                    FillForm();
                    dtsChanged = true;
                }
            }
            catch (Exception)
            {
                // ignored
            }

            return dtsChanged;
        }

        bool IsMemberCard(string cardNumber)
        {
            LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"ProDebugging: OnDeviceRecordRecived().IsMemberCard START--> cardNumber:{cardNumber}");

            if (currentDoor == null)
                return false;
            var response = GetJsonObjecToLink<bool>(ApiAddress.MemberApi.IsParkingMember, currentDoor?.ParkingId.ToString() + $"&cardNumber={cardNumber}");
            var focuseItem = (trafficGrid.MainView as GridView).GetFocusedDataSourceRowIndex();

            LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"ProDebugging: OnDeviceRecordRecived().IsMemberCard END");
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                return response.Values;
            else
                return false;
        }

        void GetUserDoor()
        {
            var response = GetJsonObjecToLink<ParkingDoorEntity>(ApiAddress.ParkingApi.GetParkingDoor, PublicVariables.CurrentUser.DoorShift);
            //if (this.InvokeRequired)
            //Invoke(new MethodInvoker(() =>
            //{

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                currentDoor = response.Values;
                //Task.Factory.StartNew(()=>{ GetDoorTrafficDetailes(); });
                InitFormByEntryAuthorizaitionType();
                InitFormByTraficType();
                processDevices();
            }
            else
                currentDoor = null;
            // MessageShowError(response);
            //}));
        }

        List<string> FindSimilarPlate(string plate)
        {
            try
            {
                var response = GetJsonObjecToLink<List<string>>(ApiAddress.ParkingApi.FindSimilarPlate, $"{plate}&inMemberPlate=false");

                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    return response.Values;
                }
                else
                    return new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        void processDevices()
        {
            if (currentDoor == null || currentDoor.DtoViewEquipments == null || !currentDoor.DtoViewEquipments.Any())
                return;
            deviceManagers = new List<DeviceManager>();
            currentDoor.PcPos = currentDoor.DtoViewEquipments.Select(q => q.Key).FirstOrDefault(q => q.DeviceType == EquipmentTypes.Pos);
            currentDoor.EnteranceCamera = currentDoor.DtoViewEquipments.Where(q => q.Value == DoorTrafficTypes.All).Select(q => q.Key).FirstOrDefault(q => q.DeviceType == EquipmentTypes.Camera);
            currentDoor.ExitCamera = currentDoor.DtoViewEquipments.Where(q => q.Value == DoorTrafficTypes.MemberOnly).Select(q => q.Key).FirstOrDefault(q => q.DeviceType == EquipmentTypes.Camera);

            StartCamera();
            //var allVIPGates = repository.context.ParkingEquipments.Where(a => a.DeviceType == EquipmentTypes.Gate && a.DeviceName.ToLower().Contains("vip".ToLower())).ToList();
            // دستگاه جی فور و ساعغت زن پرو رو اضافه نمی کند و بالاتر آنرا ایجاد می نماییم. چون پردازش های این دو دستگاه باید بهینه گردد و خطاهایی دارد و مجدد پیاده سازی گردیده است
            foreach (var i in currentDoor.DtoViewEquipments.Where(q => !q.Key.ControlByServer && q.Key.DeviceType != EquipmentTypes.Pos && q.Key.DeviceType != EquipmentTypes.Camera && q.Key.DeviceType != EquipmentTypes.Gate && q.Key.DeviceType != EquipmentTypes.PoroTrafficControler))
            {
                var dev = PublicVariables.ActiveDevices.AddDevice(i.Key);
                deviceManagers.Add(dev);

                //dev.OnLastRecordRecived -= new RecordRecivedEventHandler(OnDeviceLastRecordRecived);
                dev.OnLastRecordRecived += new RecordRecivedEventHandler(OnDeviceLastRecordRecived);
                //dev.OnRecordRecived -= OnDeviceRecordRecived;
                dev.OnRecordRecived += new RecordRecivedEventHandler(OnDeviceRecordRecived);
                //dev.OnGetDateTime -= OnDeviceGetDateTime;
                dev.OnGetDateTime += new EventHandler(OnDeviceGetDateTime);
                //dev.OnSetDateTime += null;
                //dev.OnSetDateTime += new EventHandler((object sender, EventArgs arg) => { /*MessageShowSucsess("تغیر ساعت دستگاه با موفقیت انجام شد");*/ });
                if (!dev.IsLive)
                    dev.Start();
            }
            var enterGate = currentDoor.DtoViewEquipments.FirstOrDefault(q => q.Key.DeviceType == EquipmentTypes.Gate && q.Value == DoorTrafficTypes.All).Key;
            if (enterGate != null)
            {
                var dev = PublicVariables.ActiveDevices.AddDevice(enterGate);
                deviceManagers.Add(dev);

                //dev.OnLastRecordRecived -= new RecordRecivedEventHandler(OnDeviceLastRecordRecived);
                dev.OnLastRecordRecived += new RecordRecivedEventHandler(OnDeviceLastRecordRecived);
                //dev.OnRecordRecived -= OnDeviceRecordRecived;
                dev.OnRecordRecived += new RecordRecivedEventHandler(OnDeviceRecordRecived);
                //dev.OnGetDateTime -= OnDeviceGetDateTime;
                dev.OnGetDateTime += new EventHandler(OnDeviceGetDateTime);
                //dev.OnSetDateTime += null;
                //dev.OnSetDateTime += new EventHandler((object sender, EventArgs arg) => { /*MessageShowSucsess("تغیر ساعت دستگاه با موفقیت انجام شد");*/ });
                if (!dev.IsLive)
                    dev.Start();
            }
            var exitGate = currentDoor.DtoViewEquipments.FirstOrDefault(q => q.Key.DeviceType == EquipmentTypes.Gate && q.Value == DoorTrafficTypes.MemberOnly).Key;
            if (exitGate != null && enterGate?.Id != exitGate?.Id)
            {
                var dev = PublicVariables.ActiveDevices.AddDevice(exitGate);
                deviceManagers.Add(dev);

                //dev.OnLastRecordRecived -= new RecordRecivedEventHandler(OnDeviceLastRecordRecived);
                dev.OnLastRecordRecived += new RecordRecivedEventHandler(OnDeviceLastRecordRecived);
                //dev.OnRecordRecived -= OnDeviceRecordRecived;
                dev.OnRecordRecived += new RecordRecivedEventHandler(OnDeviceRecordRecived);
                //dev.OnGetDateTime -= OnDeviceGetDateTime;
                dev.OnGetDateTime += new EventHandler(OnDeviceGetDateTime);
                //dev.OnSetDateTime += null;
                //dev.OnSetDateTime += new EventHandler((object sender, EventArgs arg) => { /*MessageShowSucsess("تغیر ساعت دستگاه با موفقیت انجام شد");*/ });
                if (!dev.IsLive)
                    dev.Start();
            }



            //PublicVariables.ActiveDevices.StartLiveCheking();
        }

        private void OnDeviceLastRecordRecived(DeviceManager sender, RecordRecivedArg arg)
        {
            //try
            //{
            //    if ((DateTime.Now - arg.Record.DateTime).TotalSeconds > clockTimeDifSecond)
            //        return;
            //    if (currentDoor.DtoViewEquipments.Where(q => q.Key.Id == (sender as DeviceManager).Equipment.Id).Select(q => q.Value).FirstOrDefault() == DoorTrafficTypes.MemberOnly)
            //    {
            //        if (!IsMemberCard((arg.Record as ClockRecord).ID.ToString()))
            //            return;
            //    }

            //    if (cardTextBox.InvokeRequired)
            //    {
            //        cardTextBox.Invoke(new MethodInvoker(() =>
            //        {
            //            //cancelButton_Click(cardTextBox, new EventArgs());
            //            if (currentCarInfo != null)
            //            {
            //                arg.SetNextRecord = false;
            //                return;// CancelForm(false);
            //            }
            //            cardTextBox.Text = (arg.Record as ClockRecord).ID.ToString();
            //            cardTextBox.Focus();
            //            cardTextBox.Validate();
            //            arg.SetNextRecord = true;
            //        }));
            //    }
            //    else
            //    {
            //        cardTextBox.Text = (arg.Record as ClockRecord).ID.ToString();
            //        cardTextBox.Focus();
            //        cardTextBox.Validate();
            //    }

            //}
            //catch
            //{
            //    if (cardTextBox == null || cardTextBox.IsDisposed)
            //        ReleaseDevice(sender as DeviceManager);
            //}

        }

        private void OnDeviceRecordRecived(DeviceManager sender, RecordRecivedArg arg)
        {
            LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"ProDebugging: OnDeviceRecordRecived() START");

            arg.SetNextRecord = true;
            //if (cardTextBox.InvokeRequired)
            //{
            //    cardTextBox.Invoke(new MethodInvoker(() =>
            //    {
            //        cardTextBox.Focus();
            //        cardTextBox.Text = (arg.Record as ClockRecord).ID.ToString();
            //    }));
            //}
            //else
            //{
            //    cardTextBox.Focus();
            //    cardTextBox.Text = (arg.Record as ClockRecord).ID.ToString();
            //}

            try
            {
                if ((DateTime.Now - arg.Record.DateTime).TotalSeconds > clockTimeDifSecond)
                    return;
                if (currentDoor.DtoViewEquipments.Where(q => q.Key.Id == (sender as DeviceManager).Equipment.Id)
                                                 .Select(q => q.Value).FirstOrDefault() == DoorTrafficTypes.MemberOnly)
                {

                    if (!IsMemberCard((arg.Record as ClockRecord).ID.ToString()))
                        return;
                }

                if (cardTextBox.InvokeRequired)
                {
                    cardTextBox.Invoke(new MethodInvoker(() =>
                    {
                        //cancelButton_Click(cardTextBox, new EventArgs());
                        //if (currentCarInfo != null)
                        //{
                        //    arg.SetNextRecord = false;
                        //    return;// CancelForm(false);
                        //}
                        cardTextBox.Text = SetCardIdInTextBox((arg.Record as ClockRecord).ID.ToString());
                        //cardTextBox.Focus();
                        if (!string.IsNullOrEmpty(cardTextBox.Text))
                        {
                            cardTextBox.Focus();
                            
                            cardTextBox.Validate();
                        }
                    }));
                }
                else
                {
                    cardTextBox.Text = SetCardIdInTextBox((arg.Record as ClockRecord).ID.ToString());
                    //cardTextBox.Focus();
                    if (!string.IsNullOrEmpty(cardTextBox.Text))
                    {
                        cardTextBox.Focus();

                        cardTextBox.Validate();
                    }
                }

                arg.SetNextRecord = true;
            }
            catch
            {
                if (cardTextBox == null || cardTextBox.IsDisposed)
                    ReleaseDevice(sender as DeviceManager);
            }

            LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"ProDebugging: OnDeviceRecordRecived() END");

        }

        private string SetCardIdInTextBox(string cardID, string source = "")
        {
            string _ret = cardID;
            try
            {
                bool canShow = true;
                if (checkBoxIgnoreRepeatedCardID.Checked)
                {
                    bool bCheckCardInList = cardIDList.Any(q => q.Key == cardID && (DateTime.Now - q.Value).TotalSeconds < decimal.ToDouble(numericUpDownIgnoreCardIDTime.Value));
                    canShow = !bCheckCardInList;
                }

                if (canShow)
                {
                    cardIDList.Add(new KeyValuePair<string, DateTime>(cardID, DateTime.Now));
                    _ret = cardID;
                    labelRepeatedCardID.Visible = false;
                }
                else
                {
                    labelRepeatedCardID.Text = cardID;
                    labelRepeatedCardID.Visible = true;

                    _ret = "";
                    pauseReadingStPro2000 = false;
                    pauseReadingReader = false;
                }



            }
            catch (Exception)
            {
                // ignored
            }

            return _ret;
        }

        private void OnDeviceGetDateTime(object sender, EventArgs arg)
        {
            return;//
            try
            {
                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "ProDebugging: OnDeviceGetDateTime() START");

                var device = sender as DeviceManager;
                if (deviceGridControl.DataSource == null)
                    return;

                if (deviceGridControl.InvokeRequired)
                {
                    cardTextBox.Invoke(new MethodInvoker(() =>
                    {
                        var item = (deviceGridControl.DataSource as List<DeviceInfoDto>).FirstOrDefault(q => q.DeviceId == device.Equipment.Id);
                        item.CurrentDateTime = device.DeviceDateTime;
                        deviceGridControl.RefreshDataSource();
                        LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"ProDebugging: OnDeviceGetDateTime() DeviceDateTime1-->{device.DeviceDateTime}");
                    }));
                }
                else
                {
                    var item = (deviceGridControl.DataSource as List<DeviceInfoDto>).FirstOrDefault(q => q.DeviceId == device.Equipment.Id);
                    item.CurrentDateTime = device.DeviceDateTime;
                    deviceGridControl.RefreshDataSource();
                    var x = (deviceGridControl.DataSource as List<DeviceInfoDto>);

                    LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"ProDebugging: OnDeviceGetDateTime() DeviceDateTime2-->{device.DeviceDateTime}");


                }
            }
            catch (Exception ex)
            {
                if (cardTextBox == null || cardTextBox.IsDisposed)
                    ReleaseDevice(sender as DeviceManager);
                LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"ProDebugging: OnDeviceGetDateTime() Catch-->{ex.Message}");
            }
            LogHelper.Log(System.Diagnostics.TraceEventType.Information, "ProDebugging: OnDeviceGetDateTime() START");

        }



        private void ReleaseDevice(DeviceManager device)
        {
            try
            {

                if (device != null)
                {
                    //device.OnGetDateTime -=new EventHandler(OnDeviceGetDateTime);
                    //device.OnLastRecordRecived -= new RecordRecivedEventHandler(OnDeviceLastRecordRecived);
                    //device.OnRecordRecived -= new RecordRecivedEventHandler(OnDeviceRecordRecived);
                    //device.OnSentValidUserIds += null;
                    //device.OnSetDateTime = OnDeviceSetDateTime;
                    lock (PublicVariables.ActiveDevices.DeviceManagers)
                    {
                        PublicVariables.ActiveDevices.DeviceManagers.Remove(device);
                    }
                    lock (device)
                    {
                        device.Disconnect();
                        device.DisconnectGateController();
                        device.Stop();
                    }
                    device.Dispose();
                }
            }
            catch { }
        }

        private void StartCamera()
        {
            try
            {
                if (currentDoor.EnteranceCamera != null && !currentDoor.EnteranceCamera.Disabled)
                {
                    plateDetectCheckBox.Visible = !string.IsNullOrEmpty(Properties.Settings.Default.PlateDetectorLink);// File.Exists(Application.StartupPath + "\\SETPA.cfg");
                                                                                                                       //plateDetectCheckBox.Checked = plateDetectCheckBox.Visible;
                                                                                                                       //plateDetectedButton.Visible = plateDetectCheckBox.Visible;

                    var rect = new Rectangle(currentDoor.EnteranceCamera.DetectionLeft, currentDoor.EnteranceCamera.DetectionTop, currentDoor.EnteranceCamera.DetectionWidth, currentDoor.EnteranceCamera.DetectionHeight);
                    if (ConfigurationManager.AppSettings["DetectPlateRegion"] != null)
                    {
                        try
                        {
                            //rect.X = int.Parse(ConfigurationManager.AppSettings["DetectPlateRegion"].Split(',')[0]);
                            //rect.Y = int.Parse(ConfigurationManager.AppSettings["DetectPlateRegion"].Split(',')[1]);
                            //rect.Width = int.Parse(ConfigurationManager.AppSettings["DetectPlateRegion"].Split(',')[2]);
                            //rect.Height = int.Parse(ConfigurationManager.AppSettings["DetectPlateRegion"].Split(',')[3]);
                        }
                        catch { }
                    }
                    try
                    {
                        eosIpCamView1.VideoSize = new Size(int.Parse(ConfigurationManager.AppSettings["VideoWidth"] ?? "0"), int.Parse(ConfigurationManager.AppSettings["VideoHeight"] ?? "0"));
                        eosIpCamView1.StretchVideo = bool.Parse(ConfigurationManager.AppSettings["StretchVideo"] ?? "false");
                    }
                    catch { }
                    eosIpCamView1.DetectPlateRegion = rect;
                    //eosIpCamView1.Zoom =  int.Parse(ConfigurationManager.AppSettings["CameraZoom"].ToString());
                    eosIpCamView1.PlateDetectorAddress = currentDoor.EnteranceCamera.DetectionServerAddress;//Properties.Settings.Default.PlateDetectorLink;
                    eosIpCamView1.ActivePlateDetector = plateDetectCheckBox.Checked && plateDetectCheckBox.Visible;
                    eosIpCamView1.StartSync(currentDoor.EnteranceCamera.Ip, currentDoor.EnteranceCamera.CameraUserName, currentDoor.EnteranceCamera.CameraPassword, currentDoor.EnteranceCamera.Port);
                    //eosIpCamView1.Zoom = int.Parse(ConfigurationManager.AppSettings["CameraZoom"].ToString());
                    if (plateDetectCheckBox.Checked)
                    {

                    }
                    tabControl1.SelectedIndex = 0;
                }

                if (currentDoor.ExitCamera != null && !currentDoor.ExitCamera.Disabled)
                {
                    plateDetectCheckBox.Visible = !string.IsNullOrEmpty(Properties.Settings.Default.PlateDetectorLink);// File.Exists(Application.StartupPath + "\\SETPA.cfg");
                                                                                                                       //plateDetectCheckBox.Checked = plateDetectCheckBox.Visible;
                                                                                                                       //plateDetectedButton.Visible = plateDetectCheckBox.Visible;

                    var rect = new Rectangle(currentDoor.ExitCamera.DetectionLeft, currentDoor.ExitCamera.DetectionTop, currentDoor.ExitCamera.DetectionWidth, currentDoor.ExitCamera.DetectionHeight);
                    if (ConfigurationManager.AppSettings["DetectPlateRegion"] != null)
                    {
                        //try
                        //{
                        //    rect.X = int.Parse(ConfigurationManager.AppSettings["DetectPlateRegion"].Split(',')[0]);
                        //    rect.Y = int.Parse(ConfigurationManager.AppSettings["DetectPlateRegion"].Split(',')[1]);
                        //    rect.Width = int.Parse(ConfigurationManager.AppSettings["DetectPlateRegion"].Split(',')[2]);
                        //    rect.Height = int.Parse(ConfigurationManager.AppSettings["DetectPlateRegion"].Split(',')[3]);
                        //}
                        //catch { }
                    }
                    try
                    {
                        eosExitIpCamView2.VideoSize = new Size(int.Parse(ConfigurationManager.AppSettings["VideoWidth"] ?? "0"), int.Parse(ConfigurationManager.AppSettings["VideoHeight"] ?? "0"));
                        eosExitIpCamView2.StretchVideo = bool.Parse(ConfigurationManager.AppSettings["StretchVideo"] ?? "false");

                    }
                    catch { }
                    eosExitIpCamView2.DetectPlateRegion = rect;
                    //eosIpCamView1.Zoom =  int.Parse(ConfigurationManager.AppSettings["CameraZoom"].ToString());
                    eosExitIpCamView2.PlateDetectorAddress = currentDoor.ExitCamera.DetectionServerAddress;//Properties.Settings.Default.PlateDetectorLink;
                    eosExitIpCamView2.ActivePlateDetector = plateDetectCheckBox.Checked && plateDetectCheckBox.Visible;
                    eosExitIpCamView2.StartSync(currentDoor.ExitCamera.Ip, currentDoor.ExitCamera.CameraUserName, currentDoor.ExitCamera.CameraPassword, currentDoor.ExitCamera.Port);
                    //eosIpCamView1.Zoom = int.Parse(ConfigurationManager.AppSettings["CameraZoom"].ToString());
                    if (plateDetectCheckBox.Checked)
                    {

                    }
                    if (currentDoor.EnteranceCamera == null)
                        tabControl1.SelectedIndex = 1;
                }
            }
            catch { }
        }
        void PcPosResponseReady(string raw_response)
        {
            try
            {
                string sResponse = pcPos.Response.GetParsedResp(raw_response);
                ResponsePos res = PosResponseToObject(sResponse);
                currentPayForm.SnedToPayForm(res);
            }
            catch (Exception)
            {
                // ignored
            }
            /*
                        if (txt_raw_resp.InvokeRequired)
                        {
                            txt_raw_resp.Invoke(new Action<string>(PcPosResponseReady), new object[] { raw_response });
                        }
                        else
                        {
                            txt_raw_resp.Text = raw_response;
                            string sResponse = pcPos.Response.GetParsedResp(raw_response);

                            ResponsePos res = PosResponseToObject(sResponse);

                            txt_resp.Text = sResponse;
                        }
            */
        }
        private string GetDataResponse(string sData)
        {
            string ret = sData;
            try
            {

                int equalPos = sData.IndexOf("=");
                ret = sData.Substring(equalPos + 1, sData.Length - equalPos - 1).Trim();
            }
            catch (Exception)
            {
                // ignored
            }

            return ret;

        }

        private ResponsePos PosResponseToObject(string sResponse)
        {
            ResponsePos ret = new ResponsePos();
            try
            {
                var myList = new List<string>(sResponse.Split(
                    new string[] { "\r\n", "\r", "\n" },
                    StringSplitOptions.None
                    ));
                ret.RS = GetDataResponse(myList[0]);
                ret.TR = GetDataResponse(myList[1]);
                ret.CardNumber_PN = GetDataResponse(myList[2]);
                ret.Terminal_TM = GetDataResponse(myList[3]);
                ret.Amount_AM = GetDataResponse(myList[4]);
                ret.ResponseNumber_RN = GetDataResponse(myList[5]);
                ret.Time_TI = GetDataResponse(myList[6]);
                ret.SR = GetDataResponse(myList[7]);
                ret.BankName = myList[8];
            }
            catch (Exception ex)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> PosResponseToObject (ERR):({ex.Message})");

            }

            return ret;
        }


        void GetParkingDoorDevices()
        {
            try
            {
                var response = GetJsonObjecToLink<List<DeviceInfoDto>>(ApiAddress.ParkingApi.GetParkingDoorDevices, PublicVariables.CurrentUser.DoorShift);


                response.Values = response.Values.Where(q => q.Disabled == false).ToList();


                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> GetParkingDoorDevices : " + response.Values.Count());
                foreach (var item in response.Values)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices id:{item.DeviceId} , name:{item.DeviceName}, type:{item.DeviceType}, connection:{item.ConnectionType}");
                }



                var responseGate = response.Values.Where(q => q.DeviceType == EquipmentTypes.Gate).ToList();
                var responsePro = response.Values.Where(q => q.DeviceType == EquipmentTypes.PoroTrafficControler).ToList();
                var responseUHF = response.Values.Where(q => q.DeviceType == EquipmentTypes.UHF_LongRangeReader).ToList();
                var responsePOS = response.Values.Where(q => q.DeviceType == EquipmentTypes.Pos).ToList();
                var responseReader = response.Values.Where(q => q.DeviceType == EquipmentTypes.CardReader).ToList();
                if (response == null && response.ResponseResultType != EosParking.Core.Enums.ResponseResultTypes.Ok)
                    response = GetJsonObjecToLink<List<DeviceInfoDto>>(ApiAddress.ParkingApi.GetParkingDoorDevices, PublicVariables.CurrentUser.DoorShift);

                try
                {
                    topGateDeviceID = responseGate[0].DeviceId;
                }
                catch { }


                /*
                 * دریافت اطلاعات راهبند جهت ارسال دستور به آن. 
                 * نکته: تا به امروز از 
                 * DoorShift
                 * استفاده می شد ولی در تست جهت رله با یوزر خروج که آمدم رله ای یافت نکرد و به جای دیتای فوق از
                 * CurrentParking
                 * استفاده کردم
                 * احتمالا این باگ به این دلیل مخفی مانده بوده که همیشه یک یوزر کار میکرده و مقدار
                 * ID
                 * آن با پارکینگ یکسان و همیشه یک بوده است!
                 * در بالادست تغییر ندادم تا پس از مشورت آنرا تغییر بدهم 1401-10-23 21:44
                 */
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> GetParkingDoorDevices(Gate.Count): " + responseGate.Count().ToString());

                string stproModelName = "";
                string g4ModelName = "";
                string uhfModelName = "";
                string posName = "";
                string readerName = "";
                string readerName2 = "";
                long g4DeviceID = -1;
                long stproDeviceID = -1;
                long uhfDeviceID = -1;
                long posDeviceID = -1;
                long readerDeviceID = -1;
                long readerDeviceID2 = -1;




                try
                {
                    if (responsePOS.Count() > 0)
                    {


                        var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                            .Values.Where(q => q.Id == responsePOS[0].DeviceId).ToList();
                        if (!responseEquipments[0].Disabled)
                        {

                            pcPos = new PCPOS();
                            pcPos.GetResponse += new PCPOS.ResponseEventHandler(PcPosResponseReady);

                            pcPos.ConnectionType = PCPOS.cnType.LAN;
                            pcPos.Ip = responseEquipments[0].Ip;
                            pcPos.Port = responseEquipments[0].Port;

                            posDeviceID = responseEquipments[0].Id;
                            if (pcPos.TestConnection())
                            {
                                posName = "S800 متصل";
                            }
                            else
                            {
                                posName = "S800 یافت نشد";
                            }
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo POS (Info): {posName}   {responseEquipments[0].Ip}:{responseEquipments[0].Port}");
                        }
                    }

                }
                catch (Exception ex)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo POS Exception: {ex.Message}");
                }

                try
                {
                    if (responseUHF.Count() > 0)
                    {



                        var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                            .Values.Where(q => q.DeviceType == EquipmentTypes.UHF_LongRangeReader).ToList();
                        ConnectToUHF(responseEquipments, response);

                        /*var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                            .Values.Where(q => q.Id == responseUHF[0].DeviceId).ToList();

                        if (!responseEquipments[0].Disabled)
                        {
                            uhfListData = new List<RecordEvent.InstantRecord>();
                            uhfDeviceID = responseEquipments[0].Id;
                            _gateUHF = new UHFControler(responseEquipments[0].Ip, responseEquipments[0].Port);
                            _gateUHF.GetRecordRaised += UHFProcessGetRecord;
                            var uhfIsReady = _gateUHF != null;
                            if (_gateUHF.Connect())
                            {
                                uhfModelName = _gateUHF?.GetDeviceInfo();
                                _gateUHF?.Start();
                            }
                            else
                            {
                                uhfModelName = "یافت نشد";
                            }
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo UHF ({uhfIsReady.ToString()})(Info): {uhfModelName}   {responseEquipments[0].Ip}:{responseEquipments[0].Port}");
                        }
                        */
                    }

                }
                catch (Exception ex)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo POS Exception: {ex.Message}");
                }


                try
                {

                    // in new OpenGate first generate then Open. skip generate all Gate at RUNTIME
                    /*
                    if (responseGate.Count() > 0)
                    {

                        
                        var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                            .Values.Where(q => q.Id == responseGate[0].DeviceId).ToList();
                        if (!responseEquipments[0].Disabled)
                        {
                            g4DeviceID = responseEquipments[0].Id;
                            relayData = new RelayDataGate4
                            {
                                Name = responseEquipments[0].DeviceName,
                                Ip = responseEquipments[0].Ip,
                                Port = responseEquipments[0].Port,
                                Relay = responseEquipments[0].Relay,
                                ByService = responseEquipments[0].ByService

                            };
                                _gateG4 = new GateControler(relayData.Ip, relayData.Port);
                                _gateG4Relay = (relayData.Relay ?? 0);

                                GateIsReady = _gateG4.PrepareBoard();
                                if (GateIsReady)
                                {
                                    g4ModelName = _gateG4.GetBoardStatus();
                                }
                                else
                                {
                                    g4ModelName = "یافت نشد";
                                }
                            }



                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo G4 ({GateIsReady.ToString()})(Gate.relayData): {relayData.Name},{relayData.Ip},{relayData.Port},{relayData.Relay}  G4IsReady:{GateIsReady.ToString()}");


                        }
                    
                    }*/


                }
                catch (Exception ex)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo G4 Exception: {ex.Message}");
                }

                try
                {



                    if (responsePro.Count() > 0)
                    {
                        var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                            .Values.Where(q => q.DeviceType == EquipmentTypes.PoroTrafficControler).ToList();



                        //var responseDeviceInfo = GetJsonObjecToLink<List<DeviceInfoDto>>(ApiAddress.ParkingApi.GetParkingDoorDevices, PublicVariables.CurrentUser.DoorShift);
                        //responseDeviceInfo.Values = response.Values.Where(q => q.Disabled == false).ToList();

                        /*var curDoorID = currentDoor?.Id;

                        foreach (var dev in responseEquipments)
                        {
                            foreach (var door in dev.ParkingDoorDevices)
                            { 
                            
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + STPRO DOORS: currentDoor:[{curDoorID}], deviceDoorID:[{door.Id}]");
                            }

                                
                            
                        }*/
                        //responseEquipments.Where(q=>q.ParkingDoorDevices.)
                        ConnectToStPro2000(responseEquipments, response);
                        //ConnectToStPro2000(responseDeviceInfo, response);
                        /*
                        var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                            .Values.Where(q => q.Id == responsePro[0].DeviceId).ToList();
                        if (!responseEquipments[0].Disabled)
                        {
                            stproDeviceID = responseEquipments[0].Id;
                            StPro2000Data proData = new StPro2000Data(
                                responseEquipments[0].DeviceName,
                                responseEquipments[0].Ip,
                                responseEquipments[0].Port,
                                responseEquipments[0].ReadTimeOut,
                                responseEquipments[0].WriteTimeOut);

                            Connection _connection = new TCPIPConnection(proData.Ip, proData.Port, proData.ReadTimeOut, proData.WriteTimeOut,200);
                            _clockStPro2000 = new Clock(_connection, ProtocolType.RS485//rbSTProR2.Checked ? ProtocolType.RS485 : ProtocolType.Hdlc
                                                        , 1,
                                                  1, EncryptionMode.None, ProtocolType.Suprema);

                            if (_clockStPro2000.TestConnection())
                            {
                                if (_clockStPro2000.GetDateTime().ToString("yyyy-MM-ddTHH:mm") != DateTime.Now.ToString("yyyy-MM-ddTHH:mm"))
                                    _clockStPro2000.SetDateTime(DateTime.Now);
                                stproModelName = _clockStPro2000.GetModel() + " " + _clockStPro2000.GetFirmwareVersion();
                                StPro2000IsReady = true;
                                

                                //Clear oldData
                                int storageRecordCount = 0;
                                try
                                {
                                    if (!_clockStPro2000.IsEmpty())
                                    {
                                        var record = _clockStPro2000.GetRecord();
                                        if (record != null)
                                        {
                                            storageRecordCount++;
                                            _clockStPro2000.NextRecord();
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    string ss = ex.Message;
                                }
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> StPro2000 Clear Old Data. RecordCount:{storageRecordCount}");
                                threadStPro2000 = new Thread(() => ReadDataOfStPro2000());
                                threadStPro2000.Start();
                            }
                            else
                            {
                                stproModelName = "یافت نشد";
                                _clockStPro2000 = null;
                                StPro2000IsReady = false;
                                // add log error
                            }

                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo StPro2000 ({proData.Name})= {proData.Ip}:{proData.Port},ReadTimeOut:{proData.ReadTimeOut},WriteTimeOut:{proData.WriteTimeOut}  IsReady:{StPro2000IsReady}");

                        }
                        */
                    }
                }
                catch (Exception ex)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo StPro2000 Exception: {ex.Message}");
                }

                try
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader(Count): " + responseReader.Count.ToString());
                    if (responseReader.Count() > 0)
                    {
                        var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                                .Values.Where(q => q.DeviceType == EquipmentTypes.CardReader).ToList();

                        ConnectToReaders(responseEquipments, response);


                        /* var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                             .Values.Where(q => q.Id == responseReader[0].DeviceId).ToList();
                        */
                        if (!responseEquipments[0].Disabled)
                        {

                            readerDeviceID = responseEquipments[0].Id;
                            /*if (ConnectCardReader1(responseEquipments[0].Ip, responseEquipments[0].Port))
                            {
                                readerName = $"#1_Reader [IP]";

                            }
                            else
                            {

                                readerName = "#1_یافت نشد";

                            }
                            */
                            /*
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader: manual #1");
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
                                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader: connected");
                                    var startedreader1 = _cardReader?.Start();
                                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader: started: " + startedreader1.ToString());
                                    //timer1.Enabled = true;
                                    readerName = $"#1_Reader {connectionMode}";
                                    

                                }
                                else
                                {
                                    readerName = "#1_یافت نشد";
                                    _cardReader.Disconnect();
                                    _cardReader.Dispose();
                                    _cardReader = null;
                                }

                            }





                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo CardReader ({readerName})= COM{responseEquipments[0].ComPort.ToString()}");
*/
                        }


                    }
                    if (responseReader.Count() > 1)
                    {

                        /*var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                                .Values.Where(q => q.DeviceType == EquipmentTypes.CardReader).ToList();

                        ConnectToReaders(responseEquipments, response);
                        */
                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader: manual #2");
                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader: count: " + responseReader.Count().ToString());
                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader: " + responseReader[1].DeviceId.ToString());

                        var responseEquipments = GetJsonObjecToLink<List<EquipmentEntity>>(ApiAddress.ParkingApi.GetParkingEquipments, PublicVariables.CurrentUser.CurrentParking)
                            .Values.Where(q => q.Id == responseReader[1].DeviceId).ToList();

                        if (!responseEquipments[0].Disabled)
                        {
                            readerDeviceID2 = responseEquipments[0].Id;
                            /*if (ConnectCardReader2(responseEquipments[0].Ip, responseEquipments[0].Port))
                            {
                                readerName2 = $"#2_Reader [IP]";

                            }
                            else
                            {

                                readerName2 = "#2_یافت نشد";

                            }
                            */
                            /*
                            readerDeviceID2 = responseEquipments[0].Id;
                            if (_cardReader2 != null)
                            {
                                _cardReader2.Dispose();
                                _cardReader2 = null;
                            }

                            string connectionMode = "";

                            if (responseEquipments[0].ConnectionType == EosParking.Core.Enums.ConnectionTypes.SerialConnection)
                            {
                                _cardReader2 = new OnlineEncoder("COM" + responseEquipments[0].ComPort.ToString(), false, Application.StartupPath);
                                connectionMode = "[COM]";
                                _cardReader2.GetRecordRaised += ProcessGetRecordFromCardReader;
                            }
                            else
                            {
                                connectionMode = "[IP]";
                                _cardReader2 = new OnlineEncoder(responseEquipments[0].Ip, responseEquipments[0].Port, false, Application.StartupPath);
                                _cardReader2.GetRecordRaised += ProcessGetRecordFromCardReader;

                                if (_cardReader2.Connect())
                                {
                                    //lblConnect.Text = "Connected";
                                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader: connected" );
                                    var startedreader2 = _cardReader2?.Start();
                                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> responseReader: started: " + startedreader2.ToString());

                                    //timer1.Enabled = true;
                                    readerName2 = $"#2_Reader {connectionMode}";
                                }
                                else
                                {
                                    readerName2 = "#2_یافت نشد";
                                    _cardReader2.Disconnect();
                                    _cardReader2.Dispose();
                                    _cardReader2 = null;
                                }


                            }





                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo CardReader ({readerName2})= COM{responseEquipments[0].ComPort.ToString()}");
*/
                        }


                    }
                }
                catch (Exception ex)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo CardReader Exception: {ex.Message}");
                }




                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    //response.Values
                    try
                    {
                        if (!String.IsNullOrEmpty(stproModelName))
                        {
                            var item = response.Values.FirstOrDefault(q => q.DeviceId == stproDeviceID);
                            item.FrimewareVersion = stproModelName;
                        }
                        if (!String.IsNullOrEmpty(g4ModelName))
                        {
                            var item = response.Values.FirstOrDefault(q => q.DeviceId == g4DeviceID);
                            item.FrimewareVersion = g4ModelName;
                        }
                        if (!String.IsNullOrEmpty(uhfModelName))
                        {
                            var item = response.Values.FirstOrDefault(q => q.DeviceId == uhfDeviceID);
                            item.FrimewareVersion = uhfModelName;
                        }
                        if (!String.IsNullOrEmpty(posName))
                        {
                            var item = response.Values.FirstOrDefault(q => q.DeviceId == posDeviceID);
                            item.FrimewareVersion = posName;
                        }

                        if (!String.IsNullOrEmpty(readerName))
                        {
                            var item = response.Values.FirstOrDefault(q => q.DeviceId == readerDeviceID);
                            item.FrimewareVersion = readerName;
                        }
                        if (!String.IsNullOrEmpty(readerName2))
                        {
                            var item = response.Values.FirstOrDefault(q => q.DeviceId == readerDeviceID2);
                            item.FrimewareVersion = readerName2;
                        }


                    }
                    catch (Exception)
                    {
                        // ignored
                    }

                    response.Values = response.Values.Where(q => !q.ProcessByServer).ToList();
                    deviceDataSource = response.Values;
                    if (deviceGridControl.InvokeRequired)
                        deviceGridControl.Invoke(new MethodInvoker(() => { deviceGridControl.DataSource = response.Values/*.Where(q => q.DeviceType != EquipmentTypes.Gate)*/.ToList(); }));
                    else
                        deviceGridControl.DataSource = response.Values;
                }



            }
            catch
            {
                // ignored
            }
        }

        private bool ConnectCardReader1(string _deviceIp, int _devicePort)
        {
            bool ret_ = false;
            try
            {
                _cardReader = new OnlineEncoder(_deviceIp, _devicePort, false, Application.StartupPath);
                _cardReader.GetRecordRaised += ProcessGetRecordFromCardReader;
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> responseReader: manual #1 connected [ {_deviceIp} ]");

                if (_cardReader.Connect())
                {
                    _cardReader?.Start();
                    ret_ = true;
                }

            }
            catch (Exception)
            {
                // ignored
            }

            return ret_;
        }

        private bool ConnectCardReader2(string _deviceIp, int _devicePort)
        {
            bool ret_ = false;
            try
            {
                _cardReader2 = new OnlineEncoder(_deviceIp, _devicePort, false, Application.StartupPath);
                _cardReader2.GetRecordRaised += ProcessGetRecordFromCardReader;
                if (_cardReader2.Connect())
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> responseReader: manual #2 connected [ {_deviceIp} ]");
                    _cardReader2?.Start();
                    ret_ = true;
                    //timer1.Enabled = true;
                }

            }
            catch (Exception)
            {
                // ignored
            }

            return ret_;
        }


        //private void ConnectToStPro2000(List<EquipmentEntity> responseEquipments, ResponseResultWeb<List<DeviceInfoDto>> response)
        private void ConnectToStPro2000(List<EquipmentEntity> responseEquipments, ResponseResultWeb<List<DeviceInfoDto>> response)

        {
            string stproModelName = "";
            long stproDeviceID = 0;
            clockStPro2000_all = new List<Clock>();


            //List<EnquirePriceSub> e = getSomethings();
            //var data = appDb.EnquirePriceSubs.Where(w => e.Select(s => s.Id).Contains(w.Id)).ToList();
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> ConnectToStPro2000(Count): " + responseEquipments.Count.ToString());
            responseEquipments = responseEquipments.Where(q => response.Values.Select(s => s.DeviceId).Contains(q.Id)).ToList();
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> ConnectToStPro2000(Count after where): " + responseEquipments.Count.ToString());

            try
            {
                for (var i = 0; i < responseEquipments.Count; i++)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ConnectToStPro2000 [{i}]/[{responseEquipments.Count}]");

                    try
                    {
                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ConnectToStPro2000: name:{responseEquipments[i].DeviceName},ip:{responseEquipments[i].Ip},port:{responseEquipments[i].Port}, disabled:{responseEquipments[i].Disabled}");

                        if (!responseEquipments[i].Disabled)
                        {
                            stproDeviceID = responseEquipments[i].Id;
                            StPro2000Data proData = new StPro2000Data(
                                responseEquipments[i].DeviceName,
                                responseEquipments[i].Ip,
                                responseEquipments[i].Port,
                                responseEquipments[i].ReadTimeOut,
                                responseEquipments[i].WriteTimeOut);

                            Connection _connection = new TCPIPConnection(proData.Ip, proData.Port, proData.ReadTimeOut, proData.WriteTimeOut, 200);
                            _clockStPro2000 = new Clock(_connection, ProtocolType.RS485//rbSTProR2.Checked ? ProtocolType.RS485 : ProtocolType.Hdlc
                                                                , 1,
                                                          1, EncryptionMode.None, ProtocolType.Suprema);

                            if (_clockStPro2000.TestConnection())
                            {
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ConnectToStPro2000 CONNECTED: name:{responseEquipments[i].DeviceName}");

                                if (_clockStPro2000.GetDateTime().ToString("yyyy-MM-ddTHH:mm") != DateTime.Now.ToString("yyyy-MM-ddTHH:mm"))
                                    _clockStPro2000.SetDateTime(DateTime.Now);
                                stproModelName = $"[{i + 1}]{_clockStPro2000.GetModel()} {_clockStPro2000.GetFirmwareVersion()}";
                                StPro2000IsReady = true;


                                //Clear oldData
                                int storageRecordCount = 0;
                                try
                                {
                                    if (!_clockStPro2000.IsEmpty())
                                    {
                                        var record = _clockStPro2000.GetRecord();
                                        if (record != null)
                                        {
                                            storageRecordCount++;
                                            _clockStPro2000.NextRecord();
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    string ss = ex.Message;
                                }
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> StPro2000 Clear Old Data. RecordCount:{storageRecordCount}");

                            }
                            else
                            {
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ConnectToStPro2000 dont CONNECT!!: name:{responseEquipments[i].DeviceName}");

                                stproModelName = $"[{i + 1}] یافت نشد";
                                _clockStPro2000 = null;
                                //StPro2000IsReady = false;
                                // add log error
                            }

                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo StPro2000 ({proData.Name})= {proData.Ip}:{proData.Port},ReadTimeOut:{proData.ReadTimeOut},WriteTimeOut:{proData.WriteTimeOut}  IsReady:{StPro2000IsReady}");


                            if (!String.IsNullOrEmpty(stproModelName))
                            {
                                if (_clockStPro2000 != null)
                                {
                                    clockStPro2000_all.Add(_clockStPro2000);
                                    _clockStPro2000 = null;
                                }

                                //var item = response.Values.FirstOrDefault(q => q.DeviceId == stproDeviceID);
                                //var item = response.Values[i];
                                //item.FrimewareVersion = $"{stproModelName}";
                                for (var iRes = 0; iRes < response.Values.Count; iRes++)
                                {
                                    if (response.Values[iRes].DeviceId == stproDeviceID)
                                    {
                                        response.Values[iRes].FrimewareVersion = $"{stproModelName}";
                                    }
                                }
                            }

                        }
                    }
                    catch (Exception ex)
                    {
                        string ss = ex.Message;
                    }




                }
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> ConnectToStPro2000(connected Count): " + clockStPro2000_all.Count.ToString());

                if (clockStPro2000_all.Count > 0)
                {
                    threadStPro2000 = new Thread(() => ReadDataOfStPro2000());
                    threadStPro2000.Start();
                    StPro2000IsReady = true;
                }
            }
            catch (Exception ex)
            {
                string ss = ex.Message;
            }
        }
        private void ConnectToReaders(List<EquipmentEntity> responseEquipments, ResponseResultWeb<List<DeviceInfoDto>> response)

        {

            string readerModelName = "";
            long readerDeviceID = 0;
            cardReader_all = new List<OnlineEncoder>();
            //OnlineEncoder _cardReader = null;
            string connectionMode = "";
            //bool readerConnected = false;


            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> ConnectToCardReader(Count): " + responseEquipments.Count.ToString());
            responseEquipments = responseEquipments.Where(q => response.Values.Select(s => s.DeviceId).Contains(q.Id)).ToList();
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> ConnectToCardReader(Count after where): " + responseEquipments.Count.ToString());

            try
            {
                for (var i = 0; i < responseEquipments.Count; i++)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ConnectToCardReader [{i + 1}]/[{responseEquipments.Count}]");

                    try
                    {
                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ConnectToCardReader: name:{responseEquipments[i].DeviceName},ip:{responseEquipments[i].Ip},port:{responseEquipments[i].Port}, disabled:{responseEquipments[i].Disabled}");

                        if (!responseEquipments[i].Disabled)
                        {
                            readerDeviceID = responseEquipments[i].Id;


                            if (responseEquipments[i].ConnectionType == EosParking.Core.Enums.ConnectionTypes.SerialConnection)
                            {
                                _cardReader = new OnlineEncoder("COM" + responseEquipments[i].ComPort.ToString(), false, Application.StartupPath);
                                connectionMode = "[COM]";
                                _cardReader.GetRecordRaised += ProcessGetRecordFromCardReader;
                            }
                            else
                            {
                                connectionMode = "[IP]";
                                _cardReader = new OnlineEncoder(responseEquipments[i].Ip, responseEquipments[i].Port, false, Application.StartupPath);
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
                                readerModelName = $"Reader 1.0 {connectionMode}";
                                //readerConnected = true;
                            }
                            else
                            {
                                readerModelName = "یافت نشد";
                                _cardReader = null;
                                //readerConnected = false;
                            }
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo CardReader ({readerModelName})= COM{responseEquipments[i].ComPort.ToString()}");



                            if (!String.IsNullOrEmpty(readerModelName))
                            {
                                if (_cardReader != null)
                                {
                                    cardReader_all.Add(_cardReader);
                                    _cardReader = null;
                                }

                                //var item = response.Values.FirstOrDefault(q => q.DeviceId == stproDeviceID);
                                //var item = response.Values[i];
                                //item.FrimewareVersion = $"{stproModelName}";
                                foreach (var deviceInfoDto in response.Values.Where(deviceInfoDto => deviceInfoDto.DeviceId == readerDeviceID))
                                {
                                    deviceInfoDto.FrimewareVersion = $"{readerModelName}";
                                }
                            }


                            //if (readerConnected)
                            //{
                            //    if (_cardReader != null)
                            //    {
                            //        cardReader_all.Add(_cardReader);
                            //        _cardReader = null;
                            //        try
                            //        {
                            //            //_cardReader.GetRecordRaised -= ProcessGetRecordFromCardReader;
                            //            //_cardReader.Disconnect();
                            //            //_cardReader = null;
                            //        }
                            //        catch { }

                            //    }

                            //    //var item = response.Values.FirstOrDefault(q => q.DeviceId == stproDeviceID);
                            //    //var item = response.Values[i];
                            //    //item.FrimewareVersion = $"{stproModelName}";
                            //}

                        }
                    }
                    catch (Exception ex)
                    {
                        string ss = ex.Message;
                    }
                }
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> ConnectToCardReader(connected Count): " + cardReader_all.Count.ToString());


            }
            catch (Exception ex)
            {
                string ss = ex.Message;
            }
        }
        private void ConnectToUHF(List<EquipmentEntity> responseEquipments, ResponseResultWeb<List<DeviceInfoDto>> response)
        {
            string uhfModelName = "";
            long uhfDeviceID = 0;
            gateUHF_all = new List<UHFControler>();
            uhfListData = new List<RecordEvent.InstantRecord>();

            try
            {
                for (var i = 0; i < responseEquipments.Count; i++)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ConnectToStPro2000 [{i}]/[{responseEquipments.Count}]");

                    try
                    {

                        if (!responseEquipments[i].Disabled)
                        {


                            uhfDeviceID = responseEquipments[i].Id;
                            _gateUHF = new UHFControler(responseEquipments[0].Ip, responseEquipments[0].Port);
                            _gateUHF.GetRecordRaised += UHFProcessGetRecord;
                            var uhfIsReady = _gateUHF != null;
                            if (_gateUHF.Connect())
                            {
                                uhfModelName = _gateUHF?.GetDeviceInfo();
                                _gateUHF?.Start();
                            }
                            else
                            {
                                _gateUHF = null;
                                uhfModelName = $"[{i + 1}] یافت نشد";
                            }
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetParkingDoorDevices + ConnectTo UHF ({uhfIsReady.ToString()})(Info): {uhfModelName}   {responseEquipments[0].Ip}:{responseEquipments[0].Port}");
                            if (!String.IsNullOrEmpty(uhfModelName))
                            {
                                if (_gateUHF != null)
                                {
                                    gateUHF_all.Add(_gateUHF);
                                    _gateUHF = null;
                                }

                                //var item = response.Values.FirstOrDefault(q => q.DeviceId == stproDeviceID);

                                for (var iRes = 0; iRes < response.Values.Count; iRes++)
                                {
                                    if (response.Values[iRes].DeviceId == uhfDeviceID)
                                    {
                                        response.Values[iRes].FrimewareVersion = $"{uhfModelName}";
                                    }
                                }
                                //var item = response.Values[i];
                                //item.FrimewareVersion = $"{uhfModelName}";
                            }


                        }
                    }
                    catch (Exception ex)
                    {
                        string ss = ex.Message;
                    }




                }

            }
            catch (Exception ex)
            {
                string ss = ex.Message;
            }
        }

        private void ProcessGetRecordFromCardReader(object sender, RecordEvent.RecordEventArgs e)
        {
            string log = "CardReader--> ";
            try
            {
                if (!pauseReadingReader)
                {
                    pauseReadingReader = true;

                    if (!string.IsNullOrEmpty(e?.RecordData?.Data))
                    {
                        string cardID = e.RecordData.Data.ToString();
                        var bCheckCardIDInList = _cardReaderDetectList.Any(q => q.Key == cardID && (DateTime.Now - q.Value).TotalSeconds < 90);
                        log += $" ID:{cardID} * DateTime:{e.RecordData.DateTime.ToString("yyyy/MM/dd HH:mm:ss")}";
                        if (!bCheckCardIDInList)
                        {
                            PassCardID2(e.RecordData);
                            _cardReaderDetectList.Add(new KeyValuePair<string, DateTime>(cardID, e.RecordData.DateTime));
                            if (this.InvokeRequired)
                                Invoke(new MethodInvoker(() =>
                                {
                                    labelRepeatedCardID.Visible = false;
                                }));
                            else
                            {
                                labelRepeatedCardID.Visible = false;
                            }
                        }
                        else
                        {
                            log += "  (ignore! repeated)";
                            if (this.InvokeRequired)
                                Invoke(new MethodInvoker(() =>
                                {
                                    labelRepeatedCardID.Text = EosParking.Core.Helpers.CardHelper.RemoveZero(cardID);
                                    labelRepeatedCardID.Visible = true;
                                }));
                            else
                            {
                                labelRepeatedCardID.Text = EosParking.Core.Helpers.CardHelper.RemoveZero(cardID);
                                labelRepeatedCardID.Visible = true;
                            }

                        }
                    }
                    else
                    {
                        log += " NoData!";
                    }
                    pauseReadingReader = false;
                }
                else
                {
                    log += " ignored!  pause Reading Reader";
                }


            }
            catch (Exception ex)
            {
                log = "ProcessGetRecordFromCardReader ERR--> " + ex.Message.ToString();
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> " + log);
        }



        private void ReadDataOfStPro2000()
        {
            try
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> ConnectToStPro2000 ReadDataOfStPro2000 started");

                DateTime startDateTime = DateTime.Now;
                Thread.Sleep(500); // wait on start form app
                while (true)
                {
                    Thread.Sleep(500); // این خط اول حلقه باشد
                    try
                    {


                        for (var i = 0; i < clockStPro2000_all.Count; i++)
                        {
                            if ((!pauseReadingStPro2000) && (clockStPro2000_all[i] != null))
                            {
                                if (!clockStPro2000_all[i].IsEmpty())
                                {
                                    try
                                    {
                                        var record = clockStPro2000_all[i].GetRecord();
                                        if (record != null)
                                        {
                                            //if (startDateTime <= record.DateTime) // فقط کارت های جدید را می خواند که بعد از باز شدن فرم شده شده باشند
                                            if (true)
                                            {
                                                try
                                                {
                                                    PassCardID(record);
                                                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ReadDataOfStPro2000[{i}] Read  ID:{record.ID} , Time:{record.DateTime} , StartTime=:{startDateTime}");
                                                }
                                                catch (Exception ex)
                                                {
                                                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ReadDataOfStPro2000[{i}] Read ERR: {ex.Message}");
                                                }
                                            }
                                            else
                                            {
                                                //EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ReadDataOfStPro2000 Read IGNORED!!!  ID:{record.ID} , Time:{record.DateTime} , StartTime=:{startDateTime}");
                                            }
                                            clockStPro2000_all[i].NextRecord();
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        string ss = ex.Message;
                                    }
                                }
                                else
                                {
                                    Thread.Sleep(100);
                                }

                            }
                        }
                        /*
                        if ((!pauseReadingStPro2000)&& (_clockStPro2000 != null))
                        { 
                            if (!_clockStPro2000.IsEmpty())
                            {
                                try
                                {

                                    var record = _clockStPro2000.GetRecord();
                                    if (record != null)
                                    {
                                        //if (startDateTime <= record.DateTime) // فقط کارت های جدید را می خواند که بعد از باز شدن فرم شده شده باشند
                                        if (true)
                                        {
                                            PassCardID(record);
                                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ReadDataOfStPro2000 Read  ID:{record.ID} , Time:{record.DateTime} , StartTime=:{startDateTime}");
                                        }
                                        else
                                        {
                                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ReadDataOfStPro2000 Read IGNORED!!!  ID:{record.ID} , Time:{record.DateTime} , StartTime=:{startDateTime}");
                                        }
                                        _clockStPro2000.NextRecord();
                                    }
                                }
                                catch (Exception ex)
                                {
                                    string ss = ex.Message;
                                }
                            }
                            else
                            {
                                Thread.Sleep(100);
                            }
                                
                        }*/






                    }
                    catch (Exception ex)
                    {
                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, $">>>> ReadDataOfStPro2000 ERR#1  --> {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, $">>>> ReadDataOfStPro2000 ERR#2  --> {ex.Message}");
            }
        }

        private void PassCardID(Record record)
        {
            try
            {
                pauseReadingStPro2000 = true;

                if (cardTextBox.InvokeRequired)
                {
                    cardTextBox.Invoke(new MethodInvoker(() =>
                    {
                        cardTextBox.Text = SetCardIdInTextBox(record.ID.ToString());

                        if (!string.IsNullOrEmpty(cardTextBox.Text))
                        {
                            cardTextBox.Focus();
                            cardTextBox.Validate();
                        }
                    }));
                }
                else
                {
                    cardTextBox.Text = SetCardIdInTextBox(record.ID.ToString());

                    if (!string.IsNullOrEmpty(cardTextBox.Text))
                    {
                        cardTextBox.Focus();
                        cardTextBox.Validate();
                    }
                }
            }
            catch
            {
            }
            finally
            {
                pauseReadingStPro2000 = false;
            }
        }

        private void PassCardID2(RecordEvent.InstantRecord record)
        {
            try
            {
                ////string recordDate = record.DateTime.ToString("yyyy/MM/dd HH:mm:ss");
                string cardID = EosParking.Core.Helpers.CardHelper.RemoveZero(record.Data.ToString());

                pauseReadingReader = true;
                if (cardTextBox.InvokeRequired)
                {
                    cardTextBox.Invoke(new MethodInvoker(() =>
                    {

                        //cardTextBox.Text = SetCardIdInTextBox(record.Data.ToString());
                        cardTextBox.Text = SetCardIdInTextBox(cardID);
                        //cardTextBox.Focus();
                        if (!string.IsNullOrEmpty(cardTextBox.Text))
                        {
                            cardTextBox.Focus();

                            cardTextBox.Validate();
                        }
                    }));
                }
                else
                {
                    //cardTextBox.Text = SetCardIdInTextBox(record.Data.ToString());
                    cardTextBox.Text = SetCardIdInTextBox(cardID);
                    //cardTextBox.Focus();
                    if (!string.IsNullOrEmpty(cardTextBox.Text))
                    {
                        cardTextBox.Focus();

                        cardTextBox.Validate();
                    }
                }
            }
            catch (Exception)
            {
                // ignored
            }
        }

        void GetParkingTariffs()
        {
            try
            {
                var response = GetJsonObjecToLink<List<TariffDto>>(ApiAddress.TariffApi.GetByParkingId, PublicVariables.CurrentUser.CurrentParking);
                if (response == null || response.ResponseResultType != EosParking.Core.Enums.ResponseResultTypes.Ok)
                    response = GetJsonObjecToLink<List<TariffDto>>(ApiAddress.TariffApi.GetByParkingId, PublicVariables.CurrentUser.CurrentParking);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    tarrifList = response.Values.Where(q => q.IsActive || q.IsCurrent).OrderBy(q => q.IsCurrent).ToList();
                    tariffTextBox.TextBoxObject.DataSource = tarrifList;
                    tariffTextBox.TextBoxObject.ValueMember = "Id";
                    tariffTextBox.TextBoxObject.DisplayMember = "Title";
                    if (response.Values?.FirstOrDefault(q => q.IsCurrent)?.Id == null)
                    {
                        MessageShowError("هیچ تعرفه پیش فرضی در سیستم یافت نگردید");
                        if (!response.Values.Any())
                            Close();
                    }
                    tariffTextBox.TextBoxObject.SelectedValue = response.Values?.FirstOrDefault(q => q.IsCurrent)?.Id ?? 0;
                    currentTarrifTitle = response.Values?.FirstOrDefault(q => q.IsCurrent)?.Title ?? "--";

                }
            }
            catch { }
        }

        void CreateEnterDump(bool entranceFake = false)
        {
            LogHelper.Log(TraceEventType.Information, $"CreateEnterDump START");
            var ct = eosPlateControl1.CarType;
            long iDoorID = currentDoor.Id;

            if ((_currentPlateImage == null && eosIpCamView1.IsConnect)
                || eosPlateControl1.CarType == CarTypes.Motor)
            {
                _currentPlateImage = null;
                eosIpCamView1.ClearFrames();
                eosIpCamView1.CapturBitmap(true);
            }
            Thread.Sleep(500);
            Application.DoEvents();
            byte[] bmpByte = _currentPlateImage != null ? EosIpCamView.CompressedCurrentPlateBitmapToByte(_currentPlateImage, 500, 500, true) : eosIpCamView1.CompressedCurrentPlateBitmapToByte(500, 500, true);
            if (bmpByte == null)
                bmpByte = eosIpCamView1.CompressedFrameBufferToByte(500, 500, true);

            switch (currentDoor.EntryAuthorizaitionType)
            {
                //case EntryAuthorizaitionTypes.QRCode:
                case EntryAuthorizaitionTypes.Card: if (string.IsNullOrEmpty(cardTextBox.Text)) { MessageShowValidationError("شماره کارت الزامی می باشد"); return; } break;
                case EntryAuthorizaitionTypes.Plate: if (!eosPlateControl1.IsValid) { MessageShowValidationError("شماره پلاک الزامی می باشد"); return; } break;
                case EntryAuthorizaitionTypes.CardAndPictur:
                    if (string.IsNullOrEmpty(cardTextBox.Text)) { MessageShowValidationError("شماره کارت الزامی می باشد"); return; }
                    else if (bmpByte == null)
                    {
                        eosIpCamView1.CapturBitmap(true);
                        Thread.Sleep(1000);
                        Application.DoEvents();
                        bmpByte = eosIpCamView1.CompressedFrameBufferToByte(500, 500, true);
                        if (bmpByte == null)
                        {
                            MessageShowError("متاسفانه تصویر خودرو دریافت نشد. تصویر الزامی می باشد"); return;
                        }
                    }
                    break;
                case EntryAuthorizaitionTypes.CardAndPlate:
                    //case EntryAuthorizaitionTypes.QRCodeAndPlate:
                    if (string.IsNullOrEmpty(cardTextBox.Text)) { MessageShowValidationError("شماره کارت الزامی می باشد"); return; }
                    else if (!eosPlateControl1.IsValid) { MessageShowValidationError("شماره پلاک الزامی می باشد"); return; }
                    break;
            }

            //File.WriteAllBytes("e:\\dbdd.jpg", bmpByte);
            //if (currentCarInfo == null && string.IsNullOrEmpty(eosPlateControl1.Plate))
            //{
            //    MessageShowValidationError("لطفا اطلاعات را وارد کنید");
            //    return;
            //}
            if (currentCarInfo.ControlType != ControlListTypes.None)
            {
                if (!CheckControlList(false, DoorTypes.Entrance)) return;
            }
            //if (currentDoor.DoorType == DoorTypes.Entrance && currentCarInfo.EnterDateTime != null || currentCarInfo.EnterDateTime > DateTime.MinValue)
            //{
            //    MessageShowError("قبلا ورودی برای این خودرو ثبت شده است");
            //    carEnterButton.Enabled = true;
            //    carExitButton.Enabled = false;
            //    return;
            //}
            var item = (infoGridControl.DataSource as List<CardInfoView>)?.FirstOrDefault();


            var cType = eosPlateControl1.CarType;
            var dump = new TrafficDumpEntity
            {
                DoorId = currentDoor.Id,
                CardId = currentCarInfo?.CardId,
                MemberId = currentCarInfo?.MemberId,
                CarPlate = eosPlateControl1.Plate,
                //CarType = eosPlateControl1.CarType,
                CarType = ct,
                //Car = new CarEntity { Id = currentCarInfo?.CarId ?? 0, DtoViewCarColorTitle = currentCarInfo?.CarColor, DtoViewCarModelTitle = currentCarInfo?.CarModel },
                //Car = new CarEntity { Id = currentCarInfo?.CarId ?? 0,DtoViewCarColorTitle = item.CarColor, DtoViewCarModelTitle = item.CarModle },
                DtoViewCarModelTitle = item?.CarModle,
                DtoViewCarColorTitle = item?.CarColor,
                Id = currentCarInfo?.DumpId ?? 0,
                CarId = currentCarInfo?.CarId,
                SourceType = DumpSourceTypes.UserManual,
                IdOnDevice = 0,
                PersistBy = PublicVariables.CurrentUser.Id,
                TariffId = currentCarInfo.MemberTariffId != 0 ? currentCarInfo.MemberTariffId : long.Parse(tariffTextBox.TextBoxObject.SelectedValue.ToString()),
                DtoViewTrafficImages = bmpByte != null ? new List<TrafficDumpImageEntity> { new TrafficDumpImageEntity { TrafficImage = bmpByte } } : new List<TrafficDumpImageEntity> { },
                DoSave = true,
                BillControlType = controlBillCheckBox.Checked ? BillControlTypes.InitialBillControl : BillControlTypes.Normal,
                EnterDateTimeFake = entranceFake,
            };

            var response = PostJsonObjecToLinkAndWait<EnterDumpRecordSavedDto>(ApiAddress.TrafficApi.CreateEnterDump, dump, false);
            //if (this.InvokeRequired)
            //Invoke(new MethodInvoker(() =>
            //{
            try
            {
                LogHelper.Log(TraceEventType.Information, $"SendPacketEnterDump : {ApiAddress.TrafficApi.CreateEnterDump}   {Newtonsoft.Json.JsonConvert.SerializeObject(dump)}");
                LogHelper.Log(TraceEventType.Information, $"SendPacketEnterDumpResponse :{Newtonsoft.Json.JsonConvert.SerializeObject(response)}");
            }
            catch (Exception ex)
            {
                LogHelper.Log(TraceEventType.Information, $"SendPacketEnterDump ERR :{ex.Message}");

            }
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                //TODO Disable dataGrid
                //Task.Factory.StartNew(() => { scaduleTimer_Tick(this, new EventArgs()); }).Wait(100);

                if (controlBillCheckBox.Checked)
                {
                    SecurityHelper.GenerateBillControlNumbers(response.Values.Id, response.Values.EnterDateTime, out long idNum1, out long idNum2);
                    EosParkingTools.Utils.ReportsViewer.PrintReportResourceSync<ExitBillDto>("EntrancControlFishPrinter.mrt", new List<ExitBillDto>
                                                                                                {
                                                                                                    new ExitBillDto {
                                                                                                        CardNumber=string.IsNullOrEmpty(currentCarInfo?.CardNumber)?cardTextBox.Text:currentCarInfo?.CardNumber,
                                                                                                        CarPlate=!string.IsNullOrEmpty(eosPlateControl1.Plate)?eosPlateControl1.Plate:currentCarInfo?.Plate,
                                                                                                        EnterDateTime=response.Values.EnterDateTime,
                                                                                                        ExitDateTime=null,
                                                                                                        DumpId=response.Values.Id,
                                                                                                        MemberCode=currentCarInfo?.MemberCode,
                                                                                                        BillControlID1 = idNum1,
                                                                                                        BillControlID2 = idNum2,
                                                                                                    }
                                                                                                });
                    OpenGate(false);

                    OpenGateG4(relayData);
                    OpenGate(topGateDeviceID, true);
                }
                else if (entrancePrintCheckBox.Checked && (currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.QRCode || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.QRCodeAndPlate /*|| currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.QRCodeOrPlate*/))
                    if (PublicVariables.PrintAutomatic || ShowQuestion(message: "آیا می خواهید فیش چاپ شود؟") == DialogResult.OK)
                        EosParkingTools.Utils.ReportsViewer.PrintReportResourceSync<ExitBillDto>("EntrancFishPrinter.mrt", new List<ExitBillDto>
                                                                                                {
                                                                                                    new ExitBillDto {
                                                                                                        CardNumber=string.IsNullOrEmpty(currentCarInfo?.CardNumber)?cardTextBox.Text:currentCarInfo?.CardNumber,
                                                                                                        CarPlate=!string.IsNullOrEmpty(eosPlateControl1.Plate)?eosPlateControl1.Plate:currentCarInfo?.Plate,
                                                                                                        EnterDateTime=response.Values.EnterDateTime,
                                                                                                        ExitDateTime=null,
                                                                                                        DumpId=response.Values.Id,
                                                                                                        MemberCode=currentCarInfo?.MemberCode
                                                                                                    }
                                                                                                });
                OpenGate(false);
                OpenGateG4(relayData);
                OpenGate(topGateDeviceID, true);
                //MessageShowSucsess("ورود ثبت گردید");
                if (!entranceFake)
                {
                    SetFormCarInfo(null, false, false, false);
                }
            }
            else
                MessageShowError(response);
            //}));
            eosIpCamView1.WaiteForNextPlate = false;
            eosExitIpCamView2.WaiteForNextPlate = false;
            LogHelper.Log(TraceEventType.Information, $"CreateEnterDump END");

        }

        private bool CheckControlList(bool isSilent = false, DoorTypes DoorTypeCheck = DoorTypes.Both)
        {
            if (currentCarInfo == null)
                return true;
            var bkColor = this.BackColor;
            switch (currentCarInfo.ControlType)
            {
                case ControlListTypes.Black:
                    try
                    {
                        //BackColor = Color.Gray;

                        if (currentCarInfo.ControlListActionType == ControlListActionTypes.EntranceAndExit
                            || (currentCarInfo.ControlListActionType == ControlListActionTypes.Entrance && (currentDoor.DoorType == DoorTypes.Entrance || currentDoor.DoorType == DoorTypes.Both))
                            || (currentCarInfo.ControlListActionType == ControlListActionTypes.Exit && (currentDoor.DoorType == DoorTypes.Exit || currentDoor.DoorType == DoorTypes.Both)))
                        {
                            if (!isSilent)
                                EosControlListDialogForm.ShowControlDialog(currentCarInfo.ControlType, currentCarInfo.Description);
                            return false;
                        }
                    }
                    finally { /*BackColor = bkColor;*/  }
                    break;
                case ControlListTypes.Stealing:
                    try
                    {
                        //this.BackColor = Color.Maroon;


                        if (currentCarInfo.ControlListActionType == ControlListActionTypes.EntranceAndExit
                            || (currentCarInfo.ControlListActionType == ControlListActionTypes.Entrance && (currentDoor.DoorType == DoorTypes.Exit || currentDoor.DoorType == DoorTypes.Both))
                            || (currentCarInfo.ControlListActionType == ControlListActionTypes.Exit && (currentDoor.DoorType == DoorTypes.Exit || currentDoor.DoorType == DoorTypes.Both)))
                        {
                            if (!isSilent)
                                EosControlListDialogForm.ShowControlDialog(currentCarInfo.ControlType, currentCarInfo.Description);
                            //if (currentDoor.DoorType == DoorTypes.Exit || currentDoor.DoorType == DoorTypes.Both)
                            //{
                            //    //return false;
                            //}

                        }
                        return DoorTypeCheck == DoorTypes.Entrance;
                    }
                    finally { /*BackColor = bkColor;*/ }
                //break;
                case ControlListTypes.Observation:
                    try
                    {
                        //this.BackColor = Color.Green;
                        if (currentCarInfo.ControlListActionType == ControlListActionTypes.EntranceAndExit
                                            || (currentCarInfo.ControlListActionType == ControlListActionTypes.Entrance && (currentDoor.DoorType == DoorTypes.Exit || currentDoor.DoorType == DoorTypes.Both))
                                            || (currentCarInfo.ControlListActionType == ControlListActionTypes.Exit && (currentDoor.DoorType == DoorTypes.Exit || currentDoor.DoorType == DoorTypes.Both)))
                        {
                            if (!isSilent)
                                EosControlListDialogForm.ShowControlDialog(currentCarInfo.ControlType, currentCarInfo.Description);
                            //Do Observation
                            //return;
                        }
                    }
                    finally { /*BackColor = bkColor;*/ }
                    break;

            }
            return true;
        }

        void GetCarInfo(bool isplate, bool isCard, bool isMember)
        {
            int start = Environment.TickCount;

            if (!isMember && currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.CardAndPlate)
            {
                isplate = true;
                isCard = true;
            }
            if (isplate && (string.IsNullOrEmpty(eosPlateControl1.Plate) || !eosPlateControl1.IsValid))
                return;
            if (isCard && string.IsNullOrEmpty(cardTextBox.Text))
                return;
            if (isMember && string.IsNullOrEmpty(memberCodeTextBox.Text))
                return;
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #1 Duration:({Environment.TickCount - start}) ");
            /// یک باگ در شیراز بود موقتا غیر فعال می شود این بلاک
            /// یه چیزی تو مایه های عمل آپاندیس هستش :D
            /// بعضی از پارکینگ ها که از یک دوربین برای ورود و خروج استفاده می کنند کارایی دارد
            /// در سیستم جدید پلاک خوان می توان
            /// ROI 
            /// تعریف نمود 
            /// بالاجبار این را نگه می داریم برای مشتری های قدیمی تر و تنظیمات اضافه کردم که اگر مشتریان جدید و قدیم به مشکل نخورند
            if (checkBoxCheckRepeatedTrade.Checked)
            {
                if (trafficGrid.DataSource != null)
                {
                    var trafficEnter = (trafficGrid.DataSource as List<ExitBillDto>).Where(q => (!string.IsNullOrEmpty(eosPlateControl1.Plate) && q.AbsolutCarPlate == eosPlateControl1.Plate) || (!string.IsNullOrEmpty(cardTextBox.Text) && q.CardNumber == cardTextBox.Text)).Select(q => q.EnterDateTime).OrderByDescending(q => q).FirstOrDefault();//??DateTime.MinValue;
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #1.1 Duration:({Environment.TickCount - start}) ");
                    var trafficExit = (trafficGrid.DataSource as List<ExitBillDto>).Where(q => (!string.IsNullOrEmpty(eosPlateControl1.Plate) && q.AbsolutCarPlate == eosPlateControl1.Plate) || (!string.IsNullOrEmpty(cardTextBox.Text) && q.CardNumber == cardTextBox.Text)).Select(q => q.ExitDateTime).OrderByDescending(q => q).FirstOrDefault() ?? DateTime.MinValue;
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #1.2 Duration:({Environment.TickCount - start}) ");
                    if ((DateTime.Now - trafficEnter).TotalMinutes <= (int)repeatedRecordTimeUpDown.Value
                        || (DateTime.Now - trafficExit).TotalMinutes <= (int)repeatedRecordTimeUpDown.Value)
                    {

                        MessageShowError("تردد تکراری می باشد", messageTimeOut);
                        cancelButton_Click(this, new EventArgs());
                        return;
                    }
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #1.2+1 Duration:({Environment.TickCount - start}) ");

                }
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #2 Duration:({Environment.TickCount - start}) ");
            isCard = !string.IsNullOrEmpty(cardTextBox.Text);
            isplate = !(string.IsNullOrEmpty(eosPlateControl1.Plate) || !eosPlateControl1.IsValid);
            var response = GetJsonObjecToLink<CarTrafficInfoDto>(ApiAddress.TrafficApi.GetCarTrafficInfo, $"parkingId={currentDoor.ParkingId}&plate={(isplate ? eosPlateControl1.Plate : string.Empty)}&memberCard={(isCard ? cardTextBox.Text : String.Empty)}&memberCode={(isMember ? memberCodeTextBox.Text : string.Empty)}");
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #3 Duration:({Environment.TickCount - start}) ");
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                //if (!string.IsNullOrEmpty(eosPlateControl1.Plate))
                //{
                //cardTextBox.Text = response.Values.MemberCard;
                //memberCodeTextBox.Text = response.Values.MemberCode;
                ShowFurtureMemberInfo(response.Values, isMember);


                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #3.1 Duration:({Environment.TickCount - start}) ");
                if (onlyMemberheckBox.Checked && currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.Plate)
                {
                    if (response.Values == null || response.Values.MemberId == 0)
                    {
                        CancelForm(false);
                        return;
                    }
                }
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #3.2 Duration:({Environment.TickCount - start}) ");

                SetFormCarInfo(response.Values, isplate, isCard, isMember);

                //{WARNING: dont use Thread. !!!!!! jafari.
                //    Thread myNewThread = new Thread(() => SetFormCarInfo(response.Values, isplate, isCard, isMember));
                //    myNewThread.Start();
                //}

                //}
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo #4 Duration:({Environment.TickCount - start}) ");
            }
            else
            {
                if (!string.IsNullOrEmpty(response.RealMessage))
                    MessageShowError(response);
                pauseReadingStPro2000 = false;
                pauseReadingReader = false;
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> GetCarInfo end Duration:({Environment.TickCount - start}) ");

        }

        void AutomaticMemberTraffic(string plate, string card, string member)
        {
            if ((string.IsNullOrEmpty(plate) || !eosPlateControl1.IsValid))
                return;
            if (string.IsNullOrEmpty(card))
                return;
            if (string.IsNullOrEmpty(member))
                return;
            var response = GetJsonObjecToLink<CarTrafficInfoDto>(ApiAddress.TrafficApi.GetCarTrafficInfo, $"parkingId={currentDoor.ParkingId}&plate={plate}&memberCard={card}&memberCode={member}");

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                //if (!string.IsNullOrEmpty(eosPlateControl1.Plate))
                //{
                //cardTextBox.Text = response.Values.MemberCard;
                //memberCodeTextBox.Text = response.Values.MemberCode;
                SetFormCarInfo(response.Values, string.IsNullOrEmpty(plate), string.IsNullOrEmpty(card), string.IsNullOrEmpty(plate));
                if (response.Values.EnterDateTime.HasValue)
                    DoExitDump();
                else
                    CreateEnterDump();
                //SetFormCarInfo(response.Values, isplate, isCard, isMember);
                //}
            }
            //else
            //    if (!string.IsNullOrEmpty(response.RealMessage))
            //    MessageShowError(response);
        }

        public void ShowMemberCreditInfo(List<MemberCreditDto> memberInfo)
        {
            try
            {
                StringBuilder message = new StringBuilder();

                foreach (var memberCredit in memberInfo)
                {
                    if (!memberCredit.IsActive)
                    {
                        message.Append("   *****رزرو :");

                        switch (memberCredit.MembershipCreditType)
                        {
                            case MembershipCreditTypes.Credit:
                                message.Append("سقف اعتبار :" + String.Format("{0:N0}", memberCredit.CashAmount) + " ریال");
                                break;
                            case MembershipCreditTypes.LongTime:
                                message.Append("اعتبار مدت دار دارد");
                                break;
                            case MembershipCreditTypes.LongTimeCredit:
                                message.Append($"اعتبار مدت دار تا سقف {String.Format("{0:N0}", memberCredit.CashAmount)} ریال دارد");
                                break;
                        }
                    }
                    else
                    {
                        if (memberCredit.MembershipCreditType == MembershipCreditTypes.Credit)
                            message.Append("مانده اعتبار: " + String.Format("{0:N0}", memberCredit.CashAmount) + " ریال");
                        else if (memberCredit.MembershipCreditType == MembershipCreditTypes.LongTime)
                            message.Append($"اعتبار از تاریخ {memberCredit.SolarRegisterStartDateTime} تا تاریخ {memberCredit.SolarRegisterEndDateTime} می باشد");
                        else
                            message.Append($"از تاریخ {memberCredit.SolarRegisterStartDateTime} تا تاریخ {memberCredit.SolarRegisterEndDateTime} به میزان {String.Format("{0:N0}", memberCredit.CashAmount)}  ریال مانده حساب می باشد");
                    }
                }



                additionalInfoLabel.Text = message.ToString();
            }
            catch
            {
                /*iqnored*/
            }
        }

        public void ShowFurtureMemberInfo(CarTrafficInfoDto carInfo, bool isMember)
        {


            try
            {

                if ((carInfo?.IsMemberBlock ?? false) && isMember)
                {
                    additionalInfoLabel.Text = "عضویت غیر فعال می باشد";
                    return;
                }
            }
            catch { /*ignored*/}

            bool hasMemberCode = false;


            eosPlateControl1.Plate = carInfo.Plate;
            if (carInfo != null && !String.IsNullOrEmpty(carInfo.MemberCode))
                hasMemberCode = true;

            ChangeColorForMember(isMember || hasMemberCode);
            _billControlType = carInfo?.BillControlType ?? BillControlTypes.Normal;
            grbMemberInfo.Location = new Point(74, 25);
            LoadPersonalPhoto(carInfo?.MemberPersonalPhoto);
            txbMemberName.Text = carInfo?.MemberName;
            txbMemberFamily.Text = carInfo?.MemberFamily;
            txbMemberNationalCode.Text = carInfo?.MemberNationalCode;
            grbMemberInfo.Visible = true;
            if ((currentDoor.DoorType == DoorTypes.Entrance || carInfo.EnterDateTime == null || carInfo.EnterDateTime <= DateTime.MinValue)
                && (isMember || hasMemberCode))
            {
                try
                {
                    var response = GetJsonObjecToLinkAndWait<List<MemberCreditDto>>(ApiAddress.TrafficApi.GetMemberCurrentCreditInfo, carInfo?.MemberId);
                    if (response != null && response.Values?.Count > 0)
                        ShowMemberCreditInfo(response.Values);
                    else
                        additionalInfoLabel.Text = "فاقد اشتراک است";
                }
                catch { /*ignored*/}
            }




        }

        private void LoadPersonalPhoto(byte[] memberPersonalPhoto)
        {
            if (memberPersonalPhoto != null)
            {
                using (MemoryStream memstr = new MemoryStream(memberPersonalPhoto))
                {
                    Image img = Image.FromStream(memstr);
                    pictureBoxPersonal.Image = img;
                }
            }
            else
            {
                pictureBoxPersonal.Image = null;
            }
        }

        private void SetFormCarInfo(CarTrafficInfoDto carInfo, bool isplate, bool isCard, bool isMember)
        {
            try
            {
                if (carInfo?.IsMemberBlock ?? false)
                {
                    MessageShowError("عضویت غیر فعال است");
                    return;
                }
            }
            catch { }
            int start = Environment.TickCount;
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SetFormCarInfo #1 Duration:({Environment.TickCount - start}) ");

            bool cancelAutoSystem = false;

            if (InvokeRequired)
                Invoke(new MethodInvoker(() =>
                {
                    SetFormCarInfo(carInfo, isplate, isCard, isMember);
                    return;
                }));
            eosPlateControl1.Enabled = true;




            if (carInfo == null || (string.IsNullOrEmpty(carInfo.CardNumber) && string.IsNullOrEmpty(carInfo.Plate) && string.IsNullOrEmpty(carInfo.MemberCode) && string.IsNullOrEmpty(carInfo.MemberFullName)))
            {

                infoGridControl.DataSource = new List<CardInfoView>() { };
                infoGridControl.RefreshDataSource();
                infoGridControl.Refresh();
                memberCodeTextBox.Text = "";
                grbMemberInfo.Visible = false;
                if (carInfo == null && !isCard)
                    cardTextBox.Text = "";
                eosPlateControl1.Clear();
                //eosIpCamView1.Plate = "";
                flowLayoutPanel1.Enabled = false;
                cancelButton.Enabled = false;
                currentCarInfo = null;
                eosPlateControl1.Focus();
                carPicture.Image = null;
                return;
            }


            if (string.IsNullOrEmpty(eosPlateControl1.Plate) || (eosPlateControl1.Plate.Contains("*") && eosPlateControl1.Plate != carInfo.Plate))
                eosPlateControl1.Plate = carInfo.Plate;

            enterDateLabel.Text = "";
            ////carInfoLabel.Text = Environment.NewLine;
            infoGridControl.DataSource = null;

            if (isplate/*!string.IsNullOrEmpty(eosPlateControl1.Plate)*/)
            {
                //if(carInfo == null || carid)
                if (string.IsNullOrEmpty(cardTextBox.Text))
                    cardTextBox.Text = SetCardIdInTextBox(carInfo.CardNumber);
                //if (string.IsNullOrEmpty(memberCodeTextBox.Text))

            }
            eosPlateControl1.Enabled = !(isMember || carInfo.MemberId > 0);
            flowLayoutPanel1.Enabled = true;
            if (isMember/*!string.IsNullOrEmpty(memberCodeTextBox.Text)*/)
            {
                if (carInfo == null || carInfo.MemberId == 0)
                {
                    MessageShowError("عضوی با این مشخصات وجود ندارد");
                    return;
                }
                if (string.IsNullOrEmpty(eosPlateControl1.Plate) || (eosPlateControl1.Plate.Contains("*") && eosPlateControl1.Plate != carInfo.Plate))
                    eosPlateControl1.Plate = carInfo.Plate;
                //if (string.IsNullOrEmpty(cardTextBox.Text))
                cardTextBox.Text = SetCardIdInTextBox(carInfo.CardNumber);
                //cardTextBox.Text = carInfo.CardNumber;
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
                if (string.IsNullOrEmpty(eosPlateControl1.Plate) && (carInfo.MemberId <= 0 || carInfo.MemberCars?.Count <= 1))
                    eosPlateControl1.Plate = !string.IsNullOrEmpty(carInfo.Plate) ? carInfo.Plate : eosPlateControl1.Plate;
                //if (string.IsNullOrEmpty(memberCodeTextBox.Text))
                memberCodeTextBox.Text = carInfo.MemberCode;
                cardTextBox.Text = SetCardIdInTextBox(carInfo.CardNumber);
            }
            carSearchButton.Hide();


            //bool hasMemberCode = false;

            //if (carInfo != null && !String.IsNullOrEmpty(carInfo.MemberCode))
            //    hasMemberCode = true;

            //ChangeColorForMember(isMember || hasMemberCode);
            //_billControlType = carInfo?.BillControlType ?? BillControlTypes.Normal;
            //if ((carInfo.EnterDateTime == null || carInfo.EnterDateTime <= DateTime.MinValue) && (isMember || hasMemberCode))
            //{
            //    try
            //    {
            //        var response = GetJsonObjecToLinkAndWait<List<MemberCreditDto>>(ApiAddress.TrafficApi.GetMemberCurrentCreditInfo, carInfo?.MemberId);
            //        if (response != null && response.Values?.Count > 0)
            //            ShowMemberCreditInfo(response.Values);
            //    }
            //    catch { /*ignored*/}
            //}





            if (currentDoor.DoorType == DoorTypes.Entrance && (carInfo.EnterDateTime != null || carInfo.EnterDateTime > DateTime.MinValue))
            {
                carEnterButton.Enabled = true;
                controlBillCheckBox.Enabled = true;
                carExitButton.Enabled = false;
                if (checkBoxExitWithoutEntrance.Checked)
                {
                    carExitButton.Enabled = true;
                }
                else
                {
                    MessageShowError("1ورودی برای این خودرو ثبت نشده است");
                    enterDateLabel.Text = "1ورودی برای این خودرو ثبت نشده است";
                    //-- - inja
                }

                carSearchButton.Show();
            }
            else if (currentDoor.DoorType == DoorTypes.Exit && (carInfo.EnterDateTime == null || carInfo.EnterDateTime <= DateTime.MinValue))
            {
                carEnterButton.Enabled = true;
                controlBillCheckBox.Enabled = true;
                carExitButton.Enabled = false;
                if (checkBoxExitWithoutEntrance.Checked)
                {
                    carExitButton.Enabled = true;
                }
                else
                {
                    MessageShowError("2ورودی برای این خودرو ثبت نشده است");
                }
                carSearchButton.Show();
                enterDateLabel.Text = "ورودی ثبت نشده است";
            }
            else
            {
                carEnterButton.Enabled = carInfo.EnterDateTime == null || carInfo.EnterDateTime <= DateTime.MinValue;
                controlBillCheckBox.Enabled = carEnterButton.Enabled;
                carExitButton.Enabled = !(carInfo.EnterDateTime == null || carInfo.EnterDateTime <= DateTime.MinValue);
                if (checkBoxExitWithoutEntrance.Checked)
                {
                    carExitButton.Enabled = true;
                }

                if (carInfo.EnterDateTime == null)
                {

                    enterDateLabel.Text = "ورودی ثبت نشده است";
                    carSearchButton.Show();
                    if (carInfo.MemberCars != null /*&& carInfo.MemberCars.Count > 1*/ && !carInfo.MemberCars.Any(q => q.Plate == eosPlateControl1.Plate))
                    {
                        eosPlateControl1.Clear();
                        currentCarInfo = carInfo;
                        eosPlateSelector1.Plates = carInfo.MemberCars.ToList();
                        eosPlateSelector1.Tag = carInfo.MemberId;
                        ShowPopup(false);
                        cancelButton.Enabled = true;
                        eosPlateSelector1.Focus();
                        return;
                    }
                    else if (string.IsNullOrEmpty(eosPlateControl1.Plate))
                    {
                        eosPlateControl1.Plate = carInfo.MemberCars?.FirstOrDefault()?.Plate ?? "";
                    }
                }
                else
                {
                    enterDateLabel.Text = (carInfo.EnterDateTime == null || carInfo.EnterDateTime <= DateTime.MinValue) ? "" : "ورود:" +/*Environment.NewLine+*/ carInfo.EnterDateTime.Value.ToPersianDatetime()/* + "                                 " + Environment.NewLine*/;

                }


            }

            if (!string.IsNullOrEmpty(carInfo.MemberTariffName))
                tariffTextBox.Text = carInfo.MemberTariffName;

            //carNameLabel.Text = carInfo.CarName;
            //carTypeLabel.Text = eosPlateControl1.CarType.DisplayString();
            //modelLabel.Text = "پژو 405";
            //colorLabel.Text = "آلبالویی";
            if (!string.IsNullOrEmpty(carInfo.MemberCode))
                memberCodeTextBox.Text = carInfo.MemberCode;
            infoGridControl.DataSource = new List<CardInfoView>() { new CardInfoView
            {
                EntranceDateTime = (carInfo.EnterDateTime == null || carInfo.EnterDateTime <= DateTime.MinValue) ? "" : /*Environment.NewLine+*/ carInfo.EnterDateTime.Value.ToPersianDatetime(),
                CarName=carInfo.CarName,
                CarType = eosPlateControl1.CarType.DisplayString(),
                CarColor = carInfo.CarColor,
                CarModle = carInfo.CarModel,
                MemberName=carInfo.MemberFullName
            }};
            infoGridControl.RefreshDataSource();
            infoGridControl.Refresh();
            //carInfoLabel.Text += string.IsNullOrEmpty(carInfo.CarName) ? "" : $"نام خودرو:   {carInfo.CarName}" + Environment.NewLine + Environment.NewLine;
            //carInfoLabel.Text += string.IsNullOrEmpty(carInfo.MemberFullName) ? "" : $"نام عضو: {carInfo.MemberFullName}" + Environment.NewLine + Environment.NewLine;
            //carInfoLabel.Text += string.IsNullOrEmpty(carInfo.MemberTariffName) ? "" : $"نام تعرفه: {carInfo.MemberTariffName}" + Environment.NewLine + Environment.NewLine;
            //carInfoLabel.Text += string.IsNullOrEmpty(carInfo.MemberTariffName) ? "" : $"نام تعرفه: {carInfo.MemberTariffName}" + Environment.NewLine + Environment.NewLine;

            carPicture.Image = GraphicsHelper.ImageFromBytes(carInfo.EnteranceImage);
            carPicture.Refresh();
            currentCarInfo = carInfo;
            currentCarInfo.PersistOn = DateTime.Now;
            cancelButton.Enabled = true;

            flowLayoutPanel1.Focus();
            SetInfo(carInfo.MemberCars?.FirstOrDefault()?.DtoViewCarColorTitle ?? carInfo.CarColor, carInfo.MemberCars?.FirstOrDefault()?.DtoViewCarModelTitle ?? carInfo.CarModel, carInfo.CarName);
            var temp = tariffTextBox.TextBoxObject.SelectedValue;
            try
            {
                if (carInfo.MemberTariffId > 0)
                    tariffTextBox.TextBoxObject.SelectedValue = carInfo.MemberTariffId;
            }
            catch { tariffTextBox.TextBoxObject.SelectedValue = temp; }
            flowLayoutPanel1.Focus();

            if (recivedPlateFromExitCamera >= 0 && currentDoor.ExitCameraId.HasValue && currentDoor.ExitCameraId != 0)
            {
                if (carEnterButton.Enabled && recivedPlateFromExitCamera == 1)
                {
                    if (!checkBoxExitWithoutEntrance.Checked)
                    {
                        MessageShowWarning("خودرو درحال خروج است ولی ورودی برای آن ثبت نگردیده است", messageTimeOut);
                        cancelAutoSystem = true;
                    }
                    else
                    {
                        var currentPlate = eosPlateControl1.Plate;

                        if (_lastAutoEnterPlate == currentPlate &&
                            (DateTime.Now - _lastAutoEnterTime).TotalSeconds < 15)
                        {
                            return;
                        }

                        _lastAutoEnterPlate = currentPlate;
                        _lastAutoEnterTime = DateTime.Now;

                        carEnterButton_Click(this, new EventArgs());

                      
                        carExitButton_Click(this, new EventArgs());
                        cancelAutoSystem = true; // چون در دو خط بالا ورود و خروج خودکار را زده ام
                        enterDateLabel.Text += Environment.NewLine + "خروج خودکار بدون وردی";
                    }
                }
                else if (carExitButton.Enabled && recivedPlateFromExitCamera == 0 && !checkBoxExitWithoutEntrance.Checked)
                {
                    if (!carExitButton.Enabled)
                    {
                        if (!checkBoxEnterWithoutBeforeExit.Checked)
                        {
                            MessageShowWarning("خودرو درحال ورود است اما قبلا ورود ثبت شده است", messageTimeOut);
                            cancelAutoSystem = true;
                        }
                        else
                        {
                            //این رو جهت ورود چند باره اضافه می کنم
                            var currentPlate = eosPlateControl1.Plate;

                            if (_lastAutoEnterPlate == currentPlate &&
                                (DateTime.Now - _lastAutoEnterTime).TotalSeconds < 15)
                            {
                                return;
                            }

                            _lastAutoEnterPlate = currentPlate;
                            _lastAutoEnterTime = DateTime.Now;

                            carEnterButton_Click(this, new EventArgs());
                            carEnterButton_Click(this, new EventArgs());
                            cancelAutoSystem = true;
                        }
                    }
                }
                ///recivedPlateFromExitCamera = -1;
                ///نمیدونم این چرا مقدارش غیرمعتبر میشد. من برش داشتم
            }
            // این کد رو برای ورود چندباره درصورتی که از دوربین ورودی اومده اضافه کردم
            if (checkBoxEnterWithoutBeforeExit.Checked && !cancelAutoSystem && recivedPlateFromExitCamera == 0)
            {
                carEnterButton_Click(this, new EventArgs());
                cancelAutoSystem = true;
            }
            if (entranceTypeComboBox.SelectedIndex == 1 && carEnterButton.Enabled && (!carExitButton.Enabled || checkBoxExitWithoutEntrance.Checked))
            {
                if (!cancelAutoSystem)

                    carEnterButton_Click(this, new EventArgs());
                else
                    cancelAutoSystem = false;

            }
            //else if (entranceTypeComboBox.SelectedIndex == 2 && carEnterButton.Enabled && !carExitButton.Enabled && !string.IsNullOrEmpty(carInfo.MemberCode))
            // این شرط را برای استیل البرز اضافه کردیم جهت ورود چند باره بدون خروج
            else if (entranceTypeComboBox.SelectedIndex == 2 &&
                (
                    (carEnterButton.Enabled && !carExitButton.Enabled) || checkBoxEnterWithoutBeforeExit.Checked
                )
                && !string.IsNullOrEmpty(carInfo.MemberCode))
            {
                //if (carEnterButton.Enabled && !carExitButton.Enabled)
                if (!cancelAutoSystem)
                    carEnterButton_Click(this, new EventArgs());
                else
                    cancelAutoSystem = false;


            }
            else if (carExitButton.Enabled && !carEnterButton.Enabled && (exitTypeComboBox.SelectedIndex == 1 || (exitTypeComboBox.SelectedIndex == 2 && !string.IsNullOrEmpty(carInfo.MemberCode))))
            {
                if (!cancelAutoSystem)
                    carExitButton_Click(this, new EventArgs());
                else
                    cancelAutoSystem = false;
            }

            if (currentCarInfo != null && currentCarInfo.BillControlType == BillControlTypes.InitialBillControl && currentCarInfo.EnterDateTime != null)
                ShowBillCheckControl(currentCarInfo);
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SetFormCarInfo end Duration:({Environment.TickCount - start}) ");

        }

        public void ShowBillCheckControl(CarTrafficInfoDto carInfo)
        {
            billCheckerControl1.Clear();
            billCheckerControl1.EnterDateTime = carInfo.EnterDateTime.Value;
            billCheckerControl1.Id = carInfo.DumpId;
            this.PopupControl = billCheckerControl1;
            ShowPopup(false);
            billCheckerControl1.Focus();
            return;

        }
        public ManualTrafficControlForm(ParkingEntity parking)
        {
            InitializeComponent();
            _parking = parking;
            double.TryParse(ConfigurationManager.AppSettings["ClearFormMinute"], out clearFormMinute);

            _useSimilarPlateForMember = false;
            bool.TryParse(ConfigurationManager.AppSettings["UseSimilarPlateForMember"], out _useSimilarPlateForMember);

            if (clearFormMinute <= 0)
                clearFormMinute = 5;
            Task.Factory.StartNew(() => { GetParkingDoorDevices(); });
            eosPlateSelector1.CarColors = PublicVariables.CarColors;
            eosPlateSelector1.CarModels = PublicVariables.CarModels;
            //plateDetectedButton2.Show();
            infoGridControl.Enabled = PublicVariables.CheckUserAccess(AccessItemTypes.ParkingManualIOEditCarInfo);

            newCargoColumn.Visible = LockOprator.HasAccessToCargoAbility;
        }

        void InitFormByTraficType()
        {
            if (currentDoor == null)
                return;
            //memberCodeTextBox.Enabled=currentDoor.DoorTrafficType != EosParking.Core.Enums.DoorTrafficTypes.NonMemberOnly;
            //_useSimilarPlateForMember = currentDoor.DoorTrafficType == DoorTrafficTypes.MemberOnly;
            carExitButton.Visible = currentDoor.DoorType == DoorTypes.Both || currentDoor.DoorType == DoorTypes.Exit;
            carEnterButton.Visible = currentDoor.DoorType == DoorTypes.Both || currentDoor.DoorType == DoorTypes.Entrance;
            controlBillCheckBox.Visible = carEnterButton.Visible && _parking.HasBillControl &&
                PublicVariables.CheckUserAccess(AccessItemTypes.parkingManualIOBillControl);


        }

        void InitFormByEntryAuthorizaitionType()
        {
            if (currentDoor == null)
                return;
            cardTextBox.Enabled = currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.Card
            || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.QRCode
            || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.QRCodeAndPlate
            || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.CardAndPictur
            || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.CardAndPlate
            || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.CardOrPlate;

            //eosPlateControl1.Enabled = currentDoor.EntryAuthorizaitionType==EntryAuthorizaitionTypes.CardAndPlate
            //    || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.Plate
            //    || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.QRCodeAndPlate
            //    || currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.CardOrPlate;

            switch (currentDoor.EntryAuthorizaitionType)
            {
                case EosParking.Core.Enums.EntryAuthorizaitionTypes.Card:
                    break;
                case EosParking.Core.Enums.EntryAuthorizaitionTypes.CardAndPictur:
                    break;
                case EosParking.Core.Enums.EntryAuthorizaitionTypes.CardAndPlate:
                    break;
            }
        }

        public void FillForm()
        {
            try
            {
                WaitingLockForm = false;
                infoLabel.Text = "نام کاربر: " + PublicVariables.CurrentUser.FullName;
                if (currentDoor != null)
                {
                    infoLabel.Text += "     درب جاری کاربر: " + currentDoor.Title;
                    infoLabel.Text += "     نوع درب: " + currentDoor.DoorType.DisplayString();
                    //infoLabel.Text += "     نوع تردد: " + currentDoor.DoorTrafficType.DisplayString();
                }

                try
                {
                    infoLabel.Text += "     تعرفه: " + currentTarrifTitle;
                }
                catch { infoLabel.Text += "-"; }

                infoLabel.Text += "     آخرین بروزرسانی لیست: " + lastUpdateTimeGridDataSource;
            }
            catch (Exception)
            {
                // ignored
            }
        }

        private void ManualTrafficControlForm_Shown(object sender, EventArgs e)
        {
            PublicVariables.RefreshLogin();
            if (_parking.Id != PublicVariables.CurrentUser.CurrentParking)
            {
                MessageShowError("در این زمان شیفتی روی این پارکینگ برای شما تعریف نگردیده است");
                Close();
                return;
            }
            GetUserDoor();
            Task.Factory.StartNew(() => { scaduleTimer_Tick(this, new EventArgs()); }).Wait(100);
            if (currentDoor == null)
            {
                MessageShowError("در این زمان شیفتی برای شما تعریف نگردیده است");
                Close();
                return;
            }

            GetParkingTariffs();
            FillForm();
            scaduleTimer.Enabled = true;
            eosPlateControl1.SkipMiddlePart = bool.Parse(ConfigurationManager.AppSettings["SkipMiddlePart"]?.ToLower() ?? "false");
            SetIpCamRuntimeSettings();

        }
        private void eosPlateControl1_Validated(object sender, EventArgs e)
        {
            int start = Environment.TickCount;

            if ((currentCarInfo != null && (DateTime.Now - currentCarInfo.EnterDateTime)?.TotalMinutes <= clearFormMinute) || !eosPlateControl1.IsValid)
                return;
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> eosPlateControl1_Validated #1 Duration:({Environment.TickCount - start}) ");
            //if (currentCarInfo?.Plate == eosPlateControl1.Plate)
            //{
            //    flowLayoutPanel1.Focus();
            //    return;
            //}

            PlaySound();
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> eosPlateControl1_Validated #2 Duration:({Environment.TickCount - start}) ");

            if (currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.CardAndPlate && string.IsNullOrEmpty(cardTextBox.Text))
            {
                cardTextBox.Focus();
                return;
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> eosPlateControl1_Validated #3 Duration:({Environment.TickCount - start}) ");


            //_currentPlateImage = sender as Bitmap;
            if (sender is Bitmap bitmap)
                _currentPlateImage = bitmap;
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> eosPlateControl1_Validated #4 Duration:({Environment.TickCount - start}) ");

            //if (carExitButton.Visible && checkBoxExitWithoutEntrance.Checked)
            //{
            //    CreateEnterDump();
            //}
            GetCarInfo(true, false, false);
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> eosPlateControl1_Validated #5 Duration:({Environment.TickCount - start}) ");

            if (CheckControlList() && !billCheckerControl1.Visible)
                flowLayoutPanel1_Enter(sender, e);
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> eosPlateControl1_Validated end Duration:({Environment.TickCount - start}) ");

        }

        private void cardTextBox_Validated(object sender, EventArgs e)
        {
            if (currentDoor == null)
                return;

            if (sender != memberCodeTextBox && currentDoor.EntryAuthorizaitionType == EntryAuthorizaitionTypes.CardAndPlate && string.IsNullOrEmpty(eosPlateControl1.Plate))
            {
                eosPlateControl1.Focus();
                return;
            }
            GetCarInfo(false, sender == cardTextBox, sender == memberCodeTextBox);
            if (PopupControl == null || !PopupControl.Visible)
                flowLayoutPanel1_Enter(sender, e);
        }

        private void carEnterButton_Click(object sender, EventArgs e)
        {
            if ((checkBoxTrafficMustHavePlate.Checked) && (String.IsNullOrEmpty(eosPlateControl1.Plate.Trim())))
            {
                MessageBox.Show("ثبت شماره پلاک خودرو اجباری می باشد. لطفاً آنرا ثبت نمایید");
                cancelButton_Click(sender, e);
                return;
            }
            var ct = eosPlateControl1.CarType;
            carEnterButton.Enabled = false;
            controlBillCheckBox.Enabled = false;
            try
            {
                eosIpCamView1.WaiteForNextPlate = true;
                CreateEnterDump();
            }
            catch { }
            finally
            {
                _currentPlateImage = null;
                eosIpCamView1.WaiteForNextPlate = false;
                carEnterButton.Enabled = true;
                controlBillCheckBox.Enabled = true;
                controlBillCheckBox.Checked = false;
                additionalInfoLabel.Text = String.Empty;
                ChangeColorForMember(false);
                ReadUHFList();
            }
            pauseReadingStPro2000 = false;
            pauseReadingReader = false;

        }

        private void ReadUHFList()
        {


            try
            {
                if (uhfListData == null)
                    return;
                if (uhfListData.Count == 0)
                    return;
                if (cancelButton.Enabled)
                    return;

                string currentCardID = "";
                if (cardTextBox.InvokeRequired)
                {
                    cardTextBox.Invoke(new MethodInvoker(() =>
                    {
                        currentCardID = cardTextBox.Text;
                    }));
                }
                else
                {
                    currentCardID = cardTextBox.Text;
                }
                if (!String.IsNullOrEmpty(currentCardID))
                    return;




                var selectedUHF = uhfListData.OrderBy(q => q.DateTime).Select(q => q.Data).FirstOrDefault();


                if (cardTextBox.InvokeRequired)
                {
                    cardTextBox.Invoke(new MethodInvoker(() =>
                    {
                        cardTextBox.Text = SetCardIdInTextBox(selectedUHF, "uhf");
                        if (!string.IsNullOrEmpty(cardTextBox.Text))
                            cardTextBox.Validate();
                    }));
                }
                else
                {
                    cardTextBox.Text = SetCardIdInTextBox(selectedUHF, "uhf");
                    if (!string.IsNullOrEmpty(cardTextBox.Text))
                        cardTextBox.Validate();
                }



                uhfListData.RemoveAll(s => s.Data == selectedUHF);
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> ReadUHFList CardID:{selectedUHF}");
            }
            catch (Exception ex)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, $">>>> ReadUHFList ERR-->:{ex.Message}");
            }

        }

        private void carExitButton_Click(object sender, EventArgs e)
        {
            string msgExit = "";
            if //(LockOprator.HasWebCartable)
                ((ConfigurationManager.AppSettings["ExitPermission"]?.Trim().ToLower() ?? "false") == "true")
            {
                if (!CarExitPermission(ref msgExit))
                {
                    if (msgExit == "")
                    {
                        msgExit = "مجوز خروج این خودرو صادر نگردیده است";
                    }
                    MessageBox.Show(msgExit);
                    return;
                }
            }
            eosExitIpCamView2.WaiteForNextPlate = true;
            carExitButton.Enabled = false;
            try
            {

                if ((currentCarInfo.EnterDateTime == null) && (checkBoxExitWithoutEntrance.Checked))
                {
                    CreateEnterDump(true);
                    GetCarInfo(true, false, false);
                }

                DoExitDump();
            }
            catch { }
            finally
            {
                _currentPlateImage = null;
                carExitButton.Enabled = true;
                additionalInfoLabel.Text = String.Empty;
                eosExitIpCamView2.WaiteForNextPlate = false;
                ChangeColorForMember(false);
                ReadUHFList();
            }

            pauseReadingStPro2000 = false;
            pauseReadingReader = false;

        }

        private bool CarExitPermission(ref string msg)
        {

            long dumpID = currentCarInfo?.DumpId ?? 0;
            bool dumpExitPermission = currentCarInfo?.ExitPermission ?? false;
            DateTime dumpExitPermissionPersistOn = currentCarInfo?.ExitPermissionPersistOn ?? DateTime.Now;
            long dumpExitPermissionPersistBy = currentCarInfo?.ExitPermissionPersistBy ?? 0;
            if (dumpExitPermission)
            {
                msg = "";
            }
            else
            {
                msg = $"مجوز خروج تردد شماره «{dumpID}»  صادر نگردیده است";
            }
            return dumpExitPermission;

        }

        private void DoExitDump()
        {
            //using (var r = new TrafficRepository())
            //{
            //    var x=r.DoExitDump(new EosParking.Data.EF.Entities.TrafficDumpEntity() {Id=10,MemberId=0,EnterDateTime=DateTime.Parse("2019-07-02 09:11:50", new System.Globalization.CultureInfo("en-US", false)),ExitDateTime=DateTime.Now });
            //}
            byte[] bmpByte;
            long iDoorID = currentDoor.Id;

            if (eosExitIpCamView2.IsConnect)
            {
                eosExitIpCamView2.CapturBitmap(true);
                Thread.Sleep(500);
                bmpByte = eosIpCamView1.CompressedFrameBufferToByte(500, 500, true);
            }
            else
            {
                if (eosIpCamView1.IsConnect)
                    eosIpCamView1.CapturBitmap(true);
                Thread.Sleep(500);
                bmpByte = eosIpCamView1.CompressedFrameBufferToByte(500, 500, true);
            }
            if (currentCarInfo == null && string.IsNullOrEmpty(eosPlateControl1.Plate))
            {
                if (!checkBoxExitWithoutEntrance.Checked)
                {
                    MessageShowValidationError("لطفا اطلاعات را وارد کنید");
                }
                return;
            }

            switch (currentDoor.EntryAuthorizaitionType)
            {
                //case EntryAuthorizaitionTypes.QRCode:
                case EntryAuthorizaitionTypes.Card: if (string.IsNullOrEmpty(cardTextBox.Text)) { MessageShowValidationError("شماره کارت الزامی می باشد"); return; } break;
                case EntryAuthorizaitionTypes.Plate: if (!eosPlateControl1.IsValid) { MessageShowValidationError("شماره پلاک الزامی می باشد"); return; } break;
                case EntryAuthorizaitionTypes.CardAndPictur:
                    if (string.IsNullOrEmpty(cardTextBox.Text)) { MessageShowValidationError("شماره کارت الزامی می باشد"); return; }
                    //else if (eosIpCamView1.FrameBuffer == null)
                    //{
                    //    eosIpCamView1.CapturBitmap(true);
                    //    Thread.Sleep(500);
                    //    Application.DoEvents();
                    //    if (eosIpCamView1.FrameBuffer == null)
                    //    {
                    //        MessageShowError("متاسفانه تصویر خودرو دریافت نشد. تصویر الزامی می باشد"); return;
                    //    }
                    //}
                    break;
                case EntryAuthorizaitionTypes.CardAndPlate:
                    //case EntryAuthorizaitionTypes.QRCodeAndPlate:
                    if (string.IsNullOrEmpty(cardTextBox.Text)) { MessageShowValidationError("شماره کارت الزامی می باشد"); return; }
                    else if (!eosPlateControl1.IsValid) { MessageShowValidationError("شماره پلاک الزامی می باشد"); return; }
                    break;
            }

            if (currentCarInfo.ControlType != ControlListTypes.None)
            {
                if (!CheckControlList()) return;
            }

            if (currentDoor.DoorType != DoorTypes.Entrance && currentCarInfo.EnterDateTime == null || currentCarInfo.EnterDateTime <= DateTime.MinValue)
            {
                carEnterButton.Enabled = true;
                controlBillCheckBox.Enabled = true;
                carExitButton.Enabled = false;
                if (checkBoxExitWithoutEntrance.Checked)
                {
                    carExitButton.Enabled = true;
                }
                else
                {
                    MessageShowError("ورودی برای این خودرو ثبت نشده است3");
                    return;

                }

            }



            BillControlTypes billControl = BillControlTypes.Normal;
            if (currentCarInfo.BillControlType == BillControlTypes.InitialBillControl)
            {
                billControl = (billCheckerControl1.IsValidBillIdNumbers) ? BillControlTypes.RegisteredIdsBillControl : BillControlTypes.NotRegistereIdsdBillControl;

            }

            var item = (infoGridControl.DataSource as List<CardInfoView>)?.FirstOrDefault();
            string _description = !String.IsNullOrEmpty(billCheckerControl1.IdsBillControl) ? billCheckerControl1.IdsBillControl : "";
            if ((currentCarInfo.EnterDateTime == null) && (checkBoxExitWithoutEntrance.Checked))
            {
                ////CreateEnterDump(false);

                ////DoExitDump();
                return;
                var aa = currentCarInfo;
                GetCarInfo(true, false, false);
                var bb = currentCarInfo;
                _description += "«خروج فاقد ورودی»";
                //make enterance record!
            }

            var cType = eosPlateControl1?.CarType;

            var dump = new TrafficDumpEntity
            {
                //DoorId = currentDoor.Id,
                ExitDoorId = currentDoor.Id,
                CardId = currentCarInfo?.CardId,
                MemberId = currentCarInfo?.MemberId,
                CarPlate = eosPlateControl1.Plate,
                Id = currentCarInfo?.DumpId ?? 0,
                CarId = currentCarInfo?.CarId,
                CarType = eosPlateControl1?.CarType ?? CarTypes.Car,
                //Car=new CarEntity { DtoViewCarColorTitle= item.CarColor,DtoViewCarModelTitle=item.CarModle},
                DtoViewCarModelTitle = item.CarModle,
                DtoViewCarColorTitle = item.CarColor,
                SourceType = DumpSourceTypes.UserManual,
                IdOnDevice = 0,
                PersistBy = PublicVariables.CurrentUser.Id,
                TariffId = long.Parse(tariffTextBox.TextBoxObject.SelectedValue.ToString()),
                ExitDateTime = null, //bug #18281 ////ExitDateTime = DateTime.Now,
                EnterDateTime = currentCarInfo.EnterDateTime.Value,
                DtoViewTrafficImages = new List<TrafficDumpImageEntity> { new TrafficDumpImageEntity { TrafficImage = bmpByte } },
                DoSave = true,
                BillControlType = billControl,
                Description = _description,
                //Description = !String.IsNullOrEmpty(billCheckerControl1.IdsBillControl) ? billCheckerControl1.IdsBillControl : null,
            };

            var response = PostJsonObjecToLinkAndWait<ExitBillDto>(ApiAddress.TrafficApi.DoExitDump, dump, false);
            //if (this.InvokeRequired)
            //Invoke(new MethodInvoker(() =>
            //{
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                response.Values.DumpId = currentCarInfo?.DumpId ?? 0;

                if (response.Values != null)
                {
                    string receipt = String.Empty;
                    bool isMember = ((!String.IsNullOrEmpty(response.Values.CardNumber)) || (!String.IsNullOrEmpty(response.Values.MemberCode)));
                    string sWarning = "«عدم نمایش گزارش خروج»";
                    if ((!checkBoxDontShowPayFormNotMembers.Checked) || (isMember))
                    {

                        receipt = PayForm.ShowPay(response.Values, currentDoor, pcPos, ref currentPayForm, timeOutSec: (response.Values.CommonCost <= 0 &&
                                                                                                exitTypeComboBox.SelectedIndex == 0) ? 0 : PublicVariables.MessageDialogTimeoutSecond);
                        if (isMember)
                            sWarning = "«خروج ماشین عضو»";
                        else
                            sWarning = "";
                    }
                    enterDateLabel.Text += Environment.NewLine + sWarning;


                    //var receipt = PayForm.ShowPay(response.Values, currentDoor, timeOutSec: (response.Values.CommonCost <= 0 &&
                    //                                                                        exitTypeComboBox.SelectedIndex == 0) ? 0 : PublicVariables.MessageDialogTimeoutSecond);
                    if (!string.IsNullOrEmpty(receipt) || response.Values.CommonCost == 0)
                    {
                        if (exitPrintCheckBox.Checked && !string.IsNullOrEmpty(receipt))
                            PrintExitFish(response.Values, receipt);
                        //MessageShowSucsess("پرداخت گردید");
                        OpenGate(true);
                        OpenGateG4(relayData);
                        OpenGate(topGateDeviceID, true);
                    }
                }
                /*
                else
                    OpenGate(true);
                    OpenGateG4(relayData);
                    OpenGate(topGateDeviceID, true);
                 */
                //else
                //    MessageShowSucsess("پرداخت نگردید");
                SetFormCarInfo(null, false, false, false);
                //TODO disable reload after insert
                ////Task.Factory.StartNew(() => { scaduleTimer_Tick(this, new EventArgs()); }).Wait(100);
            }
            else
                MessageShowError(response);
            eosIpCamView1.WaiteForNextPlate = false;
            eosExitIpCamView2.WaiteForNextPlate = false;
        }

        private void OpenGateG4(RelayDataGate4 relayData)
        {
            int start = Environment.TickCount;
            if (relayData == null)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateG4(relayData): IS NULL");
                return;

            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateG4(relayData) START: {relayData.Name},{relayData.Ip},{relayData.Port},{relayData.Relay}");

            try
            {

                if (!checkBoxG4FastCommand.Checked)
                {
                    Thread myNewThread = new Thread(() => SendCommandToG4(relayData.Ip, relayData.Port, (relayData.Relay ?? 0)));
                    myNewThread.Start();
                }
                else
                {

                    Thread myNewThread = new Thread(() => SendCommandToG4v2());
                    myNewThread.Start();
                }
                //SendCommandToG4(relayData.Ip, relayData.Port, (relayData.Relay??0));
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateG4(relayData) END duration:{Environment.TickCount - start}: {relayData.Name},{relayData.Ip},{relayData.Port},{relayData.Relay}");

            }
            catch
            {


            }






        }
        private void OpenGateG4(int iDoorID)
        {
            string query = @"select DoorID, DoorType, GateDeviceID, [IP], [Port], iif(Relay is null, 0, Relay) as Relay from 
                                (
                                select *, (select Ip from Equipments where id = a.GateDeviceID) as [IP],
                                (select Port from Equipments where id = a.GateDeviceID) as [Port],
                                (select Relay from Equipments where id = a.GateDeviceID) as Relay

                                from(
                                SELECT        Id AS DoorID, DoorType
                                , iif(DoorType = 0, GateEntranceDeviceId, GateExitDeviceId) GateDeviceID

                                FROM            dbo.ParkingDoors
                                ) a
                                where a.DoorID = %door_id%
                                ) b".Replace("%door_id%", iDoorID.ToString());



            var connString = GetDBConnection();//@"Data Source=(Local)\sql2019;Initial Catalog=EosParking;Persist Security Info=True;User ID=sa;password=12345678";
            //System.Configuration.ConfigurationManager.
            //ConnectionStrings["EosParkingContextConnection"].ConnectionString;


            try
            {
                var table = new DataTable();
                using (var da = new SqlDataAdapter(query, connString))
                {
                    da.Fill(table);
                    if (table.Rows.Count > 0)
                    {
                        string ip = table.Rows[0].Field<string>("IP");
                        int port = table.Rows[0].Field<int>("port");
                        int relay = table.Rows[0].Field<int>("relay");
                        SendCommandToG4(ip, port, relay);
                        //int aa = 1;
                    }
                }


            }
            catch
            {

            }


        }
        private string GetDBConnection()
        {
            string connection = ConfigurationManager.ConnectionStrings["EosParkingContextConnection"].ToString();
            return connection; // @"Data Source=(Local)\sql2019;Initial Catalog=EosParking;Persist Security Info=True;User ID=sa;password=12345678";
        }
        private void SendCommandToG4(string ip, int port, int relay)
        {
            this.Invoke((MethodInvoker)delegate { doorStateLabel.Text = "..."; });
            int start = Environment.TickCount;
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SendCommandToG4 START ");

            GateControler _gate = null;
            bool bGateOpened = false;
            _gate = new GateControler(ip, port);
            var isReady = _gate.PrepareBoard();
            if (isReady)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SendCommandToG4(isReady)");

                _gate?.GetBoardStatus(); // GC V1.0 // show this board
                var result = _gate?.RunCommandAndGetResult(GateControler.CommandType.OpenGate, relay, 5);
                string sCommandResult = _gate?.ParsResult(result).ToString();

                if (sCommandResult.ToLower().Trim() == "STATUS_OK".ToLower().Trim())
                {
                    if (relayBuzzerCheckBox.Checked)
                    {
                        _gate?.TriggerBuzzerTone(3);
                    }
                    bGateOpened = true;
                }
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SendCommandToG4(isReady:{isReady.ToString()},GateOpened:{bGateOpened.ToString()})");
            string sMSG = "";
            if (bGateOpened)
            {
                //doorStateLabel.ForeColor = Color.Green;
                sMSG = "درب باز شد";
            }
            else
            {
                //doorStateLabel.ForeColor = Color.Red;
                sMSG = "درب باز نشد";
                if (!isReady)
                {
                    sMSG += "\n رله یافت نشد";
                }
                else
                {
                    sMSG += "\n رله آماده دریافت دستور نیست";
                }
            }

            this.Invoke((MethodInvoker)delegate { doorStateLabel.Text = sMSG; });


            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SendCommandToG4 END duration:{Environment.TickCount - start}");


        }
        private void SendCommandToG4v2()
        {
            this.Invoke((MethodInvoker)delegate { doorStateLabel.Text = "..."; });
            int start = Environment.TickCount;
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SendCommandToG4v2 START ");
            bool bGateOpened = false;
            /*GateControler _gate = null;
            
            _gate = new GateControler(ip, port);
            var isReady = _gate.PrepareBoard();
            */
            if (GateIsReady)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SendCommandToG4v2(isReady)");

                _gateG4?.GetBoardStatus(); // GC V1.0 // show this board
                var result = _gateG4?.RunCommandAndGetResult(GateControler.CommandType.OpenGate, _gateG4Relay, 5);

                string sCommandResult = _gateG4?.ParsResult(result).ToString();

                if (sCommandResult.ToLower().Trim() == "STATUS_OK".ToLower().Trim())
                {
                    if (relayBuzzerCheckBox.Checked)
                    {
                        _gateG4?.TriggerBuzzerTone(3);
                    }
                    bGateOpened = true;
                }
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SendCommandToG4v2(GateOpened:{bGateOpened.ToString()})");
            string sMSG = "";
            if (bGateOpened)
            {
                //doorStateLabel.ForeColor = Color.Green;
                sMSG = "درب باز شد";
            }
            else
            {
                //doorStateLabel.ForeColor = Color.Red;
                sMSG = "درب باز نشد";
                if (!GateIsReady)
                {
                    sMSG += "\n رله یافت نشد";
                }
                else
                {
                    sMSG += "\n رله آماده دریافت دستور نیست";
                }

            }

            this.Invoke((MethodInvoker)delegate { doorStateLabel.Text = sMSG; });


            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> SendCommandToG4 END duration:{Environment.TickCount - start}");


        }


        void PrintExitFish(ExitBillDto value, string receipt)
        {
            if (!exitPrintCheckBox.Checked)
                return;
            //if(File.Exists(Application.StartupPath))
            if (PublicVariables.PrintAutomatic ||
                ShowQuestion(message: "آیا می خواهید فیش خروج چاپ شود؟") == DialogResult.OK)
            {
                //ignore
            }
            else
            {
                return;
            }

            var parameters = new List<KeyValuePair<string, object>>
            {
                new KeyValuePair<string, object>("ParkingName",_parking.ParkingName),
                new KeyValuePair<string, object>("Receipt",receipt),
            };
            EosParkingTools.Utils.ReportsViewer.PrintReportResourceSync<ExitBillDto>("ExitFishPrinter.mrt", new List<ExitBillDto> { value }, parameters: parameters);
        }

        private void OpenGate(bool forExit)
        {

            return;

            if (!CheckControlList(true))
                return;
            try
            {
                var gates = currentDoor.DtoViewEquipments.Where(q => q.Key.DeviceType == EquipmentTypes.Gate).ToList();

                if (gates == null || gates.Count == 0)
                    return;


                //var equipment = currentDoor.DtoViewEquipments.
                //    FirstOrDefault(q => q.Key.DeviceType == EquipmentTypes.Gate && q.Value == DoorTrafficTypes.All).Key;

                EquipmentEntity equipment = gates.FirstOrDefault(q => q.Value == DoorTrafficTypes.All).Key ??
                                            gates.FirstOrDefault(q => q.Value == DoorTrafficTypes.MemberOnly).Key;

                if (forExit)
                {

                    var equipmentTemp = gates.FirstOrDefault(q => q.Value == DoorTrafficTypes.MemberOnly).Key;
                    if (equipment.Id != equipmentTemp.Id)
                        equipment = equipmentTemp;
                }

                var dev = PublicVariables.ActiveDevices.DeviceManagers.FirstOrDefault(q => q.Equipment.Id == equipment.Id);
                if (dev != null && dev.IsConnect)
                {
                    bool openGate = false;
                    bool isFinish = false;
                    var t = Task.Factory.StartNew(() =>
                    {
                        openGate = dev.OpenGate();
                        isFinish = true;
                        doorStateLabel.Invoke(new MethodInvoker(() =>
                        {
                            doorStateLabel.Visible = true;
                            if (openGate)
                            {
                                doorStateLabel.ForeColor = Color.Green;
                                doorStateLabel.Text = "درب باز شد";
                            }
                            else
                            {
                                doorStateLabel.ForeColor = Color.Red;
                                doorStateLabel.Text = "درب باز نشد";
                            }
                        }));
                        Thread.Sleep(3500);
                        doorStateLabel.Invoke(new MethodInvoker(() =>
                        {
                            doorStateLabel.Text = "";
                        }));
                    });
                    t.Wait(1000);
                    //while(!t.IsCompleted && !t.IsCanceled && !t.IsFaulted)
                    //{
                    //    t.Wait(250);
                    //    Application.DoEvents();
                    //}

                }
            }
            catch (Exception)
            {
                // ignored
            }
        }

        private void gridView1_RowStyle(object sender, DevExpress.XtraGrid.Views.Grid.RowStyleEventArgs e)
        {
            try
            {
                if (e.RowHandle < 0)
                    return;
                var item = (gridView1.DataSource as List<ExitBillDto>)[e.RowHandle];
                if (item.ExitDateTime != null && item.ExitDateTime != item.EnterDateTime && item.ExitDateTime > DateTime.MinValue)
                {

                    e.Appearance.ForeColor = Color.DarkGreen;

                    /*if (item.CommonCost >= 0 && item.PayType == PayTypes.None)
                        e.Appearance.BackColor = Color.Yellow;*/
                    e.Appearance.Options.UseForeColor = true;
                    e.HighPriority = true;
                }
                else //if ((gridView1.DataSource as List<ExitBillDto>)[e.RowHandle].ExitDateTime == null)
                {
                    e.Appearance.ForeColor = Color.Black;
                    //e.Appearance.Options.UseForeColor = true;
                    e.HighPriority = false;
                }
            }
            catch { }
        }

        private void ManualTrafficControlForm_Load(object sender, EventArgs e)
        {
            plateDetectCheckBox.Visible = false;
            //#hardcode
            ////platelistButton.Visible = true;// (LockOprator.ModuleType == 1);// only ShahabANPR
            LoadLocalSetting();
        }

        private void eosPlateSelector1_ClickOkButton(object sender, EventArgs e)
        {
            if (/*(eosPlateSelector1.Plates.Count == 0 &&*/ string.IsNullOrEmpty(eosPlateSelector1.SelectedPlate?.Plate))
            {
                MessageShowError("پلاکی انتخاب نشد");

                eosPlateSelector1.NewPlateClick();
                return;
            }
            if (eosPlateSelector1.SelectedPlate.Id == 0)
                try
                {
                    var response = GetJsonObjecToLink<long>(ApiAddress.TariffApi.AddMemberCar, eosPlateSelector1.Tag.ToString() + $"&plate={eosPlateSelector1.SelectedPlate.Plate}&CarName={eosPlateSelector1.SelectedPlate.Name}&carType={eosPlateSelector1.SelectedPlate.CarType}&&carColorTitle={eosPlateSelector1.SelectedPlate.DtoViewCarColorTitle}&carModleTitle={eosPlateSelector1.SelectedPlate.DtoViewCarModelTitle}");

                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values > 0)
                    {

                    }
                    else
                    {
                        MessageShowError(response);
                        eosPlateSelector1.NewPlateClick();
                        return;
                        //MessageShowError("ثبت نشد. لطفا مجددا ");
                    }
                }
                catch { }

            eosPlateControl1.CarType = eosPlateSelector1.SelectedPlate.CarType;
            eosPlateControl1.Plate = eosPlateSelector1.SelectedPlate.Plate;
            eosPlateControl1.Validate();
            SetInfo(eosPlateSelector1.SelectedPlate.DtoViewCarColorTitle, eosPlateSelector1.SelectedPlate.DtoViewCarModelTitle, eosPlateSelector1.SelectedPlate.Name);
            ClosePopup();
            try { flowLayoutPanel1.Focus(); } catch { }
        }

        private void SetInfo(string CarColor, string CarModle, string CarName)
        {
            var item = (infoGridControl.DataSource as List<CardInfoView>)?.FirstOrDefault();
            if (item == null)
            {
                item = new CardInfoView();
                infoGridControl.DataSource = new List<CardInfoView>() { item };
            }
            item.CarColor = CarColor;
            item.CarModle = CarModle;
            item.CarName = CarName;
            item.MemberName = currentCarInfo?.MemberFullName;
            infoGridControl.RefreshDataSource();
        }

        private void eosPlateSelector1_ClickCancelButton(object sender, EventArgs e)
        {
            ClosePopup();
        }

        private void scaduleTimer_Tick(object sender, EventArgs e)
        {
            try
            {
                //if (sender == this)
                //    return;
                scaduleTimer.Enabled = false;
                //GetParkingDoorDevices();
                //var x = new SevenSegmentDisplayDevice(currentDoor.LcdPricePort);
                //x.DisplayCapacity(DateTime.Now.ToString("HHmmss"));
                //if(false)
                //GetDoorTrafficDetailes();
                Thread myNewThread = new Thread(() => GetDoorTrafficDetailes());
                myNewThread.Start();


            }
            catch { scaduleTimer.Enabled = true; }
        }

        private void gridView2_RowStyle(object sender, DevExpress.XtraGrid.Views.Grid.RowStyleEventArgs e)
        {
            //if(e.State==DevExpress.XtraGrid.Views.Base.GridRowCellState.)
            try
            {
                if (deviceGridControl.DataSource == null)
                    return;
                var item = (deviceGridControl.DataSource as List<DeviceInfoDto>)[e.RowHandle];
                if ((DateTime.Now - (item.CurrentDateTime ?? DateTime.MinValue)).TotalSeconds >= clockTimeDifSecond)
                {
                    lock (PublicVariables.ActiveDevices.DeviceManagers)
                    {
                        if (!PublicVariables.ActiveDevices.DeviceManagers.Any(q => q.IsLive && q.IsConnect && q.Equipment.Id == item.DeviceId) || !item.CurrentDateTime.HasValue || string.IsNullOrEmpty(item.SolarCurrentDateTime))
                        {
                            e.Appearance.ForeColor = Color.Red;
                            item.CurrentDateTime = null;
                        }
                        else
                            e.Appearance.ForeColor = Color.Orange;
                    }
                    e.HighPriority = true;
                }
                else
                {
                    e.Appearance.ForeColor = Color.Green;
                    e.HighPriority = false;
                }
            }
            catch { }
        }

        private void syncTimeDeviceRepositoryButtonEdit_Click(object sender, EventArgs e)
        {
            var item = (deviceGridControl.MainView as GridView).GetFocusedRow() as DeviceInfoDto;

            if (item != null)
            {
                if (item.DeviceType == EquipmentTypes.Gate)
                {// عجله ای و نیم ساعته زدم از خودم بابت این کد چرک عذرخواهی می کنم

                    OpenGate(item.DeviceId, true);
                }
                else
                {

                    var device = PublicVariables.ActiveDevices.DeviceManagers.FirstOrDefault(q => q.Equipment?.Id == item.DeviceId);
                    //PublicVariables.ActiveDevices.

                    if (device == null)
                    {
                        MessageShowError("دستگاه یافت نشد");
                        return;
                    }
                    if (device == null)
                        device.Start();
                    if (!device.IsConnect)
                    {
                        MessageShowError("اتصال برقرار نیست");
                        return;
                    }
                    if (device.SetDateTime(DateTime.Now))
                    {
                        for (int i = 0; i < 100; i++)
                        {
                            Application.DoEvents();
                            Thread.Sleep(50);
                        }
                        //MessageShowSucsess();
                    }
                }
            }
        }

        private void OpenGate(long deviceId)
        {
            var connString = GetDBConnection();
            string query = "SELECT TOP (1) DeviceName,[Ip],[Port],[Relay] FROM [dbo].[Equipments] where id =%deviceid% and [Disabled]=0"
                            .Replace("%deviceid%", deviceId.ToString());

            try
            {
                using (var da = new SqlDataAdapter(query, connString))
                {
                    DataTable dtTable = new DataTable();
                    da.Fill(dtTable);
                    string ip = dtTable.Rows[0]["Ip"].ToString();
                    int port = Int32.Parse(dtTable.Rows[0]["Port"].ToString());
                    int relay = Int32.Parse(dtTable.Rows[0]["Relay"].ToString());
                    string deviceName = dtTable.Rows[0]["DeviceName"].ToString();



                    GateControler _gate = null;

                    if (_gate == null)
                    {
                        _gate = new GateControler(ip, port);
                    }
                    bool gateIsReady = _gate.PrepareBoard();
                    if (!gateIsReady)
                        _gate = null;
                    string status_ = _gate?.GetBoardStatus();


                    var result = _gate?.RunCommandAndGetResult(GateControler.CommandType.OpenGate, relay, 5);
                    string sRet = _gate?.ParsResult(result).ToString();


                    if (sRet.ToLower().Trim() == "STATUS_OK".ToLower().Trim())
                    {
                        _gate?.TriggerBuzzerTone(3);
                        MessageBox.Show($"راهبند «{deviceName}» باز شد");
                    }

                    _gate.Disconnect();
                    _gate = null;
                }
            }
            catch (Exception)
            {
                // ignored
            }
        }


        private void OpenGateByService(string ip, int port, int relay)
        {
            try
            {
                var connString = GetDBConnection();// @"Data Source=(Local)\sql2019;Initial Catalog=EosParking;Persist Security Info=True;User ID=sa;password=12345678";
                string query = @"INSERT INTO [dbo].[OpenGateRequest]([IP],[Port],[Relay],[RequestTime],[PersistOn],[OnlyTriggerBuzzer])
     VALUES('%IP%',%Port%,%Relay%,getdate(), getdate(),0)"
                                    .Replace("%IP%", ip)
                                    .Replace("%Port%", port.ToString())
                                    .Replace("%Relay%", relay.ToString());
                try
                {
                    SqlConnection connection = new SqlConnection(connString);
                    connection.Open();

                    SqlCommand command = new SqlCommand(query, connection);
                    command.ExecuteNonQuery();
                    connection.Close();
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateByService  IP:{ip}:{port},{relay}");
                    //MessageBox.Show("درخواست بازکردن راهبند به سرویس ارسال گردید");
                    doorStateLabel.Text = "ارسال دستور به راهبند";
                }

                catch (Exception ex)
                {
                    //MessageBox.Show("Send Error!" + Environment.NewLine + ex.Message);
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, $">>>> OpenGateByService  IP:{ip}:{port},{relay} ERROR:{ex.Message}");


                }
            }
            catch (Exception ex)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, $">>>> OpenGateByService  IP:{ip}:{port},{relay} ERROR:{ex.Message}");
            }
        }
        private void OpenGate(long deviceId, bool useListable)
        {


            var currentGate = allGates.Where(q => q.deviceID == deviceId).ToList();
            if (deviceId == 0)
            {
                currentGate = allGates.Take(1).ToList();
            }
            if (currentGate.Count > 0)
            {

                if (currentGate[0].ByService)
                {
                    //send to command!
                    OpenGateByService(currentGate[0].ip, currentGate[0].port, currentGate[0].relay);
                    //MessageBox.Show("درخواست باز شدن گیت به سرویس ارسال گردید");
                    return;
                }

                try
                {
                    if (currentGate[0].relay < 100)
                    { // is G4
                        var result = currentGate[0].gate?.RunCommandAndGetResult(GateControler.CommandType.OpenGate, currentGate[0].relay, 5);
                        string sRet = currentGate[0].gate?.ParsResult(result).ToString();
                        if (sRet.ToLower().Trim() == "STATUS_OK".ToLower().Trim())
                        {
                            currentGate[0].gate?.TriggerBuzzerTone(3);
                            //MessageBox.Show($"راهبند «{currentGate[0].deviceName}» باز شد");
                            doorStateLabel.Text = $"راهبند «{currentGate[0].deviceName}» باز شد";
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  Opened G4 gate DeviceID:{deviceId}, Relay:{currentGate[0].relay}, Result:{sRet.ToLower().Trim()}");
                        }
                        else
                        {
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  DontOpen G4 gate DeviceID:{deviceId}, Relay:{currentGate[0].relay}, Result:{sRet.ToLower().Trim()}");
                        }
                    }
                    if ((currentGate[0].relay == 200) || (currentGate[0].relay == 300))
                    { // is relay=200 ==> stpro  relay = 300 ==> shine
                        string msg4Show = String.Empty;
                        try
                        {
                            DateTime currerntTime;
                            bool connected = false;
                            try
                            {
                                currerntTime = currentGate[0].gateStPro.GetDateTime();
                                connected = currentGate[0].gateStPro.TestConnection();
                            }
                            catch (Exception)
                            {
                                // ignored
                            }

                            if (connected)
                            {
                                reconnectStPro = 0;
                            }
                            else
                            {
                                reconnectStPro++;
                                allGates = allGates.Where(q => q.deviceID != currentGate[0].deviceID).ToList();
                                try
                                {
                                    currentGate[0].gateStPro.Disconnect();
                                    currentGate[0].gateStPro = null;

                                }
                                catch (Exception)
                                {
                                    // ignored
                                }

                                if (reconnectStPro <= 3)
                                {
                                    OpenGate(deviceId, useListable);
                                    return;
                                }
                            }


                            bool stProOpenGate = currentGate[0].gateStPro.OpenGate();
                            if (stProOpenGate)
                            {
                                msg4Show = $"راهبند «{currentGate[0].deviceName}» باز شد";
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  Opened stPro DeviceID:{deviceId}, Relay:{currentGate[0].relay}, ReadTimeOut:{currentGate[0].ReadTimeOut}, WriteTimeOut:{currentGate[0].WriteTimeOut}, Result:{stProOpenGate.ToString()}");
                            }
                            else
                            {
                                msg4Show = $"متاسفانه «{currentGate[0].deviceName}» باز نشد";
                            }
                        }
                        catch (Exception ex)
                        {

#if DEBUG
                            msg4Show += Environment.NewLine + $"Error:{ex.Message}";
#endif



                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, $">>>> OpenGateListable gateStPro Error:{ex.Message}");
                        }
                        if (!String.IsNullOrEmpty(msg4Show))
                        {
                            MessageBox.Show(msg4Show);
                        }

                    }
                }
                catch (Exception ex)
                {
                    EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, $">>>> OpenGateListable  Error:{ex.Message}");
                }
            }
            else
            {


                var connString = GetDBConnection();
                string query = "SELECT TOP (1) DeviceName,[Ip],[Port],[Relay],ReadTimeOut, WriteTimeOut, ByService FROM [dbo].[Equipments] where id =%deviceid% and [Disabled]=0"
                                .Replace("%deviceid%", deviceId.ToString());

                try
                {
                    using (var da = new SqlDataAdapter(query, connString))
                    {
                        DataTable dtTable = new DataTable();
                        da.Fill(dtTable);
                        int rowCount = dtTable.Rows.Count;
                        string ip = dtTable.Rows[0]["Ip"].ToString();
                        int port = Int32.Parse(dtTable.Rows[0]["Port"].ToString());
                        int relay = Int32.Parse(dtTable.Rows[0]["Relay"].ToString());
                        string deviceName = dtTable.Rows[0]["DeviceName"].ToString();
                        int readTimeOut = Int32.Parse(dtTable.Rows[0]["ReadTimeOut"].ToString());
                        int writeTimeOut = Int32.Parse(dtTable.Rows[0]["WriteTimeOut"].ToString());



                        GateClass gateClass = new GateClass();
                        gateClass.deviceID = deviceId;
                        gateClass.deviceName = deviceName;
                        gateClass.gate = null;
                        gateClass.relay = relay;
                        gateClass.ByService = Boolean.Parse(dtTable.Rows[0]["ByService"].ToString());

                        //GateControler _gate = null;

                        if (relay < 100)
                        {
                            //G4
                            bool gateIsReady = false;
                            if (!gateClass.ByService)
                            {
                                gateClass.gateStPro = null;
                                if (gateClass.gate == null)
                                {
                                    gateClass.gate = new GateControler(ip, port);
                                }
                                gateIsReady = gateClass.gate.PrepareBoard();
                                if (!gateIsReady)
                                    gateClass.gate = null;
                                string status_ = gateClass.gate?.GetBoardStatus();
                                gateClass.status = status_;
                                gateClass.ReadTimeOut = 0;
                                gateClass.WriteTimeOut = 0;
                            }
                            else
                            {
                                gateClass.status = "سرویس G4";
                                gateClass.ip = ip;
                                gateClass.port = port;
                                gateIsReady = true;
                            }

                            if (gateIsReady)
                            //    if (gateClass.gate != null)
                            {
                                allGates.Add(gateClass);
                                UpdateDeviceVerInfo(deviceId, gateClass.status);
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  NewGate_Added (G4) DeviceID:{deviceId}, Relay:{gateClass.relay}, IsReady:{gateIsReady}, Status:{gateClass.status}, ByService:{gateClass.ByService}");
                                OpenGate(deviceId, useListable);// after first add must again execute method 
                            }
                            else
                            {
                                MessageBox.Show($"ارتباط با دستگاه «{gateClass.deviceName}» برقرار نگردید");
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  NewGate_dontAdd (G4) DeviceID:{deviceId}, Relay:{gateClass.relay}, IsReady:{gateIsReady}, Status:{gateClass.status}, ByService:{gateClass.ByService}");
                            }
                        }
                        if (relay == 200)
                        {// is stPro

                            bool testConncetion = true;
                            if (!gateClass.ByService)
                            {
                                gateClass.gate = null;
                                if (gateClass.gateStPro == null)
                                {
                                    gateClass.ReadTimeOut = readTimeOut;
                                    gateClass.WriteTimeOut = writeTimeOut;
                                    Connection _connection = new TCPIPConnection(ip, port, readTimeOut, writeTimeOut, 200);

                                    gateClass.gateStPro = new Clock(_connection, ProtocolType.RS485/*rbSTProR2.Checked ? ProtocolType.RS485 : ProtocolType.Hdlc*/, 1,
                                                          1, EncryptionMode.None, ProtocolType.Suprema);

                                    testConncetion = gateClass.gateStPro.TestConnection();
                                    gateClass.status = gateClass.gateStPro.GetModel() + " " + gateClass.gateStPro.GetFirmwareVersion();



                                }
                            }
                            else
                            {
                                gateClass.status = "سرویس stPro";
                                testConncetion = true;
                                gateClass.ip = ip;
                                gateClass.port = port;

                            }
                            if (testConncetion)
                            {
                                allGates.Add(gateClass);
                                UpdateDeviceVerInfo(deviceId, gateClass.status);
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  NewGate_Added (stPro) DeviceID:{deviceId}, IsReady:{testConncetion}, ByService:{gateClass.ByService}");
                                OpenGate(deviceId, useListable);// after first add must again execute method 
                            }
                            else
                            {
                                MessageBox.Show($"ارتباط با دستگاه «{gateClass.deviceName}» برقرار نگردید");
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  NewGate_dontAdd (stPro) DeviceID:{deviceId}, IsReady:{testConncetion}, ByService:{gateClass.ByService}");
                            }

                        }

                        if (relay == 300)
                        {// is shine

                            bool testConncetion = true;
                            if (!gateClass.ByService)
                            {
                                gateClass.gate = null;
                                if (gateClass.gateStPro == null)
                                {
                                    gateClass.ReadTimeOut = readTimeOut;
                                    gateClass.WriteTimeOut = writeTimeOut;
                                    Connection _connection = new TCPIPConnection(ip, port, readTimeOut, writeTimeOut, 200);

                                    gateClass.gateStPro = new Clock(_connection, ProtocolType.Hdlc/*rbSTProR2.Checked ? ProtocolType.RS485 : ProtocolType.Hdlc*/, 1,
                                                          1, EncryptionMode.None, ProtocolType.Suprema);

                                    testConncetion = gateClass.gateStPro.TestConnection();
                                    gateClass.status = gateClass.gateStPro.GetModel() + " " + gateClass.gateStPro.GetFirmwareVersion();
                                }
                            }
                            else
                            {
                                gateClass.status = "سرویس shine";
                                testConncetion = true;
                                gateClass.ip = ip;
                                gateClass.port = port;

                            }
                            if (testConncetion)
                            {
                                allGates.Add(gateClass);
                                UpdateDeviceVerInfo(deviceId, gateClass.status);
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  NewGate_Added (shine) DeviceID:{deviceId}, IsReady:{testConncetion}, ByService:{gateClass.ByService}");
                                OpenGate(deviceId, useListable);// after first add must again execute method 
                            }
                            else
                            {
                                MessageBox.Show($"ارتباط با دستگاه «{gateClass.deviceName}» برقرار نگردید");
                                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> OpenGateListable  NewGate_dontAdd (shine) DeviceID:{deviceId}, IsReady:{testConncetion}, ByService:{gateClass.ByService}");
                            }

                        }




                        //_gate.Disconnect();
                        //_gate = null;
                    }
                }
                catch (Exception)
                {
                    // ignored
                }
            }

        }

        private void UpdateDeviceVerInfo(long deviceId, string status)
        {
            if (!String.IsNullOrEmpty(status))
            {
                var item = deviceDataSource.FirstOrDefault(q => q.DeviceId == deviceId);
                item.FrimewareVersion = status;
            }

            if (deviceGridControl.InvokeRequired)
                deviceGridControl.Invoke(new MethodInvoker(() => { deviceGridControl.DataSource = deviceDataSource; }));
            else
                deviceGridControl.DataSource = deviceDataSource;

        }

        private void carSearchButton_Click(object sender, EventArgs e)
        {
            try
            {
                using (var frm = new ManageTrafficRecordForm(_parking))
                {
                    frm.SetFormCarInfo(currentCarInfo, !string.IsNullOrEmpty(currentCarInfo.Plate), string.IsNullOrEmpty(currentCarInfo.Plate) & string.IsNullOrEmpty(currentCarInfo.CardNumber), string.IsNullOrEmpty(currentCarInfo.Plate) & string.IsNullOrEmpty(currentCarInfo.MemberCode));
                    frm.ShowDialog();
                }
                currentCarInfo = null;
                if (eosPlateControl1.IsValid)
                {
                    eosPlateControl1.Focus();
                    eosPlateControl1.Validate();
                }
                else if (string.IsNullOrEmpty(cardTextBox.Text))
                    cardTextBox.Validate();
                else if (string.IsNullOrEmpty(memberCodeTextBox.Text))
                    memberCodeTextBox.Validate();
            }
            catch
            { //ignore
            }
        }

        private void gridView1_CustomColumnDisplayText(object sender, DevExpress.XtraGrid.Views.Base.CustomColumnDisplayTextEventArgs e)
        {
            try
            {

                if (e.Column == gridColumnEnterDateTime || e.Column == gridColumnExitDateTime)
                    if (e.Value != null)
                        e.DisplayText = ((DateTime)e.Value).ToPersianDatetime();
                //else if (e.Column == payTypeGridColumn)

            }
            catch
            {
            }
        }

        private void payRepositoryGridButton_ButtonClick(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var _payDetails = (gridView1.GetFocusedRow() as ExitBillDto);
            if (_payDetails == null)
                return;
            if (!_payDetails.ExitDateTime.HasValue || _payDetails.ExitDateTime <= DateTime.MinValue)
            {
                MessageShowError("ابتدا خروج خودرو را ثبت کنید");
                return;
            }
            if (_payDetails.PayType != PayTypes.None && _payDetails.PayType != PayTypes.IntitialPaymentWithParkban)
            {
                MessageShowError("قبلا پرداخت شده است");
                return;
            }
            var receipt = PayForm.ShowPay(_payDetails, currentDoor, pcPos, ref currentPayForm);
            if (!string.IsNullOrEmpty(receipt))
            {
                PrintExitFish(_payDetails, receipt);
                //TODO:Disabled dataGrid
                ////Task.Factory.StartNew(() => { scaduleTimer_Tick(this, new EventArgs()); }).Wait(100);
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            plateDetectedButton.RightToLeft = RightToLeft.Yes;
            eosPlateControl1.Plate = "48ط14988";
            eosPlateControl1.Validate();
        }

        private void eosIpCamView1_OnNewPlateDetected(object sender, EventArgs e)
        {
            int start = Environment.TickCount;
            if (currentCarInfo != null && (DateTime.Now - currentCarInfo.PersistOn)?.TotalMinutes < clearFormMinute)
                return;
            if (sender == eosExitIpCamView2)
            {
                tabControl1.SelectedIndex = 1;
                recivedPlateFromExitCamera = 1;
            }
            else
            {
                tabControl1.SelectedIndex = 0;
                recivedPlateFromExitCamera = 0;
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> IpCam1_OnNewPlateDetected #1 Duration:({Environment.TickCount - start}) ");
            var camView = sender as EosIpCamView;
            plateDetectedButton.Text = SmsHelper.PlateFormat(SmsHelper.ConvertPersianNumberToEnglish(camView.Plate));
            if (string.IsNullOrEmpty(plateDetectedButton.Text))
                return;

            var detectedPlate = SmsHelper.ConvertPersianNumberToEnglish(camView.Plate);

            if (_lastDetectedPlate == detectedPlate &&
                (DateTime.Now - _lastDetectedPlateTime).TotalSeconds < 30)
            {
                camView.WaiteForNextPlate = true;
                return;
            }

            _lastDetectedPlate = detectedPlate;
            _lastDetectedPlateTime = DateTime.Now;

            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> IpCam1_OnNewPlateDetected #2 Duration:({Environment.TickCount - start}) ");
            eosPlateControl1.Plate = camView.Plate;
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> IpCam1_OnNewPlateDetected #3 Duration:({Environment.TickCount - start}) ");
            if (camView.CurrentPlateBitmap != null)
                _currentPlateImage = (Bitmap)camView.CurrentPlateBitmap.Clone();
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> IpCam1_OnNewPlateDetected #4 Duration:({Environment.TickCount - start}) ");
            if (_useSimilarPlateForMember)
            {
                var plates = FindSimilarPlate(eosPlateControl1.Plate);
                if (plates != null && plates.Count > 0)
                    eosPlateControl1.Plate = plates[0];
                else
                    eosPlateControl1.Plate = camView.Plate;
            }
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> IpCam1_OnNewPlateDetected #5 Duration:({Environment.TickCount - start}) ");
            camView.WaiteForNextPlate = true;
            eosPlateControl1.Focus();
            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> IpCam1_OnNewPlateDetected #6 Duration:({Environment.TickCount - start}) ");
            //if(entranceTypeComboBox.SelectedIndex!=0)
            eosPlateControl1.Refresh();
            eosPlateControl1.Validate();
            int len = Environment.TickCount - start;


            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> IpCam1_OnNewPlateDetected Duration:({Environment.TickCount - start}) ");

        }

        private void plateDetectCheckBox_CheckedChanged(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(Properties.Settings.Default.PlateDetectorLink))/*File.Exists(Application.StartupPath + "\\SETPA.cfg")*/
            {
                eosIpCamView1.PlateDetectorAddress = Properties.Settings.Default.PlateDetectorLink;
                eosIpCamView1.ActivePlateDetector = plateDetectCheckBox.Checked;
                eosIpCamView1.Plate = "";
                plateDetectedButton.Enabled = plateDetectCheckBox.Checked;
                if (plateDetectCheckBox.Checked)
                {
                    eosIpCamView1.Plate = "";
                    eosIpCamView1.CapturBitmap(false);
                }
            }
            else
            {
                plateDetectCheckBox.Enabled = false;
                plateDetectedButton.Enabled = false;
            }
        }
        DateTime oldFrameDateTime = DateTime.MinValue;
        private double clearFormMinute = 5;
        private Bitmap _currentPlateImage;

        private void eosIpCamView1_OnFrameBitmapRecived(object sender, Bitmap image)
        {
            //if ((DateTime.Now - oldFrameDateTime).TotalSeconds < 3)
            //    return;
            //Task.Factory.StartNew(() => {
            //    GetOnlinePlate(sender, image);
            //}).Wait(10);
            //oldFrameDateTime = DateTime.Now;
            //image.Save("d:\\a\\q" + (Directory.GetFiles("d:\\a").Count() + 1).ToString() + ".jpg");
            //label3.Text = DateTime.Now.ToString();
        }

        private void ManualTrafficControlForm_FormClosed(object sender, FormClosedEventArgs e)
        {

        }

        private void ManualTrafficControlForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            try
            {
                if (settingPanelChanged)
                {
                    SaveLocalSetting();
                }
                Waiting(true);
                //foreach(var device in PublicVariables.ActiveDevices.DeviceManagers)
                //    ReleaseDevice(device, true);
                PublicVariables.ActiveDevices.StopLiveCheking();
                if (PublicVariables.ActiveDevices.DeviceManagers != null)
                    while (PublicVariables.ActiveDevices.DeviceManagers.Any(q => q.IsLive))
                        ReleaseDevice(PublicVariables.ActiveDevices.DeviceManagers.Where(q => q.IsLive).FirstOrDefault());

                try
                {
                    try
                    {
                        if (_clockStPro2000 != null)
                        {
                            _clockStPro2000.Disconnect();
                            _clockStPro2000 = null;
                        }
                    }
                    catch { }

                    try
                    {
                        if (clockStPro2000_all != null)
                        {
                            for (var i = 0; i < clockStPro2000_all.Count; i++)
                            {
                                if (clockStPro2000_all[i] != null)
                                {
                                    clockStPro2000_all[i].Disconnect();
                                    clockStPro2000_all[i] = null;
                                }
                            }
                        }
                    }
                    catch { }
                    try
                    {
                        if (_gateUHF != null)
                        {
                            _gateUHF.Disconnect();
                            _gateUHF = null;
                        }
                    }
                    catch { }

                    try
                    {
                        if (gateUHF_all != null)
                            for (var i = 0; i < gateUHF_all.Count; i++)
                            {
                                if (gateUHF_all[i] != null)
                                {
                                    gateUHF_all[i].Disconnect();
                                    gateUHF_all[i] = null;
                                }
                            }
                    }
                    catch
                    { }

                    try
                    {
                        if (pcPos != null)
                        {
                            pcPos = null;
                        }
                    }
                    catch
                    { }

                    try
                    {
                        for (var i = 0; i < allGates.Count; i++)
                        {
                            if (allGates[i].gate != null)
                            {
                                allGates[i].gate.Disconnect();
                                allGates[i].gate = null;
                            }
                        }
                    }
                    catch
                    { }
                    try
                    {
                        for (var i = 0; i < deviceManagers?.Count; i++)
                        {
                            if (deviceManagers[i] != null)
                            {
                                deviceManagers[i].Disconnect();
                                deviceManagers[i] = null;
                            }
                        }
                    }
                    catch
                    { }

                    try
                    {
                        if (cardReader_all != null)
                        {
                            for (var i = 0; i < cardReader_all.Count; i++)
                            {
                                if (cardReader_all[i] != null)
                                {
                                    cardReader_all[i].Disconnect();
                                    cardReader_all[i] = null;
                                }
                            }
                        }

                    }
                    catch
                    { }
                    //try
                    //{
                    //    if (_cardReader != null)
                    //    {
                    //        _cardReader.Disconnect();
                    //        _cardReader = null;
                    //    }
                    //}
                    //catch { }
                    try
                    {
                        if (_cardReader != null)
                        {
                            _cardReader.GetRecordRaised -= ProcessGetRecordFromCardReader;
                            _cardReader.Dispose();
                            _cardReader = null;
                        }
                    }
                    catch
                    {
                        // ignored
                    }


                    try
                    {
                        if (_cardReader2 != null)
                        {
                            _cardReader2.GetRecordRaised -= ProcessGetRecordFromCardReader;
                            _cardReader2.Dispose();
                            _cardReader2 = null;
                        }
                    }
                    catch
                    {
                        // ignored
                    }
                }
                catch (Exception)
                {
                    // ignored
                }

                eosIpCamView1.ActivePlateDetector = false;
                eosIpCamView1.Stop();
                eosExitIpCamView2.ActivePlateDetector = false;
                eosExitIpCamView2?.Stop();
                //eosIpCamView1.Dispose();
                Waiting(false);
            }
            catch
            {
                Waiting(false);
            }

            try
            {
                if (frmPlateDetect != null)
                {
                    frmPlateDetect.Close();
                }
            }
            catch { }
            try
            {
                if (_clockStPro2000 != null)
                {
                    _clockStPro2000.Disconnect();
                    _clockStPro2000.Dispose();
                    _clockStPro2000 = null;
                }
            }
            catch { }

            try
            {
                if (_gateG4 != null)
                {
                    _gateG4.Disconnect();
                    _gateG4.Dispose();
                    _gateG4 = null;
                }
            }
            catch { }

            try
            {
                if (_gateUHF != null)
                {
                    _gateUHF.Disconnect();
                    _gateUHF.Dispose();
                    _gateUHF = null;
                }
            }
            catch { }
            try
            {
                if (pcPos != null)
                {
                    pcPos = null;
                }
            }
            catch { }
            //try
            //{
            //    if (_cardReader != null)
            //    {
            //        _cardReader.Disconnect();
            //        _cardReader = null;
            //    }
            //}
            //catch { }

            try
            {

                foreach (var _gate in allGates)
                {

                    try
                    {
                        if (_gate.gate != null)
                        {
                            _gate.gate.Disconnect();
                            _gate.gate = null;
                        }
                        if (_gate.gateStPro != null)
                        {
                            _gate.gateStPro.Disconnect();
                            _gate.gateStPro = null;
                        }
                    }
                    catch (Exception)
                    {
                        // ignored
                    }
                }
                allGates.Clear();
            }
            catch { }









        }

        public void CancelForm(bool newPlateDetect = true)
        {
            SetFormCarInfo(null, false, false, false);
            doorStateLabel.Text = "";
            if (newPlateDetect)//(currentDoor.EntryAuthorizaitionType != EntryAuthorizaitionTypes.CardAndPlate && currentDoor.EntryAuthorizaitionType != EntryAuthorizaitionTypes.Plate)
            {
                //eosPlateControl1.Dispose();
                //ReloadPlateControl();
                eosIpCamView1.Plate = "";
                //eosIpCamView1.LastPlateDateTime = DateTime.Now;
                eosExitIpCamView2.Plate = "";
                //eosExitIpCamView2.LastPlateDateTime = DateTime.Now;
            }
            grbMemberInfo.Visible = false;
            _currentPlateImage = null;
            eosIpCamView1.WaiteForNextPlate = false;
            eosExitIpCamView2.WaiteForNextPlate = false;
        }

        private void ReloadPlateControl()
        {

            eosPlateControl1.Dispose();
            eosPlateControl1 = new EosParkingTools.EosControls.EosPlateControl();

            eosPlateControl1.Anchor = System.Windows.Forms.AnchorStyles.None;
            eosPlateControl1.BorderColor = System.Drawing.Color.FromArgb(((int)(((byte)(64)))), ((int)(((byte)(64)))), ((int)(((byte)(64)))));
            eosPlateControl1.CarType = EosParking.Core.Enums.CarTypes.Car;
            eosPlateControl1.LeftPart = 0;
            eosPlateControl1.Location = new System.Drawing.Point(556, 31);
            eosPlateControl1.Margin = new System.Windows.Forms.Padding(0, 3, 0, 0);
            eosPlateControl1.MiddlePart = 0;
            eosPlateControl1.MinimumSize = new System.Drawing.Size(162, 30);
            eosPlateControl1.MotorDownPart = 0;
            eosPlateControl1.MotorUpPart = 0;
            //            eosPlateControl1.Name = "eosPlateControl1";
            eosPlateControl1.Plate = "";
            eosPlateControl1.PlateDetailsFont = new System.Drawing.Font("Tahoma", 18F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            eosPlateControl1.RightPart = 0;
            eosPlateControl1.RoundRectRadius = 8;
            eosPlateControl1.Size = new System.Drawing.Size(262, 75);
            eosPlateControl1.SkipMiddlePart = false;
            eosPlateControl1.TabIndex = 0;
            eosPlateControl1.TabStop = false;
            eosPlateControl1.TypePart = "";
            eosPlateControl1.WaiteForNextPalte = false;
            eosPlateControl1.TextChanged += new System.EventHandler(cardTextBox_TextValueChanged);
            eosPlateControl1.Validated += new System.EventHandler(eosPlateControl1_Validated);
            panel2.Controls.Add(eosPlateControl1);


        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            ChangeColorForMember(false);
            additionalInfoLabel.Text = String.Empty;
            CancelForm();
            pauseReadingStPro2000 = false;
            pauseReadingReader = false;
            ReadUHFList();

        }

        private void cardTextBox_TextValueChanged(object sender, EventArgs e)
        {
            if ((sender as Control).Text.Length > 3 && (sender as Control).Text.Replace("!@^", "\t").Count(q => q == '\t') > 1 /*(sender as Control).Text.StartsWith("!@^") && (sender as Control).Text.EndsWith("!@^")*/)
            {
                int first = (sender as Control).Text.Replace("!@^", "\t").IndexOf("");
                int end = (sender as Control).Text.Replace("!@^", "\t").LastIndexOf("\t") - 1;
                var textValue = (sender as Control).Text.Replace("!@^", "").Substring(first, end - first);
                var qr = SecurityHelper.QRCoderDecrypt(textValue.Replace("!@^", ""));
                var qrcode = qr.Split('#');
                try
                {
                    var response = GetJsonObjecToLink<ExitBillDto>(ApiAddress.TrafficApi.GetTrafficBill, long.Parse(qrcode[0]));

                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values != null && response.Values.PayType == PayTypes.None)
                    {
                        memberCodeTextBox.Text = qrcode[2];
                        cardTextBox.Text = SetCardIdInTextBox(qrcode[3], "qrcode");
                        eosPlateControl1.Plate = SmsHelper.ConverNumberPlateToPlate(qrcode[1]);
                        currentCarInfo = new CarTrafficInfoDto { Plate = eosPlateControl1.Plate, DumpId = long.Parse(qrcode[0]), CardNumber = cardTextBox.Text, MemberCode = memberCodeTextBox.Text };

                        if (String.IsNullOrEmpty(cardTextBox.Text))
                        {
                            if (!String.IsNullOrEmpty(memberCodeTextBox.Text))
                                memberCodeTextBox.Validate();
                            if (!String.IsNullOrEmpty(eosPlateControl1.Plate))
                                eosPlateControl1.Validate();
                        }
                    }
                    else
                    {
                        (sender as Control).Text = "";
                        MessageShowError("بارکد نامعتبر است");
                    }
                }
                catch
                {

                }
                (sender as Control).ForeColor = Color.Black;

            }
            else if ((sender as Control).Text.Replace("!@^", "\t").Count(q => q == '\t') > 0)
            { (sender as Control).ForeColor = (sender as Control).BackColor; }



            if ((sender as Control).Text.Length == 0)
            {
                ReadUHFList();
            }


        }

        private void memberCodeTextBox_KeyPress(object sender, KeyPressEventArgs e)
        {
        }

        private void settingButton_Click(object sender, EventArgs e)
        {
            settingPanel.Visible = !settingPanel.Visible;
            if (settingPanel.Visible)
            {
                settingPanel.Location = new Point(5, 5);
                settingPanel.Focus();
                entranceTypeComboBox.Focus();
            }
            else settingButton.Focus();
        }

        private void settingPanel_Leave(object sender, EventArgs e)
        {
            foreach (Control c in settingPanel.Controls)
                if (c.Focused)
                    return;
                else
                {
                    if (c.Controls.Count > 0)
                        foreach (Control c2 in c.Controls)
                            if (c2.Focused)
                                return;
                }
            if (!settingPanel.Focused && !entranceTypeComboBox.Focused && !entranceTypeComboBox.IsEditorActive && !settingButton.Focused)
                settingPanel.Hide();
        }

        private void panel2_MouseEnter(object sender, EventArgs e)
        {
            settingPanel_Leave(sender, e);
        }

        private void cameraPauseButton_Click(object sender, EventArgs e)
        {
        }

        private void eosPlateSelector1_Load(object sender, EventArgs e)
        {

        }

        private void exitRepositoryGridButton_Click(object sender, EventArgs e)
        {
            var _exitDetails = (gridView1.GetFocusedRow() as ExitBillDto);
            if (_exitDetails == null)
                return;
            if (_exitDetails.ExitDateTime.HasValue)
            {
                MessageShowError("خروج خودرو ثبت شده است");
                return;
            }
            cancelButton_Click(sender, e);
            memberCodeTextBox.Text = _exitDetails.MemberCode;
            eosPlateControl1.Plate = _exitDetails.CarPlate;
            cardTextBox.Text = SetCardIdInTextBox(_exitDetails.CardNumber);
            if (!string.IsNullOrEmpty(memberCodeTextBox.Text))
            {
                memberCodeTextBox.Validate();
            }
            else if (!string.IsNullOrEmpty(eosPlateControl1.Plate))
            {
                eosPlateControl1.Validate();
            }
            else if (!string.IsNullOrEmpty(cardTextBox.Text))
            {
                cardTextBox.Validate();
            }

        }

        //private string ReverseGridExitPlate(string CarPlate)
        //{
        //    string[] platePart = CarPlate.Replace(" ", "").Split('-');
        //    Array.Reverse(platePart);
        //    return string.Join("-", platePart);
        //}

        private void flowLayoutPanel1_Enter(object sender, EventArgs e)
        {
            //ActiveControl = splitContainer1;
            if (carExitButton.Enabled && carExitButton.Visible)
                carExitButton.Focus();
            else if (carEnterButton.Visible && carEnterButton.Enabled)
            {
                //if (splitContainer1.ActiveControl != flowLayoutPanel1 && !carEnterButton.Focused)
                //{
                //    splitContainer1.ActiveControl = flowLayoutPanel1;
                //    flowLayoutPanel1.Focus();
                //}
                //if(!carEnterButton.Focused)
                carEnterButton.Focus();
            }
            else if (carSearchButton.Visible && carSearchButton.Enabled)
                carSearchButton.Focus();
        }

        private void settingPanel_VisibleChanged(object sender, EventArgs e)
        {
            settingPanelChanged = true;
            //var key = "Enter&ExitType";

            if (settingPanel.Visible)
            {
                LoadLocalSetting();
            }
            else
            {
                SaveLocalSetting();
                /*
                var setting = "";
                setting += onlyMemberheckBox.Checked ? "1," : "0,";
                setting += entranceTypeComboBox.SelectedIndex.ToString() + ",";
                setting += exitTypeComboBox.SelectedIndex.ToString() + ",";
                setting += entrancePrintCheckBox.Checked ? "1," : "0,";
                setting += exitPrintCheckBox.Checked ? "1," : "0,";
                setting += repeatedRecordTimeUpDown.Value.ToString("0") + ",";

                setting += checkBoxCheckRepeatedTrade.Checked ? "1," : "0,";
                setting += relayBuzzerCheckBox.Checked ? "1," : "0,";
                setting += checkBoxDontCheckPlateInCurrentList.Checked ? "1," : "0,";
                setting += checkBoxExitWithoutEntrance.Checked ? "1," : "0,";

                PublicVariables.SetLocalSetting(key, setting);
                */
            }
        }

        private void SaveLocalSetting()
        {
            try
            {
                var key = "Enter&ExitType";
                var setting = "";
                setting += onlyMemberheckBox.Checked ? "1," : "0,";
                setting += entranceTypeComboBox.SelectedIndex.ToString() + ",";
                setting += exitTypeComboBox.SelectedIndex.ToString() + ",";
                setting += entrancePrintCheckBox.Checked ? "1," : "0,";
                setting += exitPrintCheckBox.Checked ? "1," : "0,";
                setting += repeatedRecordTimeUpDown.Value.ToString("0") + ",";

                setting += checkBoxCheckRepeatedTrade.Checked ? "1," : "0,";
                setting += relayBuzzerCheckBox.Checked ? "1," : "0,";
                setting += checkBoxDontCheckPlateInCurrentList.Checked ? "1," : "0,";
                setting += checkBoxExitWithoutEntrance.Checked ? "1," : "0,";
                setting += checkBoxDontShowPayFormNotMembers.Checked ? "1," : "0,";
                setting += checkBoxEnterWithoutBeforeExit.Checked ? "1," : "0,";
                setting += checkBoxG4FastCommand.Checked ? "1," : "0,";
                setting += checkBoxTrafficMustHavePlate.Checked ? "1," : "0,";

                setting += checkBoxIgnoreRepeatedCardID.Checked ? "1," : "0,";
                setting += numericUpDownIgnoreCardIDTime.Value.ToString() + ",";



                PublicVariables.SetLocalSetting(key, setting);
                settingPanelChanged = false;
            }
            catch
            {
            }

        }

        private void LoadLocalSetting()
        {
            try
            {
                var key = "Enter&ExitType";
                var setting = PublicVariables.GetLocalSetting(key);
                if (!string.IsNullOrEmpty(setting))
                {
                    onlyMemberheckBox.Checked = setting.Split(',')[0] == "1";
                    entranceTypeComboBox.SelectedIndex = int.Parse(setting.Split(',')[1]);
                    exitTypeComboBox.SelectedIndex = int.Parse(setting.Split(',')[2]);
                    entrancePrintCheckBox.Checked = setting.Split(',')[3] == "1";
                    exitPrintCheckBox.Checked = setting.Split(',')[4] == "1";
                    repeatedRecordTimeUpDown.Value = int.Parse(setting.Split(',')[5]);

                    checkBoxCheckRepeatedTrade.Checked = setting.Split(',')[6] == "1";
                    relayBuzzerCheckBox.Checked = setting.Split(',')[7] == "1";
                    checkBoxDontCheckPlateInCurrentList.Checked = setting.Split(',')[8] == "1";
                    checkBoxExitWithoutEntrance.Checked = setting.Split(',')[9] == "1";
                    checkBoxDontShowPayFormNotMembers.Checked = setting.Split(',')[10] == "1";
                    checkBoxEnterWithoutBeforeExit.Checked = setting.Split(',')[11] == "1";
                    checkBoxG4FastCommand.Checked = setting.Split(',')[12] == "1";
                    checkBoxTrafficMustHavePlate.Checked = setting.Split(',')[13] == "1";

                    checkBoxIgnoreRepeatedCardID.Checked = setting.Split(',')[14] == "1";
                    numericUpDownIgnoreCardIDTime.Value = int.Parse(setting.Split(',')[15]);
                }
            }
            catch
            {
            }
        }

        private void cancelButton_EnabledChanged(object sender, EventArgs e)
        {
            if (currentCarInfo != null)
                currentCarInfo.PersistOn = DateTime.Now;
        }

        private void simpleButton1_Click(object sender, EventArgs e)
        {
            foreach (Form f in Application.OpenForms)
                f.WindowState = FormWindowState.Minimized;
        }

        private void repeatedRecordTimeUpDown_Move(object sender, EventArgs e)
        {
            repeatedRecordTimeUpDown.Focus();
            ActiveControl = repeatedRecordTimeUpDown;
        }

        private void ChangeColorForMember(bool IsMember)
        {
            Color backColor;

            if (IsMember)
                backColor = Color.FromArgb(100, 192, 255, 192);
            else
                backColor = Color.FromArgb(100, 240, 240, 240);

            if (panel2.InvokeRequired)
                panel2.Invoke(new MethodInvoker(() =>
                {
                    panel2.BackColor = backColor;
                    MemberpictureBox.Visible = IsMember;
                }));
            else
            {
                panel2.BackColor = panel2.BackColor = backColor;
                MemberpictureBox.Visible = IsMember;
            }

        }

        private void billCheckerControl1_ClickOkButton(object sender, EventArgs e)
        {
            ClosePopup();
            PopupControl = eosPlateSelector1;
            carExitButton_Click(sender, e);
        }

        private void billCheckerControl1_ClickCancelButton(object sender, EventArgs e)
        {
            ClosePopup();

            PopupControl = eosPlateSelector1;
        }

        private void cargoRepositoryGridButton_MouseDown(object sender, MouseEventArgs e)
        {
            //GridHitInfo hitInfo = new GridView(trafficGrid).CalcHitInfo(new Point(e.X, e.Y));

            //if (hitInfo.HitTest == DevExpress.XtraGrid.Views.Grid.ViewInfo.GridHitTest.ColumnButton)
            //    GridViewMenu menu = new GridViewMenu(hitInfo.View);
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

        private void simpleButton2_Click(object sender, EventArgs e)
        {

        }

        private void btnReloadCamera_Click(object sender, EventArgs e)
        {
            // #mj added for debug 1401-07-17
            StartCamera();
        }

        private void contextMenuStrip1_Opening(object sender, CancelEventArgs e)
        {

        }

        private void toolStripMenuItem1_Click(object sender, EventArgs e)
        {
            // #mj added for debug 1401-07-19
            StartCamera();

        }

        private void contextMenuCamera2_Opening(object sender, CancelEventArgs e)
        {

        }

        private void toolStripMenuItem2_Click(object sender, EventArgs e)
        {
            // #mj added for debug 1401-07-19
            StartCamera();
        }

        private void checkBoxDontCheckPlateInCurrentList_CheckedChanged(object sender, EventArgs e)
        {
            SetIpCamRuntimeSettings();
        }

        private void SetIpCamRuntimeSettings()
        {
            eosIpCamView1.DontCheckPlateInCurrentList = !checkBoxDontCheckPlateInCurrentList.Checked;
            eosExitIpCamView2.DontCheckPlateInCurrentList = !checkBoxDontCheckPlateInCurrentList.Checked;

        }

        private void eosPlateControl1_Load(object sender, EventArgs e)
        {

        }

        private void platelistButton_Click(object sender, EventArgs e)
        {
            activeplateDetector_eosIpCamView1 = eosIpCamView1.ActivePlateDetector;
            activeplateDetector_eosExitIpCamView = eosExitIpCamView2.ActivePlateDetector;
            frmPlateDetect = new PlateDetectedList();
            frmPlateDetect.myParentForm = this;
            frmPlateDetect.TopMost = true;
            frmPlateDetect.Show();
            platelistButton.Enabled = false;
        }


        private void UHFProcessGetRecord(object sender, RecordEvent.RecordEventArgs e)
        {
            if (e.RecordData == null)
                return;

            if (!string.IsNullOrEmpty(e.RecordData.Data))
            {
                RecordEvent.InstantRecord record = new RecordEvent.InstantRecord();
                record.Data = e.RecordData.Data;
                record.DateTime = e.RecordData.DateTime;
                AddUHFList(record);
                ReadUHFList();
                /*
                //var record_ = $"ID:{e.RecordData.Data.ToString()} * DateTime:{e.RecordData.DateTime.ToString("yyyy/MM/dd-HH:mm:ss")}";
                var record4List = $"{listBox1.Items.Count+1}*{e.RecordData.Data.ToString()}";
                if (listBox1.InvokeRequired)
                    this.Invoke((MethodInvoker)(() => listBox1.Items.Insert(0, record4List)));
                else
                    listBox1.Items.Insert(0, record4List);
                */
            }

        }

        private void AddUHFList(RecordEvent.InstantRecord record)
        {
            try
            {
                uhfListData.Add(record);
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $">>>> AddUHFList ID:{record.Data} Time:{record.DateTime.ToString()} ");
            }
            catch (Exception ex)
            {
                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, $">>>> AddUHFList ERR-->:{ex.Message}");
            }
        }

        private void button1_Click_1(object sender, EventArgs e)
        {

        }

        private void eosIpCamView1_OnNewPlateDetectRepeated(object sender, EventArgs e)
        {
            var camView = sender as EosIpCamView;
            var plate = SmsHelper.PlateFormat(SmsHelper.ConvertPersianNumberToEnglish(camView.Plate));
            //MessageBox.Show($"ignored plate: {plate}");
            labelRepeatedPlate.Text = plate;
            labelRepeatedPlate.Visible = true;


        }

        private void eosExitIpCamView2_OnNewPlateDetectRepeated(object sender, EventArgs e)
        {
            eosIpCamView1_OnNewPlateDetectRepeated(sender, e);
        }

        private void labelRepeatedPlate_Click(object sender, EventArgs e)
        {
            eosPlateControl1.Plate = labelRepeatedPlate.Text;
            labelRepeatedPlate.Visible = false;
        }

        private void labelRepeatedCardID_Click(object sender, EventArgs e)
        {
            cardTextBox.Text = labelRepeatedCardID.Text;
            labelRepeatedCardID.Visible = false;
            if (!string.IsNullOrEmpty(cardTextBox.Text))
                cardTextBox.Validate();

        }

        private void button1_Click_2(object sender, EventArgs e)
        {
            cardTextBox.Text = SetCardIdInTextBox(textBox1.Text);
            if (!string.IsNullOrEmpty(cardTextBox.Text))
            { cardTextBox.Validate(); }
            else
            { MessageBox.Show("please enter data"); }

        }
    }

    internal class GateClass
    {
        public long deviceID { get; set; }
        public string deviceName { get; set; }
        public GateControler gate { get; set; }
        public Clock gateStPro { get; set; }
        public Clock gateShine { get; set; }
        public string ip { get; set; }
        public int port { get; set; }
        public int relay { get; set; }
        public int ReadTimeOut { get; set; }
        public int WriteTimeOut { get; set; }
        public string status { get; set; }
        public bool ByService { get; set; }
    }

    internal class RelayDataGate4
    {
        public string Name { get; set; }
        public string Ip { get; set; }
        public int Port { get; set; }
        public int? Relay { get; set; }
        public bool ByService { get; set; }
    }

    internal class StPro2000Data
    {
        private string deviceName;

        public StPro2000Data(string deviceName, string ip, int port, int readTimeOut, int writeTimeOut)
        {
            Name = deviceName;
            Ip = ip;
            Port = port;
            ReadTimeOut = readTimeOut;
            WriteTimeOut = writeTimeOut;
        }

        public string Name { get; set; }
        public string Ip { get; set; }
        public int Port { get; set; }
        public int ReadTimeOut { get; set; }
        public int WriteTimeOut { get; set; }
    }

    internal class CardInfoView : CardEntity
    {
        public string EntranceDateTime { get; set; }
        public string CarType { get; set; }
        public string CarColor { get; set; }
        public string CarModle { get; set; }
        public string MemberName { get; set; }
        public string CarName { get; set; }
    }
    public class ResponsePos
    {

        public string RS { get; set; }
        public string TR { get; set; }
        public string CardNumber_PN { get; set; }
        public string Terminal_TM { get; set; }
        public string Amount_AM { get; set; }
        public string ResponseNumber_RN { get; set; }
        public string Time_TI { get; set; }
        public string SR { get; set; }
        public string BankName { get; set; }
    }
}
