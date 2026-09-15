using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParkingTools.Interfaces;
using System.Threading.Tasks;
using EosParking.Controllers;
using EosParking.Data.EF.Entities;
using EosParking.Core.Helpers;
using EosParking.Data.EF.PagingModel;
using EosParking.Data.EF.Dto;
using EosParkingTools.Utils;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class IncomeFilterPanel : UserControl, IFilterPanel
    {
        public int StateValue { get; set; } = 0;
        public IncomeFilterPanel()
        {
            InitializeComponent();
        }

        public IncomeFilterPanel(IEosSendRecivedForm parentForm, int stateValue)
        {
            InitializeComponent();
            StateValue = stateValue;
            ParentForm = parentForm;
            FillKindCombo();
            yearsTextBox.Properties.TextEditStyle = DevExpress.XtraEditors.Controls.TextEditStyles.Standard;
            if (stateValue == 0)
            {
                yearsTextBox.Properties.Buttons.Clear();
            }
        }

        public new IEosSendRecivedForm ParentForm { get; set; }
        public List<StatisticsDto> LatestValues { get; private set; }

        public void ClearPanel()
        {
            throw new NotImplementedException();
        }
        private void FillKindCombo()
        {
            for(int i=0;i<=20;i++)
            {
                yearsTextBox.Properties.Items.Add(new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day).AddYears(-1 * i).ToPersianDate().Substring(0,4));
            }
            yearsTextBox.Properties.Items[0].CheckState=CheckState.Checked;
            var t = Task.Factory.StartNew(() =>
            {
                try
                {
                    var response = ParentForm.GetJsonObjecToLink<List<ParkingEntity>>(ApiAddress.ParkingApi.Get);
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        //response.Values.Insert(0, new ParkingDoorEntity { Id = 0, Title = "همه" });
                        if (InvokeRequired)
                        {
                            Invoke(new MethodInvoker(() =>
                            {
                                parkingsTextBox.Properties.DataSource = response.Values;
                                parkingsTextBox.Properties.ValueMember = "Id";
                                parkingsTextBox.Properties.DisplayMember = "ParkingName";
                                parkingsTextBox.Visible = true;
                                eosLabel1.Visible = true;
                            //doorsTextBox.Text = "همه";
                            parkingsTextBox.CheckAll();
                            }));
                        }
                        else
                        {
                                parkingsTextBox.Properties.DataSource = response.Values;
                                parkingsTextBox.Properties.ValueMember = "Id";
                                parkingsTextBox.Properties.DisplayMember = "ParkingName";
                                parkingsTextBox.Visible = true;
                                eosLabel1.Visible = true;
                            //doorsTextBox.Text = "همه";
                            parkingsTextBox.CheckAll();
                        }
                    }
                }
                catch { }
            });
            t.Wait(10);
        }

        public bool GetValues()
        {
            var pageValue = new PageFilterModel<TrafficStatisticFilterModel>
            {
                Filters = new TrafficStatisticFilterModel
                {
                    StartDateTime = StateValue == 0 ? PersianDateHelper.ToMiladiDate(yearsTextBox.Text + "/01/01") :  DateTime.MinValue,
                    EndDateTime = StateValue == 0 ? PersianDateHelper.ToMiladiDate(yearsTextBox.Text + "/12/29") :  DateTime.MaxValue,
                    ParkingIds = parkingsTextBox.Properties.GetItems().Where(q => q.CheckState == CheckState.Checked).Select(q => (long)q.Value).ToArray(),
                    SolarYears = yearsTextBox.Properties.GetItems().Where(q => q.CheckState == CheckState.Checked).Select(q => int.Parse(q.Value.ToString())).ToArray(),
                   //DoorId = doorsTextBox.Properties.GetItems().Where(q => q.CheckState == CheckState.Checked).Select(q => (long)q.Value).ToArray(),
                },

                GridFilters = new List<FilterDescriptor>
                {
                },
                PageNumber = 1,
                PageSize = 1000000
            };
            if (pageValue.Filters.DoorIds == null)
                pageValue.Filters.DoorIds = new long[0];
            var response =
                ParentForm.PostJsonObjecToLinkAndWait<List<StatisticsDto>>(StateValue == 0 ? ApiAddress.ReportApi.GetParkingMonthlyIncomingReport : ApiAddress.ReportApi.GetParkingYearIncomingReport, pageValue, false, false);

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                LatestValues = response.Values;
                return response.Values != null && response.Values.Count > 0;
            }
            else
            {
                return false;
            }

            //return true;
        }

        public ICollection<object> GetValuesSync()
        {
            throw new NotImplementedException();
        }

        public void ShowReport()
        {
            if (LatestValues == null)
                GetValues();
            var reportFile = "";
            switch (StateValue)
            {
                case 0: reportFile = "ParkingMonthlyIncomingChartReport.mrt"; break;
                case 1: reportFile = "ParkingMonthlyIncomingChartReport.mrt"; break;
                case 2: reportFile = "ParkingYearlyComparIncomingChartReport.mrt"; break;
                case 3: reportFile = "ParkingMonthlyIncomingChartReport.mrt"; break;
                    // case 3: reportFile = "GetOccupedHourlyParkReport.mrt"; break;
            }
            if (StateValue < 2 || StateValue == 2)
                ReportsViewer.ShowReportResource<StatisticsDto>(reportFile, LatestValues?.ToList(), isDialog:true);
            //else
            //    ReportsViewer.ShowReportResource<StatisticsOccupedParkSpaceDto>(reportFile, LatestOccupeidValues?.ToList(), false);
        }
    }
}
