using EosParking.Controllers;
using EosParking.Data.EF.Entities;
using EosParking.Data.External.Models;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using DevExpress.XtraGrid.Views.Base;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParkingProfessional.Models;

namespace EosParkingProfessional.EosForms
{
    public partial class MonitoringAnprForm : EosBaseForm
    {
        #region Fields

        private List<AnprWithPics> _anprWithPicsList;
        private ParkingDoorEntity _currentDoor;
        private List<CarEntity> memberPlates;
        private readonly HashSet<long> _loadedAnprPictureIds = new HashSet<long>();
        private AnprSignalRClient _anprSignalRClient;
        private bool _formLoaded;

        #endregion

        #region ctor

        public MonitoringAnprForm() => InitCtor();

        #endregion

        #region events

        private void MonitoringAnprForm_Load(object sender, EventArgs e) => LoadAndInitForm();

        private void gridView2_CustomDrawCell(object sender, RowCellCustomDrawEventArgs e) => CustomDrawCellInsertTime(e);

        private void gridView2_FocusedRowChanged(object sender, FocusedRowChangedEventArgs e) => SetNewSelectedRowImageToPictures(sender);

        private void RbEosSourceShahab_CheckedChanged(object sender, EventArgs e) => OnRbEosSourceCheckedChanged(sender);

        private void RbEosSourceElmoSanat_CheckedChanged(object sender, EventArgs e) => OnRbEosSourceCheckedChanged(sender);

        private void MonitoringAnprForm_FormClosed(object sender, FormClosedEventArgs e) => _anprSignalRClient?.Dispose();

        #endregion

        #region ExtractedMethods

        #region ApiMethods

        private List<AnprWithPics> GetAnprRecordWithPicTop20LastHour()
        {
            var result = GetJsonObjecToLink<List<AnprWithPics>>(ApiAddress.AnprApi.GetAnprRecordWithPicTop20LastHour + $"?isEosAnpr={RbEosSourceElmoSanat.Checked}");
            if (result == null || result.HttpResponseType != System.Net.HttpStatusCode.OK || result.Values == null)
                return new List<AnprWithPics>();

            // Images are loaded on demand through GetAnprPicById when a row gets focus.
            foreach (var record in result.Values)
            {
                record.CarPic = null;
                record.PlatePic = null;
            }

            return result.Values;
        }

        private AnprWithPics GetAnprPicById(long anprId)
        {
            var result = GetJsonObjecToLink<AnprWithPics>(
                ApiAddress.AnprApi.GetAnprPicById,
                $"{anprId}&isEosAnpr={RbEosSourceElmoSanat.Checked}");

            return result != null && result.HttpResponseType == System.Net.HttpStatusCode.OK
                ? result.Values
                : null;
        }

        private void InitializeUserDoor()
        {
            if (doorsComboBox.SelectedValue?.ToString() == "-1")
            {
                _currentDoor = null;

            }
            else
            {
                var response = GetJsonObjecToLink<ParkingDoorEntity>(ApiAddress.ParkingApi.GetParkingDoor, doorsComboBox.SelectedValue);
                _currentDoor = response != null && response.ResponseResultType == ResponseResultTypes.Ok
                        ? response.Values
                        : null;
            }
            InitializeCamera();
        }

        private void RemoveOldImages() => GetJsonObjecToLink<bool>(ApiAddress.AnprApi.DeleteOldAnprPics + $"?isEosAnpr={RbEosSourceElmoSanat.Checked}");

        #endregion

        #region UiInvokers

        private void SetAnprRecordsGridDataSource(List<AnprWithPics> anprWithPicsList)
        {
            if (anprRecordsGrid.InvokeRequired)
            {
                Invoke(new MethodInvoker(() =>
                {
                    anprRecordsGrid.DataSource = anprWithPicsList;
                    anprRecordsGrid.RefreshDataSource();
                    gridView2.RefreshData();
                    if (gridView2.RowCount > 0)
                    {
                        gridView2.FocusedRowHandle = 0;
                        gridView2.SelectRow(0);
                        gridView2.MakeRowVisible(0);
                        SetNewSelectedRowImageToPictures(gridView2);
                    }
                    else
                    {
                        SetNewSelectedRowImageToPictures(gridView2);
                    }
                }));
            }
            else
            {
                anprRecordsGrid.DataSource = anprWithPicsList;
                anprRecordsGrid.RefreshDataSource();
                gridView2.RefreshData();
                if (gridView2.RowCount > 0)
                {
                    gridView2.FocusedRowHandle = 0;
                    gridView2.SelectRow(0);
                    gridView2.MakeRowVisible(0);
                    SetNewSelectedRowImageToPictures(gridView2);
                }
                else
                {
                    SetNewSelectedRowImageToPictures(gridView2);
                }
            }
        }

