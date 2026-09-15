using System;
using System.Globalization;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using CRT571TESTDLL;
using static EosParkingDispenser.CardDispenser;
using EosClocks;
using System.Reflection;
using EosParking.Data.EF.Dto;
using EosParking.Core.Enums;
using EosParking.Data.EF.Entities;
using EosParking.Controllers;
using System.Configuration;
using EosParking.Core.Helpers;
using System.Net.Http;
using System.Threading;
using EosParkingDispenser.Class;
using System.Linq;
using System.Threading.Tasks;
using ReportDispenser;
using System.IO;

namespace EosParkingDispenser
{
    public partial class mainForm : Form
    {
        UInt32 Hdle = 0;
        private CardDispenser cardDispenser;
        private OnlineEncoder _cardReader = null;
        private ParkingDoorEntity currentDoor = null;
        private Class.ANPRResult lastPlate;
        private string lastCardNumber = "12345";
        private int doorID = 5;
        private DateTime lastCardReaderRunTime;
        public string WebAddress { get; set; }
        

        private string lastFaceTag = "";
        private DateTime lastFaceTagEventTime;
        private ANPRResult anprResult;
        private FaceResult faceResult;
        Thread getDataFromDB = null;
        Thread playRTSP = null;
        Thread conncetDevice = null;
        Thread waitAndCloseApp = null;

        private bool appRunning = false;
        public List<KeyValuePair<string, DateTime>> _entranceCarLog = new List<KeyValuePair<string, DateTime>>();
        private int intervalGetDataFromServerSec = 5;
        DateTime lastServerTime;
        private bool demoFace = false;




        public mainForm()
        {
            InitializeComponent();
            getDataFromDB = new Thread(() => GetDataFromDB());
            playRTSP = new Thread(() => PlayRTSP());
            conncetDevice = new Thread(() => ConnectAllDeviceMaster());
            

        }

        private void ConnectAllDeviceMaster()
        {
            

            if (InvokeRequired) Invoke(new MethodInvoker(() =>
            { ConnectAllDevice(); }));
            else
            { ConnectAllDevice(); }

        }

        private void GetDataFromDB()
        {
            SetText1("start getting Data...");
            while (appRunning)
            {
                if (InvokeRequired)                    Invoke(new MethodInvoker(() =>
                    {                         picGetData.Visible = true;                     }));
                else
                {                    picGetData.Visible = true;                }

                //picGetData.Visible = true;
                faceResult = null;
                anprResult = null;
                anprResult = EosParkingDispenser.Class.DB.getPlate();
                if (anprResult != null)
                {
                    timerGetPlate_Tick(null, null);
                    if (anprResult.dbConnected)
                    {
                        faceResult = EosParkingDispenser.Class.DB.getFace();
                        timerGetFace_Tick(null, null);
                    }

                }
                if (InvokeRequired) Invoke(new MethodInvoker(() =>
                { picGetData.Visible = false; }));
                else
                { picGetData.Visible = false; }

                Thread.Sleep(intervalGetDataFromServerSec*1000);


            }
        }

        private void OpenCommBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void CloseCommBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void button1_Click(object sender, EventArgs e)
        {
           
        }

        private void CardStatusBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void SensorStatusBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void AllCardInBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void NoCardInBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void MoveCardToFront1Btn_Click(object sender, EventArgs e)
        {
            
        }

        private void MoveCardToFront2Btn_Click(object sender, EventArgs e)
        {
            
        }

        private void MoveCardToRFBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void MoveCardToICCBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void MoveCardToRecycleBinBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void CPUColdResetBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void CPUWarmResetBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void SendAPDUbtn_Click(object sender, EventArgs e)
        {
   
        }

        private void CPUDownbtn_Click(object sender, EventArgs e)
        {
            
        }

        private void RFTestTypeBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void ICTestTypeBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void CardActivateBtn_Click(object sender, EventArgs e)
        {
            	

        }

        private void TypeASendApduBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void CardDeactivateBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void TypeBSendApduBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void MiCardActivateBtn_Click(object sender, EventArgs e)
        {
            	
        }

        private void CardDactivateBtn_Click(object sender, EventArgs e)
        {
            
        }

        private void MiCheckPasswordBtn_Click(object sender, EventArgs e)
        {
            		
        }

        private void MiReadLockBtn_Click(object sender, EventArgs e)
        {
            	

        }

        private void MiWriteBlockBtn_Click(object sender, EventArgs e)
        {
            	

        }

        private void ReaderResetBtn_Load(object sender, EventArgs e)
        {

            SetText1($"ver: {Assembly.GetExecutingAssembly().GetName().Version.ToString()}");
            SetText1($"verEn: {System.Environment.Version.ToString()}");
            
            //this.Text += " " + Assembly.GetExecutingAssembly().GetName().Version.ToString();
        }

        private void button2_Click(object sender, EventArgs e)
        {





        }
        delegate void SetTextCallback(string text);
        delegate void SetResultCallback(CardDespenserResult text);
        private void SetText1(string text)
        {

            try
            {
                cardDispenser.AddLog(text);
            }
            catch { }

            if (this.textBoxLOG.InvokeRequired)
            {
                SetTextCallback d = new SetTextCallback(SetText1);
                this.Invoke(d, new object[] { text });
            }
            else
            {
                this.textBoxLOG.Text = text + Environment.NewLine + this.textBoxLOG.Text;
                this.textBoxLOG.ScrollToCaret();
            }
        }

        

