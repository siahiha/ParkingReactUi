using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParkingTools.Interfaces;
using System.Collections;
using EosParking.Controllers;
using EosParking.Data.EF.PagingModel;
using System.Threading.Tasks;
using EosParking.Data.EF.Entities;
using EosParking.Data.EF.Dto;
using EosParking.Core.Helpers;
using EosParkingTools.Utils;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class MembersFilterPanel : UserControl, IFilterPanel
    {
        public int StateValue { get; set; }

        ICollection<MemberDto> LatestValues;
        public IEosSendRecivedForm ParentForm { get; set; }

        private long _parkingId;
                
        public MembersFilterPanel(IEosSendRecivedForm parentForm,long parkingId)
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
            //var t = Task.Factory.StartNew(() =>
            //{
                try
                {
                    var response = ParentForm.GetJsonObjecToLink<List<MemberRegisterKindEntity>>(ApiAddress.MemberApi.GetMemberRegisterKindsByParkingId, _parkingId);
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                        response = ParentForm.GetJsonObjecToLink<List<MemberRegisterKindEntity>>(ApiAddress.MemberApi.GetMemberRegisterKindsByParkingId, _parkingId);
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
            //});
            //t.Wait(10);
        }
        public void ClearPanel()
        {
            registerTypeTextBox.Text = "همه";
        }

        public  bool GetValues()
        {
            var pageValue = new PageFilterModel<BaseFilterModel>
            {
                Filters = new BaseFilterModel { StartDateTime = fromDateTimePicker.Value?.Date ?? DateTime.MinValue, EndDateTime = toDateTimePicker2.Value?.Date ?? DateTime.MinValue },
                GridFilters = new List<FilterDescriptor> { new FilterDescriptor("ParkingId", _parkingId.ToString(),PageFilterType.Equals),
                                                           new FilterDescriptor("MemberRegisterKindTitle", registerTypeTextBox.Text=="همه"?"":registerTypeTextBox.Text, PageFilterType.StartsWith),
                                                           new FilterDescriptor("IsActive", StateValue==0?"":(StateValue==1?"true":"false"), PageFilterType.StartsWith),
                                                         },
                PageNumber = 1,
                PageSize = 1000000

            };
            var response = ParentForm.PostJsonObjecToLinkAndWait<List<MemberDto>>(ApiAddress.ReportApi.GetMemberReport,pageValue,false,false);

            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                LatestValues= response.Values;
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
            ReportsViewer.ShowReportResource<MemberDto>("MembersReport.mrt", LatestValues.ToList(), isDialog: false);
        }

        private void registerTypeTextBox_DropDown(object sender, EventArgs e)
        {
            //if(registerTypeTextBox.TextBoxObject.DataSource==null)
            //{
            //    FillKindCombo();

            //registerTypeTextBox.TextBoxObject.ValueMember = "Id";
            //registerTypeTextBox.TextBoxObject.DisplayMember = "Title";
            //}
        }
    }
}