        #endregion

        #region Extra

        private void InitCtor()
        {
            _anprWithPicsList = new List<AnprWithPics>();
            InitializeComponent();
            FormClosed += MonitoringAnprForm_FormClosed;
        }

        private void LoadAndInitForm()
        {
            
            //RemoveOldImages();
            InitializeUserDoor();
            InitializeDoors();
            GetAllMemberPlates();
            LoadInitialRecords();
            _formLoaded = true;
            StartAnprSignalR();
        }

        private void InitializeDoors()
        {
            var doors = GetJsonObjecToLink<List<ParkingDoorEntity>>(ApiAddress.ParkingApi.GetParkingDoors, PublicVariables.CurrentUser.CurrentParking).Values ?? new List<ParkingDoorEntity>();
            doors.Add(new ParkingDoorEntity { Id = -1, Title = "انتخاب درب" });
            doors = doors.OrderBy(q => q.Id).ToList();
            doorsComboBox.DataSource = doors;
            doorsComboBox.DisplayMember = "Title";
            doorsComboBox.ValueMember = "Id";
            doorsComboBox.SelectedValueChanged += new EventHandler((object obj, EventArgs e) =>
            {
                InitializeUserDoor();
            });
        }

        private void GetAllMemberPlates()
        {
            memberPlates = PostJsonObjecToLink<List<CarEntity>>(ApiAddress.MemberApi.GetAllMembersPlates,null).Values ?? new List<CarEntity>();
            
        }

        private void CustomDrawCellInsertTime(RowCellCustomDrawEventArgs e)
        {
            if (e.Column == gridColumnInsertTime)
            {
                try { e.DisplayText = ((DateTime)e.CellValue).ToPersianDatetime(); }
                catch
                {
                    // ignored
                } 
            }
            if (e.Column == gridColumnPlate)
            {
                
                try
                {
                    //e.Graphics.DrawRectangle(new Pen(Brushes.LightGreen), new Rectangle(0, 0, 100, 50));
                    if (memberPlates.Any(q => q.Plate == e.DisplayText.Replace("-", "")))
                        e.Appearance.BackColor = Color.LightGreen;
                }
                catch
                {
                    // ignored
                }
            }
        }

        private void LoadInitialRecords()
        {
            _loadedAnprPictureIds.Clear();
            _anprWithPicsList = GetAnprRecordWithPicTop20LastHour();
            SetAnprRecordsGridDataSource(_anprWithPicsList);
        }

        private async void StartAnprSignalR()
        {
            try
            {
                _anprSignalRClient = new AnprSignalRClient();
                _anprSignalRClient.RecordReceived += AnprSignalRClient_RecordReceived;
                _anprSignalRClient.ConnectionError += exception => AnprSignalRClient_ConnectionError(this, exception);

                var address = ConfigurationManager.AppSettings["AnprSignalRAddress"];
                if (string.IsNullOrWhiteSpace(address))
                    address = "http://localhost:3012/signalr";

                await _anprSignalRClient.ConnectAsync(address, WebHelper.UserToken, RbEosSourceElmoSanat.Checked);
            }
            catch (Exception exception)
            {
                AnprSignalRClient_ConnectionError(this, exception);
            }
        }

        private void AnprSignalRClient_RecordReceived(object sender, AnprWithPics record)
        {
            if (record == null)
                return;

            if (InvokeRequired)
            {
                BeginInvoke(new Action(() => AnprSignalRClient_RecordReceived(sender, record)));
                return;
            }

            if (_anprWithPicsList.Any(item => item.ID == record.ID))
                return;

            _loadedAnprPictureIds.Add(record.ID);
            _anprWithPicsList.Insert(0, record);
            _anprWithPicsList = _anprWithPicsList
                .OrderByDescending(item => item.InsertTime)
                .Take(20)
                .ToList();
            SetAnprRecordsGridDataSource(_anprWithPicsList);
        }

        private void AnprSignalRClient_ConnectionError(object sender, Exception exception)
        {
            LogHelper.Log(System.Diagnostics.TraceEventType.Error, "ANPR SignalR connection error: " + exception);
        }

