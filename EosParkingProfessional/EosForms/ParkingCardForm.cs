using DevExpress.XtraGrid.Views.Grid;
using EosClocks;
using EosParking.Controllers;
using EosParking.Core;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Data.EF.Entities;
using EosParking.Data.EF.Repository;
using EosParking.Devices;
using EosParkingProfessional.Models;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
////using EosParkingProfessional.Models;
using ConnectionTypes = EosParking.Core.Enums.ConnectionTypes;

namespace EosParkingProfessional.EosForms
{
    public partial class ParkingCardForm : EosBaseForm
    {
        private List<CardEntity> deletedCards = new List<CardEntity>();
        private List<CardEntity> editCards = new List<CardEntity>();
        private Thread threadStPro2000;
        public ParkingCardForm()
        {
            InitializeComponent();

        }

        void GetUserDoor()
        {
            try
            {
                deleteGridColumn.Visible = PublicVariables.CheckUserAccess(AccessItemTypes.ParkingCardDelete);
                var response = GetJsonObjecToLink<ParkingDoorEntity>(ApiAddress.ParkingApi.GetParkingDoor, PublicVariables.CurrentUser.DoorShift);
                //if (this.InvokeRequired)
                //Invoke(new MethodInvoker(() =>
                //{

                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    currentDoor = response.Values;
                    //Task.Factory.StartNew(()=>{ GetDoorTrafficDetailes(); }); 
                    //processDevices();
                    deviceTextBox.TextBoxObject.DataSource = currentDoor.DtoViewEquipments.Where(q => q.Key.DeviceType != EquipmentTypes.Pos && q.Key.DeviceType != EquipmentTypes.Camera && q.Key.DeviceType != EquipmentTypes.Gate).Select(q => q.Key).ToList();
                    deviceTextBox.TextBoxObject.ValueMember = "Id";
                    deviceTextBox.TextBoxObject.DisplayMember = "DeviceName";
                    deviceTextBox.Show();
                    deviceCheckBox.Show();
                }
                else
                {
                    currentDoor = null;

                }

            }
            catch
            {
            }// MessageShowError(response);
            //}));
            this.Refresh();
            this.Invalidate();
        }


