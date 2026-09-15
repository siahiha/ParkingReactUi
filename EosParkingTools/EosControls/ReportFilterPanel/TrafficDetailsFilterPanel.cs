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
using EosParkingTools.Utils;
using EosParking.Data.EF.Dto;
using EosParking.Controllers;
using EosParking.Data.EF.PagingModel;
using EosParking.Data.EF.Entities;
using EosParking.Core.Helpers;
using EosParking.Core.Enums;
using EosParking.Core.Exceptions;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class TrafficDetailsFilterPanel : UserControl, IFilterPanel
    {
        [Browsable(true)]
        public bool ShowParkingComboBox { get => parkingPanel.Visible; set => parkingPanel.Visible = value; }

        [Browsable(true)]
        public bool ShowJustPresenceCheckBox { get => justPresenceCheckBox.Visible; set => justPresenceCheckBox.Visible = value; }
 
        public bool ShowImageCheckBox { get => imageCheckBox.Visible; set => imageCheckBox.Visible = value; }

        public int StateValue { get; set; }

        ICollection<ExitBillDto> LatestValues;
        public IEosSendRecivedForm ParentForm { get; set; }

        private long _parkingId;
        public TrafficDetailsFilterPanel(IEosSendRecivedForm parentForm, long parkingId)
        {
            InitializeComponent();

            ParentForm = parentForm;
            _parkingId = parkingId;
            fromDateTimePicker.Value = DateTime.Now.AddMonths(-1);
            toDateTimePicker2.Value = DateTime.Now;
            FillCarTypeComboBox();
            //FillKindCombo();

        }

        public void ClearPanel()
        {
            eosPlateControl1.Clear();
            memberCodeTextBox.Text = "";
        }

        public void FillCarTypeComboBox()
        {
            carTypeComboBox.DataSource = Enum.GetValues(typeof(CarTypes))
                .Cast<Enum>()
                .Select(val => new
                {
                    Description = val.DisplayString(),
                    Value = val,
                }).OrderBy(item => item.Value)
                .ToList();
            
            carTypeComboBox.ValueMember = "Value";
            carTypeComboBox.DisplayMember = "Description";
            carTypeComboBox.SelectedIndex = -1;

            if (ShowParkingComboBox)
            {
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
        }
        public bool GetValues()
        {
            ResponseResultWeb<List<ExitBillDto>> response = null;

            if (!ShowParkingComboBox)
            {
                var pageValue = new PageFilterModel<DumpFilterModel>
                {
                    Filters = new DumpFilterModel
                    {
                        StartDateTime = fromDateTimePicker.Value?.Date ?? DateTime.MinValue,
                        EndDateTime = toDateTimePicker2.Value?.Date ?? DateTime.MaxValue,
                        MemberCode = memberCodeTextBox.Text,
                        Plate = eosPlateControl1.Plate,
                        WithImage = imageCheckBox.Checked,
                        ParkingId = _parkingId,
                        OnlyPresence = justPresenceCheckBox.Checked,
                        CarType = carTypeComboBox.SelectedIndex >= 0 ? (CarTypes?)carTypeComboBox.SelectedValue : null,
                    },
                    GridFilters = new List<FilterDescriptor>
                    { //new FilterDescriptor("ParkingId", "1",PageFilterType.Equals),
                      //new FilterDescriptor("MemberRegisterKindTitle", registerTypeTextBox.Text=="همه"?"":registerTypeTextBox.Text, PageFilterType.StartsWith),
                      //new FilterDescriptor("IsActive", StateValue==0?"":(StateValue==1?"true":"false"), PageFilterType.StartsWith),
                    },
                    PageNumber = 1,
                    //PageSize = 1000000

                };

                response = ParentForm.PostJsonObjecToLinkAndWait<List<ExitBillDto>>(ApiAddress.ReportApi.GetTrafficReport, pageValue, false, false);
            }
            else
            {
                var ListParkingId = parkingsTextBox.Properties.Items.Where(item => item.CheckState == CheckState.Checked).Select(item => (long)item.Value).ToList<long>();

                if (ListParkingId == null || ListParkingId.Count == 0)
                    throw new EosValidationDataException("هیچ پارکینگی انتخاب نشده است");


                var pageValue = new PageFilterModel<ReportDumpParkingsFilterModels>
                {
                    Filters = new ReportDumpParkingsFilterModels
                    {
                        StartDateTime = fromDateTimePicker.Value?.Date ?? DateTime.MinValue,
                        EndDateTime = toDateTimePicker2.Value?.Date ?? DateTime.MaxValue,
                        MemberCode = memberCodeTextBox.Text,
                        Plate = eosPlateControl1.Plate,
                        WithImage = imageCheckBox.Checked,
                        ListParkingId = ListParkingId,
                        OnlyPresence = justPresenceCheckBox.Checked,
                        CarType = carTypeComboBox.SelectedIndex >= 0 ? (CarTypes?)carTypeComboBox.SelectedValue : null,
                    },
                };

                response = ParentForm.PostJsonObjecToLinkAndWait<List<ExitBillDto>>(ApiAddress.ReportApi.GetIncomingDetailsReport, pageValue, false, false);
            }

            

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                LatestValues = response.Values;
                return response.Values != null && response.Values.Count > 0;
            }
            else
                return false;
            
        }

        public ICollection<object> GetValuesSync()
        {
            throw new NotImplementedException();
        }

        public void ShowReport()
        {
            if (LatestValues == null)
                GetValues();

            var titleDescription = "از تاریخ " + fromDateTimePicker.Value?.Date.ToPersianDate() + " تا " + toDateTimePicker2.Value?.Date.ToPersianDate();

            if (justPresenceCheckBox.Checked)
                titleDescription = " حاضرین " + titleDescription;

            List<KeyValuePair<string, object>> parameters = new List<KeyValuePair<string, object>>() {
                new KeyValuePair<string, object>("TitleDescription", titleDescription)
            };

            if (ShowParkingComboBox)
            {
                ReportsViewer.ShowReportResource<ExitBillDto>("TrafficIncomingDetailsReport.mrt", LatestValues.ToList(), parameters);
            }
            else
            {
                if (imageCheckBox.Checked)
                    ReportsViewer.ShowReportResource<ExitBillDto>("TrafficWithImageReport.mrt", LatestValues.ToList(), parameters);
                else
                    ReportsViewer.ShowReportResource("TrafficReport.mrt", LatestValues.ToList(), parameters);
            }
        }

        DataTable ToDataTable()
        {
            var li = LatestValues;//.Select(q => new { q.TotalCost, q.TotalDuration, q.SolarEnterDateTime, q.SolarExitDateTime, q.AbsolutCarPlate, q.CarPlate, q.CardNumber, q.FormatedDuration }).ToList();
            var dt = ReportHelper.ToDataTable<ExitBillDto>(new List<ExitBillDto>().AsQueryable(), "MainTable", false);
            foreach(var i in li)
            {
                var row = dt.NewRow();
                row["AbsolutCarPlate"] = i.AbsolutCarPlate;
                row["CardNumber"] = i.CardNumber;
                row["CarPlate"] = i.CarPlate;
                row["FormatedDuration"] = i.FormatedDuration;
                row["SolarEnterDateTime"] = i.SolarEnterDateTime;
                row["SolarExitDateTime"] = i.SolarExitDateTime;
                row["TotalCost"] = i.TotalCost;
                row["TotalDuration"] = i.TotalDuration;
                dt.Rows.Add(row);
            }
            return dt;
        }
    }
}
