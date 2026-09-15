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
using EosParking.Data.EF.PagingModel;
using System.Threading.Tasks;
using EosParking.Data.EF.Entities;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class MemberCashFilterPanel : UserControl, IFilterPanel
    {
        public IEosSendRecivedForm ParentForm { get; set; }

        private long _parkingId;
        ICollection<CashDto> LatestValues;
        public MemberCashFilterPanel(IEosSendRecivedForm parentForm, long parkingId)
        {
            InitializeComponent();
            ParentForm = parentForm;
            _parkingId = parkingId;
            fromDateTimePicker.Value = DateTime.Now.AddYears(-1);
            toDateTimePicker2.Value = DateTime.Now;
            FillKindCombo();
            
        }

        private void FillKindCombo()
        {
            var t = Task.Factory.StartNew(() =>
            {
                try
                {
                    var response = ParentForm.GetJsonObjecToLink<List<MemberDto>>(ApiAddress.MemberApi.GetByParkingId, _parkingId);
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        //response.Values.Insert(0, new ParkingDoorEntity { Id = 0, Title = "همه" });
                        if(memberCodeTextBox.InvokeRequired)
                        Invoke(new MethodInvoker(() =>
                        {
                            memberCodeTextBox.TextBoxObject.DataSource = response.Values.OrderBy(q=>q.Name).ThenBy(q=>q.Family).ToList();
                            memberCodeTextBox.TextBoxObject.ValueMember = "Code";
                            memberCodeTextBox.TextBoxObject.DisplayMember = "Information";
                            memberCodeTextBox.AutoCompleteMode = AutoCompleteMode.Suggest;
                            memberCodeTextBox.TextBoxObject.AutoCompleteSource = AutoCompleteSource.None;
                            //memberCodeTextBox.TextBoxObject.Items =
                            //doorsTextBox.Text = "همه";
                            //memberCodeTextBox.TextBoxObject.CheckAll();
                        }));
                        else
                        {
                            memberCodeTextBox.TextBoxObject.DataSource = response.Values.OrderBy(q=>q.Name).ThenBy(q=>q.Family).ToList();
                            memberCodeTextBox.TextBoxObject.ValueMember = "Code";
                            memberCodeTextBox.TextBoxObject.DisplayMember = "Information";
                            memberCodeTextBox.AutoCompleteMode = AutoCompleteMode.Suggest;
                            memberCodeTextBox.TextBoxObject.AutoCompleteSource = AutoCompleteSource.None;
                            //memberCodeTextBox.TextBoxObject.Items =
                            //doorsTextBox.Text = "همه";
                            //memberCodeTextBox.TextBoxObject.CheckAll();

                        }
                    }
                }
                catch { FillKindCombo(); }
            });
            t.Wait(10);
        }

        public bool GetValues()
        {

            var pageValue = new PageFilterModel<ReportMemberFilterModel>
            {
                Filters = new ReportMemberFilterModel
                {
                    StartDateTime = fromDateTimePicker.Value?.Date ?? DateTime.MinValue,
                    EndDateTime = toDateTimePicker2.Value?.Date ?? DateTime.MinValue,
                    ParkingId = _parkingId,
                    MemberCode=memberCodeTextBox.TextBoxObject.SelectedValue?.ToString()//?? memberCodeTextBox.TextBoxObject.Text
                    //DoorId = doorsTextBox.Properties.GetItems().Where(q => q.CheckState == CheckState.Checked).Select(q => (long)q.Value).ToArray(),
                },

                GridFilters = new List<FilterDescriptor>
                {
                },
                PageNumber = 1,
                PageSize = 1000000
            };
            var response = ParentForm.PostJsonObjecToLinkAndWait<List<CashDto>>( ApiAddress.ReportApi.GetMemberCach, pageValue, false,false);

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                LatestValues = response.Values.OrderBy(q=>q.MemberCode).ThenBy(q=>q.SolarCashDateTime).ToList();
                return response.Values != null && response.Values.Count > 0;
            }
            else
                return false;
        }

        public ICollection<object> GetValuesSync()
        {
            throw new NotImplementedException();
        }

        public void ClearPanel()
        {
            FillKindCombo();
        }

        public void ShowReport()
        {
            if (LatestValues == null)
                GetValues();

            ReportsViewer.ShowReportResource<CashDto>( "MemberCashReport.mrt", LatestValues.ToList());
        }
    }
}