        private void SetNewSelectedRowImageToPictures(object sender)
        {
            var gridView = sender as DevExpress.XtraGrid.Views.Grid.GridView;
            var row = gridView?.GetFocusedRow() as AnprWithPics;
            if (row == null)
            {
                SetPictureImage(CarPicture, null);
                SetPictureImage(PlatePicture, null);
                return;
            }

            if (!_loadedAnprPictureIds.Contains(row.ID))
            {
                var recordWithPictures = GetAnprPicById(row.ID);
                _loadedAnprPictureIds.Add(row.ID);

                if (recordWithPictures != null)
                {
                    row.CarPic = recordWithPictures.CarPic;
                    row.PlatePic = recordWithPictures.PlatePic;
                    row.CarImageName = recordWithPictures.CarImageName;
                    row.PlateImageName = recordWithPictures.PlateImageName;
                }

                anprRecordsGrid.RefreshDataSource();
                gridView.RefreshData();
            }

            SetPictureImage(CarPicture, row.CarPic);
            SetPictureImage(PlatePicture, row.PlatePic);
        }

        private static void SetPictureImage(PictureBox pictureBox, byte[] bytes)
        {
            var newImage = ByteArrayToImage(bytes);
            var oldImage = pictureBox.Image;
            pictureBox.Image = newImage;
            oldImage?.Dispose();
        }

        private void InitializeCamera()
        {
            if (_currentDoor == null)
            {
                eosIpCamView1.Stop();
                eosExitIpCamView2.Stop();
                return;
            }

            _currentDoor.EnteranceCamera = _currentDoor.DtoViewEquipments
                .Where(q => q.Value == DoorTrafficTypes.All)
                .Select(q => q.Key)
                .FirstOrDefault(q => q.DeviceType == EquipmentTypes.Camera);
            _currentDoor.ExitCamera = _currentDoor.DtoViewEquipments
                .Where(q => q.Value == DoorTrafficTypes.MemberOnly)
                .Select(q => q.Key)
                .FirstOrDefault(q => q.DeviceType == EquipmentTypes.Camera);
            try
            {
                if (_currentDoor.EnteranceCamera != null && !_currentDoor.EnteranceCamera.Disabled)
                {

                    try
                    {
                        eosIpCamView1.VideoSize = new Size(int.Parse(ConfigurationManager.AppSettings["VideoWidth"] ?? "0"), int.Parse(ConfigurationManager.AppSettings["VideoHeight"] ?? "0"));
                        eosIpCamView1.StretchVideo = bool.Parse(ConfigurationManager.AppSettings["StretchVideo"] ?? "false");
                    }
                    catch
                    {
                        // ignored
                    }
                    eosIpCamView1.ActivePlateDetector = false;
                    eosIpCamView1.StartSync(_currentDoor.EnteranceCamera.Ip, _currentDoor.EnteranceCamera.CameraUserName, _currentDoor.EnteranceCamera.CameraPassword, _currentDoor.EnteranceCamera.Port);
                    tabControl1.SelectedIndex = 0;
                }

                if (_currentDoor.ExitCamera != null && !_currentDoor.ExitCamera.Disabled)
                {
                    try
                    {
                        eosExitIpCamView2.VideoSize = new Size(int.Parse(ConfigurationManager.AppSettings["VideoWidth"] ?? "0"), int.Parse(ConfigurationManager.AppSettings["VideoHeight"] ?? "0"));
                        eosExitIpCamView2.StretchVideo = bool.Parse(ConfigurationManager.AppSettings["StretchVideo"] ?? "false");

                    }
                    catch
                    {
                        // ignored
                    }
                    eosExitIpCamView2.ActivePlateDetector = false;
                    eosExitIpCamView2.StartSync(_currentDoor.ExitCamera.Ip, _currentDoor.ExitCamera.CameraUserName, _currentDoor.ExitCamera.CameraPassword, _currentDoor.ExitCamera.Port);
                    if (_currentDoor.EnteranceCamera == null)
                    {
                        tabControl1.SelectedIndex = 1;
                    }
                }
            }
            catch
            {
                // ignored
            }
        }

        private static Image ByteArrayToImage(byte[] bytes)
        {
            if (bytes == null || bytes.Length == 0)
                return null;

            using (var ms = new MemoryStream(bytes))
            {
                using (var image = Image.FromStream(ms))
                {
                    return new Bitmap(image);
                }
            }
        }

        private void OnRbEosSourceCheckedChanged(object sender)
        {
            if (!_formLoaded || !(sender is RadioButton radioButton) || !radioButton.Checked)
                return;

            var selectedSource = RbEosSourceElmoSanat.Checked;
            LoadInitialRecords();
            if (_anprSignalRClient == null)
            {
                StartAnprSignalR();
                return;
            }

            _anprSignalRClient.SubscribeAsync(selectedSource).ContinueWith(task =>
            {
                if (task.IsFaulted && task.Exception != null)
                    AnprSignalRClient_ConnectionError(this, task.Exception.GetBaseException());
            });
        }

        #endregion

        #endregion

    }
}
