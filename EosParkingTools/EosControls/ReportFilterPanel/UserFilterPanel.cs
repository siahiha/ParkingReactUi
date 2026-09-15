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
using EosParking.Data.EF.PagingModel;
using EosParking.Controllers;
using System.Threading.Tasks;
using EosParking.Data.Dto;
using System.Globalization;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class UserFilterPanel : UserControl, IFilterPanel
    {
        public IEosSendRecivedForm ParentForm { get; set; }
        public long _userId = 0;
        private long _parkingId;
        ICollection<CashDto> LatestValues;

        public UserFilterPanel(IEosSendRecivedForm parentForm, long parkingId,long userId=0)
        {
            InitializeComponent();
            ParentForm = parentForm;
            _parkingId = parkingId;
            fromDateTimePicker.Value = DateTime.Now.AddMonths(-1);
            toDateTimePicker2.Value = DateTime.Now;
            _userId = userId;
            memberCodeTextBox.Visible = (_userId == 0);
        }

        private void FillKindCombo()
        {
            if (_userId != 0)
                return;
            var t = Task.Factory.StartNew(() =>
            {
                try
                {
                    var response = ParentForm.GetJsonObjecToLink<List<UserDto>>(ApiAddress.UserApi.Get, null);
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                    //response.Values.Insert(0, new ParkingDoorEntity { Id = 0, Title = "همه" });
                    if (memberCodeTextBox.InvokeRequired)
                            memberCodeTextBox.Invoke(new MethodInvoker(() =>
                            {
                                memberCodeTextBox.TextBoxObject.DataSource = response.Values.OrderBy(q => q.UserName).ToList();
                                memberCodeTextBox.TextBoxObject.ValueMember = "Id";
                                memberCodeTextBox.TextBoxObject.DisplayMember = "UserName";
                                memberCodeTextBox.AutoCompleteMode = AutoCompleteMode.Suggest;
                                memberCodeTextBox.TextBoxObject.AutoCompleteSource = AutoCompleteSource.None;
                                memberCodeTextBox.TextBoxObject.DroppedDown = true;
                            //memberCodeTextBox.TextBoxObject.Items =
                            //doorsTextBox.Text = "همه";
                            //memberCodeTextBox.TextBoxObject.CheckAll();
                            }));
                        else
                        {
                            memberCodeTextBox.TextBoxObject.DataSource = response.Values.OrderBy(q => q.UserName).ToList();
                            memberCodeTextBox.TextBoxObject.ValueMember = "Id";
                            memberCodeTextBox.TextBoxObject.DisplayMember = "UserName";
                            memberCodeTextBox.AutoCompleteMode = AutoCompleteMode.Suggest;
                            memberCodeTextBox.TextBoxObject.AutoCompleteSource = AutoCompleteSource.None;
                            memberCodeTextBox.TextBoxObject.DroppedDown = true;
                            //memberCodeTextBox.TextBoxObject.Items =
                            //doorsTextBox.Text = "همه";
                            //memberCodeTextBox.TextBoxObject.CheckAll();

                        }
                    }
                }
                catch { }
            });
            t.Wait(10);
        }

        public bool GetValues()
        {

            //var pageValue = new PageFilterModel<EosParking.Data.EF.PagingModel.ReportMemberFilterModel>
            //{
            //    Filters = new ReportMemberFilterModel
            //    {
            //        StartDateTime = fromDateTimePicker.Value?.Date ?? DateTime.MinValue,
            //        EndDateTime = toDateTimePicker2.Value?.Date ?? DateTime.MinValue,
            //        ParkingId = _parkingId,
            //        MemberCode = memberCodeTextBox.TextBoxObject.SelectedValue?.ToString()
            //        //DoorId = doorsTextBox.Properties.GetItems().Where(q => q.CheckState == CheckState.Checked).Select(q => (long)q.Value).ToArray(),
            //    },

            //    GridFilters = new List<FilterDescriptor>
            //    {
            //    },
            //    PageNumber = 1,
            //    PageSize = 1000000
            //};
            var response = ParentForm.GetJsonObjecToLink<List<CashDto>>(ApiAddress.ReportApi.GetUserActivity, $"startDateTime={fromDateTimePicker.Value?.Date.ToString("yyyy/MM/dd", new CultureInfo("En"))}&endDateTime={toDateTimePicker2.Value?.Date.ToString("yyyy/MM/dd 23:59",new CultureInfo("En"))}&userId={(_userId != 0? _userId:memberCodeTextBox.TextBoxObject.SelectedValue)}", false);

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
            FillKindCombo();
        }

        public void ShowReport()
        {
            if (LatestValues == null)
                GetValues();
            ReportsViewer.ShowReportResource<CashDto>("UserCashReport.mrt", LatestValues.ToList());
        }
        public UserFilterPanel()
        {
            InitializeComponent();
        }

        private void flowLayoutPanel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void memberCodeTextBox_DropDown(object sender, EventArgs e)
        {
            if(memberCodeTextBox.TextBoxObject.DataSource==null)
                FillKindCombo();
        }
    }
}