        void EventFromDespencer(CardDespenserResult e)
        {

            SetText1("CardID: " + e.CardID + Environment.NewLine +
                " CardStatus: " + e.CardStatus + Environment.NewLine +
                e.MessageText + Environment.NewLine
                );

            if ((e.MessageID == 11) )
            {
                //ShowWarning("چند لحظه دیگر مجددا دکمه را بفشارید");
                var restTime = Convert.ToInt32(e.RestTimeRemain);
                if (restTime > 1)
                {
                    //ShowWarningAndHide($"لطفاً دکمه را {restTime} ثانیه دیگر بفشارید", restTime);
                    ShowWarningAndHide("چند لحظه دیگر مجددا دکمه را بفشارید");
                }
                else {
                    ShowWarningAndHide("", 0);
                }

                
            }


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

            if (((e.CardStatus == "120")|| (e.CardStatus == "100")) && (checkBoxShootOut.Checked))
            {
                    if (cardDispenser.ShootOut())
                    {
                        SetText1("ShootOut" + Environment.NewLine);
                    }
            }

            if (e.CardStatus == "000")
            {
                SetText1("Storage empty!" + Environment.NewLine);
                ShowWarning("مخزن کارت خالی می باشد");

                //MessageBox.Show("Storage empty!");
            }
            if (e.MessageID == 1071)
            {
                
                SetText1("ignore RedButton" + Environment.NewLine);
                //ShowWarningDown("در نسخه تشخیص چهره این دکمه فعال نیست");
                return;
            }

            string messageID = "-";
            try
            { messageID = e.MessageID.ToString(); }
            catch { }
            if ((!String.IsNullOrEmpty(e.CardID)) && (e.MessageID == 1))
            {
                //textBox1.Text += e.CardID + Environment.NewLine;
                SetLastCardNumber(e.CardID);
                CreateEnterDump(doorID, lastCardNumber,"" ,lastPlate);

                SetText1(e.CardID);
                ShowWarning("");
            } else if ((checkBoxPrintNoCard.Checked) && (messageID != "0") && (messageID != "1000") && (messageID != "11"))
            {
                //SetLastCardNumber(e.CardID);
                CreateEnterDump(doorID, "ورود بدون کارت","", lastPlate);

                SetText1("print noCard");
                ShowWarning("");
            }


            SetText1($"eventDespenser mID: {messageID}");
            

            return;



        }

        private void ShowWarningDown(string msg)
        {
            labelWarningDown.Visible = true;
            labelWarningDown.Text = msg;
            WaitNoFreeze(500);
            labelWarningDown.Visible = false;
        }

        private void ShowWarning(string msg)
        {



            if (!String.IsNullOrEmpty(msg))
            {
                picKeyPress.Visible = false;
                //labelWelcome.Text = msg;
                //Thread.Sleep(2000);
            }
            else
            {
                //labelMessage.Text = "جهت ورود دکمه زیر را فشار دهید";
                //labelWelcome.Text = "";
                picKeyPress.Visible = true;
            }
        }

        //private async Task<string> ShowWarningAndHide(string msg, int delaySecond = 2)
        private void ShowWarningAndHide(string msg, int delaySecond = 2)
        {
            SetText1($"ShowWarningAndHide[{delaySecond}],[{msg}]");
            if (!String.IsNullOrEmpty(msg))
            {
                picKeyPress.Visible = false;
                //labelMessage.Text = msg;
                labelCardNumber.Text = msg;
                labelCardNumber.Visible = true;

                //Thread.Sleep(delaySecond * 1000);
                WaitNoFreeze(delaySecond * 1000);
                //await Task.Delay(delaySecond * 1000);
                pictureBoxPersonImage.Visible = false;
                labelPersonName.Visible = false;
                labelWelcome.Visible = false;
                ShowWarningAndHide("", 0);
            }
            else
            {
                //labelMessage.Text = "";
                labelCardNumber.Text = "";
                labelCardNumber.Visible = false;
                picKeyPress.Visible = true;
                pictureBoxPersonImage.Visible = false;
                labelPersonName.Visible = false;
                labelWelcome.Visible = false;
            }
            //return "";
        }

        private void WaitNoFreeze(int milliseconds)
        {
                System.Windows.Forms.Timer timer1 = new System.Windows.Forms.Timer();
                if (milliseconds == 0 || milliseconds < 0) return;
                timer1.Interval = milliseconds;
                timer1.Enabled = true;
                timer1.Start();
                timer1.Tick += (s, e) =>
                {
                    timer1.Enabled = false;
                    timer1.Stop();
                };
                while (timer1.Enabled)
                {
                    Application.DoEvents();
                }
            
        }

        private void SetLastCardNumber(string cardID)
        {
            lastCardNumber = cardID;
            
            SetLabelCardNumber("لطفاً کارت خود را بردارید");
            //labelCardNumber.Text = $"شماره کارت: {cardID}";
            //labelCardNumber.Visible = true;


        }

        private void button3_Click(object sender, EventArgs e)
        {

            if (InvokeRequired) Invoke(new MethodInvoker(() =>
            { conncetDevice.Start(); }));
            else
            { conncetDevice.Start(); }

            
            
           



        }

