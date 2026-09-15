using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
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
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class MonitoringForm : EosBaseForm
    {
        private ParkingEntity currentParking;
        private int liveRecordTimeout = 10000;
        private int liveRecordTimeSleep = 10000;
        private Thread liveTrafficthread = null;


        void CheckControlList(List<ManitoringTrafficItemDto> values)
        {

            //accordionControl1.BeginUpdate();
            Task.Factory.StartNew(() =>
            {
                foreach (var x in values.Where(q => q.ControlType != ControlListTypes.None).OrderByDescending(q => q.DumpDateTime))
                    if (!accordionControl1.Elements[0].Elements.Any(q => q.Tag.ToString() == x.ToString()))
                    {
                        var xx = new DevExpress.XtraBars.Navigation.AccordionControlElement()
                        {
                            Image = (x.ControlType == ControlListTypes.Black ? Properties.Resources.BlackControlList21 : (x.ControlType == ControlListTypes.Stealing ? Properties.Resources.StealControlList21 : Properties.Resources.ObservationControlList21)),
                            Text = x.ToString(),
                            Tag = x.ToString(),
                            Style = DevExpress.XtraBars.Navigation.ElementStyle.Item
                        };
                        if (!string.IsNullOrEmpty(x.Description))
                        {
                            xx.Style = DevExpress.XtraBars.Navigation.ElementStyle.Group;
                            xx.Elements.Add(new DevExpress.XtraBars.Navigation.AccordionControlElement()
                            {
                                //Text = $"<div class=\"w3-container w3-border-bottom w3-border-red\"><p>{x.Description}</p></div>" ,
                                Text = x.Description,
                                Style = DevExpress.XtraBars.Navigation.ElementStyle.Item
                            });
                        }
                        if (accordionControl1.InvokeRequired)
                            accordionControl1.Invoke(new MethodInvoker(() => { accordionControl1.Elements[0].Elements.Insert(0, xx); }));
                        else
                            accordionControl1.Elements[0].Elements.Insert(0, xx);
                    }
                //accordionControl1.EndUpdate();
                if (accordionControl1.InvokeRequired)
                    accordionControl1.Invoke(new MethodInvoker(() =>
                    {
                        accordionControl1.Refresh();
                        accordionControl1.ExpandAll();
                    }));
                else
                {
                    accordionControl1.Refresh();
                    accordionControl1.ExpandAll();
                }
            }).Wait(300);

        }
        void GetTrafficDetailes(int count, DoorTypes trafficType, List<long> doorIds)
        {
            liveRecordTimeSleep = liveRecordTimeout;
            var idsString = "0";
            if(doorIds.Count>0)
            idsString = doorIds.Count > 1 ? doorIds.Select(q=>q.ToString()).Aggregate((l, r) => { return l + "&doorIds=" + r; }):doorIds[0].ToString();
            var startDateTime = (trafficGrid.DataSource as List<ManitoringTrafficItemDto>)?.Select(q => q.DumpDateTime.AddHours(-1)).OrderByDescending(q=>q).Take(2).FirstOrDefault();
            if (startDateTime == DateTime.MinValue)
                startDateTime = null;
            var response = GetJsonObjecToLink<List<ManitoringTrafficItemDto>>(ApiAddress.TrafficApi.GetMonitoringTraffics, currentParking.Id.ToString() + "&Count=" + count.ToString() + "&trafficType=" + trafficType.ToString() + "&doorIds=" + idsString+ "&startDateTime="+ startDateTime?.AddSeconds(1));
            if (this.InvokeRequired)
            {
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (trafficGrid.DataSource == null)

                        Invoke(new MethodInvoker(() =>
                        {
                            trafficGrid.DataSource = response.Values;
                    }));

                    else
                    {
                        foreach (var i in response.Values.OrderBy(q => q.DumpDateTime))
                            if (!(trafficGrid.DataSource as List<ManitoringTrafficItemDto>).Any(q => i.DumpDateTime == q.DumpDateTime && (q.MemberId == i.MemberId || i.CardId == q.CardId || i.CarId == q.CarId)))
                                (trafficGrid.DataSource as List<ManitoringTrafficItemDto>).Insert(0, i);
                    }
                    Invoke(new MethodInvoker(() =>
                    {
                        trafficGrid.RefreshDataSource();
                    }));
                    CheckControlList(response.Values);

                    //(trafficGrid.MainView as GridView).SetFocusedRowCellValue("MemberCode", focuseItem);
                }
                // MessageShowError(response);
            }
            else
            {
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (trafficGrid.DataSource == null)
                        trafficGrid.DataSource = response.Values;
                    else
                    {

                        foreach (var i in response.Values.OrderBy(q => q.DumpDateTime))
                            (trafficGrid.DataSource as List<ManitoringTrafficItemDto>).Insert(0, i);
                    }
                    trafficGrid.RefreshDataSource();
                    CheckControlList(response.Values);
                    //trafficGrid.DataSource = response.Values.ToList(); 
                    //CheckControlList(response.Values); 
                }
            }
        }

        void GetDoorDetailes()
        {
            var response = GetJsonObjecToLink<List<DoorInfoLiveDto>>(ApiAddress.ParkingApi.GetParkingDoorsLive, currentParking.Id);
            if (this.InvokeRequired)
                Invoke(new MethodInvoker(() =>
                {
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        foreach(var i in response.Values)
                        {
                            i.Selected = (doorGridControl.DataSource == null || (doorGridControl.DataSource as List<DoorInfoLiveDto>).Any(q => q.Id == i.Id && q.Selected));
                        }
                        doorGridControl.DataSource = response.Values;
                    }
                }));
            else
            {
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                        foreach(var i in response.Values)
                        {
                            i.Selected = (doorGridControl.DataSource == null || (doorGridControl.DataSource as List<DoorInfoLiveDto>).Any(q => q.Id == i.Id && q.Selected));
                        }
                    doorGridControl.DataSource = response.Values.ToList();
                }
            }
        }

        public MonitoringForm(ParkingEntity parking)
        {
            InitializeComponent();
            currentParking = parking;
            trafficTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(DoorTypes), true);
            trafficTypeTextBox.TextBoxObject.Text = DoorTypes.Both.DisplayString();
            trafficCountTextBox.TextBoxObject.DataSource = new List<string> {"10","50","100","300","500","1000","10000" };
            trafficCountTextBox.TextBoxObject.Text = "500";
            //GetTrafficDetailes(500, (DoorTypes)trafficTypeTextBox.TextBoxObject.SelectedIndex);
            GetDoorDetailes();
            liveTrafficthread = new Thread(new ThreadStart(() =>
            {
                while (true)
                {
                    liveRecordTimeSleep = liveRecordTimeout;
                    try
                    {
                        if (this.IsDisposed)
                            break;
                        int count = 500;
                        DoorTypes doorType = DoorTypes.Both;
                        var ids = new List<long>();
                        if (InvokeRequired)
                        {
                            Invoke(new MethodInvoker(() =>
                            {
                                count = int.Parse(trafficCountTextBox.Text);
                                doorType = (DoorTypes)trafficTypeTextBox.TextBoxObject.SelectedIndex;
                                ids = (doorGridControl.DataSource == null ? new List<long>() : (doorGridControl.DataSource as List<DoorInfoLiveDto>).Where(q => q.Selected).Select(q => q.Id).ToList());
                                //gridView2.ActiveFilterString = "DoorId in [" + (ids.Count == 0 ? "" : (ids.Count == 1 ? ids[0].ToString() : ids.Select(q => q.ToString()).Aggregate((q, s) => q + "," + s))) + "]";
                            }));
                        }
                        else
                        {
                            count = int.Parse(trafficCountTextBox.Text);
                            doorType = (DoorTypes)trafficTypeTextBox.TextBoxObject.SelectedIndex;
                            ids = (doorGridControl.DataSource == null ? new List<long>() : (doorGridControl.DataSource as List<DoorInfoLiveDto>).Where(q => q.Selected).Select(q => q.Id).ToList());
                            //gridView2.ActiveFilterString = "DoorId in [" + (ids.Count == 0 ? "" : (ids.Count == 1 ? ids[0].ToString() : ids.Select(q => q.ToString()).Aggregate((q, s) => q + "," + s))) + "]";
                        }
                        GetTrafficDetailes(count, doorType, ids);
                        GetDoorDetailes();
                        while (liveRecordTimeSleep > 0)
                        {
                            Thread.Sleep(5000);
                            liveRecordTimeSleep -= 5000;
                            if (this.IsDisposed)
                                break;
                        }
                    }
                    catch { }
                }
            }));
            
            liveTrafficthread.IsBackground = true;
            liveTrafficthread.Start();
        }

        private void trafficCountTextBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            try
            {
                trafficGrid.DataSource = null;
                var count = int.Parse(trafficCountTextBox.Text);
                var trDoorType = (DoorTypes)trafficTypeTextBox.TextBoxObject.SelectedIndex;
                var li = (doorGridControl.DataSource == null ? new List<long>() : (doorGridControl.DataSource as List<DoorInfoLiveDto>).Where(q => q.Selected).Select(q => q.Id).ToList());
                Task.Factory.StartNew(() =>
                {
                    GetTrafficDetailes(count,trDoorType,li);
                }).Wait(200);
                liveRecordTimeSleep = liveRecordTimeout;
            }
            catch { }
        }

        private void gridView2_CustomDrawCell(object sender, DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs e)
        {
            if (e.Column == dateTimeGridColumn)
                try { e.DisplayText = ((DateTime)e.CellValue).ToPersianDatetime() ; } catch { }
        }

        private void gridView2_CellValueChanged(object sender, DevExpress.XtraGrid.Views.Base.CellValueChangedEventArgs e)
        {
            if (e.Column == selectedGridColumn)
            {
                var ids = (doorGridControl.DataSource == null ? new List<long>() : (doorGridControl.DataSource as List<DoorInfoLiveDto>).Where(q => q.Selected).Select(q => q.Id).ToList());
                (trafficGrid.MainView as GridView).ActiveFilterString =  (ids.Count == 0 ? "" : "DoorId="+(ids.Count == 1 ? ids[0].ToString() : ids.Select(q => q.ToString()).Aggregate((q, s) => ""+q + " or DoorId=" + s))) ;
            }
        }
    }
}
