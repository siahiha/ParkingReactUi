using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Data.EF.Entities;
using EosParkingProfessional.Models;
using System;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class ParkingForm : EosParkingTools.EosForms.EosBaseDialogForm
    {
        private ParkingEntity _building;

        public ParkingEntity Building { get => _building; set => _building = value; }

        public ParkingForm()
        {
            InitializeComponent();

            //trafficTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(EntryAuthorizaitionTypes),true);
        }

        private void FillForm()
        {
            nameTextBox.Text = _building.ParkingName;
            addressTextBox.Text = _building.Address;
            tellTextBox.Text = _building.PhonNumber;
            costOfCardTextBox.Text = _building.CostOfCard.ToString("#,#");
            maxOfTransferCredit.Text = _building.MaxTransferCredit.ToString("#,#");
            minOnHostelryHours.Text = _building.MinOfHostelryHours.ToString("#,#");
            minOfNotFoundCarTextBox.Text = _building.MinOfNotFoundEnterCar.ToString("#,#");
            hostelryCheckBox.Checked = _building.HasHostelryTariff;
            hasBillControlCheckBox.Checked = _building.HasBillControl;
            //trafficTypeTextBox.TextBoxObject.SelectedIndex = (int)_building.TrafficType;

            shift3GroupControl.Enabled = _building.Shift2FromTime != null;
            shift1FromTextBox.Text = _building.Shift1FromTime.ToString("hh\\:mm");
            shift2FromTextBox.Text = _building.Shift2FromTime?.ToString("hh\\:mm");
            shift3FromTextBox.Text = _building.Shift3FromTime?.ToString("hh\\:mm");
            shift1ToTextBox.Text = _building.Shift1ToTime.ToString("hh\\:mm");
            shift2ToTextBox.Text = _building.Shift2ToTime?.ToString("hh\\:mm");
            shift3ToTextBox.Text = _building.Shift3ToTime?.ToString("hh\\:mm");

            taxTextBox.Text = _building.TaxRate.ToString("0");
            moneyValueTextBox.Text = _building.RoundingMoneyValue.ToString("#,#");
            moneyBorderTextBox.Text = _building.RoundingMoneyBorder.ToString("#,#");
        }

        public ParkingForm(ParkingEntity building)
        {
            InitializeComponent();

            //trafficTypeTextBox.TextBoxObject.DataSource = EnumHelper.EnumToListDisplayName(typeof(EntryAuthorizaitionTypes), true);
            Building = building;
            FillForm();
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(AccessItemTypes.ParkingInformationAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return;
            }
            if (string.IsNullOrEmpty(nameTextBox.Text))
            {
                MessageShowError("نام پارکینگ را وارد کنید");
                return;
            }
            if (shift1FromTextBox.TimeValue.Value == null || shift1FromTextBox.TimeValue.Value.Seconds + shift1FromTextBox.TimeValue.Value.Minutes + shift1FromTextBox.TimeValue.Value.Hours == 0)
            {
                MessageShowError("شیفتی انتخاب نشده است");
                return;
            }
            if (((shift2FromTextBox.TimeValue > new TimeSpan(0, 0, 0) && shift2FromTextBox.TimeValue < shift1ToTextBox.TimeValue) || (shift3FromTextBox.TimeValue > new TimeSpan(0, 0, 0) && shift3FromTextBox.TimeValue < shift2ToTextBox.TimeValue)))
            {
                MessageShowError("بازه های کاری مجموعه هم پوشانی دارند");
                return;
            }

            if (_building == null)
                _building = new ParkingEntity();// {ParkingName=nameTextBox.Text,Address=addressTextBox.Text,PhonNumber=tellTextBox.Text,TrafficType=(TrafficTypes)trafficTypeTextBox.TextBoxObject.SelectedIndex };

            _building.ParkingName = nameTextBox.Text;
            _building.Address = addressTextBox.Text;
            _building.PhonNumber = tellTextBox.Text;
            //_building.TrafficType = (TrafficTypes)trafficTypeTextBox.TextBoxObject.SelectedIndex;
            _building.CostOfCard = costOfCardTextBox.LongValue;
            _building.MaxTransferCredit = maxOfTransferCredit.LongValue;
            _building.MinOfHostelryHours = minOnHostelryHours.LongValue;
            _building.MinOfNotFoundEnterCar = minOfNotFoundCarTextBox.LongValue;
            _building.HasHostelryTariff = hostelryCheckBox.Checked;
            _building.Shift1FromTime = shift1FromTextBox.TimeValue.Value;
            _building.Shift2FromTime = shift2FromTextBox.TimeValue.Value.TotalSeconds == 0 ? null : shift2FromTextBox.TimeValue;
            _building.Shift3FromTime = shift3FromTextBox.TimeValue.Value.TotalSeconds == 0 ? null : shift3FromTextBox.TimeValue;
            _building.Shift1ToTime = shift1ToTextBox.TimeValue.Value;
            _building.Shift2ToTime = shift2ToTextBox.TimeValue;//.TotalSeconds == 0 ? new TimeSpan?() : shift2ToTextBox.TimeValue;
            _building.Shift3ToTime = shift3ToTextBox.TimeValue;//.TotalSeconds == 0 ? new TimeSpan?() : shift3ToTextBox.TimeValue;
            _building.TaxRate = taxTextBox.IntValue;
            _building.RoundingMoneyValue = moneyValueTextBox.LongValue;
            _building.RoundingMoneyBorder = moneyBorderTextBox.LongValue;
            _building.HasBillControl = hasBillControlCheckBox.Checked;

            var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.ParkingApi.Save, _building, false);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                _building.Id = response.Values;
                DialogResult = DialogResult.OK;
            }
            else
                MessageShowError(response);
        }

        private void hostelryCheckBox_CheckedChanged(object sender, EventArgs e)
        {
            minOnHostelryHours.Enabled = hostelryCheckBox.Checked;
        }

        private void shift2ToTextBox_Validated(object sender, EventArgs e)
        {
            if (shift2ToTextBox.TimeValue != null && shift2ToTextBox.TimeValue.Value.Hours + shift2ToTextBox.TimeValue.Value.Minutes > 0)
                shift3GroupControl.Enabled = true;
            else
                shift3GroupControl.Enabled = false;
        }
    }
}