        private void ConnectAllDevice()
        {
            string g4IP = "";

            int g4Port = 1001;
            int dispenserComPort = 7;
            byte deviceAddr = 0;
            try
            {
                g4IP = textBoxG4IP.Text;
                //if (demoFace)
                //{
                //    g4IP = "localhost";
                //}
                g4Port = Int16.Parse(textBoxG4Port.Text.Trim());
                dispenserComPort = Int16.Parse(textBoxDispenserComPort.Text.Trim());
                deviceAddr = (byte)(byte.Parse(textBoxDeviceAddr.Text, NumberStyles.Number));

            }
            catch (Exception ex)
            {
                SetText1("disp start err -->" + ex.Message);
                return;
            }
            ShowWarning("در حال اتصال به تجهیزات");
            //bool g4Connected = false;
            labelDeviceConnected.Text = "";
            try
            {
                CardDispenser.EquipmentEntity equipment = new CardDispenser.EquipmentEntity();
                equipment.Ip = g4IP;//"192.168.10.135";
                equipment.Port = g4Port;// 1001;
                equipment.ComPort = dispenserComPort;// 4;
                equipment.DeviceAddr = deviceAddr;

                cardDispenser = new CardDispenser(equipment, Int16.Parse(textBoxRestTime.Text), demoFace);
                cardDispenser.logFilePath = AppDomain.CurrentDomain.BaseDirectory + "\\log_disp.txt";
                CardDispenser.onCardOut += new OnCardOut(EventFromDespencer);

                var openCardDespenser = cardDispenser.OpenCardDespenser();
                picDispenser.Visible = openCardDespenser.dispenserConnected;
                if (openCardDespenser.dispenserConnected)
                {
                    labelDeviceConnected.Text += "C ";



                }
                picGate.Visible = openCardDespenser.g4Connected;
                if (openCardDespenser.g4Connected)
                {
                    labelDeviceConnected.Text += "G ";
                    //g4Connected = true;
                }

                EventFromDespencer(openCardDespenser);
            }
            catch (Exception)
            {
                // ignored
            }

            try
            {
                SetText1($"connecting CardReaedr--> {textBoxCardIP.Text.Trim()}");

                string cardIP = "";
                int cardPort = 1001;
                cardIP = textBoxCardIP.Text;
                cardPort = Int16.Parse(textBoxCardPort.Text.Trim());

                var readerConnected = ConnectCardReader(cardIP, cardPort);
                picCardReader.Visible = readerConnected;

                if (readerConnected)
                {
                    labelDeviceConnected.Text += "R ";
                }
            }
            catch (Exception)
            {
                // ignored
            }

            if (picGate.Visible)
            {
                ShowWarning("");
            }
        }

        private bool ConnectCardReader(string _deviceIp, int _devicePort)
        {
            bool ret_ = false;
            try
            {
                _cardReader = new OnlineEncoder(_deviceIp, _devicePort, false, Application.StartupPath);
                _cardReader.GetRecordRaised += ProcessGetRecordFromCardReader;
                if (_cardReader.Connect())
                {
                    SetText1($"Card Reader Connected [ {_deviceIp} ]");
                    //lblConnect.Text = "Connected";
                    _cardReader?.Start();
                    ret_ = true;
                    //timer1.Enabled = true;
                }

            }
            catch (Exception)
            {
                // ignored
            }

            return ret_;
        }

        private void ProcessGetRecordFromCardReader(object sender, RecordEvent.RecordEventArgs e)
        {
            string log = String.Empty;
            try
            {
                log = "CardReader--> ";
                
                var diffInSeconds = (DateTime.Now - lastCardReaderRunTime).TotalSeconds;
                int _restTimeSec = Int16.Parse(textBoxRestTime.Text.Trim() ?? "10");

                if (diffInSeconds >= _restTimeSec)
                {
                    if (!string.IsNullOrEmpty(e?.RecordData?.Data))
                    {
                        log += $" CardReader = ID:{e.RecordData.Data.ToString()} * DateTime:{e.RecordData.DateTime.ToString("yyyy/MM/dd HH:mm:ss")}";
                        lastCardReaderRunTime = DateTime.Now;
                        SetLastCardNumber(e.RecordData.Data.ToString());
                        CreateEnterDump(doorID, lastCardNumber,"", lastPlate);
                    }
                    else
                    {
                        log += " CardReader = NoData!";
                    }
                }
                else
                {
                    
                    ShowWarning("چند لحظه دیگر مجددا کارت بزنید");
                    log += $"card reader in rest time -{diffInSeconds}";
                }

                SetText1(log);
            }
            catch (Exception ex)
            {
                log = "ProcessGetRecordFromCardReader ERR--> " + ex.Message.ToString();
            }
        }


        private void button4_Click(object sender, EventArgs e)
        {
            DisconnectAll();
            


        }

        private void DisconnectAll()
        {
            
            if (InvokeRequired) Invoke(new MethodInvoker(() =>
            {
                labelDeviceConnected.Text = "";
            }));
            else
            {
                labelDeviceConnected.Text = "";
            }
            try
            {

                

                if (cardDispenser != null)
                {
                    var closeCardDespenser = cardDispenser.CloseCardDespenser();
                    CardDispenser.onCardOut -= new OnCardOut(EventFromDespencer);
                    EventFromDespencer(closeCardDespenser);
                }
                else
                {
                    CardDespenserResult closeCardDespenser = new CardDespenserResult();
                    closeCardDespenser.MessageText = "dispenser connection not found";
                    EventFromDespencer(closeCardDespenser);
                }
                if (InvokeRequired) Invoke(new MethodInvoker(() =>
                {
                    picDispenser.Visible = false;
                    picGate.Visible = false;
                }));
                else
                {
                    picDispenser.Visible = false;
                    picGate.Visible = false;
                }

                

            }
            catch (Exception)
            {
                // ignored
            }

            try
            {

                if (_cardReader != null)
                {
                    _cardReader.GetRecordRaised -= ProcessGetRecordFromCardReader;
                    _cardReader.Dispose();
                    _cardReader = null;
                }
                if (InvokeRequired) Invoke(new MethodInvoker(() =>
                {
                    picCardReader.Visible = false;
                }));
                else
                {
                    picCardReader.Visible = false;
                }

            }
            catch (Exception)
            {
                // ignored
            }
        }

