using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParking.Devices;
using EosParkingTools.EosForms;
using PosInterface;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Intek.PcPosLibrary;
using DevExpress.XtraPrinting;
using EosParkingProfessional.Models;

namespace EosParkingProfessional.EosForms
{
    public partial class PayForm : EosBaseDialogForm
    {
        private ExitBillDto _payDetails = null;
        ParkingDoorEntity currentDoor = null;
        static PCPOS paymentPcPos;
        private long payAmount = 0;
        public long factorId = 0;
        public string Receipt { get; set; } = null;
        public int TimeOutSecond { get; set; }

        public PayForm(ParkingDoorEntity currentDoor)
        {
            InitializeComponent();
            this.currentDoor = currentDoor;
            okButton.DialogResult = DialogResult.No;
        }
        //public PayForm()
        //{
        //    InitializeComponent(); 
        //    okButton.DialogResult = DialogResult.No;
        //}

        bool PayDump(PayTypes payType, string transactionResponse)
        {
            if (_payDetails == null)
                return false;
            var response = GetJsonObjecToLink<string>(ApiAddress.TrafficApi.PayDump, _payDetails.DumpId.ToString() + "&payType=" + payType.ToString() + "&transactionResponse=" + transactionResponse);
            if (response == null || response.ResponseResultType != EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                Thread.Sleep(500);
                response = GetJsonObjecToLink<string>(ApiAddress.TrafficApi.PayDump, _payDetails.DumpId.ToString() + "&payType=" + payType.ToString());
            }
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                if (string.IsNullOrEmpty(response.Values))
                    MessageShowError("پرداخت تایید نشد. لطفا دوباره تلاش کنید");
                Receipt = response.Values;
            }
            else
                MessageShowError(response);

            return !string.IsNullOrEmpty(response.Values);
        }


        public PayForm(ExitBillDto payDetails, ParkingDoorEntity currentDoor)
        {
            InitializeComponent();
            this.currentDoor = currentDoor;
            _payDetails = payDetails;
            SetDetails();
            qrCodePictureBox.Visible = true;
        }

        private void SetDetails(bool ShowPayButtonForFree = false)
        {
            payAmount = (long)(_payDetails?.CommonCost ?? payAmount);
            factorId = _payDetails?.DumpId ?? factorId;
            var tmpTarrifs = _payDetails?.TarrifIds;
            detailLabel.Text = _payDetails?.ToString();

            try
            {
                label2.Text = ((_payDetails?.CommonCost != 0) ? _payDetails?.CommonCost.ToString("0,0") : "0");
            }
            catch (Exception)
            {
                // ignored
            }

            posPayButton.Visible = currentDoor?.PcPos != null && !currentDoor.PcPos.Disabled;
            showPriceButton.Visible = currentDoor != null && currentDoor.HaveLcdPrice && payAmount > 0;
            okButton.Enabled = payAmount > 0 || ShowPayButtonForFree;
            posPayButton.Enabled = payAmount > 0;
            //TODO :commented for kiosk
            ////qrCodePictureBox.Image = _payDetails?.QrCode;
            qrCodePictureBox.Visible = true;
        }

        //public static DialogResult ShowPay(string payDetails, ParkingDoorEntity currentDoor , string title = "", Image qrCodeImage = null,int timeOut=0)
        //{
        //    using (var frm = new PayForm(currentDoor))
        //    {
        //        frm.titleLabel.Text = title;
        //        frm.detailLabel.Text = payDetails;
        //        frm.qrCodePictureBox.Image = qrCodeImage;
        //        if (timeOut != 0)
        //        {
        //            frm.timer1.Interval = timeOut;
        //            frm.timer1.Enabled = true;
        //        }
        //        return frm.ShowDialog();
        //    }
        //}

        public void SnedToPayForm(ResponsePos resp)
        {
            string message = "";
            if (resp.RS == "00")
            {
                message = $@"مبلغ «{resp.Amount_AM}» ریال با کارت بانکی «{resp.CardNumber_PN}» پرداخت گردید";

                PayDump(PayTypes.PosPay, resp.ResponseNumber_RN);
                MessageShowWarning(message, 15);
                DialogResult = DialogResult.OK;
            }
            else
            {
                message = $@"دریافت توسط کارتخوان موفقیت آمیز نبود. کد برگشی «{resp.RS}»";
                posPayButton.Enabled = true;
                MessageShowError(message, 15);
            }




            //detailLabel.Text += Environment.NewLine + resp.CardNumber_PN;
        }
        public static string ShowPay(ExitBillDto payDetails, ParkingDoorEntity currentDoor, PCPOS pcPos, ref PayForm payForm, string title = "پرداخت حق پارک", Image qrCodeImage = null, int timeOutSec = 0)
        {
            paymentPcPos = pcPos;
            using (var frm = new PayForm(payDetails, currentDoor))
            {
                payForm = frm;
                frm.titleLabel.Text = title;
                frm.qrCodePictureBox.Image = qrCodeImage;
                frm.ShowLcdPrice();
                //frm.qrCodePictureBox.Visible = true;
                if (timeOutSec == 0 && payDetails.CommonCost == 0)
                    timeOutSec = 5;
                if (timeOutSec != 0)
                {
                    //frm.timer1.Interval = timeOut;
                    frm.TimeOutSecond = timeOutSec;
                    frm.timer1.Enabled = true;
                }
                if (frm.ShowDialog() == DialogResult.OK)
                    return frm.Receipt;
                else
                    return null;
            }
        }