        void ConnectDevice()
        {
            try
            {
                if (currentDoor == null || currentDoor.DtoViewEquipments == null ||
                    !currentDoor.DtoViewEquipments.Any())
                    return;
                deviceManagers = new List<DeviceManager>();
                //currentDoor.PcPos = currentDoor.DtoViewEquipments.Select(q=>q.Key).FirstOrDefault(q => q.DeviceType == EquipmentTypes.Pos);
                //currentDoor.Camera = currentDoor.DtoViewEquipments.Select(q => q.Key).FirstOrDefault(q => q.DeviceType == EquipmentTypes.Camera);
                Cursor = Cursors.WaitCursor;
                var i = currentDoor.DtoViewEquipments.Select(q => q.Key).FirstOrDefault(q =>
                    q.Id == long.Parse(deviceTextBox.TextBoxObject.SelectedValue.ToString()));
                if (i?.DeviceType == EquipmentTypes.CardReader)
                {
                    ReleaseCardReader();
                    if (i.ConnectionType == ConnectionTypes.SerialConnection)
                    {
                        _cardReader = new OnlineEncoder("COM" + i.ComPort.ToString(), false, Application.StartupPath);
                    }
                    else
                    {
                        _cardReader = new OnlineEncoder(i.Ip.Trim(), i.Port, false, Application.StartupPath);
                        if (_cardReader.Connect())
                        {
                            _cardReader?.Start();
                        }
                    }

                    if (_cardReader != null)
                    {
                        _cardReader.GetRecordRaised += (sender, e) =>
                        {
                            if (!string.IsNullOrEmpty(e?.RecordData?.Data))
                            {
                                try
                                {
                                    if (cardButtonEdit.InvokeRequired)
                                    {
                                        cardButtonEdit.Invoke(new MethodInvoker(() =>
                                        {
                                            cardButtonEdit.Focus();
                                            cardButtonEdit.Text = EosParking.Core.Helpers.CardHelper.RemoveZero(e.RecordData.Data.ToString());
                                            cardButtonEdit_ButtonPressed(currentDevice, null);
                                        }));
                                    }
                                    else
                                    {
                                        cardButtonEdit.Focus();
                                        cardButtonEdit.Text = EosParking.Core.Helpers.CardHelper.RemoveZero(e.RecordData.Data.ToString());
                                        cardButtonEdit_ButtonPressed(currentDevice, null);
                                    }
                                }
                                catch
                                {
                                    if (cardButtonEdit == null || cardButtonEdit.IsDisposed)
                                    {
                                        ReleaseCardReader();
                                    }
                                }
                            }
                        };
                    }
                }
                else
                {
                    ReleaseDevice(currentDevice);
                    currentDevice = PublicVariables.ActiveDevices.AddDevice(i);
                    deviceManagers.Add(currentDevice);
                    currentDevice.OnLastRecordRecived += null;
                    currentDevice.OnLastRecordRecived += (sender, arg) =>
                    {
                        try
                        {
                            //MessageBox.Show("read cart Fire");
                            if (cardButtonEdit.InvokeRequired)
                            {
                                //MessageBox.Show("condition true");
                                cardButtonEdit.Invoke(new MethodInvoker(() =>
                                {
                                    //MessageBox.Show("Focus true");
                                    cardButtonEdit.Focus();
                                    cardButtonEdit.Text = arg.Record.ID.ToString();
                                    cardButtonEdit_ButtonPressed(currentDevice, null);
                                }));
                            }
                            else
                            {
                                //MessageBox.Show("else true");
                                cardButtonEdit.Focus();
                                cardButtonEdit.Text = arg.Record.ID.ToString();
                                cardButtonEdit_ButtonPressed(currentDevice, null);
                            }
                        }
                        catch (Exception ex)
                        {
                            MessageBox.Show("Message Catch");
                            if (cardButtonEdit == null || cardButtonEdit.IsDisposed)
                                ReleaseDevice(sender as DeviceManager);
                        }

                        arg.SetNextRecord = true;
                    };
                    currentDevice.OnRecordRecived += null;
                    currentDevice.OnRecordRecived +=
                        new RecordRecivedEventHandler((DeviceManager sender, RecordRecivedArg arg) =>
                        {
                            arg.SetNextRecord = true;
                        });
                    currentDevice.OnGetDateTime += null;
                    currentDevice.OnGetDateTime += new EventHandler((object sender, EventArgs arg) =>
                    {
                        try
                        {
                            var device = sender as DeviceManager;
                            //if (deviceGridControl.DataSource == null)
                            //    return;

                            //if (deviceGridControl.InvokeRequired)
                            //{
                            //    cardTextBox.Invoke(new MethodInvoker(() =>
                            //    {
                            //    }));
                            //}
                            //else
                            //{
                            //}
                        }
                        catch
                        {
                        }
                    });
                    currentDevice.OnSetDateTime += null;
                    currentDevice.OnSetDateTime += new EventHandler((object sender, EventArgs arg) =>
                    {
                        /*MessageShowSucsess("تغیر ساعت دستگاه با موفقیت انجام شد");*/
                    });
                    if (!currentDevice.IsLive)
                    {
                        currentDevice.Start();
                        currentDevice.Start2();
                    }
                    Thread.Sleep(1000);
                    currentDevice.SetDateTime(DateTime.Now);
                    Cursor = Cursors.Default;
                }
            }
            catch
            {
                Cursor = Cursors.Default;
            }
            finally
            {
                Cursor = Cursors.Default;
            }

            this.Refresh();
            this.Invalidate();
        }

        private void ReleaseCardReader()
        {
            try
            {
                if (_cardReader != null)
                {
                    _cardReader.Disconnect();
                    _cardReader.Dispose();
                }
            }
            catch (Exception)
            {
                // ignored
            }
        }

        private void ReleaseDevice(DeviceManager device)
        {
            try
            {
                if (device != null)
                {
                    lock (device)
                    {
                        device.OnGetDateTime += null;
                        device.OnLastRecordRecived += null;
                        device.OnRecordRecived += null;
                        device.OnSentValidUserIds += null;
                        device.OnSetDateTime += null;
                        PublicVariables.ActiveDevices.DeviceManagers.Remove(device);
                        device.Disconnect();
                        device.Dispose();

                    }
                }
            }
            catch
            {
                // ignored
            }
        }

        private void AddToChangeList(CardEntity item)
        {
            if (item != null)
                editCards.Add(item);
            ShowChangeInformation();
        }