        private void ReaderResetBtn_Shown(object sender, EventArgs e)
        {
            
            getResulation();
            labelPersonName.MaximumSize = new Size(360, 0);
            labelPersonName.AutoSize = true;
            picKeyPress.Top = 143;
            picKeyPress.Left = 106;


            //timerGetPlate.Enabled = true;
            //timerGetFace.Enabled = true;
            try
            {
                
                try
                {
                    demoFace = ((ConfigurationManager.AppSettings["demoFace"].ToString().Trim() ?? "") == "true");
                }
                catch { }
                if (demoFace)
                {
                    picKeyPress.Image = Properties.Resources.demoFace;
                }




            }
            catch (Exception ex)
            {
                SetText1("ERR(2): " + ex.Message);
            }

            try
            {
                bool debugMode = false;
                try
                {
                    debugMode = ((ConfigurationManager.AppSettings["debugMode"].ToString().Trim() ?? "") == "true");
                }
                catch { }
                textBoxDispenserComPort.Enabled =
                textBoxDeviceAddr.Enabled =
                textBoxG4IP.Enabled =
                textBoxG4Port.Enabled =
                textBoxCardIP.Enabled =
                textBoxCardPort.Enabled =
                checkBoxMoveToBin.Enabled =
                checkBoxShootOut.Enabled =
                textBoxRestTime.Enabled =
                checkBoxPrintNoCard.Enabled =
                checkBoxShowInvalidFace.Enabled =
                checkBoxWelcome.Enabled = 
                buttonClose.Visible =
                buttonOpen.Visible =

                buttonCardOut.Visible =
                pictureBoxPerson.Visible =
                checkBoxHCardOut.Visible =
                checkBoxHprint.Visible =
                button1.Visible  //testPrint
                = debugMode;




            }
            catch (Exception ex)
            {
                SetText1("ERR(2): " + ex.Message);
            }


            try
            {
                doorID = Convert.ToInt16(ConfigurationManager.AppSettings["DoorID"].ToString() ?? "5");
                SetText1($"doorID = {doorID}");


                textBoxG4IP.Text = ConfigurationManager.AppSettings["G4IP"].ToString().Trim() ?? "";
                SetText1($"g4IP = {textBoxG4IP.Text}");
                textBoxG4Port.Text = ConfigurationManager.AppSettings["G4Port"].ToString().Trim() ?? "1001";
                SetText1($"g4Port = {textBoxG4Port.Text}");
                textBoxDispenserComPort.Text = ConfigurationManager.AppSettings["DispenserComPort"].ToString().Trim() ?? "1001";
                SetText1($"comPort = {textBoxDispenserComPort.Text}");
                textBoxDeviceAddr.Text = ConfigurationManager.AppSettings["DispenserDeviceAddress"].ToString().Trim() ?? "00";
                SetText1($"Addr: = {textBoxDeviceAddr.Text}");

                textBoxCardIP.Text = ConfigurationManager.AppSettings["CardReaderIP"].ToString().Trim() ?? "";
                SetText1($"CardIP = {textBoxCardIP.Text}");
                textBoxCardPort.Text = ConfigurationManager.AppSettings["CardReaderPort"].ToString().Trim() ?? "1001";
                SetText1($"CardPort = {textBoxCardPort.Text}");
                textBoxRestTime.Text = ConfigurationManager.AppSettings["RestTime"].ToString().Trim()?? "11";
                SetText1($"RestTime = {textBoxRestTime.Text}");


                string autoStart = ConfigurationManager.AppSettings["AutoStart"].ToString().Trim().ToLower();
                SetText1($"autoStart = {autoStart}");

                

                if (autoStart == "true")
                {
                    button3_Click(sender, e);
                    SetText1("auto Start");
                }

                intervalGetDataFromServerSec = 5;
                try
                { intervalGetDataFromServerSec = Int16.Parse(ConfigurationManager.AppSettings["intervalGetDataFromServerSec"].ToString().Trim() ?? "5"); }
                catch { }
                SetText1($"intervalGetDataFromServerSec = {intervalGetDataFromServerSec}");


                
                var showRTSP = ConfigurationManager.AppSettings["showRTSP"].ToString().Trim() ?? "false";
                if (showRTSP == "true")
                {
                    SetText1($"playRTSP.Start");
                    playRTSP.Start();

                }



                appRunning = true;
                
                getDataFromDB.Start();
            }
            catch (Exception ex)
            {
                SetText1("ERR(1): " + ex.Message);
            }


        }

        private void PlayRTSP()
        {
            try
            {
                string rtspURL = ConfigurationManager.AppSettings["rtspURL"].ToString().Trim() ?? "";
                //string vlcLibDirectory = ConfigurationManager.AppSettings["vlcLibDirectory"].ToString().Trim() ?? "C:\\Program Files\\VideoLAN\\VLC";
                //worked on designerCS
                int playerPositopn = Int16.Parse(ConfigurationManager.AppSettings["playerPositopn"].ToString().Trim() ?? "2");
                int posX = 0;
                int posY = 0;

                switch (playerPositopn)
                {
                    case 1:
                        posX = 30;
                        posY = 60;
                        break;
                    case 2:
                        posX = 833;
                        posY = 58;
                        break;
                    case 3:
                        posX = 440;
                        posY = 600;
                        break;
                    default:
                        break;
                }

                if (!String.IsNullOrEmpty(rtspURL))
                {
                    if (InvokeRequired) Invoke(new MethodInvoker(() =>
                    { PlayVLC(rtspURL, posX, posY, ""); }));
                    else
                    { PlayVLC(rtspURL, posX, posY, ""); }

                }

                //get face rtsp url
                //playing
                //position:1,2,3
                //vlcLibDirectory


            }
            catch (Exception)
            {
                // ignored
            }
        }

        private void PlayVLC(string rtspURL, int posX, int posY, string vlcLibDirectory)
        {
            vlcControl1.Left = posX;
            vlcControl1.Top = posY;
            //vlcControl1.BeginInit();
            //vlcControl1.VlcLibDirectory = new DirectoryInfo(vlcLibDirectory);
            //vlcControl1.EndInit();
           
            vlcControl1.Visible = true;
            //vlcControl1.Play(new Uri("rtsp://admin:12345678Aa@192.168.30.142:554/livecam"));
            vlcControl1.Play(new Uri(rtspURL), ":rtsp-tcp");

        }

        private void getResulation()
        {
            try
            {
                Rectangle resolution = Screen.PrimaryScreen.Bounds;

                this.textBoxLOG.Text += "Resolution : " + resolution.Width + " X " + resolution.Height;

            }
            catch (Exception)
            {
                // ignored
            }
        }