        public static string ShowPay(long payAmount, string details, long factorId, ParkingDoorEntity currentDoor = null, string title = "", Image qrCodeImage = null, int timeOutSec = 0, bool ShowPayButtonForFree = false)
        {
            using (var frm = new PayForm(currentDoor))
            {
                frm.payAmount = payAmount;
                frm.SetDetails(ShowPayButtonForFree);
                frm.ShowLcdPrice();
                frm.titleLabel.Text = title;
                frm.detailLabel.Text = details;
                frm.qrCodePictureBox.Image = qrCodeImage;
                frm.factorId = -factorId;
                //frm.qrCodePictureBox.Visible = true;
                if (timeOutSec == 0 && payAmount == 0)
                    timeOutSec = 5;
                if (timeOutSec != 0)
                {
                    //frm.timer1.Interval = timeOut;
                    frm.TimeOutSecond = timeOutSec;
                    frm.timer1.Enabled = true;
                }
                if (frm.ShowDialog() == DialogResult.OK /*|| payAmount==0*/)
                    return PublicVariables.CurrentUser.Id.ToString() + DateTime.Now.ToString("yyMMddHHmm");
                else
                    return null;
            }
        }

        public void ShowLcdPrice()
        {
            if (currentDoor != null && currentDoor.HaveLcdPrice)
            {
                SevenSegmentDisplayDevice sev = new SevenSegmentDisplayDevice(currentDoor.LcdPricePort);
                var _payable = payAmount;

                try
                {
                    if (ConfigurationManager.AppSettings["LcdPriceToman"].ToString().ToLower() == "true")
                    {
                        _payable = _payable / 10;
                    }
                }
                catch { }

                //sev.DisplayCapacitySync(payAmount.ToString());
                sev.DisplayCapacitySync(_payable.ToString());
            }
        }

        private void timer1_Tick(object sender, EventArgs e)
        {
            Text = (TimeOutSecond--).ToString() + "ثانیه تا بسته شدن پنجره";

            if (TimeOutSecond < 0)
            {
                timer1.Enabled = false;
                Text = "";
                if (payAmount == 0)
                    DialogResult = DialogResult.OK;
                else
                    DialogResult = DialogResult.Cancel;
                Close();
            }
        }

        private void panelControl2_MouseEnter(object sender, EventArgs e)
        {
            timer1.Enabled = false;
            Text = "";
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            try
            {
                if (_payDetails != null && PayDump(PayTypes.CashPay, ""))
                {
                    DialogResult = DialogResult.OK;
                }
                else
                {
                    //PayDefault();
                    DialogResult = DialogResult.OK;
                }
            }
            catch { }
        }

        private void PayDefault(bool withPos)
        {
            if (!withPos)
                DialogResult = DialogResult.OK;
            else
            {

            }
        }

        private void simpleButton1_Click(object sender, EventArgs e)
        {
            try
            {
                if (paymentPcPos == null)
                {
                    MessageShowError("ارتباط با پوز برقرار نمی باشد");
                    return;
                }
                else
                {
                    paymentPcPos.Amount = ((int)payAmount).ToString();
                    //#hardcode
#if DEBUG
                    paymentPcPos.Amount = "2000";
#endif

                    paymentPcPos.PrCode = "000000";
                    paymentPcPos.send_transaction();
                    posPayButton.Enabled = false;
                }
                /*
                                if (factorId > 0)
                                {


                                    if (PcPosPaied())
                                    {
                                        if (PayDump(PayTypes.PosPay))
                                            DialogResult = DialogResult.OK;
                                        else MessageShowError("وجه مورد نظر دریافت شد اما رکورد تایید نشد لطفا رکورد را مجددا ثبت کنید");
                                    }
                                }
                                else
                                {
                                    factorId = -1 * factorId;
                                    if (PcPosPaied())
                                    {
                                       DialogResult = DialogResult.OK;
                                    }
                                }


                                if (factorId > 0)
                                {
                                    if (PcPosPaied())
                                    {
                                        if (PayDump(PayTypes.PosPay))
                                            DialogResult = DialogResult.OK;
                                        else MessageShowError("وجه مورد نظر دریافت شد اما رکورد تایید نشد لطفا رکورد را مجددا ثبت کنید");
                                    }
                                }
                                else
                                {
                                    factorId = -1 * factorId;
                                    if (PcPosPaied())
                                    {
                                        DialogResult = DialogResult.OK;
                                    }
                                }
                                */


            }
            catch { }
        }

        private bool PcPosPaied()
        {
            if (factorId == 0)
            {
                MessageShowError("شماره فاکتور دریافت نشد. ");
                return false;
            }
            PcPosManager pcpos = new PcPosManager(currentDoor.PcPos);
            pcpos.Connect();
            Waiting(true, true);
            TransactionResult tr = null;
            Thread thr = null;
            Task.Factory.StartNew(() =>
            {
                thr = Thread.CurrentThread;
                tr = pcpos.Pay(payAmount, factorId);
            }).Wait(100);

            while (tr == null && thr.IsAlive && !EosWaitPanel.IsCanceled)
            {
                Application.DoEvents();
            }
            if (tr?.ErrorCode == 0)
            {
                return true;
            }
            else
            {
                MessageShowError("پرداخت انجام نشد. " + tr?.ErrorMsg);
            }

            Waiting(false);
            return false;
        }

        private void showPriceButton_Click(object sender, EventArgs e)
        {
            ShowLcdPrice();
        }

        private void PayForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            try
            {
                paymentPcPos = null;
            }
            catch (Exception)
            {
                // ignored
            }
        }
    }
}
