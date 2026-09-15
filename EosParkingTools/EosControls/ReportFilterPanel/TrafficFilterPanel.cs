using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParkingTools.Interfaces;
using EosParking.Data.EF.Dto;
using EosParkingTools.Utils;
using EosParking.Controllers;
using System.Threading.Tasks;
using EosParking.Data.EF.Entities;
using EosParking.Data.EF.PagingModel;
using System.Globalization;
using EosParking.Core.Helpers;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class TrafficFilterPanel : UserControl, IFilterPanel
    {
        public int State { get; set; } = 0;

        public IEosSendRecivedForm ParentForm { get; set; }

        private long _parkingId;
        ICollection<StatisticsDto> LatestValues;
        ICollection<StatisticsOccupedParkSpaceDto> LatestOccupeidValues;
        public TrafficFilterPanel(IEosSendRecivedForm parentForm, long parkingId,int state)
        {
            InitializeComponent();
            ParentForm = parentForm;
            _parkingId = parkingId;
            fromDateTimePicker.Value = DateTime.Now.AddMonths(-1);
            toDateTimePicker2.Value = DateTime.Now;
            if (state == 0)
            {
                doorsTextBox.Visible = true;
                FillKindCombo();
            }
            else if (state >= 3)
            {
                toDateTimePicker2.Visible = false;
                fromDateTimePicker.Visible = false; ;
                yearTextBox.Visible = true;
                Width = Width / 3;
                yearTextBox.Text = DateTime.Now.ToPersianDate().Substring(0, 4);
            }
            else
            {
                doorsTextBox.Visible = false;
                eosLabel1.Visible = false;
            }
            State = state;
        }

        private void FillKindCombo()
        {
            //
            var t = Task.Factory.StartNew(() =>
            {
                try
                {
                    var response = ParentForm.GetJsonObjecToLink<List<ParkingDoorEntity>>(ApiAddress.ParkingApi.GetParkingDoors, _parkingId);
                    if (response == null || response.ResponseResultType != EosParking.Core.Enums.ResponseResultTypes.Ok)
                        response = ParentForm.GetJsonObjecToLink<List<ParkingDoorEntity>>(ApiAddress.ParkingApi.GetParkingDoors, _parkingId);
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        //response.Values.Insert(0, new ParkingDoorEntity { Id = 0, Title = "همه" });
                        Invoke(new MethodInvoker(() =>
                        { 
                            doorsTextBox.Properties.DataSource = response.Values;
                            doorsTextBox.Properties.ValueMember = "Id";
                            doorsTextBox.Properties.DisplayMember = "Title";
                            doorsTextBox.Visible = true;
                            eosLabel1.Visible = true;
                            //doorsTextBox.Text = "همه";
                            doorsTextBox.CheckAll();
                        }));
                    }
                }
                catch { FillKindCombo(); }
            });
            t.Wait(10);
        }

        public bool GetValues()
        {
            var pageValue = new PageFilterModel<TrafficStatisticFilterModel>
            {
                Filters = new TrafficStatisticFilterModel
                {
                    StartDateTime = State==3 || State == 4 ? PersianDateHelper.ToMiladiDate(yearTextBox.Text + "/01/01"):fromDateTimePicker.Value?.Date ?? DateTime.MinValue,
                    EndDateTime = State == 3 || State == 4 ? PersianDateHelper.ToMiladiDate(yearTextBox.Text + "/12/29"):toDateTimePicker2.Value?.Date ?? DateTime.MaxValue,
                    ParkingIds=new long[1] { _parkingId },
                    DoorIds= doorsTextBox.Properties.GetItems().Where(q=>q.CheckState==CheckState.Checked).Select(q=>(long)q.Value).ToArray() ,
                },

                GridFilters = new List<FilterDescriptor> {  
                                                         },
                PageNumber = 1,
                PageSize = 1000000
            };
            if (pageValue.Filters.DoorIds == null)
                pageValue.Filters.DoorIds = new long[0];
            ResponseResultWeb<List<StatisticsDto>> response;
            if (State == 0)
            {
                response = ParentForm.PostJsonObjecToLinkAndWait<List<StatisticsDto>>(ApiAddress.ReportApi.GetTrafficStatisticReport, pageValue, false,false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    LatestValues = response.Values;
                    return response.Values != null && response.Values.Count > 0;
                }
                else
                    return false;
            }
            else if (State == 1)
            {
                response = ParentForm.PostJsonObjecToLinkAndWait<List<StatisticsDto>>(ApiAddress.ReportApi.GetParkingDailyIncomingReport, pageValue, false,false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {    LatestValues = response.Values;
                    return response.Values != null && response.Values.Count > 0;
                }
                else
                    return false;
            }
            else if (State == 2 || State>3)
            {
                var response2 = ParentForm.GetJsonObjecToLinkAndWait<List<StatisticsOccupedParkSpaceDto>>(ApiAddress.ReportApi.GetOccupedHourlyParkByParkingId, _parkingId.ToString() 
                                                + $"&startDateTime={ PersianDateHelper.ToMiladiDate(yearTextBox.Text + "/01/01")/*fromDateTimePicker.Value?.Date.ToString(new CultureInfo("En-Us"))*/}" +
                                                $"&endDateTime={ PersianDateHelper.ToMiladiDate(yearTextBox.Text + "/12/29")/*toDateTimePicker2.Value?.Date.ToString(new CultureInfo("En-Us"))*/}", false,false);
                if (response2 != null && response2.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {    LatestOccupeidValues = response2.Values.OrderBy(q=>q.Label).ToList();
                    return response2.Values!=null && response2.Values.Count > 0;
                }
                else
                    return false;
            }
            else //if (State == 3)
            { 
                response = ParentForm.PostJsonObjecToLinkAndWait<List<StatisticsDto>>(ApiAddress.ReportApi.GetParkingMonthlyIncomingReport, pageValue, false,false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    LatestValues = response.Values;
                    return response.Values != null && response.Values.Count > 0;
                }
                else
                    return false;
            }
            //else //if (State == 3)
            //    response = ParentForm.PostJsonObjecToLinkAndWait<List<StatisticsDto>>(ApiAddress.ReportApi.GetOccupedHourlyParkByParkingId, pageValue, false);

            

        }

        public ICollection<object> GetValuesSync()
        {
            throw new NotImplementedException();
        }

        public void ClearPanel()
        { 
        }

        public void ShowReport()
        {
            if (LatestValues == null)
                GetValues();
            var reportFile = "";
            switch(State)
            {
                case 0: reportFile = "TrafficStatisticChartReport.mrt"; break;
                case 1: reportFile = "ParkingIncomingChartReport.mrt"; break;
                case 2: reportFile = "TotalHourParkingReport.mrt"; break;
                case 3: reportFile = "ParkingMonthlyIncomingChartReport.mrt"; break;
                case 4: reportFile = "ParkingYearlyOccupiedParkChartReport.mrt"; break;
                case 5: reportFile = "ParkingYearlyTotalParkChartReport.mrt"; break;
                case 6: reportFile = "ParkingYearlyOccupacyAverageParkChartReport.mrt"; break;
                case 7: reportFile = "ParkingYearlyOccupacyRotationRatioParkChartReport.mrt"; break;
                case 8: reportFile = "ParkingYearlyDistanceChartReport.mrt"; break;
            }
            if(State<2 || State==3)
                ReportsViewer.ShowReportResource<StatisticsDto>(reportFile , LatestValues?.ToList(),/*new List<KeyValuePair<string, object>> { new KeyValuePair<string, object>("Description",)},*/ isDialog: true);
            else 
                ReportsViewer.ShowReportResource<StatisticsOccupedParkSpaceDto>(reportFile , LatestOccupeidValues?.ToList(), isDialog: true);

        }

        private void doorsTextBox_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            //if (doorsTextBox.Properties.Items.Count == 0)
            //    FillKindCombo();
        }
    }
}