        private void buttonHex_Click(object sender, EventArgs e)
        {
            string s = "10C5EC9C6"; //textBoxHEX.Text;// 
            string s1 = s.Substring(0, 4);
            string s2 = s.Substring(4, 4);
            long n = Int64.Parse(s, System.Globalization.NumberStyles.HexNumber);
            long n1 = Int64.Parse(s1, System.Globalization.NumberStyles.HexNumber);
            long n2 = Int64.Parse(s2, System.Globalization.NumberStyles.HexNumber);
            SetText1($"HEX:{s} to Long:{n}");
            SetText1($"HEX1:{s1} to Long:{n1}");
            SetText1($"HEX2:{s2} to Long:{n2}");
            SetText1($"DispID:{s} to CardID:{n2.ToString().PadLeft(5,'0')}{n1.ToString().PadLeft(5, '0')}");
            string sss = EosParkingDispenser.Class.Helper.DispenserHexToCardID(s);

            SetText1($"DispenserHexToCardID:{s} --> :{sss}");


        }

        private void buttonExit_Click(object sender, EventArgs e)
        {
            groupBoxSetting.Enabled = false;
            buttonExit.Enabled = false;
            Thread waitAndCloseApp = null;
            waitAndCloseApp = new Thread(() => ExitApp());
            waitAndCloseApp.Start();

            //ExitApp();
        }

        private void ExitApp()
        {

            try
            {

                SetText1("Exiting step1...");
                //this.Enabled = false;
                appRunning = false;
                try { getDataFromDB.Abort(); } catch { }
                try { playRTSP.Abort(); } catch { }
                try {
                    if (vlcControl1.Visible)
                    { vlcControl1.Stop(); }
                } catch { }

                try { conncetDevice.Abort(); } catch { }

                DisconnectAll();
                SetText1("Exiting step2...");
                Thread.Sleep(intervalGetDataFromServerSec * 1000);
                System.Windows.Forms.Application.Exit();
            }
            catch (Exception)
            {
                // ignored
            }
        }

        private void buttonSetting_Click(object sender, EventArgs e)
        {
            groupBoxSetting.Visible = !groupBoxSetting.Visible;
            if (groupBoxSetting.Visible)
            {
                groupBoxSetting.Location = new Point(25, 25);
                groupBoxSetting.Height = 600;
                //panelCenter.Visible = false;
                //groupBoxSetting.Size = new Size(370, 600); 

                groupBoxSetting.Focus();
                //entranceTypeComboBox.Focus();
            }
            else
            {
                buttonSetting.Focus();
                //panelCenter.Visible = true;
            }
        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            //var res = EosParkingDispenser.Class.ANPR.getPlate();
            
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
            PrintEnterFish(enterBill, "رسید ورود خودرو","","نام پارکینگ");
            var i = 0;

            //CreateEnterDump(doorID, lastCardNumber, lastPlate);

        }
        void PrintEnterFish(ExitBillDto value, string receipt,string faceID,string parkingName, bool warningGetPrint = true)
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
            if (warningGetPrint)
            {
                SetLabelCardNumber($"پس از چاپ رسید خود را بردارید");
            }
            SetText1("PrintEnterFish " + receipt);
            var parameters = new List<KeyValuePair<string, object>>
            {
                new KeyValuePair<string, object>("ParkingName","نام پارکینگ"/*_parking.ParkingName*/),
                new KeyValuePair<string, object>("Receipt",receipt),
            };
            
            /*QrData qrData = new QrData
            {
                plate = "12الف35211",
                cardID = "1654321458",
                doorID = 1,
                faceID = "1450",
                paidAmount = 0,
                rnn = "",
                tarrifID = 1,
                userID = 2,
                cash = 0,
                enteranceDate = DateTime.Now
            };
            */

            QrData qrData = new QrData
            {
                plate = value.CarPlate,
                cardID = value.CardNumber,
                doorID = doorID,
                faceID = faceID,
                paidAmount = 0,
                rnn = "",
                tarrifID = (int)value.TarrifId,
                userID = 0,
                cash = 0,
                //enteranceDate = value.EnterDateTime
                enteranceDate = lastServerTime //DateTime.Now
                
            };



            // * print new version
            /*            print prn = new print();

                        prn.doPrint(qrData, parkingName);
                        prn.Close();
                        prn.Dispose();
            */

            // old version         
            EosParkingTools.Utils.ReportsViewer.PrintReportResourceSync<ExitBillDto>("EntrancFishPrinter.mrt", new List<ExitBillDto> { value }, parameters: parameters);
            //EosParkingTools.Utils.ReportsViewer.PrintReportResourceSync<ExitBillDto>("EntrancFishPrinterFace.mrt", new List<ExitBillDto> { value }, parameters: parameters);
            
            ////Thread.Sleep(4000);
            labelCardNumber.Visible = false;

        }

        private void SetLabelCardNumber(string msg)
        {
            try
            {
                labelCardNumber.Text = msg;
                labelCardNumber.Visible = true;
                timerDisableMessage.Enabled = false;
                timerDisableMessage.Enabled = true;

            }
            catch { }
        }