        private void ShowChangeInformation()
        {
            var deleteItemCount = deletedCards.Count;
            var addItemCount = editCards.Count(q => q.Id == 0);
            var editItemCount = editCards.Count(q => q.Id > 0);
            infoLabel.Text = "تعداد موارد حذف شده " + deleteItemCount + " مورد";
            infoLabel.Text += Environment.NewLine + "تعداد موارد ایجاد شده " + addItemCount + " مورد";
            infoLabel.Text += Environment.NewLine + "تعداد موارد ویرایش شده " + editItemCount + " مورد";
        }

        private ParkingEntity parking = null;

        List<CardEntity> DeleteParkSpaces = new List<CardEntity>();
        private ParkingDoorEntity currentDoor;
        private List<DeviceManager> deviceManagers;
        private DeviceManager currentDevice;
        private OnlineEncoder _cardReader;

        private void FillGrid()
        {
            var response = GetJsonObjecToLinkAndWait<List<CardEntity>>(ApiAddress.CardApi.GetByParkingId, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                gridControl1.DataSource = response.Values;


            }
            else
            {
                MessageShowError(response);
            }
            this.Refresh();
            this.Invalidate();
            ShowCardCount();
        }

        private void ShowCardCount()
        {
            try
            {
                eosLabelCardCount.Text = $"تعداد کارت: {(gridControl1.DataSource as List<CardEntity>).Count}";
            }
            catch (Exception)
            {
                // ignored
            }
        }

        public ParkingCardForm(ParkingEntity parking)
        {
            InitializeComponent();
            this.parking = parking;
        }


        private void ParkingCardForm_Load(object sender, EventArgs e)
        {
            FillGrid();
            GetUserDoor();
            this.Refresh();
            this.Invalidate();
            OnResize(e);
            this.Height = this.Height + 1;
            Application.DoEvents();
        }

