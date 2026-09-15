using EosParking.Controllers;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.PagingModel;
using EosParkingTools.Interfaces;
using EosParkingTools.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Forms;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class MemberRegisterHistoryFilterPanel : UserControl, IFilterPanel
    {
        public IEosSendRecivedForm ParentForm { get; set; }

        private long _parkingId;
        ICollection<MemberRegisterHistoryDto> LatestValues;
        public MemberRegisterHistoryFilterPanel(IEosSendRecivedForm parentForm, long parkingId)
        {
            InitializeComponent();
            ParentForm = parentForm;
            _parkingId = parkingId;
            fromDateTimePicker.Value = DateTime.Now.AddYears(-1);
            toDateTimePicker2.Value = DateTime.Now;
            //FillKindCombo();
        }

        //private void FillKindCombo()
        //{
        //    var t = Task.Factory.StartNew(() =>
        //    {
        //        try
        //        {
        //            var response = ParentForm.GetJsonObjecToLink<List<ParkingDoorEntity>>(ApiAddress.ParkingApi.GetParkingDoors, _parkingId);
        //            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
        //            {
        //                //response.Values.Insert(0, new ParkingDoorEntity { Id = 0, Title = "همه" });
        //                Invoke(new MethodInvoker(() =>
        //                {
        //                    doorsTextBox.Properties.DataSource = response.Values;
        //                    doorsTextBox.Properties.ValueMember = "Id";
        //                    doorsTextBox.Properties.DisplayMember = "Title";
        //                    //doorsTextBox.Text = "همه";
        //                    doorsTextBox.CheckAll();
        //                }));
        //            }
        //        }
        //        catch { }
        //    });
        //    t.Wait(10);
        //}

        public bool GetValues()
        {
            var pageValue = new PageFilterModel<ReportMemberFilterModel>
            {
                Filters = new ReportMemberFilterModel
                {
                    StartDateTime = fromDateTimePicker.Value?.Date ?? DateTime.MinValue,
                    EndDateTime = toDateTimePicker2.Value?.Date ?? DateTime.MinValue,
                    ParkingId = _parkingId,
                    MemberCode=memberCodeTextBox.Text
                    //DoorId = doorsTextBox.Properties.GetItems().Where(q => q.CheckState == CheckState.Checked).Select(q => (long)q.Value).ToArray(),
                },

                GridFilters = new List<FilterDescriptor>
                {
                },
                PageNumber = 1,
                PageSize = 1000000
            };
            var response = ParentForm.PostJsonObjecToLinkAndWait<List<MemberRegisterHistoryDto>>(ApiAddress.ReportApi.GetMemberRegisterHistory, pageValue, false,false);

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

        public void ClearPanel()
        {
        }

        public void ShowReport()
        {
            if (LatestValues == null)
                GetValues();

            ReportsViewer.ShowReportResource<MemberRegisterHistoryDto>("MemberRegisterReport.mrt", LatestValues.ToList());
        }
    }
}