        bool CreateEnterDump(int doorID, string cardNumber, string faceID, Class.ANPRResult anprResult, bool warningGetPrint = true)
        {
            bool bRet = false;
            if (String.IsNullOrEmpty(cardNumber))
            {
                SetText1("CreateEnterDump return, cardNumber empty");
                return bRet;
            }
            string carPlate = "";
            try
            {
                carPlate = anprResult.plateDetected_fa;
            }
            catch (Exception)
            {
                // ignored
            }

            var bcheckInList = _entranceCarLog.Any(q => q.Key == cardNumber && (DateTime.Now - q.Value).TotalSeconds < 90);
            if (bcheckInList)
            {
                SetText1("CreateEnterDump return, FoundInListAndIgnored(90s)");
                return bRet;

            }

            _entranceCarLog.Add(new KeyValuePair<string, DateTime>(cardNumber, DateTime.Now));

            var res = EosParkingDispenser.Class.DB.enterCarToParking(doorID,carPlate,cardNumber, faceID, demoFace);
            if (res != null)
            {
                bRet = true;
                try
                {
                    SetText1($"enterCarToParking msg= {res.msg}");
                }
                catch { }
                lastPlate = null;
                lastCardNumber = "";
                //labelCardNumber.Text = "";
                panelTopWrite_Plate.Visible = false;
                ExitBillDto enterBill =
                    new ExitBillDto
                    {
                        CardNumber = cardNumber,
                        CarPlate = carPlate,
                        EnterDateTime = res.entranceTime,
                        ExitDateTime = null,
                        DumpId = res.trafficDumpID

                    };

                if (!demoFace)
                {

                    PrintEnterFish(enterBill, "رسید ورود خودرو", faceID, res.parkingName, warningGetPrint);
                }
                else
                {

                    try
                    {
                        if (faceResult.mustGetReceipt || checkBoxHprint.Checked)
                        {

                            PrintEnterFish(enterBill, "رسید ورود", faceID, res.parkingName, warningGetPrint);
                        }
                        if (faceResult.mustGetCard || checkBoxHCardOut.Checked)
                        {

                            cardDispenser.CardOut();
                        }
                    }
                    catch (Exception)
                    {
                        // ignored
                    }
                }
            }
            else
            {
                SetText1("enterCarToParking null result");

            }

            return bRet;


        }

        private  void timerGetPlate_Tick(object sender, EventArgs e)
        {
            timerGetPlate.Enabled = false;
            try
            {
                //var res = EosParkingDispenser.Class.DB.getPlate();
                var res = anprResult;
                bool netConnected = false;
                bool showPlatePanel = false;
                string serverDate_ = "";
                string serverTime_ = "";
                if (res != null)
                {
                    netConnected = res.dbConnected;

                    if (!netConnected)
                    {
                        SetText1("ErrorDB: " + res.errorMessage);
                    }


                    //picNetwork.Visible = res.dbConnected;
                    if (res.plateDetected_fa != null)
                    {
                        lastPlate = res;
                    }
                    try
                    {
                        string[] servetTime = res.currentServerTime_Shamsi.Split(' ');
                        lastServerTime = res.currentServerTime;
                        //labelServerTime.Text = res.currentServerTime_Shamsi;
                        serverDate_ = servetTime[0];
                        serverTime_ = servetTime[1].Substring(0,5);
                        //if (labelServerDate.Text != servetTime[0])
                        //    labelServerDate.Text = servetTime[0];
                        //if (labelServerTime.Text != servetTime[1])
                        //    labelServerTime.Text = servetTime[1];
                    }
                    catch (Exception)
                    {
                        // ignored
                    }

                    string plate = res.plateDetected_fa;
                    if (!String.IsNullOrEmpty(plate))
                    {
                        labelPlate_City.Text = plate.Substring(plate.Length - 2, 2);
                        string plate_2len = plate.Substring(0, 2);
                        labelPlate_part1.Text = plate_2len;
                        string plate_alphabet = plate.Substring(2, plate.Length - 7);
                        labelPlate_part2.Text = plate_alphabet;

                        string plate_3len = plate.Substring(plate_alphabet.Length + 2, 3);
                        labelPlate_part3.Text = plate_3len;


                        //labelPlate_Other.Text = plate.Substring(0, 6);
                        showPlatePanel = true;
                    }
                }
                else
                {
                    netConnected = false;
                    //picNetwork.Visible = false;
                }
                if (InvokeRequired) Invoke(new MethodInvoker(() =>
                {
                    panelTopWrite_Plate.Visible = showPlatePanel;// true;
                    picNetwork.Visible = netConnected;
                    if (labelServerDate.Text != serverDate_)                         labelServerDate.Text = serverDate_;
                    if (labelServerTime.Text != serverTime_)                         labelServerTime.Text = serverTime_;

                }));
                else
                {
                    panelTopWrite_Plate.Visible = showPlatePanel;// true;
                    picNetwork.Visible = netConnected;
                    if (labelServerDate.Text != serverDate_) labelServerDate.Text = serverDate_;
                    if (labelServerTime.Text != serverTime_) labelServerTime.Text = serverTime_;
                }


            }
            catch (Exception)
            {
                // ignored
            }
            //timerGetPlate.Enabled = true;
        }

        private void timerDisableMessage_Tick(object sender, EventArgs e)
        {
            timerDisableMessage.Enabled = false;
            labelCardNumber.Visible = false;
            labelCardNumber.Text = "";
        }

        private void button2_Click_1(object sender, EventArgs e)
        {
            //SetLastCardNumber("تست کارتتو بردار");
            //var sqlOpen_ = EosParkingDispenser.Class.Helper.IsPortOpen("192.168.10.129", 1433, 2);
            //var sqlOpen2 = EosParkingDispenser.Class.Helper.IsPortOpen("192.168.11.129", 1433, 2);
            bool retSQl = SqlHostPortIsReady();
            bool retSQl2 = SqlHostPortIsReady();
        }

        private bool SqlHostPortIsReady()
        {
            bool ret_ = false;
            try
            {
                string hostName = ConfigurationManager.AppSettings["SqlServerIP"].ToString();
                int portNumber = Int16.Parse(ConfigurationManager.AppSettings["SqlServerPort"].ToString());
                ret_ = EosParkingDispenser.Class.Helper.IsPortOpen(hostName, portNumber, 1);

            }
            catch (Exception)
            {
                ret_ = false;
            }
            return ret_;
        }

        private void labelCardNumber_Click(object sender, EventArgs e)
        {

        }

