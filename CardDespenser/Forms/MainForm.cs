using CRT571;
using EosParking.Data.EF.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using static CRT571.CardDispenser;

namespace CardDespenser
{
    public partial class frmMain : Form
    {
        UInt32 Hdle = 0;
        private CardDispenser cardDispenser;

        public frmMain()
        {
            InitializeComponent();
        }

        private void btnOpenDespenser_Click(object sender, EventArgs e)
        {
            CardDispenser.EquipmentEntity equipment = new CardDispenser.EquipmentEntity();
            equipment.Ip = "192.168.10.135";
            equipment.Port = 1001;
            equipment.ComPort = 4;

            cardDispenser = new CardDispenser(equipment, Int16.Parse(textBoxRestTime.Text));
            cardDispenser.logFilePath = AppDomain.CurrentDomain.BaseDirectory + "\\log_disp.txt";
            CardDispenser.onCardOut += new OnCardOut(EventFromDespencer);
            var openCardDespenser = cardDispenser.OpenCardDespenser();
            EventFromDespencer(openCardDespenser);

        }


        void EventFromDespencer(CardDespenserResult e)
        {

            SetText1("CardID: " + e.CardID + Environment.NewLine +
                " CardStatus: " + e.CardStatus + Environment.NewLine +
                e.MessageText + Environment.NewLine
                );


            if ((e.MessageID != 1) && (e.CardStatus == "220"))
            {
                if (checkBoxMoveToBin.Checked)
                {
                    if (cardDispenser.MoveCardBin())
                    {
                        SetText1("MoveCardBin" + Environment.NewLine);
                    }
                }
            }
            if (((e.CardStatus == "120") || (e.CardStatus == "100")) && (checkBoxShootOut.Checked))
            {
                if (cardDispenser.ShootOut())
                {
                    SetText1("ShootOut" + Environment.NewLine);
                }
            }

            if (e.CardStatus == "000")
            {
                MessageBox.Show("Storage empty!");
            }


            return;
            if ((!String.IsNullOrEmpty(e.CardID)) && (e.MessageID == 1))
            {
                //textBox1.Text += e.CardID + Environment.NewLine;
                SetText1(e.CardID);
            }
        }
        delegate void SetTextCallback(string text);
        delegate void SetResultCallback(CardDespenserResult text);
        private void SetText1(string text)
        {
            if (this.textBox1.InvokeRequired)
            {
                SetTextCallback d = new SetTextCallback(SetText1);
                this.Invoke(d, new object[] { text });
            }
            else
            {
                this.textBox1.Text += text + Environment.NewLine;
                this.textBox1.ScrollToCaret();
            }
        }

        private void button4_Click(object sender, EventArgs e)
        {
            var closeCardDespenser = cardDispenser.CloseCardDespenser();
            CardDispenser.onCardOut -= new OnCardOut(EventFromDespencer);

            EventFromDespencer(closeCardDespenser);
        }

        private void btnPrintTest_Click(object sender, EventArgs e)
        {
            ExitBillDto enterBill = 
            new ExitBillDto
            {
                CardNumber = "1520",
                CarPlate = "19ب19933",
                EnterDateTime = DateTime.Now,
                ExitDateTime = null,
                DumpId = 55665,
                MemberCode = "22"
            };
            PrintEnterFish(enterBill, "رسید ورود خودرو");


        }
        void PrintEnterFish(ExitBillDto value, string receipt)
        {
            /*
            if (!exitPrintCheckBox.Checked)
                return;
            //if(File.Exists(Application.StartupPath))
            if (PublicVariables.PrintAutomatic || ShowQuestion(message: "آیا می خواهید فیش خروج چاپ شود؟") == DialogResult.OK)
                ;
            else
                return;
            */
            var parameters = new List<KeyValuePair<string, object>>
            {
                new KeyValuePair<string, object>("ParkingName","نام پارکینگ"/*_parking.ParkingName*/),
                new KeyValuePair<string, object>("Receipt",receipt),
            };
            EosParkingTools.Utils.ReportsViewer.PrintReportResourceSync<ExitBillDto>("EntrancFishPrinter.mrt", new List<ExitBillDto> { value }, parameters: parameters);
        }

    }
}
