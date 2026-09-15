using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParkingTools.Interfaces;
using EosParking.Data.EF.Entities;
using EosParking.Controllers;
using System.Threading.Tasks;
using EosParking.Data.EF.Dto;
using EosParkingTools.Utils;
using EosParking.Data.EF.PagingModel;
using EosParking.Core.Helpers;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class MembershipFilterPanel : UserControl, IFilterPanel
    {
        private long _parkingId;
        private string _rangeDateFilter;
        public ICollection<MembershipInfoDto> LatestValues { get; set; }

        
        public MembershipFilterPanel(IEosSendRecivedForm parentForm, long parkingId)
        {
            InitializeComponent();
            ParentForm = parentForm;
            _parkingId = parkingId;
            fromDateTimePicker.Value = DateTime.Now.AddMonths(-1);
            toDateTimePicker2.Value = DateTime.Now;
            FillKindCombo();
        }

        private void FillKindCombo()
        {
            try
            {
                var response = ParentForm.GetJsonObjecToLink<List<MemberRegisterKindEntity>>(ApiAddress.MemberApi.GetMemberRegisterKindsByParkingId, _parkingId);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    response.Values.Insert(0, new MemberRegisterKindEntity { Id = 0, Title = "همه" });
                    if (registerTypeTextBox.InvokeRequired)
                        registerTypeTextBox.Invoke(new MethodInvoker(() =>
                        {
                            registerTypeTextBox.TextBoxObject.DataSource = response.Values;
                            //registerTypeTextBox.TextBoxObject.ValueMember = "Id";
                            //registerTypeTextBox.TextBoxObject.DisplayMember = "Title";

                            //registerTypeTextBox.Text = "همه";
                        }));
                    else
                    {
                        registerTypeTextBox.TextBoxObject.DataSource = response.Values;
                    }
                    registerTypeTextBox.TextBoxObject.ValueMember = "Id";
                    registerTypeTextBox.TextBoxObject.DisplayMember = "Title";

                    registerTypeTextBox.Text = "همه";
                }
            }
            catch { }

            //var t = Task.Factory.StartNew(() =>
            //{
            try
            {
                var response = ParentForm.GetJsonObjecToLink<List<MemberDto>>(ApiAddress.MemberApi.GetByParkingId, _parkingId);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {

                    if (memberCodeTextBox.InvokeRequired)
                        Invoke(new MethodInvoker(() =>
                        {
                            memberCodeTextBox.TextBoxObject.DataSource = response.Values.OrderBy(q => q.Name).ThenBy(q => q.Family).ToList();
                            memberCodeTextBox.TextBoxObject.ValueMember = "Code";
                            memberCodeTextBox.TextBoxObject.DisplayMember = "Information";
                            memberCodeTextBox.AutoCompleteMode = AutoCompleteMode.Suggest;
                            memberCodeTextBox.TextBoxObject.AutoCompleteSource = AutoCompleteSource.None;
                            memberCodeTextBox.TextBoxObject.SelectedIndex = -1;
                        }));
                    else
                    {
                        memberCodeTextBox.TextBoxObject.DataSource = response.Values.OrderBy(q => q.Name).ThenBy(q => q.Family).ToList();
                        memberCodeTextBox.TextBoxObject.ValueMember = "Code";
                        memberCodeTextBox.TextBoxObject.DisplayMember = "Information";
                        memberCodeTextBox.AutoCompleteMode = AutoCompleteMode.Suggest;
                        memberCodeTextBox.TextBoxObject.AutoCompleteSource = AutoCompleteSource.None;
                        memberCodeTextBox.TextBoxObject.SelectedIndex = -1;
                    }
                }
            }
            catch { }
            //});
            //t.Wait();
        }

        public IEosSendRecivedForm ParentForm { get; set; }

        public void ClearPanel()
        {
            registerTypeTextBox.Text = "همه";
            memberCodeTextBox.TextBoxObject.SelectedIndex = -1;
        }

        public bool GetValues()
        {
            var filter = new ReportMemberFilterModel
            {
                StartDateTime = fromDateTimePicker.Value?.Date ?? DateTime.MinValue,
                EndDateTime = toDateTimePicker2.Value?.Date.AddSeconds(86340) ?? DateTime.MinValue,
                ParkingId = _parkingId,
                MemberCode = memberCodeTextBox.TextBoxObject.SelectedValue?.ToString(),
            };

            _rangeDateFilter = $"از تاریخ {filter.StartDateTime.ToPersianDate()} تا تاریخ {filter.EndDateTime.ToPersianDate()}";


            if (registerTypeTextBox.TextBoxObject.SelectedIndex > 0)
            {
                if (long.TryParse(registerTypeTextBox.TextBoxObject.SelectedValue.ToString(), out long id))
                    filter.MemberRegisterKindId = id;
            }

            var response = ParentForm.PostJsonObjecToLinkAndWait<List<MembershipInfoDto>>(ApiAddress.ReportApi.GetMembershipIncomingDetails, filter, false, false);

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

            var dicParam = new Dictionary<string, object>();
            dicParam.Add("TitleDescription", _rangeDateFilter);

            ReportsViewer.ShowReportResource<MembershipInfoDto>("MembershipInfoIncomingDetailsReport.mrt",
                                                                LatestValues.ToList(),
                                                                String.IsNullOrEmpty(_rangeDateFilter) ? null :dicParam.ToList() 
                                                                );
                                                                 
        }
    }
}