        private  void timerGetFace_Tick(object sender, EventArgs e)
        {
            timerGetFace.Enabled = false;
            try
            {
                //var res = EosParkingDispenser.Class.DB.getFace();
                var res = faceResult;
                //picNetwork.Visible = res.dbConnected;
                if (res != null)
                {
                    
                    if (InvokeRequired) Invoke(new MethodInvoker(() =>
                    { try { labelFaceCamLastConnect.Text = "face camera last connect: " + res.CameraLastConnect_fa; } catch { } }));
                    else
                    { try { labelFaceCamLastConnect.Text = "face camera last connect: " + res.CameraLastConnect_fa; } catch { } }

                    if (!res.validFace)
                    {
                        if (checkBoxShowInvalidFace.Checked)
                        {
                            SetText1($"invalid face :fName:{res.facePersonName},tag:{res.FaceTag},detectAgo:{res.faceDetectAgo},print:{res.mustGetReceipt},card:{res.mustGetCard}");
                            SetText1($"::pName:{res.parkingPersonName}");
                            pictureBoxPerson.Image = res.personImage;
                            if (checkBoxWelcome.Checked)
                            {
                                
                                ShowPersonPic(res);
                                WaitNoFreeze(2 * 1000);

                                if (InvokeRequired) Invoke(new MethodInvoker(() =>
                                {
                                    ShowWarningAndHide("", 0);
                                }));
                                else
                                {
                                    ShowWarningAndHide("", 0);
                                }

                            }
                        }
                    }
                    else // validated FACE
                    {
                        //lastFaceIdDetected = res.faceEventID;
                        SetText1($"valid face :name:{res.facePersonName},tag:{res.FaceTag},detectAgo:{res.faceDetectAgo}");
                        SetText1($"::pName:{res.parkingPersonName}");
                        string cardID = "F" + res.FaceTag;
                        string faceID = res.FaceTag;
                        var bcheckInList = _entranceCarLog.Any(q => q.Key == cardID && (DateTime.Now - q.Value).TotalSeconds < 60);
                        pictureBoxPerson.Image = res.personImage;

                        //injaa
                        if (bcheckInList)
                        {
                            SetText1("faceRepeated Ignored(90s)");
                            if (lastFaceTag != res.FaceTag)
                            {
                                
                                ShowWarningAndHide($"اخیراً ورود «{res.parkingPersonName}»ثبت شده است", 10);
                                SetText1($"FoundInListAndIgnored(90s) :name:{res.facePersonName}");
                            }
                            return;
                        }
                         



                            if (DateTime.Now > lastFaceTagEventTime.AddSeconds(Int16.Parse(textBoxRestTime.Text)))
                        { 
                            lastFaceTag = res.FaceTag;
                            lastFaceTagEventTime = DateTime.Now;

                            //ShowWarningAndHide(res.facePersonName, 10);
                            //CreateEnterDump(doorID, "Face:" + res.facePersonName, lastPlate);
                            //check repeated
                            if (InvokeRequired) Invoke(new MethodInvoker(() =>
                            {
                                

                                var entered = CreateEnterDump(doorID, cardID, faceID, lastPlate, false);
                                if (entered)
                                {
                                    ShowPersonPic(res);
                                    ShowWarningAndHide($"در حال ثبت ورود «{res.parkingPersonName}»، شکیبا باشید", 4);
                                }

                            }));
                            else
                            {
                                //ShowPersonPic(res);
                                //ShowWarningAndHide(res.facePersonName, 10);
                                //CreateEnterDump(doorID, "Face:" + res.facePersonName, faceID, lastPlate, true);
                                var entered = CreateEnterDump(doorID, cardID, faceID, lastPlate, false);
                                if (entered)
                                {
                                    ShowPersonPic(res);
                                    ShowWarningAndHide($"در حال ثبت ورود «{res.parkingPersonName}»، شکیبا باشید", 4);
                                }


                            }

                        }
                        else {
                            SetText1("face detect in restTime");
                        }

 
                    }



                }


            }
            catch (Exception)
            {
                // ignored
            }
            ////timerGetFace.Enabled = true;
        }

        private void ShowPersonPic(FaceResult res)
        {
            try
            {

                if (InvokeRequired) Invoke(new MethodInvoker(() =>
                {
                    pictureBoxPersonImage.Image = res.personImage;
                    labelPersonName.Text = res.parkingPersonName;
                    labelPersonName.Visible = true;
                    labelWelcome.Visible = true;
                    pictureBoxPersonImage.Visible = true;
                    picKeyPress.Visible = false;
                }));
                else
                {
                    pictureBoxPersonImage.Image = res.personImage;
                    labelPersonName.Text = res.parkingPersonName;
                    labelPersonName.Visible = true;
                    labelWelcome.Visible = true;
                    pictureBoxPersonImage.Visible = true;
                    picKeyPress.Visible = false;
                }

            }
            catch (Exception)
            {
                // ignored
            }
        }

        private void Main_FormClosing(object sender, FormClosingEventArgs e)
        {
            appRunning = false;
        }

        private void picGetData_Click(object sender, EventArgs e)
        {

        }

        private void buttonCardOut_Click(object sender, EventArgs e)
        {
            string resS = "";
            try
            {
                var res = cardDispenser.CardOut();
                resS = $"cardOut:[{res.CardID}] , msg:[{res.MessageText}]";
                
            }
            catch (Exception ex)
            {
                resS = $"cardOutManual ERR: {ex.Message}";
            }
            SetText1(resS);
        }

        private void button1_Click_2(object sender, EventArgs e)
        {
            ExitBillDto enterBill =
                new ExitBillDto
                {
                    CardNumber = "100",
                    CarPlate = "",
                    EnterDateTime = DateTime.Now,
                    ExitDateTime = null,
                    DumpId = 100

                };
            PrintEnterFish(enterBill, "رسید ورود", "F450", "name", true);
        }

        private void button2_Click_2(object sender, EventArgs e)
        {
            vlcControl1.Visible = true;
            vlcControl1.Play(new Uri("rtsp://admin:12345678Aa@192.168.30.142:554/livecam"));
        }

        private void vlcControl1_Playing(object sender, Vlc.DotNet.Core.VlcMediaPlayerPlayingEventArgs e)
        {
            if (!vlcControl1.Visible)
            {
                vlcControl1.Visible = true;
            }
        }

