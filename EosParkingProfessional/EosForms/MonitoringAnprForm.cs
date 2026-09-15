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

        private long _currentLastAnprId;
        private List<AnprWithPics> _anprWithPicsList;
        private ParkingDoorEntity _currentDoor;
        private bool _isGettingNewRecords;
        private List<CarEntity> memberPlates;

        #endregion

        #region ctor

        public MonitoringAnprForm() => InitCtor();

        #endregion

        #region events

        private void MonitoringAnprForm_Load(object sender, EventArgs e) => LoadAndInitForm();

        private void timerGetRecord_Tick(object sender, EventArgs e) => GetNewRecords(true);

        private void gridView2_CustomDrawCell(object sender, RowCellCustomDrawEventArgs e) => CustomDrawCellInsertTime(e);

        private void gridView2_FocusedRowChanged(object sender, FocusedRowChangedEventArgs e) => SetNewSelectedRowImageToPictures(sender);

        private void RbEosSourceShahab_CheckedChanged(object sender, EventArgs e) => OnRbEosSourceCheckedChanged();

        private void RbEosSourceElmoSanat_CheckedChanged(object sender, EventArgs e) => OnRbEosSourceCheckedChanged();

        #endregion

        #region ExtractedMethods

        #region ApiMethods

        private List<AnprWithPics> GetAnprRecordWithPicTop20LastHour()
        {
            var result = GetJsonObjecToLink<List<AnprWithPics>>(ApiAddress.AnprApi.GetAnprRecordWithPicTop20LastHour + $"?isEosAnpr={RbEosSourceElmoSanat.Checked}");
            return result != null && result.HttpResponseType == System.Net.HttpStatusCode.OK && result.Values != null
                ? result.Values ?? new List<AnprWithPics>()
                : new List<AnprWithPics>();
        }

        private long GetLastMaxAnprId()
        {
            var result = GetJsonObjecToLink<long>(ApiAddress.AnprApi.GetLastMaxAnprId + $"?isEosAnpr={RbEosSourceElmoSanat.Checked}");
            return (result != null && result.HttpResponseType == System.Net.HttpStatusCode.OK) ? result.Values : 0;
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
                        var firstRow = anprWithPicsList.FirstOrDefault();
                        CarPicture.Image = ByteArrayToImage(firstRow?.CarPic);
                        PlatePicture.Image = ByteArrayToImage(firstRow?.PlatePic);
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
                    var firstRow = anprWithPicsList.FirstOrDefault();
                    CarPicture.Image = ByteArrayToImage(firstRow?.CarPic);
                    PlatePicture.Image = ByteArrayToImage(firstRow?.PlatePic);
                }
            }
        }

        #endregion

        #region Extra

        private void InitCtor()
        {
            _anprWithPicsList = new List<AnprWithPics>();
            InitializeComponent();

        }

        private void LoadAndInitForm()
        {
            
            //RemoveOldImages();
            InitializeUserDoor();
            InitializeDoors();
            GetNewRecords(false);
            PrepareTimer();
            GetAllMemberPlates();
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

        private void GetNewRecords(bool checkRecordIsGetting)
        {
            timerGetRecord.Enabled = false;
            if (checkRecordIsGetting && _isGettingNewRecords) return;
            _isGettingNewRecords = true;
            try
            {
                var lastAnprId = GetLastMaxAnprId();
                if (lastAnprId > _currentLastAnprId)
                {
                    _currentLastAnprId = lastAnprId;
                    _anprWithPicsList = GetAnprRecordWithPicTop20LastHour();
                    SetAnprRecordsGridDataSource(_anprWithPicsList);
                    //RemoveOldImages();
                }
                else if (lastAnprId == 0)
                {
                    _currentLastAnprId = 0;
                    _anprWithPicsList = new List<AnprWithPics>();
                    SetAnprRecordsGridDataSource(_anprWithPicsList);
                }
            }
            finally
            {
                
                timerGetRecord.Enabled = true;
                _isGettingNewRecords = false;
            }
        }

        private void SetNewSelectedRowImageToPictures(object sender)
        {
            if ((sender as DevExpress.XtraGrid.Views.Grid.GridView)?.GetFocusedRow() is AnprWithPics row)
            {
                CarPicture.Image = ByteArrayToImage(row.CarPic);
                PlatePicture.Image = ByteArrayToImage(row.PlatePic);
            }
        }

        private void PrepareTimer()
        {
            timerGetRecord.Interval = 3000;
            timerGetRecord.Enabled = true;
            timerGetRecord.Start();
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
                return Image.FromStream(ms);
            }
        }

        private void OnRbEosSourceCheckedChanged()
        {
            _currentLastAnprId = 0;
            GetNewRecords(true);
        }

        #endregion

        #endregion

    }
}