        private void cardButtonEdit_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (e.KeyChar == (char)Keys.Enter)
            {
                cardButtonEdit_ButtonPressed(sender, null);
            }
        }

        private void cardButtonEdit_TextChanged(object sender, EventArgs e)
        {
            //(gridControl1.MainView as GridView).SetAutoFilterValue(cardNumberGridColumn, cardButtonEdit.Text, DevExpress.XtraGrid.Columns.AutoFilterCondition.Contains);
            (gridControl1.MainView as GridView).ActiveFilterString = $"CardNumber like '%{cardButtonEdit.Text}%' ";
        }

        private void cardButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            try
            {
                cardButtonEdit.Text = cardButtonEdit.Text.ConvertPersianNumberToEnglish();
                if (string.IsNullOrEmpty(cardButtonEdit.Text))
                    return;
                if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingCardAddOrEdit))
                {
                    MessageShowErrorUserPermision();
                    return;
                }
                if ((gridControl1.DataSource as List<CardEntity>).Any(q => q.CardNumber == cardButtonEdit.Text))
                {
                    MessageShowError("کارتی با این شماره موجود است");
                    return;
                }
                var item = new CardEntity() { CardNumber = cardButtonEdit.Text, ParkingId = parking.Id, IsBlock = false, PersistOn = DateTime.Now };
                (gridControl1.DataSource as List<CardEntity>).Add(item);
                AddToChangeList(item);
                //ResponseResultWeb<long> response = null;
                //var t=Task.Factory.StartNew(() =>{ response = PostJsonObjecToLink<long>(ApiAddress.CardApi.Save, item); });
                //t.Wait(100);
                //while (t.Status == TaskStatus.Running && response!=null)
                //    Application.DoEvents();
                //if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                //{
                //    if (item.Id == 0)
                //    {
                //        (gridControl1.DataSource as List<CardEntity>).Add(item);
                gridControl1.RefreshDataSource();
                gridControl1.Refresh();
                cardButtonEdit.Text = "";

                ShowCardCount();
                //    } 
                //}
                //else
                //    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }

        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            DialogResult = DialogResult.Abort;
        }

        private void applyButton_Click(object sender, EventArgs e)
        {

            try
            {
                if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingCardAddOrEdit))
                {
                    MessageShowErrorUserPermision();
                    return;
                }
                //var item = new CardEntity() { CardNumber = cardButtonEdit.Text, ParkingId = parking.Id, IsBlock = false, PersistOn = DateTime.Now };
                var cards = editCards.ToList();
                cards.AddRange(deletedCards.Select(q => new CardEntity { Id = -q.Id }).ToList());
                ResponseResultWeb<bool> response = null;
                var t = Task.Factory.StartNew(() => { response = PostJsonObjecToLinkAndWait<bool>(ApiAddress.CardApi.SaveAll, cards, false); });
                t.Wait(100);
                while (t.Status == TaskStatus.Running && response == null)
                    Application.DoEvents();

                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (response.Values)
                    {
                        //(gridControl1.DataSource as List<CardEntity>).Add(item);
                        //gridControl1.RefreshDataSource();
                        //gridControl1.Refresh();
                        //cardButtonEdit.Text = "";
                        editCards.Clear();
                        deletedCards.Clear();
                        AddToChangeList(null);
                        MessageShowSucsess();
                        FillGrid();
                    }
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
        }

        private void deleteRepositoryGridButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion("هشدار", "آیا میخواهید حذف انجام گردد؟") != DialogResult.OK)
                return;
            var item = (gridControl1.DataSource as List<CardEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()];
            using (var repository = new ParkingRepository())
            {
                int countcart = repository.context.TrafficDumps.Count(h => h.Tariff.ParkingId == item.Id);
                if (countcart > 0)
                    MessageShowError("کارت قبلا در تردد استفاده شده است");
                else
                {
                    

                    if (item.Id != 0)
                    {
                        if (!deletedCards.Contains(item))
                            deletedCards.Add(item);
                        editCards.Remove(item);
                        AddToChangeList(null);
                    }
                    else
                        editCards.Remove(item);
                    (gridControl1.MainView as GridView).DeleteSelectedRows();
                }

            }

        }

        private void gridView1_RowUpdated(object sender, DevExpress.XtraGrid.Views.Base.RowObjectEventArgs e)
        {
            //try
            //{
            //    var item = new CardEntity() { CardNumber = cardButtonEdit.Text, ParkingId = parking.Id, IsBlock = false, PersistOn = DateTime.Now };
            //    ResponseResultWeb<long> response = null;
            //    var t = Task.Factory.StartNew(() => { response = PostJsonObjecToLink<long>(ApiAddress.CardApi.Save, item); });
            //    while (t.Status == TaskStatus.Running && response != null)
            //        Application.DoEvents();
            //    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            //    {
            //        if (item.Id == 0)
            //        {
            //            (gridControl1.DataSource as List<CardEntity>).Add(item);
            //            gridControl1.RefreshDataSource();
            //            gridControl1.Refresh();
            //            cardButtonEdit.Text = "";
            //        }
            //    }
            //    else
            //        MessageShowError(response);
            //}
            //catch (Exception ex) { MessageShowError(ex); }

            var item = e.Row as CardEntity;//(gridControl1.DataSource as List<CardEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]; 

            if (item.Id != 0)
            {
                if (!editCards.Contains(item))
                    AddToChangeList(item);
            }
        }

        private void gridView1_InitNewRow(object sender, DevExpress.XtraGrid.Views.Grid.InitNewRowEventArgs e)
        {
            (gridControl1.DataSource as List<CardEntity>).Add(new CardEntity());
            gridControl1.RefreshDataSource();
        }
        private void gridView1_ValidatingEditor(object sender, DevExpress.XtraEditors.Controls.BaseContainerValidateEditorEventArgs e)
        {

            if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingCardAddOrEdit))
            {
                MessageShowErrorUserPermision();
                e.Valid = false;
                e.ErrorText = "شما مجاز به ویرایش نمی باشید";
                return;
            }
            if (string.IsNullOrEmpty(e.Value.ToString()))
            {
                e.Valid = false;
                e.ErrorText = "کارت را صحیح وارد کنید";
                return;
            }
            if ((gridControl1.MainView as GridView).FocusedColumn == cardNumberGridColumn)
            {
                var item = (gridControl1.DataSource as List<CardEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()];
                if ((gridControl1.DataSource as List<CardEntity>).Any(q => q.CardNumber == e.Value.ToString() && q.Id != item.Id))
                {
                    //MessageShowError("کارتی با این شماره موجود است");
                    gridControl1.MainView.CancelSelection();
                    e.Valid = false;
                    e.ErrorText = "کارتی با این شماره موجود است";
                    return;
                }
            }
            e.Valid = true;
        }
        private void gridView1_RowStyle(object sender, RowStyleEventArgs e)
        {
            try
            {
                //(gridControl1.DataSource as List<CardEntity>)
                if (e.RowHandle >= 0)
                {
                    var row = (gridControl1.MainView.GetRow(e.RowHandle) as CardEntity);
                    if (row == null)
                        return;
                    if (row.IsBlock)
                    {
                        //e.Appearance.Reset();
                        //e.Appearance.Options.UseBackColor = true;
                        //e.Appearance.Options.UseForeColor = true;
                        //e.Appearance.BackColor = Color.FromArgb(50,50,50);
                        //e.Appearance.ForeColor = Color.LightYellow;
                        e.Appearance.FontStyleDelta = FontStyle.Strikeout;
                        e.HighPriority = true;
                    }
                    else if (row.Id == 0)
                    {
                        e.Appearance.ForeColor = Color.Green;
                        e.HighPriority = true;
                    }
                    else if (string.IsNullOrEmpty(row.MemberCode))
                    {
                        e.Appearance.ForeColor = Color.Blue;
                        e.HighPriority = true;
                    }

                }
            }
            catch
            { }
        }



        private void searchButtonEdit_TextChanged(object sender, EventArgs e)
        {
            if (searchButtonEdit.Text.Length > 0)
            {
                (gridControl1.MainView as GridView).ClearColumnsFilter();
                (gridControl1.MainView as GridView).ActiveFilterString = $"MemberFullName like '%{searchButtonEdit.Text}%' or MemberCode like '%{searchButtonEdit.Text}%' ";
            }
            else
            {
                (gridControl1.MainView as GridView).ClearColumnsFilter();
                (gridControl1.MainView as GridView).ActiveFilterString = "";
            }
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            try
            {
                //var item = new CardEntity() { CardNumber = cardButtonEdit.Text, ParkingId = parking.Id, IsBlock = false, PersistOn = DateTime.Now };
                var cards = editCards.ToList();
                cards.AddRange(deletedCards.Select(q => new CardEntity { Id = -q.Id }).ToList());
                ResponseResultWeb<bool> response = null;
                response = PostJsonObjecToLinkAndWait<bool>(ApiAddress.CardApi.SaveAll, cards, false);
                var t = Task.Factory.StartNew(() => { response = PostJsonObjecToLinkAndWait<bool>(ApiAddress.CardApi.SaveAll, cards, false); });
                t.Wait(100);
                while (t.Status == TaskStatus.Running && response == null)
                    Application.DoEvents();

                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (response.Values)
                    {
                        //(gridControl1.DataSource as List<CardEntity>).Add(item);
                        //gridControl1.RefreshDataSource();
                        //gridControl1.Refresh();
                        //cardButtonEdit.Text = "";
                        editCards.Clear();
                        deletedCards.Clear();
                        AddToChangeList(null);
                        MessageShowSucsess();
                        Close();
                    }
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
        }

        private void ParkingCardForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (editCards.Count + deletedCards.Count > 0)
                e.Cancel = ShowExitQuestion() != DialogResult.OK;
            if (!e.Cancel)
            {

                ReleaseDevice(currentDevice);
                ReleaseCardReader();
            }
        }

        private void deviceCheckBox_CheckedChanged(object sender, EventArgs e)
        {
            //if (deviceCheckBox.Checked)
            //ConnectDevice();
            deviceTextBox.Enabled = deviceCheckBox.Checked;
            //else
            if (!deviceCheckBox.Checked)
            {
                ReleaseDevice(currentDevice);
                ReleaseCardReader();
            }
            else
            {
                ConnectDevice();
            }
        }

        private void deviceTextBox_SelectedValueChanged(object sender, EventArgs e)
        {
            if (deviceCheckBox.Checked)
                ConnectDevice();
        }

        private void gridView1_CustomColumnDisplayText(object sender, DevExpress.XtraGrid.Views.Base.CustomColumnDisplayTextEventArgs e)
        {
            if (e.Column == persistOnGridColumn)
            {
                e.DisplayText = ((DateTime)e.Value).ToPersianDate();
            }
        }

        private void devicePictureBox_Paint(object sender, PaintEventArgs e)
        {

            if (currentDevice == null || currentDevice.IsConnect == false)
                //    devicePictureBox.Image = Properties.Resources.Disconnected_21;
                e.Graphics.DrawImage(Properties.Resources.Disconnected_21, 0, 0, devicePictureBox.Width, devicePictureBox.Height);
            else
            {
                e.Graphics.DrawImage(Properties.Resources.Connected_21, 0, 0, devicePictureBox.Width, devicePictureBox.Height);

            }
            //    devicePictureBox.Image = Properties.Resources.Connected_21;


            //Application.DoEvents();
        }


        private void devicePictureBox_Click(object sender, EventArgs e)
        {

        }

    }
}