        private void button3_Click_1(object sender, EventArgs e)
        {
            ShowWarningDown("test aaaa");
        }

        private void panelCenter_Paint(object sender, PaintEventArgs e)
        {

        }

        private void vlcControl1_Click(object sender, EventArgs e)
        {

        }

        //public virtual ResponseResultWeb<T> PostJsonObjecToLinkAndWait<T>(string apiAdress, object sendValue, bool allowCancel, bool lockParent = true)
        //{
        //  // #mj_added save all service api log
        //  try
        //  {
        //      // EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "PostJson: " + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(sendValue));
        //  }
        //  finally { }

        //  try
        //  {
        //      if (string.IsNullOrEmpty(WebAddress))
        //      {
        //          try
        //          {
        //              WebAddress = ConfigurationManager.AppSettings["ServerAddress"];
        //              if (!WebAddress.EndsWith("/"))
        //                  WebAddress = WebAddress + "/";

        //          }
        //          catch { }
        //      }
        //  }
        //  catch { }

        //  try
        //  {
        //      ResponseResultWeb<T> result = ResponseResultWeb<T>.FailResponse(new Exception());
        //      //if(typeof(T).IsValueType)
        //      Thread t = null;
        //      var task = Task.Factory.StartNew(() =>
        //      {
        //          Thread.CurrentThread.Name = $"PostRequest: {apiAdress}";
        //          t = Thread.CurrentThread;
        //          t.IsBackground = true;
        //          result = WebHelper.PostJsonObjecToLink<T>(WebAddress + apiAdress, sendValue);
        //          // #mj_added save all service api log
        //          try
        //          {
        //              string sendJSON = Newtonsoft.Json.JsonConvert.SerializeObject(sendValue);
        //              string resultJSON = Newtonsoft.Json.JsonConvert.SerializeObject(result);
        //              EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "SendJson: " + WebAddress + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(sendValue));
        //              EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "ResultJson: " + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(result));
        //          }
        //          finally { }

        //          return result;
        //      });

        //      task.Wait(10);
        //      var time = DateTime.Now.TimeOfDay;
        //      while (!task.IsCompleted && !task.IsCanceled)
        //      {
        //          if (t != null || (DateTime.Now - time).Second > 150)
        //              t.Abort();
        //          result = ResponseResultWeb<T>.FailResponse(new Exception("Task canceled."));
        //          result.ResponseResultType = EosParking.Core.Enums.ResponseResultTypes.NotSet;
        //          break;
        //              //task.Dispose();
        //          Thread.Sleep(10);
        //          Application.DoEvents();
        //      }

        //      //Waiting(false, allowCancel);
        //      return result;
        //  }
        //  finally {
        //      //Waiting(false, allowCancel); 
        //  }
        //}


        //void GetUserDoor(int doorID)
        //{
        //  var response = GetJsonObjecToLink<ParkingDoorEntity>("api/Parking/GetParkingDoor?doorId=", doorID);
        //  //if (this.InvokeRequired)
        //  //Invoke(new MethodInvoker(() =>
        //  //{

        //  if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
        //  {
        //      currentDoor = response.Values;
        //  }
        //  else
        //      currentDoor = null;
        //  // MessageShowError(response);
        //  //}));
        //}
        //        public virtual ResponseResultWeb<T> GetJsonObjecToLink<T>(string apiAdress, object sendValue = null, bool allowCancel = true)
        //        {
        //            int start = Environment.TickCount;
        //            ResponseResultWeb<T> result = ResponseResultWeb<T>.FailResponse(new Exception());
        //            try
        //            {
        //                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "GetJson: (START)" + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(sendValue));
        //            }
        //            finally { }

        //            result = WebHelper.SendJsonObjecToLink<T>(WebAddress + apiAdress, HttpMethod.Get, sendValue);



        //            // #mj_added save all service api log
        //            try
        //            {
        //                int duration = Environment.TickCount - start;
        //                EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, $"GetJson: (E N D) duration:({duration})" + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(sendValue));
        //                //EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, "ResultJson: " + apiAdress + " --> " + Newtonsoft.Json.JsonConvert.SerializeObject(result));
        //            }
        //            finally { }


        //            return result;
        //        }

        //        public virtual ResponseResultWeb<T> GetJsonObjecToLinkAndWait<T>(string apiAdress, object sendValue = null, bool allowCancel = true, bool lockParent = true)
        //{
        //  try
        //  {
        //      //Waiting(true, allowCancel, lockParent);
        //      ResponseResultWeb<T> result = ResponseResultWeb<T>.FailResponse(new Exception());
        //      //if(typeof(T).IsValueType)
        //      Thread t = null;
        //      var task = Task.Factory.StartNew(() =>
        //      {
        //          Thread.CurrentThread.Name = $"GetRequest: {apiAdress}";
        //          t = Thread.CurrentThread;
        //          t.IsBackground = true;
        //          result = WebHelper.SendJsonObjecToLink<T>(WebAddress + apiAdress, HttpMethod.Get, sendValue);
        //          return result;
        //      });
        //      task.Wait(10);
        //      while (!task.IsCompleted && !task.IsCanceled)
        //      {

        //              if (t != null)
        //                  t.Abort();
        //              result = ResponseResultWeb<T>.FailResponse(new Exception("Task canceled."));
        //              result.ResponseResultType = EosParking.Core.Enums.ResponseResultTypes.NotSet;
        //              break;
        //              //task.Dispose();

        //          Thread.Sleep(10);
        //          Application.DoEvents();
        //      }
        //      //Waiting(false, allowCancel);
        //      if (result.HttpResponseType == System.Net.HttpStatusCode.ServiceUnavailable)
        //      {
        //          //serviceIsAvalable = false;
        //          DialogResult = DialogResult.Retry;
        //          //Close();
        //      }
        //      return result;
        //  }
        //  finally { 
        //      //Waiting(false, allowCancel); 
        //  }
        //}

    }
}