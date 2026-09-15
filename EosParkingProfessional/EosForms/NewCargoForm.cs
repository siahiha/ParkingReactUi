using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraTab;
using EosParking.Controllers;
using EosParking.Core.Helpers;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParkingTools.EosControls;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class NewCargoForm : EosBaseForm
    {
        #region field
        private bool _forceCloseForm;
        private CargoRequiredData _requiredData;
        private List<CargoDocumentEntity> _documentEntryList;
        private CargoIORegistrationInfoDto _cargoIORegistrationInfo;
        #endregion

        #region readonly & constant
        public readonly ExitBillDto DumpInfo;
        public readonly bool IsExitCargo;
        #endregion

        #region Properties
        public bool IsBeforeRegistered { get; private set; }
        #endregion

        #region ctor
        public NewCargoForm(ExitBillDto dumpInfo, bool isExitCargo)
        {
            InitializeComponent();
            DumpInfo = dumpInfo;
            IsExitCargo = isExitCargo;
            PopupControl = addNewItemPopupWinControl;

            var isRegistered = GetJsonObjecToLinkAndWait<bool>(ApiAddress.CargoApi.IsCargoRegistered,
                $"trafficDumpId={dumpInfo.DumpId}&isOutBoundCargo={IsExitCargo}");

            IsBeforeRegistered = (isRegistered == null || isRegistered.Values) ? true : false;
        }

        #endregion

        #region InitializeForm
        private void NewCargoForm_Load(object sender, EventArgs e)
        {
            _forceCloseForm = false;
            if (IsBeforeRegistered)
            {
                MessageShowError($"قبلا بار {(IsExitCargo ? "خروجی" : "ورودی")} ثبت شده است");
                _forceCloseForm = true;
                this.Close();
            }

            var result = GetJsonObjecToLinkAndWait<CargoRequiredData>(ApiAddress.CargoApi.CargoRequiredData);

            if (result.HttpResponseType == System.Net.HttpStatusCode.OK && result.Values != null)
                _requiredData = result.Values ?? new CargoRequiredData();
        }

        private void InitializeTrafficDumpInfo()
        {
            if (IsExitCargo)
            {
                this.Text = "ثبت بار خروجی";
                infoGroupControl.Text = "ثبت مشخصات بار خروجی";
            }
            else
            {
                this.Text = "ثبت بار ورودی";
                infoGroupControl.Text = "ثبت مشخصات بار ورودی";
            }

            _cargoIORegistrationInfo = new CargoIORegistrationInfoDto();
            _documentEntryList = new List<CargoDocumentEntity>();
            attachmentsGridControl.DataSource = _documentEntryList;

            enterDateLabel.Text = DumpInfo.EnterDateTime.ToShamsiDate();
            enterTimeLabel.Text = DumpInfo.EnterDateTime.ToPersianTime();

            exitDateLabel.Text = DumpInfo.ExitDateTime?.ToPersianDate() ?? String.Empty;
            exitTimeLabel.Text = DumpInfo.ExitDateTime?.ToPersianTime() ?? String.Empty;

            plateNumberLabel.Text = DumpInfo?.CarPlateReversed ?? String.Empty;

        }

        private void NewCargoForm_Shown(object sender, EventArgs e)
        {
            GetPrequisteData();
            InitializeTrafficDumpInfo();
        }

        private void GetPrequisteData()
        {
            if (_requiredData == null)
            {
                _requiredData = new CargoRequiredData()
                {
                    Drivers = new List<CargoDriverEntity>(),
                    companyDetails = new List<CompanyDetailsDto>(),
                    Merchandises = new List<CargoMerchandiseEntity>(),
                };
            }
            if (_requiredData.Merchandises == null)
                _requiredData.Merchandises = new List<CargoMerchandiseEntity>();
            if (_requiredData.Drivers == null)
                _requiredData.Drivers = new List<CargoDriverEntity>();
            if (_requiredData.companyDetails == null)
                _requiredData.companyDetails = new List<CompanyDetailsDto>();

            driverFullNameTextBox.TextBoxObject.IsNeedIgnoreHistory = true;
            originCompnayTextBox.TextBoxObject.IsNeedIgnoreHistory = true;
            detinationCompanyTextBox.TextBoxObject.IsNeedIgnoreHistory = true;
            merchandiseTitleTextBox.TextBoxObject.IsNeedIgnoreHistory = true;
            driverFullNameTextBox.AutoCompleteDataSource = _requiredData.Drivers;
            originCompnayTextBox.AutoCompleteDataSource = _requiredData.companyDetails;
            detinationCompanyTextBox.AutoCompleteDataSource = _requiredData.companyDetails;
            merchandiseTitleTextBox.AutoCompleteDataSource = _requiredData.Merchandises;

        }
        #endregion

        #region SaveCargo & Cancel

        private void cancelButton_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void NewCargoForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (_forceCloseForm)
                e.Cancel = false;
            else
            {
                var result = ShowExitQuestion();

                if (result != DialogResult.OK)
                    e.Cancel = true;
                else
                    e.Cancel = false;
            }
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            /*if (_cargoIORegistrationInfo.cargoDrivers == null)
            {
                MessageShowError("لطفا راننده را انتخاب نمایید");
                return;
            }

            if (_cargoIORegistrationInfo.CargoMerchandises == null)
            {
                MessageShowError("لطفا نام کالا را انتخاب نمایید");
                return;
            }

            if (_cargoIORegistrationInfo.Company == null)
            {
                MessageShowError("نام شرکت را انتخاب نمایید");
                return;
            }

            var sectionInfo = _cargoIORegistrationInfo.Company.CompanySections;

            if (sectionInfo == null || sectionInfo.Count == 0)
            {
                MessageShowError("هیچ واحد انتخاب نشده است");
                return;
            }

           */

            if (!FinalizeCargoRegistration())
                return;

            var result = PostJsonObjecToLinkAndWait<bool>(ApiAddress.CargoApi.Save, _cargoIORegistrationInfo, false);

            if (result != null && result.Values)
            {
                MessageShowSucsess($"بار {(IsExitCargo ? "خروجی" : "ورودی")} با موفقیت ثبت گردید");
                _forceCloseForm = true;
                this.Close();
            }
            else
                MessageShowError(String.IsNullOrEmpty(result.Message) ? result.RealMessage : result.Message);
        }

        private bool FinalizeCargoRegistration()
        {
            var driver = (driverFullNameTextBox.AutoCompleteSelectedItem as CargoDriverEntity);
            if (driver == null)
            {
                MessageShowError("لطفا راننده را انتخاب نمایید");
                return false;
            }

            var merchandise = (merchandiseTitleTextBox.AutoCompleteSelectedItem as CargoMerchandiseEntity);

            if (merchandise == null)
            {
                MessageShowError("لطفا کالا را انتخاب نمایید");
                return false;
            }

            var originCompanyDetails = originCompnayTextBox.AutoCompleteSelectedItem as CompanyDetailsDto;

            if (originCompanyDetails == null)
            {
                MessageShowError("لطفا بخش مبدا را انتخاب نمایید");
                return false;
            }
             originCompanyDetails.IsOriginSection = true;
            originCompanyDetails.IsDestinationSection = false;

            var destinationCompanyDetails = detinationCompanyTextBox.AutoCompleteSelectedItem as CompanyDetailsDto;
            if (destinationCompanyDetails == null)
            {
                MessageShowError("لطفا بخش مقصد را انتخاب نمایید");
                return false;
            }

             destinationCompanyDetails.IsDestinationSection = true;
            destinationCompanyDetails.IsOriginSection = false;

             if (destinationCompanyDetails.CompanyId == originCompanyDetails.CompanyId &&
                    destinationCompanyDetails.CompanyName == originCompanyDetails.CompanyName)
            {
                MessageShowError("شرکت مبدا و مقصد نمی تواند یکسان انتخاب شود");
                return false;
            }

            _cargoIORegistrationInfo.cargoDrivers = driver;
            _cargoIORegistrationInfo.CargoMerchandises = merchandise;
            _cargoIORegistrationInfo.TrafficDumpId = DumpInfo.DumpId;
            _cargoIORegistrationInfo.Weight = weightTextBox.IntValue;
            _cargoIORegistrationInfo.Count = countTextBox.IntValue;
            _cargoIORegistrationInfo.Resason = resonTextBox.Text;
            _cargoIORegistrationInfo.Description = furtherDetailsTextBox.Text;
            _cargoIORegistrationInfo.IsOutBoundCargo = IsExitCargo;

            SetOrigianAndDestinationData(originCompanyDetails, destinationCompanyDetails);


            return true;
        }

        private void SetOrigianAndDestinationData(CompanyDetailsDto originCompanyDetails, CompanyDetailsDto destinationCompanyDetails)
        {
            var companyDetailsList = new List<CompanyDetailsDto>();
            if (originCompanyDetails.CompanyId == 0)
                AddNewCompanyToList(originCompanyDetails);

            if (destinationCompanyDetails.CompanyId == 0)
                AddNewCompanyToList(destinationCompanyDetails);

            if (originCompanyDetails.CompanyId != 0)
                AddNewSectionTolist(originCompanyDetails);

            if (destinationCompanyDetails.CompanyId != 0)
                AddNewSectionTolist(destinationCompanyDetails);

            companyDetailsList.Add(originCompanyDetails);
            companyDetailsList.Add(destinationCompanyDetails);

            _cargoIORegistrationInfo.companyDetailsList = companyDetailsList.OrderBy(q => q.CompanyId)
                                                                            .ThenBy(q => q.CompanyName)
                                                                            .ThenBy(q => q.SectionId)
                                                                            .ThenBy(q => q.SectionName)
                                                                            .ToList();


            void AddNewCompanyToList(CompanyDetailsDto company)
            {
                var list = _requiredData.companyDetails
                                        .Where(c => c.CompanyId == company.CompanyId
                                                     && c.CompanyName == company.CompanyName
                                                     && !(c.SectionId == company.SectionId
                                                     && c.SectionName == company.SectionName))
                                        .Select(q => new CompanyDetailsDto()
                                        {
                                            CompanyId = q.CompanyId,
                                            CompanyName = q.CompanyName,
                                            SectionId = q.SectionId,
                                            SectionName = q.SectionName,
                                            IsDestinationSection = false,
                                            IsOriginSection = false,
                                        });

                if (list != null)
                    companyDetailsList.AddRange(list);
            }

            void AddNewSectionTolist(CompanyDetailsDto company)
            {
                var list = _requiredData.companyDetails
                             .Where(c => c.CompanyId == company.CompanyId
                                         && c.SectionId == 0
                                         && (c.SectionId != company.SectionId
                                             && c.SectionName != company.SectionName))
                             .Select(q => new CompanyDetailsDto()
                             {
                                 CompanyId = q.CompanyId,
                                 CompanyName = q.CompanyName,
                                 SectionId = q.SectionId,
                                 SectionName = q.SectionName,
                                 IsDestinationSection = false,
                                 IsOriginSection = false,
                             });

                if (list != null)
                    companyDetailsList.AddRange(list);
            }
        }

        #endregion

        private void AddAttachmentButton_Click(object sender, EventArgs e)
        {
            OpenFileDialog dialog = new OpenFileDialog();
            dialog.Filter = "JPEG File ( *.jpg;*.jpeg;*.jpe)" +
                            "Portable Network Graphics(*.png)|*.png " +
                            "Bitmap Image File(*.bmp)" +
                            "All Image File (*.jpg;*.jpeg;*.jpe;*.png;*.bmp";
            dialog.FilterIndex = 4;

            var result = dialog.ShowDialog();

            if (result != DialogResult.OK)
                return;


            if (_documentEntryList is null)
            {
                _documentEntryList = new List<CargoDocumentEntity>();
                attachmentsGridControl.DataSource = _documentEntryList;
            }

            for (int i = 0; i < dialog.FileNames.Length; i++)
            {
                var item = File.ReadAllBytes(dialog.FileNames[i]);
                if (_documentEntryList.Exists(currentAttachment => currentAttachment.Attachment.SequenceEqual(item)))
                {
                    MessageShowError("فایل انتخاب شده تکراری می باشد");
                    return;
                }
                _documentEntryList.Add(new CargoDocumentEntity() { Attachment = item, Description = dialog.SafeFileNames[i] });
            }

            _cargoIORegistrationInfo.cargoDocuments = _documentEntryList;
            attachmentsGridControl.RefreshDataSource();
        }

        private void insertOriginCompanyButton_Click(object sender, EventArgs e)
        {
            ShowPopupNewItem(registerNewCompanyTab);
            ResetCompanyControsl();
            addNewItemPopupWinControl.Tag = originCompnayTextBox;
            ShowPopup(true);
        }

        private void insertDetinationCompanyButton_Click(object sender, EventArgs e)
        {
            ShowPopupNewItem(registerNewCompanyTab);
            ResetCompanyControsl();
            addNewItemPopupWinControl.Tag = detinationCompanyTextBox;
            ShowPopup(true);
        }

        private void ResetCompanyControsl()
        {
            companySectionPopupGridControl.Enabled = false;
            sectionPopupTextBox.Enabled = false;
            addSectionButton.Enabled = false;
            addCompanyButton.Enabled = true;
            findCompayButton.Enabled = true;
        }

        private void insertMerchandiseButton_Click(object sender, EventArgs e)
        {
            ShowPopupNewItem(registerNewTabMerchandise);
            ShowPopup(true);
        }

        private void removeAttachmentRepositoryItemButtonEdit_Click(object sender, EventArgs e)
        {
            var currentDocument = (attachmentsGridControl.MainView as GridView)?.GetFocusedRow() as CargoDocumentEntity;

            if (currentDocument == null)
                return;

            _documentEntryList.Remove(currentDocument);
            attachmentsGridControl.RefreshDataSource();
        }

        private void OpenAttachmentViewrepositoryItemButtonEdit_Click(object sender, EventArgs e)
        {

        }


        #region Add New Items


        private void insertCarSpecificationButton_Click(object sender, EventArgs e)
        {
            ShowPopupNewItem(carSpecificationTab);

            CarInfoDto carInfo = null;
            try
            {
                var result = GetJsonObjecToLinkAndWait<CarInfoDto>(ApiAddress.CargoApi.GetCarInfo, $"plate={DumpInfo.AbsolutCarPlate}");

                if (result != null && result.HttpResponseType != System.Net.HttpStatusCode.OK)
                {
                    MessageShowError("امکان دریافت اطلاعات میسر نمی باشد");
                    return;
                }

                carInfo = result.Values;

                if (carInfo != null)
                {
                    carNamePopupTextBox.Text = carInfo.Name;
                    eosPlatePopupControl.Plate = carInfo.Plate;
                    eosPlatePopupControl.CarType = carInfo.CarType;
                    carModelPopupTextBox.Text = carInfo.CarModelName;
                    carColorPopupTextBox.Text = carInfo.CarColorName;
                    addNewItemPopupWinControl.Tag = carInfo;
                }

                ShowPopup(true);

            }
            catch (Exception ex)
            {
                MessageShowError(ex);
                ClosePopup();
            }

        }

        private void insertDriverButton_Click(object sender, EventArgs e)
        {
            ShowPopupNewItem(registerNewTabDriver);
            ShowPopup(true);

        }

        private void ShowPopupNewItem(XtraTabPage currentTab)
        {
            registerNewTabControl.ShowTabHeader = DevExpress.Utils.DefaultBoolean.False;
            addNewItemPopupWinControl.Tag = null;
            foreach (XtraTabPage tab in registerNewTabControl.TabPages)
            {
                if (tab == currentTab)
                {
                    tab.PageVisible = true;
                    addNewItemPopupWinControl.CaptionText = tab.Text;
                    foreach (var control in tab?.Controls)
                    {
                        if (control is Control status)
                            status.Enabled = true;
                        if (control is EosParkingTools.EosControls.EosTextBox textBox)
                            textBox.Text = String.Empty;
                        if (control is EosParkingTools.EosControls.EosGridControl grid)
                            grid.DataSource = null;
                    }
                }
                else
                    tab.PageVisible = false;
            }
        }

        private void AddNewPopupButton_Click(object sender, EventArgs e)
        {
            if (carSpecificationTab.PageVisible)
            {
                var newCarInfo = new CarInfoDto()
                {
                    CarId = (addNewItemPopupWinControl.Tag as CarInfoDto)?.CarId ?? 0,
                    CarType = eosPlatePopupControl.CarType,
                    Plate = eosPlatePopupControl.Plate,
                    CarModelName = carModelPopupTextBox.Text,
                    CarColorName = carColorPopupTextBox.Text,
                    Name = carNamePopupTextBox.Text,
                };

                var result = PostJsonObjecToLinkAndWait<bool>(ApiAddress.CargoApi.SetCarInfo, newCarInfo, false);

                if (result == null) MessageShowError("امکان ارسال اطلاعات بر روی سرور میسر نمی باشد!");
                else if (result.HttpResponseType != System.Net.HttpStatusCode.OK || result.Values == false)
                    MessageShowError(String.IsNullOrEmpty(result.Message) ? result.RealMessage : result.Message);
                else
                {
                    MessageShowSucsess();
                    ClosePopup();
                }

            }
            else if (registerNewTabDriver.PageVisible)
            {
                if (!driverInputsValidation())
                    return;

                var newDriver = new CargoDriverEntity()
                {
                    FirstName = driverFirstNamePopupTextBox.Text,
                    LastName = driverLastNamePopupTextBox.Text,
                    NationalCode = driverNationalCodePopupTextBox.Text,
                    mobileNumber = Int64.Parse(drivermobileNumberPopupTextBox.Text),
                };


                var deleteNewDriver = _requiredData?.Drivers?.Where(driver => driver.Id == 0).FirstOrDefault();
                if (deleteNewDriver != null)
                    _requiredData.Drivers.Remove(deleteNewDriver);

                _requiredData.Drivers.Add(newDriver);
                driverFullNameTextBox.Refresh();
                driverFullNameTextBox.TextBoxObject.SelectedIndex = _requiredData.Drivers.Count - 1;
                ClosePopup();
                driverFullNameTextBox.Focus();
            }
            else if (registerNewTabMerchandise.PageVisible)
            {
                if (String.IsNullOrEmpty(merchandisePopupTextBox.Text))
                {
                    MessageShowError("لطفا عنوان کالا را مشخص نمایید");
                    return;
                }
                var isExistsMerchandise = _requiredData.Merchandises
                    .Where(merchandise => merchandise.MerchandiseTitle == merchandisePopupTextBox.Text && merchandise.Id > 0)
                    ?.Any() ?? false;

                if (isExistsMerchandise)
                {
                    MessageShowError("عنوان کالا از قبل تعریف شده است");
                    return;
                }

                var newMerchandise = new CargoMerchandiseEntity()
                {
                    MerchandiseTitle = merchandisePopupTextBox.Text,
                };

                var deleteNewMerchandise = _requiredData.Merchandises.Where(merchandise => merchandise.Id == 0).FirstOrDefault();
                if (deleteNewMerchandise != null)
                    _requiredData.Merchandises.Remove(deleteNewMerchandise);

                _requiredData.Merchandises.Add(newMerchandise);
                merchandiseTitleTextBox.Refresh();
                merchandiseTitleTextBox.TextBoxObject.SelectedIndex = _requiredData.Merchandises.Count - 1;
                ClosePopup();
                merchandiseTitleTextBox.Focus();
            }
            else if (registerNewCompanyTab.PageVisible)
            {
                var companyInfo = companyPopupTextBox.Tag as CompanyEntity;

                if (companyInfo == null)
                {
                    MessageShowError("لطفا اطلاعات شرکت و بخش ها را تکمیل نمایید");
                    return;
                }

                var companySectionInfo = (companySectionPopupGridControl.DataSource as List<CompanySectionEntity>);

                if (companySectionInfo == null || companySectionInfo.Count == 0)
                {
                    MessageShowError("هیچگونه بخشی تعریف نشده است");
                    return;
                }


                var hasNewSection = companySectionInfo.Except(_requiredData.companyDetails
                                                 .Where(oldCompany => oldCompany.CompanyId == companyInfo.Id 
                                                        && oldCompany.CompanyName == companyInfo.CompanyName)
                                                 ?.Select(section => new CompanySectionEntity()
                                                 {
                                                     CompanyId = section.CompanyId,
                                                     Id = section.SectionId,
                                                     SectionName = section.SectionName,
                                                 }), new CompanySectionEntity())?.Any() ?? false;

                if (!hasNewSection)
                {
                    MessageShowError("هیچ بخشی جدیدی تعریف نشده است");
                    return;
                }

                companyInfo.CompanySections = companySectionInfo;
                _cargoIORegistrationInfo.Company = companyInfo;

                var companydetailInfo = companyInfo.CompanySections
                                                   .Where(section => section.Id == 0)
                                                   .Select(sec => new CompanyDetailsDto()
                                                   {
                                                       CompanyId = companyInfo.Id,
                                                       CompanyName = companyInfo.CompanyName,
                                                       SectionId = sec.Id,
                                                       SectionName = sec.SectionName,
                                                   }
                                                   );

                foreach (var info in companydetailInfo)
                    _requiredData.companyDetails.RemoveAll(main => main.CompanyId == info.CompanyId
                                                                   && main.CompanyName == info.CompanyName
                                                                   && main.SectionId == info.SectionId
                                                                   && main.SectionName == info.SectionName);

                _requiredData.companyDetails.AddRange(companydetailInfo);
                _requiredData.companyDetails = _requiredData.companyDetails
                                                            .OrderBy(compnay => compnay.CompanyId)
                                                            .ThenBy(section => section.SectionId).ToList();

                var companytextBox = (addNewItemPopupWinControl.Tag as EosTextBox);
                if (companytextBox != null)
                {
                    companytextBox.AutoCompleteDataSource = _requiredData.companyDetails;
                    var idx = _requiredData.companyDetails.FindLastIndex(rec => rec.SectionId == 0);
                    companytextBox.TextBoxObject.SelectedIndex = idx;

                    EosTextBox otherCompanyTextBox =
                        (companytextBox.Name == "originCompnayTextBox" ? detinationCompanyTextBox : originCompnayTextBox);
                    if (otherCompanyTextBox.AutoCompleteSelectedItem is CompanyDetailsDto details)
                    {
                        otherCompanyTextBox.Refresh();
                        idx = _requiredData.companyDetails.FindIndex(q => q.CompanyId == details.CompanyId &&
                                                                    q.CompanyName == details.CompanyName &&
                                                                    q.SectionId == details.SectionId &&
                                                                    q.SectionName == details.SectionName);
                        otherCompanyTextBox.TextBoxObject.SelectedIndex = idx;
                    }
                    else
                        otherCompanyTextBox.Refresh();
                }
                ClosePopup();
            }
        }

        private void cancelpopupButton_Click(object sender, EventArgs e)
        {
            ClosePopup();
        }

        #endregion

        private void EosTextBox_SelectedValueChanged(object sender, EventArgs e)
        {
            var eosTextBox = (sender as EosParkingTools.EosControls.EosTextBox);

            if (eosTextBox == null)
                return;

            if (eosTextBox.AutoCompleteSelectedItem is CargoDriverEntity driver)
                _cargoIORegistrationInfo.cargoDrivers = driver;
            else if (eosTextBox.AutoCompleteSelectedItem is CargoMerchandiseEntity merchandise)
                _cargoIORegistrationInfo.CargoMerchandises = merchandise;

        }

        private bool driverInputsValidation()
        {

            if (!ValidationHelper.IsValidNationalCode(driverNationalCodePopupTextBox.Text))
            {
                MessageShowError("کد ملی معتبر نمی باشد");
                return false;
            }

            var isRepetitiveDriver = _requiredData?.Drivers
                                                ?.Where(driver => driver.NationalCode == driverNationalCodePopupTextBox.Text && driver.Id > 0).Any();
            if (isRepetitiveDriver != null && isRepetitiveDriver.Value)
            {
                MessageShowError("کد ملی وارد شده تکراری می باشد");
                return false;
            }

            if (String.IsNullOrEmpty(driverFirstNamePopupTextBox.Text))
            {
                MessageShowError("لطفا نام راننده را وارد نمایید");
                return false;
            }
            if (String.IsNullOrEmpty(driverLastNamePopupTextBox.Text))
            {
                MessageShowError("لطفا نام خانوادگی راننده را وارد نمایید");
                return false;
            }
            if (!String.IsNullOrEmpty(drivermobileNumberPopupTextBox.Text) && !Int64.TryParse(drivermobileNumberPopupTextBox.Text, out _))
            {
                MessageShowError("شماره همراه معتبر نمی باشد");
                return false;
            }
            return true;
        }

        private void findCompanyButton_Click(object sender, EventArgs e)
        {
            if (!ValidateCompanyPopupTextBox())
                return;

            if (_requiredData.companyDetails.Count == 0)
            {
                MessageShowInformation("اطلاعاتی برای جستجو وجود ندارد");
                return;
            }

            CompanyDetailsDto companyInfo = new CompanyDetailsDto();
            companyInfo = _requiredData.companyDetails
                                               ?.Where(company => company.CompanyName == companyPopupTextBox.Text)
                                               .FirstOrDefault();


            if (companyInfo == null)
            {
                MessageShowInformation("شرکتی با نام وارد شده یافت نشد");
                return;
            }

            companySectionPopupGridControl.DataSource = null;
            var companySectionList = _requiredData.companyDetails
                                                  .Where(company => company.CompanyName == companyPopupTextBox.Text)
                                                  .Select(section => new CompanySectionEntity()
                                                  {
                                                      CompanyId = section.CompanyId,
                                                      SectionName = section.SectionName,
                                                      Id = section.SectionId
                                                  })?.ToList();

            if (companySectionList != null)
            {
                companyPopupTextBox.Tag = new CompanyEntity() { Id = companyInfo.CompanyId, CompanyName = companyInfo.CompanyName };
                companySectionPopupGridControl.DataSource = companySectionList;
                companySectionPopupGridControl.Enabled = true;
                addSectionButton.Enabled = sectionPopupTextBox.Enabled = true;
                addCompanyButton.Enabled = false;
                findCompayButton.Enabled = false;
            }
            else
                MessageShowInformation("هیچگونه اطلاعاتی یافت نشد");
        }

        private void addCompanyButton_Click(object sender, EventArgs e)
        {
            if (!ValidateCompanyPopupTextBox())
                return;

            var isComapnyExists = _requiredData.companyDetails
                                               ?.Where(company => company.CompanyName == companyPopupTextBox.Text)
                                               ?.Any() ?? false;

            if (isComapnyExists)
            {
                MessageShowError("نام وارد شده قبلا استفاده شده است");
                return;
            }

            companySectionPopupGridControl.Enabled = true;
            addSectionButton.Enabled = sectionPopupTextBox.Enabled = true;
            addCompanyButton.Enabled = false;
            companyPopupTextBox.Tag = new CompanyEntity() { CompanyName = companyPopupTextBox.Text };
            companySectionPopupGridControl.DataSource = new List<CompanySectionEntity>();
            addCompanyButton.Enabled = false;
            findCompayButton.Enabled = false;
            companyPopupTextBox.Enabled = false;
        }

        private void deleteSectionRepositoryItemButtonEdit_Click(object sender, EventArgs e)
        {
            var delSection = ((companySectionPopupGridControl.MainView as GridView)?.GetFocusedRow() as CompanySectionEntity);

            if (delSection == null)
                return;

            if (delSection.Id > 0)
            {
                MessageShowError("امکان حذف بخش های قدیمی وجود ندارد");
                return;
            }

            (companySectionPopupGridControl.DataSource as List<CompanySectionEntity>)?.Remove(delSection);
            companySectionPopupGridControl.RefreshDataSource();
        }

        private bool ValidateCompanyPopupTextBox()
        {
            if (string.IsNullOrEmpty(companyPopupTextBox.Text))
            {
                MessageShowError("لطفا نام شرکت را وارد نمایید");
                return false;
            }

            return true;
        }

        private void addSectionButton_Click(object sender, EventArgs e)
        {
            if (String.IsNullOrEmpty(sectionPopupTextBox.Text))
            {
                MessageShowError("نام بخش را وارد نمایید");
                return;
            }

            bool hasDuplicatedSection = (companySectionPopupGridControl.DataSource as List<CompanySectionEntity>)
                ?.Any(section => section.SectionName == sectionPopupTextBox.Text) ?? false;

            if (hasDuplicatedSection)
            {
                MessageShowError("عنوان بخش تکراری است لطفا نام دیگری را وارد نمایید");
                return;
            }

            (companySectionPopupGridControl.DataSource as List<CompanySectionEntity>).Add(new CompanySectionEntity()
            {
                SectionName = sectionPopupTextBox.Text,
            });
            companySectionPopupGridControl.RefreshDataSource();
            companySectionPopupGridControl.Refresh();
            sectionPopupTextBox.Text = String.Empty;
            sectionPopupTextBox.Focus();
        }
    }
}
