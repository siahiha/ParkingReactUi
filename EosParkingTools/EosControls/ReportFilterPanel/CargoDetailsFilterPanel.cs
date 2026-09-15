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
using System.Threading.Tasks;
using EosParking.Controllers;
using EosParking.Data.EF.PagingModel;
using EosParking.Data.EF.Entities;
using EosParking.Core.Helpers;
using EosParkingTools.Utils;

namespace EosParkingTools.EosControls.ReportFilterPanel
{
    public partial class CargoDetailsFilterPanel : UserControl, IFilterPanel
    {
        ICollection<CargoIOResultDto> LatestValues;

        public IEosSendRecivedForm ParentForm { get; set; }

        //IEosSendRecivedForm IFilterPanel.ParentForm { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        public CargoDetailsFilterPanel(IEosSendRecivedForm parentForm)
        {
            InitializeComponent();
            ParentForm = parentForm;
            fromDateTimePicker.Value = DateTime.Now.AddMonths(-1);
            toDateTimePicker2.Value = DateTime.Now;
            FillAutoCompleteBox();
        }

        private void FillAutoCompleteBox()
        {
            var t = Task.Factory.StartNew(() =>
            {
                try
                {
                    var response = ParentForm.GetJsonObjecToLink<CargoRequiredData>(ApiAddress.CargoApi.CargoRequiredData);
                    if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && response.Values != null)
                    {
                        if (InvokeRequired)
                            Invoke(new MethodInvoker(() => FillData(response.Values)));
                        else
                            FillData(response.Values);
                    }
                }
                catch { }
            });
            t.Wait(10);

            void FillData(CargoRequiredData requiredData)
            {
                driverFullNameTextBox.TextBoxObject.IsNeedIgnoreHistory = true;
                originCompnayTextBox.TextBoxObject.IsNeedIgnoreHistory = true;
                detinationCompanyTextBox.TextBoxObject.IsNeedIgnoreHistory = true;
                merchandiseTitleTextBox.TextBoxObject.IsNeedIgnoreHistory = true;
                if (requiredData.Drivers != null)
                    driverFullNameTextBox.AutoCompleteDataSource = requiredData.Drivers;
                if (requiredData.companyDetails != null)
                    originCompnayTextBox.AutoCompleteDataSource = requiredData.companyDetails;
                if (requiredData.companyDetails != null)
                    detinationCompanyTextBox.AutoCompleteDataSource = requiredData.companyDetails;
                if (requiredData.Merchandises != null)
                    merchandiseTitleTextBox.AutoCompleteDataSource = requiredData.Merchandises;
            }
        }


        public void ClearPanel()
        {
            throw new NotImplementedException();
        }

        public bool GetValues()
        {
            ResponseResultWeb<List<CargoIOResultDto>> response = null;

            CargoFilterModel filter = new CargoFilterModel();
            filter.StartDateTime = fromDateTimePicker.Value?.Date ?? DateTime.MinValue;
            filter.EndDateTime = toDateTimePicker2.Value?.Date ?? DateTime.MaxValue;
            filter.Plate = eosPlateControl1.Plate;
            filter.OriginSectionId = (originCompnayTextBox.AutoCompleteSelectedItem as CompanyDetailsDto)?.SectionId;
            filter.DestinationSectionId = (detinationCompanyTextBox.AutoCompleteSelectedItem as CompanyDetailsDto)?.SectionId;
            filter.MerchandiseId = (merchandiseTitleTextBox.AutoCompleteSelectedItem as CargoMerchandiseEntity)?.Id;
            filter.DriverId = (driverFullNameTextBox.AutoCompleteSelectedItem as CargoDriverEntity)?.Id;
            filter.IsNeedAttachment = showAttachmentcheckBox.Checked;

            response = ParentForm.PostJsonObjecToLinkAndWait<List<CargoIOResultDto>>(ApiAddress.ReportApi.GetCargoIOReport, filter, false, false);


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



            List<KeyValuePair<string, object>> parameters = new List<KeyValuePair<string, object>>() {
                new KeyValuePair<string, object>("TitleDescription", titleDescription)
            };
            var dataSet = GetDataSetOfResult();
            if (dataSet == null)
                return;

            ReportsViewer.ShowReportResource("CargoIoReport.mrt", dataSet, parameters);
        }

        private DataSet GetDataSetOfResult()
        {
            DataSet ds = new DataSet("DB");

            var listRecord = LatestValues.ToList();

            if (listRecord == null)
                return null;

            var mainTable = ReportHelper.ToDataTable<CargoIOResultDto>(new List<CargoIOResultDto>().AsQueryable(), "MainTable", false);
            var AttachmentTable = ReportHelper.ToDataTable<CargoDocumentDto>(new List<CargoDocumentDto>().AsQueryable(), "AttachmentTable", false);



            foreach (var item in listRecord)
            {
                DataRow row = mainTable.NewRow();
                row["CargoId"] = item.CargoId;
                row["DumpId"] = item.DumpId;
                row["IsOutBoundCargo"] = item.IsOutBoundCargo;
                row["Plate"] = item.Plate;
                row["EnterDateTime"] = item.EnterDateTime;

                if (item.ExitDateTime != null && item.ExitDateTime.HasValue)
                    row["ExitDateTime"] = item.ExitDateTime.Value;

                row["DriverFirstName"] = item.DriverFirstName;
                row["DriverLastName"] = item.DriverLastName;
                row["Merchandise"] = item.Merchandise;
                row["OriginCompanyName"] = item.OriginCompanyName;
                row["OriginSectionName"] = item.OriginSectionName;
                row["DestinationCompanyName"] = item.DestinationCompanyName;
                row["DestinationSectionName"] = item.DestinationSectionName;
                row["Reason"] = item.Reason;
                row["Count"] = item.Count;
                row["Weight"] = item.Weight;
                row["Description"] = item.Description;
                row["SolarEnterDate"] = item.SolarEnterDate;
                row["CarPlateReversed"] = item.CarPlateReversed;

                if (item.ExitDateTime != null && item.ExitDateTime.HasValue)
                    row["SolarEndDate"] = item.SolarEndDate;

                if (item.Documents != null && item.Documents.Count > 0)
                {
                    foreach (var doc in item.Documents)
                    {
                        DataRow rowAtt = AttachmentTable.NewRow();
                        rowAtt["CargoId"] = item.CargoId;
                        rowAtt["Attachment"] = doc.Attachment;
                        AttachmentTable.Rows.Add(rowAtt);
                    }
                }
                mainTable.Rows.Add(row);
            }
            ds.Tables.Add(mainTable);
            ds.Tables.Add(AttachmentTable);

            return ds;
        }
    }
}
