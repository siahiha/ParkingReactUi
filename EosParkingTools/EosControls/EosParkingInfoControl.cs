using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParkingTools.EosForms;
using EosParking.Data.EF.Dto;
using EosParking.Controllers;
using EosParking.Data.EF.Entities;
using EosParkingTools.Interfaces;
using System.Threading;

namespace EosParkingTools.EosControls
{
    public partial class EosParkingInfoControl : UserControl
    {
        private ParkingEntity _parking;
        private string _copName;

        public ParkingEntity Parking { get => _parking; set => _parking = value; }
        public string CopName { get => _copName; set { _copName = value; dungleTableLayoutPanel.Visible = !string.IsNullOrEmpty(CopName); dungleLabel.Text = "مالک : " + value; } }
        public ParkingInfoDto Info { get; set; }
        public EosParkingInfoControl()
        {
            InitializeComponent();
        }

        public void GetFromServer()
        {

            try
            {
                if (scheduleTimer.Enabled && Visible)
                    return;
                var parent = Parent;
                for (int i = 0; i < 10; i++)
                {
                    if (parent is IEosSendRecivedForm)
                        break;
                    if (parent.Parent != null)
                        parent = parent.Parent;
                    else
                    {
                        parent = null;
                        break;
                    }
                }
                if ((parent is IEosSendRecivedForm) && _parking != null)
                {
                    var info = (parent as IEosSendRecivedForm).GetJsonObjecToLink<ParkingInfoDto>(ApiAddress.ParkingApi.GetInfoById, _parking.Id);
                    if (info != null && info.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && info.Values != null)
                    {
                        Info = info.Values;
                        Fill(Info);
                    }
                }
            }
            catch { Thread.Sleep(5000); }
        }

        public void Fill(ParkingInfoDto info)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new MethodInvoker(() => { Fill(info); }));
                return;
            }
            floorLabel.Text = "تعداد طبقات : " + info.FloorCount.ToString();
            doorLabel.Text = "تعداد درب ها : " + info.DoorCount.ToString();
            parkSpaceLabel.Text = "ظرفیت پارکینگ : " + info.TotalParkSpaces.ToString();
            freeParkSpacesLabel.Text = "تعداد جای پارک آزاد : " + info.FreeParkSpaceCount.ToString();
            chart1.Series[0].Points[0].YValues = new double[] { info.FreeParkSpaceCount };
            chart1.Series[0].Points[1].YValues = new double[] { info.OccupiedParkSpaceCount };
            ocupedParkSpacelabel.Text = "تعداد جای پارک اشغال شده : " + info.OccupiedParkSpaceCount.ToString();

            memberLabel.Text = "تعداد کل اعضاء : " + info.TotalMembers.ToString();
            currentShiftabel.Text = "شیفت جاری سیستم : " + info.CurrentWorkShift.ToString();
            userInShiftLabel.Text = "تعداد کاربران در شیفت جاری : " + info.UserInShiftCount.ToString();
            dateLabel.Text = "تاریخ و زمان سیستم : " + info.SolarServerDateTime;
            deviceTableLayoutPanel.Visible = !string.IsNullOrEmpty(info.DeviceProcInfo);
            deviceLable.Text = info.DeviceProcInfo;
        }

        public void StartScheduleGeting(int interval)
        {
            scheduleTimer.Enabled = false;
            scheduleTimer.Interval = interval;
            scheduleTimer.Enabled = true;
        }

        public void StopScheduleGeting()
        {
            scheduleTimer.Enabled = false;
        }

        private void scheduleTimer_Tick(object sender, EventArgs e)
        {
            scheduleTimer.Enabled = false;
            GetFromServer();
            scheduleTimer.Enabled = true;
        }
    }
}
