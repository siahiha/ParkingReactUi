using CRT571TESTDLL;
using System.Configuration;
using System.IO;

namespace EosParkingDispenser
{
    partial class mainForm
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            //if (Hdle != 0)
            //{
            //    int i = DllClass.CommClose(Hdle);
            //    Hdle = 0;
            //    CommPortStatusLabel.Text = "Comm. Port is Closed";

            //}
            //if (disposing && (components != null))
            //{
            //    components.Dispose();
            //}
            //base.Dispose(disposing);
        }


        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(mainForm));
            this.timerGetPlate = new System.Windows.Forms.Timer(this.components);
            this.timerDisableMessage = new System.Windows.Forms.Timer(this.components);
            this.timerGetFace = new System.Windows.Forms.Timer(this.components);
            this.panelCenter = new System.Windows.Forms.Panel();
            this.labelWarningDown = new System.Windows.Forms.Label();
            this.vlcControl1 = new Vlc.DotNet.Forms.VlcControl();
            this.labelPersonName = new System.Windows.Forms.Label();
            this.groupBoxSetting = new System.Windows.Forms.GroupBox();
            this.button3 = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.button1 = new System.Windows.Forms.Button();
            this.checkBoxWelcome = new System.Windows.Forms.CheckBox();
            this.pictureBoxPerson = new System.Windows.Forms.PictureBox();
            this.buttonCardOut = new System.Windows.Forms.Button();
            this.checkBoxHprint = new System.Windows.Forms.CheckBox();
            this.checkBoxHCardOut = new System.Windows.Forms.CheckBox();
            this.labelFaceCamLastConnect = new System.Windows.Forms.Label();
            this.checkBoxShowInvalidFace = new System.Windows.Forms.CheckBox();
            this.checkBoxPrintNoCard = new System.Windows.Forms.CheckBox();
            this.buttonExit = new System.Windows.Forms.Button();
            this.labelDeviceConnected = new System.Windows.Forms.Label();
            this.label29 = new System.Windows.Forms.Label();
            this.textBoxCardPort = new System.Windows.Forms.TextBox();
            this.label28 = new System.Windows.Forms.Label();
            this.textBoxCardIP = new System.Windows.Forms.TextBox();
            this.label27 = new System.Windows.Forms.Label();
            this.textBoxDeviceAddr = new System.Windows.Forms.TextBox();
            this.label26 = new System.Windows.Forms.Label();
            this.textBoxLOG = new System.Windows.Forms.TextBox();
            this.textBoxDispenserComPort = new System.Windows.Forms.TextBox();
            this.label25 = new System.Windows.Forms.Label();
            this.textBoxG4IP = new System.Windows.Forms.TextBox();
            this.label24 = new System.Windows.Forms.Label();
            this.textBoxG4Port = new System.Windows.Forms.TextBox();
            this.label11 = new System.Windows.Forms.Label();
            this.textBoxRestTime = new System.Windows.Forms.TextBox();
            this.label10 = new System.Windows.Forms.Label();
            this.buttonClose = new System.Windows.Forms.Button();
            this.checkBoxMoveToBin = new System.Windows.Forms.CheckBox();
            this.checkBoxShootOut = new System.Windows.Forms.CheckBox();
            this.buttonOpen = new System.Windows.Forms.Button();
            this.picKeyPress = new System.Windows.Forms.PictureBox();
            this.panelIcons = new System.Windows.Forms.Panel();
            this.picGetData = new System.Windows.Forms.PictureBox();
            this.picGate = new System.Windows.Forms.PictureBox();
            this.picDispenser = new System.Windows.Forms.PictureBox();
            this.picCardReader = new System.Windows.Forms.PictureBox();
            this.picNetwork = new System.Windows.Forms.PictureBox();
            this.labelCardNumber = new System.Windows.Forms.Label();
            this.buttonSetting = new System.Windows.Forms.Button();
            this.panelTopWrite_Plate = new System.Windows.Forms.Panel();
            this.labelPlate_part3 = new System.Windows.Forms.Label();
            this.labelPlate_part2 = new System.Windows.Forms.Label();
            this.labelPlate_part1 = new System.Windows.Forms.Label();
            this.labelPlate_City = new System.Windows.Forms.Label();
            this.pictureBoxPlate = new System.Windows.Forms.PictureBox();
            this.labelServerTime = new System.Windows.Forms.Label();
            this.labelServerDate = new System.Windows.Forms.Label();
            this.labelWelcome = new System.Windows.Forms.Label();
            this.pictureBoxPersonImage = new System.Windows.Forms.PictureBox();
            this.panelCenter.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.vlcControl1)).BeginInit();
            this.groupBoxSetting.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxPerson)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.picKeyPress)).BeginInit();
            this.panelIcons.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.picGetData)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.picGate)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.picDispenser)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.picCardReader)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.picNetwork)).BeginInit();
            this.panelTopWrite_Plate.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxPlate)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxPersonImage)).BeginInit();
            this.SuspendLayout();
            // 
            // timerGetPlate
            // 
            this.timerGetPlate.Interval = 800;
            this.timerGetPlate.Tick += new System.EventHandler(this.timerGetPlate_Tick);
            // 
            // timerDisableMessage
            // 
            this.timerDisableMessage.Interval = 4000;
            this.timerDisableMessage.Tick += new System.EventHandler(this.timerDisableMessage_Tick);
            // 
            // timerGetFace
            // 
            this.timerGetFace.Interval = 800;
            this.timerGetFace.Tick += new System.EventHandler(this.timerGetFace_Tick);
            // 
            // panelCenter
            // 
            this.panelCenter.BackColor = System.Drawing.Color.Transparent;
            this.panelCenter.BackgroundImage = ((System.Drawing.Image)(resources.GetObject("panelCenter.BackgroundImage")));
            this.panelCenter.Controls.Add(this.labelWarningDown);
            this.panelCenter.Controls.Add(this.vlcControl1);
            this.panelCenter.Controls.Add(this.labelPersonName);
            this.panelCenter.Controls.Add(this.groupBoxSetting);
            this.panelCenter.Controls.Add(this.picKeyPress);
            this.panelCenter.Controls.Add(this.panelIcons);
            this.panelCenter.Controls.Add(this.labelCardNumber);
            this.panelCenter.Controls.Add(this.buttonSetting);
            this.panelCenter.Controls.Add(this.panelTopWrite_Plate);
            this.panelCenter.Controls.Add(this.labelServerTime);
            this.panelCenter.Controls.Add(this.labelServerDate);
            this.panelCenter.Controls.Add(this.labelWelcome);
            this.panelCenter.Controls.Add(this.pictureBoxPersonImage);
            this.panelCenter.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panelCenter.Location = new System.Drawing.Point(0, 0);
            this.panelCenter.Name = "panelCenter";
            this.panelCenter.Size = new System.Drawing.Size(1024, 768);
            this.panelCenter.TabIndex = 111;
            this.panelCenter.Paint += new System.Windows.Forms.PaintEventHandler(this.panelCenter_Paint);
            // 
            // labelWarningDown
            // 
            this.labelWarningDown.BackColor = System.Drawing.Color.Transparent;
            this.labelWarningDown.Font = new System.Drawing.Font("B Zar", 14.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelWarningDown.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(128)))), ((int)(((byte)(128)))), ((int)(((byte)(255)))));
            this.labelWarningDown.Location = new System.Drawing.Point(343, 727);
            this.labelWarningDown.Name = "labelWarningDown";
            this.labelWarningDown.Size = new System.Drawing.Size(435, 32);
            this.labelWarningDown.TabIndex = 140;
            this.labelWarningDown.Text = "sample";
            this.labelWarningDown.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.labelWarningDown.Visible = false;
            // 
            // vlcControl1
            // 
            this.vlcControl1.BackColor = System.Drawing.Color.Black;
            this.vlcControl1.Location = new System.Drawing.Point(849, 69);
            this.vlcControl1.Name = "vlcControl1";
            this.vlcControl1.Size = new System.Drawing.Size(136, 105);
            this.vlcControl1.Spu = -1;
            this.vlcControl1.TabIndex = 139;
            this.vlcControl1.Text = "vlcControl1";
            this.vlcControl1.Visible = false;
            this.vlcControl1.VlcLibDirectory = ((System.IO.DirectoryInfo)(resources.GetObject("vlcControl1.VlcLibDirectory")));
            this.vlcControl1.VlcMediaplayerOptions = new string[] {
        ":rtsp-tcp"};
            this.vlcControl1.Playing += new System.EventHandler<Vlc.DotNet.Core.VlcMediaPlayerPlayingEventArgs>(this.vlcControl1_Playing);
            this.vlcControl1.Click += new System.EventHandler(this.vlcControl1_Click);
            // 
            // labelPersonName
            // 
            this.labelPersonName.AutoSize = true;
            this.labelPersonName.BackColor = System.Drawing.Color.Transparent;
            this.labelPersonName.Font = new System.Drawing.Font("B Titr", 26F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelPersonName.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(128)))), ((int)(((byte)(64)))), ((int)(((byte)(0)))));
            this.labelPersonName.Location = new System.Drawing.Point(515, 178);
            this.labelPersonName.Name = "labelPersonName";
            this.labelPersonName.Size = new System.Drawing.Size(174, 62);
            this.labelPersonName.TabIndex = 120;
            this.labelPersonName.Text = "جناب آقای ";
            this.labelPersonName.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            this.labelPersonName.Visible = false;
            // 
            // groupBoxSetting
            // 
            this.groupBoxSetting.Controls.Add(this.button3);
            this.groupBoxSetting.Controls.Add(this.button2);
            this.groupBoxSetting.Controls.Add(this.button1);
            this.groupBoxSetting.Controls.Add(this.checkBoxWelcome);
            this.groupBoxSetting.Controls.Add(this.pictureBoxPerson);
            this.groupBoxSetting.Controls.Add(this.buttonCardOut);
            this.groupBoxSetting.Controls.Add(this.checkBoxHprint);
            this.groupBoxSetting.Controls.Add(this.checkBoxHCardOut);
            this.groupBoxSetting.Controls.Add(this.labelFaceCamLastConnect);
            this.groupBoxSetting.Controls.Add(this.checkBoxShowInvalidFace);
            this.groupBoxSetting.Controls.Add(this.checkBoxPrintNoCard);
            this.groupBoxSetting.Controls.Add(this.buttonExit);
            this.groupBoxSetting.Controls.Add(this.labelDeviceConnected);
            this.groupBoxSetting.Controls.Add(this.label29);
            this.groupBoxSetting.Controls.Add(this.textBoxCardPort);
            this.groupBoxSetting.Controls.Add(this.label28);
            this.groupBoxSetting.Controls.Add(this.textBoxCardIP);
            this.groupBoxSetting.Controls.Add(this.label27);
            this.groupBoxSetting.Controls.Add(this.textBoxDeviceAddr);
            this.groupBoxSetting.Controls.Add(this.label26);
            this.groupBoxSetting.Controls.Add(this.textBoxLOG);
            this.groupBoxSetting.Controls.Add(this.textBoxDispenserComPort);
            this.groupBoxSetting.Controls.Add(this.label25);
            this.groupBoxSetting.Controls.Add(this.textBoxG4IP);
            this.groupBoxSetting.Controls.Add(this.label24);
            this.groupBoxSetting.Controls.Add(this.textBoxG4Port);
            this.groupBoxSetting.Controls.Add(this.label11);
            this.groupBoxSetting.Controls.Add(this.textBoxRestTime);
            this.groupBoxSetting.Controls.Add(this.label10);
            this.groupBoxSetting.Controls.Add(this.buttonClose);
            this.groupBoxSetting.Controls.Add(this.checkBoxMoveToBin);
            this.groupBoxSetting.Controls.Add(this.checkBoxShootOut);
            this.groupBoxSetting.Controls.Add(this.buttonOpen);
            this.groupBoxSetting.Location = new System.Drawing.Point(36, 26);
            this.groupBoxSetting.Name = "groupBoxSetting";
            this.groupBoxSetting.Size = new System.Drawing.Size(369, 607);
            this.groupBoxSetting.TabIndex = 113;
            this.groupBoxSetting.TabStop = false;
            this.groupBoxSetting.Visible = false;
            // 
            // button3
            // 
            this.button3.Location = new System.Drawing.Point(234, 256);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(98, 20);
            this.button3.TabIndex = 142;
            this.button3.Text = "warDown";
            this.button3.UseVisualStyleBackColor = true;
            this.button3.Visible = false;
            this.button3.Click += new System.EventHandler(this.button3_Click_1);
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(234, 226);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(98, 20);
            this.button2.TabIndex = 141;
            this.button2.Text = "rtsp";
            this.button2.UseVisualStyleBackColor = true;
            this.button2.Visible = false;
            this.button2.Click += new System.EventHandler(this.button2_Click_2);
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(234, 200);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(98, 20);
            this.button1.TabIndex = 140;
            this.button1.Text = "test print";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click_2);
            // 
            // checkBoxWelcome
            // 
            this.checkBoxWelcome.AutoSize = true;
            this.checkBoxWelcome.Location = new System.Drawing.Point(244, 134);
            this.checkBoxWelcome.Name = "checkBoxWelcome";
            this.checkBoxWelcome.Size = new System.Drawing.Size(68, 17);
            this.checkBoxWelcome.TabIndex = 139;
            this.checkBoxWelcome.Text = "welcome";
            this.checkBoxWelcome.UseVisualStyleBackColor = true;
            // 
            // pictureBoxPerson
            // 
            this.pictureBoxPerson.Location = new System.Drawing.Point(32, 202);
            this.pictureBoxPerson.Name = "pictureBoxPerson";
            this.pictureBoxPerson.Size = new System.Drawing.Size(148, 115);
            this.pictureBoxPerson.TabIndex = 137;
            this.pictureBoxPerson.TabStop = false;
            // 
            // buttonCardOut
            // 
            this.buttonCardOut.Location = new System.Drawing.Point(234, 172);
            this.buttonCardOut.Name = "buttonCardOut";
            this.buttonCardOut.Size = new System.Drawing.Size(98, 20);
            this.buttonCardOut.TabIndex = 136;
            this.buttonCardOut.Text = "Card out";
            this.buttonCardOut.UseVisualStyleBackColor = true;
            this.buttonCardOut.Click += new System.EventHandler(this.buttonCardOut_Click);
            // 
            // checkBoxHprint
            // 
            this.checkBoxHprint.AutoSize = true;
            this.checkBoxHprint.Location = new System.Drawing.Point(135, 151);
            this.checkBoxHprint.Name = "checkBoxHprint";
            this.checkBoxHprint.Size = new System.Drawing.Size(57, 17);
            this.checkBoxHprint.TabIndex = 135;
            this.checkBoxHprint.Text = "H print";
            this.checkBoxHprint.UseVisualStyleBackColor = true;
            // 
            // checkBoxHCardOut
            // 
            this.checkBoxHCardOut.AutoSize = true;
            this.checkBoxHCardOut.Location = new System.Drawing.Point(39, 151);
            this.checkBoxHCardOut.Name = "checkBoxHCardOut";
            this.checkBoxHCardOut.Size = new System.Drawing.Size(76, 17);
            this.checkBoxHCardOut.TabIndex = 134;
            this.checkBoxHCardOut.Text = "H card out";
            this.checkBoxHCardOut.UseVisualStyleBackColor = true;
            // 
            // labelFaceCamLastConnect
            // 
            this.labelFaceCamLastConnect.AutoSize = true;
            this.labelFaceCamLastConnect.Location = new System.Drawing.Point(18, 320);
            this.labelFaceCamLastConnect.Name = "labelFaceCamLastConnect";
            this.labelFaceCamLastConnect.Size = new System.Drawing.Size(130, 13);
            this.labelFaceCamLastConnect.TabIndex = 133;
            this.labelFaceCamLastConnect.Text = "face camera last connect:";
            // 
            // checkBoxShowInvalidFace
            // 
            this.checkBoxShowInvalidFace.AutoSize = true;
            this.checkBoxShowInvalidFace.Location = new System.Drawing.Point(135, 134);
            this.checkBoxShowInvalidFace.Name = "checkBoxShowInvalidFace";
            this.checkBoxShowInvalidFace.Size = new System.Drawing.Size(109, 17);
            this.checkBoxShowInvalidFace.TabIndex = 132;
            this.checkBoxShowInvalidFace.Text = "show InvalidFace";
            this.checkBoxShowInvalidFace.UseVisualStyleBackColor = true;
            // 
            // checkBoxPrintNoCard
            // 
            this.checkBoxPrintNoCard.AutoSize = true;
            this.checkBoxPrintNoCard.Checked = true;
            this.checkBoxPrintNoCard.CheckState = System.Windows.Forms.CheckState.Checked;
            this.checkBoxPrintNoCard.Location = new System.Drawing.Point(39, 133);
            this.checkBoxPrintNoCard.Name = "checkBoxPrintNoCard";
            this.checkBoxPrintNoCard.Size = new System.Drawing.Size(84, 17);
            this.checkBoxPrintNoCard.TabIndex = 131;
            this.checkBoxPrintNoCard.Text = "Print noCard";
            this.checkBoxPrintNoCard.UseVisualStyleBackColor = true;
            // 
            // buttonExit
            // 
            this.buttonExit.Location = new System.Drawing.Point(40, 563);
            this.buttonExit.Name = "buttonExit";
            this.buttonExit.Size = new System.Drawing.Size(75, 23);
            this.buttonExit.TabIndex = 128;
            this.buttonExit.Text = "خروج";
            this.buttonExit.UseVisualStyleBackColor = true;
            this.buttonExit.Click += new System.EventHandler(this.buttonExit_Click);
            // 
            // labelDeviceConnected
            // 
            this.labelDeviceConnected.AutoSize = true;
            this.labelDeviceConnected.Font = new System.Drawing.Font("Microsoft Sans Serif", 14.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelDeviceConnected.Location = new System.Drawing.Point(247, 529);
            this.labelDeviceConnected.Name = "labelDeviceConnected";
            this.labelDeviceConnected.Size = new System.Drawing.Size(25, 24);
            this.labelDeviceConnected.TabIndex = 127;
            this.labelDeviceConnected.Text = "...";
            // 
            // label29
            // 
            this.label29.AutoSize = true;
            this.label29.Location = new System.Drawing.Point(2, 573);
            this.label29.Name = "label29";
            this.label29.Size = new System.Drawing.Size(32, 13);
            this.label29.TabIndex = 125;
            this.label29.Text = "HEX:";
            this.label29.Visible = false;
            // 
            // textBoxCardPort
            // 
            this.textBoxCardPort.Location = new System.Drawing.Point(260, 83);
            this.textBoxCardPort.Name = "textBoxCardPort";
            this.textBoxCardPort.Size = new System.Drawing.Size(63, 20);
            this.textBoxCardPort.TabIndex = 122;
            this.textBoxCardPort.Text = "1001";
            // 
            // label28
            // 
            this.label28.AutoSize = true;
            this.label28.Location = new System.Drawing.Point(201, 86);
            this.label28.Name = "label28";
            this.label28.Size = new System.Drawing.Size(53, 13);
            this.label28.TabIndex = 123;
            this.label28.Text = "Card port:";
            // 
            // textBoxCardIP
            // 
            this.textBoxCardIP.Location = new System.Drawing.Point(80, 83);
            this.textBoxCardIP.Name = "textBoxCardIP";
            this.textBoxCardIP.Size = new System.Drawing.Size(100, 20);
            this.textBoxCardIP.TabIndex = 120;
            this.textBoxCardIP.Text = "192.168.30.129";
            // 
            // label27
            // 
            this.label27.AutoSize = true;
            this.label27.Location = new System.Drawing.Point(29, 86);
            this.label27.Name = "label27";
            this.label27.Size = new System.Drawing.Size(45, 13);
            this.label27.TabIndex = 121;
            this.label27.Text = "Card IP:";
            // 
            // textBoxDeviceAddr
            // 
            this.textBoxDeviceAddr.Location = new System.Drawing.Point(260, 31);
            this.textBoxDeviceAddr.Name = "textBoxDeviceAddr";
            this.textBoxDeviceAddr.Size = new System.Drawing.Size(63, 20);
            this.textBoxDeviceAddr.TabIndex = 118;
            this.textBoxDeviceAddr.Text = "01";
            // 
            // label26
            // 
            this.label26.AutoSize = true;
            this.label26.Location = new System.Drawing.Point(170, 34);
            this.label26.Name = "label26";
            this.label26.Size = new System.Drawing.Size(84, 13);
            this.label26.TabIndex = 119;
            this.label26.Text = "Device address:";
            // 
            // textBoxLOG
            // 
            this.textBoxLOG.Location = new System.Drawing.Point(15, 345);
            this.textBoxLOG.Multiline = true;
            this.textBoxLOG.Name = "textBoxLOG";
            this.textBoxLOG.ReadOnly = true;
            this.textBoxLOG.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.textBoxLOG.Size = new System.Drawing.Size(338, 170);
            this.textBoxLOG.TabIndex = 8;
            // 
            // textBoxDispenserComPort
            // 
            this.textBoxDispenserComPort.Location = new System.Drawing.Point(80, 31);
            this.textBoxDispenserComPort.Name = "textBoxDispenserComPort";
            this.textBoxDispenserComPort.Size = new System.Drawing.Size(63, 20);
            this.textBoxDispenserComPort.TabIndex = 0;
            this.textBoxDispenserComPort.Text = "7";
            // 
            // label25
            // 
            this.label25.AutoSize = true;
            this.label25.Location = new System.Drawing.Point(24, 34);
            this.label25.Name = "label25";
            this.label25.Size = new System.Drawing.Size(50, 13);
            this.label25.TabIndex = 117;
            this.label25.Text = "ComPort:";
            // 
            // textBoxG4IP
            // 
            this.textBoxG4IP.Location = new System.Drawing.Point(80, 57);
            this.textBoxG4IP.Name = "textBoxG4IP";
            this.textBoxG4IP.Size = new System.Drawing.Size(100, 20);
            this.textBoxG4IP.TabIndex = 2;
            this.textBoxG4IP.Text = "192.168.30.191";
            // 
            // label24
            // 
            this.label24.AutoSize = true;
            this.label24.Location = new System.Drawing.Point(37, 60);
            this.label24.Name = "label24";
            this.label24.Size = new System.Drawing.Size(37, 13);
            this.label24.TabIndex = 115;
            this.label24.Text = "G4 IP:";
            // 
            // textBoxG4Port
            // 
            this.textBoxG4Port.Location = new System.Drawing.Point(260, 57);
            this.textBoxG4Port.Name = "textBoxG4Port";
            this.textBoxG4Port.Size = new System.Drawing.Size(63, 20);
            this.textBoxG4Port.TabIndex = 4;
            this.textBoxG4Port.Text = "1001";
            // 
            // label11
            // 
            this.label11.AutoSize = true;
            this.label11.Location = new System.Drawing.Point(209, 60);
            this.label11.Name = "label11";
            this.label11.Size = new System.Drawing.Size(45, 13);
            this.label11.TabIndex = 113;
            this.label11.Text = "G4 port:";
            // 
            // textBoxRestTime
            // 
            this.textBoxRestTime.Location = new System.Drawing.Point(294, 108);
            this.textBoxRestTime.Name = "textBoxRestTime";
            this.textBoxRestTime.Size = new System.Drawing.Size(54, 20);
            this.textBoxRestTime.TabIndex = 1;
            this.textBoxRestTime.Text = "30";
            // 
            // label10
            // 
            this.label10.AutoSize = true;
            this.label10.Location = new System.Drawing.Point(212, 110);
            this.label10.Name = "label10";
            this.label10.Size = new System.Drawing.Size(80, 13);
            this.label10.TabIndex = 111;
            this.label10.Text = "RestTime(Sec):";
            // 
            // buttonClose
            // 
            this.buttonClose.Location = new System.Drawing.Point(130, 172);
            this.buttonClose.Name = "buttonClose";
            this.buttonClose.Size = new System.Drawing.Size(98, 20);
            this.buttonClose.TabIndex = 7;
            this.buttonClose.Text = "Close Despenser";
            this.buttonClose.UseVisualStyleBackColor = true;
            this.buttonClose.Click += new System.EventHandler(this.button4_Click);
            // 
            // checkBoxMoveToBin
            // 
            this.checkBoxMoveToBin.AutoSize = true;
            this.checkBoxMoveToBin.Checked = true;
            this.checkBoxMoveToBin.CheckState = System.Windows.Forms.CheckState.Checked;
            this.checkBoxMoveToBin.Location = new System.Drawing.Point(39, 107);
            this.checkBoxMoveToBin.Name = "checkBoxMoveToBin";
            this.checkBoxMoveToBin.Size = new System.Drawing.Size(87, 17);
            this.checkBoxMoveToBin.TabIndex = 5;
            this.checkBoxMoveToBin.Text = "Move To Bin";
            this.checkBoxMoveToBin.UseVisualStyleBackColor = true;
            // 
            // checkBoxShootOut
            // 
            this.checkBoxShootOut.AutoSize = true;
            this.checkBoxShootOut.Location = new System.Drawing.Point(135, 108);
            this.checkBoxShootOut.Name = "checkBoxShootOut";
            this.checkBoxShootOut.Size = new System.Drawing.Size(74, 17);
            this.checkBoxShootOut.TabIndex = 3;
            this.checkBoxShootOut.Text = "Shoot Out";
            this.checkBoxShootOut.UseVisualStyleBackColor = true;
            // 
            // buttonOpen
            // 
            this.buttonOpen.Location = new System.Drawing.Point(29, 172);
            this.buttonOpen.Name = "buttonOpen";
            this.buttonOpen.Size = new System.Drawing.Size(97, 20);
            this.buttonOpen.TabIndex = 6;
            this.buttonOpen.Text = "Open Despenser";
            this.buttonOpen.UseVisualStyleBackColor = true;
            this.buttonOpen.Click += new System.EventHandler(this.button3_Click);
            // 
            // picKeyPress
            // 
            this.picKeyPress.Image = global::EosParkingDispenser.Properties.Resources.keyPress;
            this.picKeyPress.Location = new System.Drawing.Point(969, 138);
            this.picKeyPress.Name = "picKeyPress";
            this.picKeyPress.Size = new System.Drawing.Size(823, 258);
            this.picKeyPress.SizeMode = System.Windows.Forms.PictureBoxSizeMode.AutoSize;
            this.picKeyPress.TabIndex = 119;
            this.picKeyPress.TabStop = false;
            // 
            // panelIcons
            // 
            this.panelIcons.Controls.Add(this.picGetData);
            this.panelIcons.Controls.Add(this.picGate);
            this.panelIcons.Controls.Add(this.picDispenser);
            this.panelIcons.Controls.Add(this.picCardReader);
            this.panelIcons.Controls.Add(this.picNetwork);
            this.panelIcons.Location = new System.Drawing.Point(809, 12);
            this.panelIcons.Name = "panelIcons";
            this.panelIcons.Size = new System.Drawing.Size(200, 40);
            this.panelIcons.TabIndex = 117;
            // 
            // picGetData
            // 
            this.picGetData.Image = global::EosParkingDispenser.Properties.Resources.icons8_record_button_48;
            this.picGetData.Location = new System.Drawing.Point(160, 0);
            this.picGetData.Name = "picGetData";
            this.picGetData.Size = new System.Drawing.Size(40, 40);
            this.picGetData.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.picGetData.TabIndex = 120;
            this.picGetData.TabStop = false;
            this.picGetData.Visible = false;
            this.picGetData.Click += new System.EventHandler(this.picGetData_Click);
            // 
            // picGate
            // 
            this.picGate.Image = global::EosParkingDispenser.Properties.Resources.icons8_gate_64;
            this.picGate.Location = new System.Drawing.Point(40, 0);
            this.picGate.Name = "picGate";
            this.picGate.Size = new System.Drawing.Size(40, 40);
            this.picGate.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.picGate.TabIndex = 119;
            this.picGate.TabStop = false;
            this.picGate.Visible = false;
            // 
            // picDispenser
            // 
            this.picDispenser.Image = global::EosParkingDispenser.Properties.Resources.icons8_insert_card_64;
            this.picDispenser.Location = new System.Drawing.Point(0, 0);
            this.picDispenser.Name = "picDispenser";
            this.picDispenser.Size = new System.Drawing.Size(40, 40);
            this.picDispenser.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.picDispenser.TabIndex = 118;
            this.picDispenser.TabStop = false;
            this.picDispenser.Visible = false;
            // 
            // picCardReader
            // 
            this.picCardReader.Image = global::EosParkingDispenser.Properties.Resources.icons8_rfid_64;
            this.picCardReader.Location = new System.Drawing.Point(80, 0);
            this.picCardReader.Name = "picCardReader";
            this.picCardReader.Size = new System.Drawing.Size(40, 40);
            this.picCardReader.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.picCardReader.TabIndex = 117;
            this.picCardReader.TabStop = false;
            this.picCardReader.Visible = false;
            // 
            // picNetwork
            // 
            this.picNetwork.Image = global::EosParkingDispenser.Properties.Resources.icons8_thin_client_64;
            this.picNetwork.Location = new System.Drawing.Point(120, 0);
            this.picNetwork.Name = "picNetwork";
            this.picNetwork.Size = new System.Drawing.Size(40, 40);
            this.picNetwork.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.picNetwork.TabIndex = 116;
            this.picNetwork.TabStop = false;
            this.picNetwork.Visible = false;
            // 
            // labelCardNumber
            // 
            this.labelCardNumber.BackColor = System.Drawing.Color.Transparent;
            this.labelCardNumber.Font = new System.Drawing.Font("B Titr", 15.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelCardNumber.Location = new System.Drawing.Point(35, 471);
            this.labelCardNumber.Name = "labelCardNumber";
            this.labelCardNumber.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelCardNumber.Size = new System.Drawing.Size(962, 101);
            this.labelCardNumber.TabIndex = 1;
            this.labelCardNumber.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.labelCardNumber.Click += new System.EventHandler(this.labelCardNumber_Click);
            // 
            // buttonSetting
            // 
            this.buttonSetting.Location = new System.Drawing.Point(4, 6);
            this.buttonSetting.Name = "buttonSetting";
            this.buttonSetting.Size = new System.Drawing.Size(26, 23);
            this.buttonSetting.TabIndex = 115;
            this.buttonSetting.Text = "...";
            this.buttonSetting.UseVisualStyleBackColor = true;
            this.buttonSetting.Click += new System.EventHandler(this.buttonSetting_Click);
            // 
            // panelTopWrite_Plate
            // 
            this.panelTopWrite_Plate.Controls.Add(this.labelPlate_part3);
            this.panelTopWrite_Plate.Controls.Add(this.labelPlate_part2);
            this.panelTopWrite_Plate.Controls.Add(this.labelPlate_part1);
            this.panelTopWrite_Plate.Controls.Add(this.labelPlate_City);
            this.panelTopWrite_Plate.Controls.Add(this.pictureBoxPlate);
            this.panelTopWrite_Plate.Location = new System.Drawing.Point(247, 6);
            this.panelTopWrite_Plate.Name = "panelTopWrite_Plate";
            this.panelTopWrite_Plate.Size = new System.Drawing.Size(549, 123);
            this.panelTopWrite_Plate.TabIndex = 114;
            this.panelTopWrite_Plate.Visible = false;
            // 
            // labelPlate_part3
            // 
            this.labelPlate_part3.BackColor = System.Drawing.Color.White;
            this.labelPlate_part3.Font = new System.Drawing.Font("B Titr", 36F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelPlate_part3.Location = new System.Drawing.Point(268, 20);
            this.labelPlate_part3.Name = "labelPlate_part3";
            this.labelPlate_part3.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelPlate_part3.Size = new System.Drawing.Size(142, 89);
            this.labelPlate_part3.TabIndex = 117;
            this.labelPlate_part3.Text = "888";
            this.labelPlate_part3.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // labelPlate_part2
            // 
            this.labelPlate_part2.BackColor = System.Drawing.Color.White;
            this.labelPlate_part2.Font = new System.Drawing.Font("B Titr", 36F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelPlate_part2.Location = new System.Drawing.Point(164, 9);
            this.labelPlate_part2.Name = "labelPlate_part2";
            this.labelPlate_part2.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelPlate_part2.Size = new System.Drawing.Size(103, 111);
            this.labelPlate_part2.TabIndex = 116;
            this.labelPlate_part2.Text = "الف";
            this.labelPlate_part2.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // labelPlate_part1
            // 
            this.labelPlate_part1.BackColor = System.Drawing.Color.White;
            this.labelPlate_part1.Font = new System.Drawing.Font("B Titr", 36F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelPlate_part1.Location = new System.Drawing.Point(52, 20);
            this.labelPlate_part1.Name = "labelPlate_part1";
            this.labelPlate_part1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelPlate_part1.Size = new System.Drawing.Size(106, 89);
            this.labelPlate_part1.TabIndex = 115;
            this.labelPlate_part1.Text = "88";
            this.labelPlate_part1.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // labelPlate_City
            // 
            this.labelPlate_City.BackColor = System.Drawing.Color.White;
            this.labelPlate_City.Font = new System.Drawing.Font("B Titr", 36F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelPlate_City.Location = new System.Drawing.Point(434, 33);
            this.labelPlate_City.Name = "labelPlate_City";
            this.labelPlate_City.Size = new System.Drawing.Size(97, 76);
            this.labelPlate_City.TabIndex = 114;
            this.labelPlate_City.Text = "55";
            // 
            // pictureBoxPlate
            // 
            this.pictureBoxPlate.Dock = System.Windows.Forms.DockStyle.Left;
            this.pictureBoxPlate.Image = global::EosParkingDispenser.Properties.Resources.plateFrame3;
            this.pictureBoxPlate.Location = new System.Drawing.Point(0, 0);
            this.pictureBoxPlate.Name = "pictureBoxPlate";
            this.pictureBoxPlate.Size = new System.Drawing.Size(536, 123);
            this.pictureBoxPlate.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.pictureBoxPlate.TabIndex = 108;
            this.pictureBoxPlate.TabStop = false;
            // 
            // labelServerTime
            // 
            this.labelServerTime.AutoSize = true;
            this.labelServerTime.BackColor = System.Drawing.Color.Transparent;
            this.labelServerTime.Font = new System.Drawing.Font("B Roya", 21.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelServerTime.Location = new System.Drawing.Point(919, 652);
            this.labelServerTime.Name = "labelServerTime";
            this.labelServerTime.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelServerTime.Size = new System.Drawing.Size(92, 49);
            this.labelServerTime.TabIndex = 3;
            this.labelServerTime.Text = "14:41";
            // 
            // labelServerDate
            // 
            this.labelServerDate.AutoSize = true;
            this.labelServerDate.BackColor = System.Drawing.Color.Transparent;
            this.labelServerDate.Font = new System.Drawing.Font("B Roya", 26.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelServerDate.Location = new System.Drawing.Point(809, 701);
            this.labelServerDate.Name = "labelServerDate";
            this.labelServerDate.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelServerDate.Size = new System.Drawing.Size(203, 58);
            this.labelServerDate.TabIndex = 2;
            this.labelServerDate.Text = "1403/09/27";
            // 
            // labelWelcome
            // 
            this.labelWelcome.BackColor = System.Drawing.Color.Transparent;
            this.labelWelcome.Font = new System.Drawing.Font("B Titr", 32F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelWelcome.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(0)))), ((int)(((byte)(0)))), ((int)(((byte)(64)))));
            this.labelWelcome.Location = new System.Drawing.Point(513, 282);
            this.labelWelcome.Name = "labelWelcome";
            this.labelWelcome.Size = new System.Drawing.Size(361, 93);
            this.labelWelcome.TabIndex = 0;
            this.labelWelcome.Text = "خوش آمدید";
            this.labelWelcome.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.labelWelcome.Visible = false;
            // 
            // pictureBoxPersonImage
            // 
            this.pictureBoxPersonImage.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.pictureBoxPersonImage.Location = new System.Drawing.Point(279, 161);
            this.pictureBoxPersonImage.Name = "pictureBoxPersonImage";
            this.pictureBoxPersonImage.Size = new System.Drawing.Size(180, 240);
            this.pictureBoxPersonImage.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.pictureBoxPersonImage.TabIndex = 138;
            this.pictureBoxPersonImage.TabStop = false;
            this.pictureBoxPersonImage.Visible = false;
            // 
            // mainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.White;
            this.ClientSize = new System.Drawing.Size(1024, 768);
            this.Controls.Add(this.panelCenter);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "mainForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.Manual;
            this.Text = "Eos CardDispenser Tester";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Main_FormClosing);
            this.Load += new System.EventHandler(this.ReaderResetBtn_Load);
            this.Shown += new System.EventHandler(this.ReaderResetBtn_Shown);
            this.panelCenter.ResumeLayout(false);
            this.panelCenter.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.vlcControl1)).EndInit();
            this.groupBoxSetting.ResumeLayout(false);
            this.groupBoxSetting.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxPerson)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.picKeyPress)).EndInit();
            this.panelIcons.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.picGetData)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.picGate)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.picDispenser)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.picCardReader)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.picNetwork)).EndInit();
            this.panelTopWrite_Plate.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxPlate)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxPersonImage)).EndInit();
            this.ResumeLayout(false);

        }
        private System.Windows.Forms.Timer timerGetPlate;
        private System.Windows.Forms.GroupBox groupBoxSetting;
        private System.Windows.Forms.Button buttonExit;
        private System.Windows.Forms.Label labelDeviceConnected;
        private System.Windows.Forms.Label label29;
        private System.Windows.Forms.TextBox textBoxCardPort;
        private System.Windows.Forms.Label label28;
        private System.Windows.Forms.TextBox textBoxCardIP;
        private System.Windows.Forms.Label label27;
        private System.Windows.Forms.TextBox textBoxDeviceAddr;
        private System.Windows.Forms.Label label26;
        private System.Windows.Forms.TextBox textBoxLOG;
        private System.Windows.Forms.TextBox textBoxDispenserComPort;
        private System.Windows.Forms.Label label25;
        private System.Windows.Forms.TextBox textBoxG4IP;
        private System.Windows.Forms.Label label24;
        private System.Windows.Forms.TextBox textBoxG4Port;
        private System.Windows.Forms.Label label11;
        private System.Windows.Forms.TextBox textBoxRestTime;
        private System.Windows.Forms.Label label10;
        private System.Windows.Forms.Button buttonClose;
        private System.Windows.Forms.CheckBox checkBoxMoveToBin;
        private System.Windows.Forms.CheckBox checkBoxShootOut;
        private System.Windows.Forms.Button buttonOpen;
        private System.Windows.Forms.Timer timerDisableMessage;
        private System.Windows.Forms.Label labelWelcome;
        private System.Windows.Forms.Label labelCardNumber;
        private System.Windows.Forms.Label labelServerDate;
        private System.Windows.Forms.Panel panelCenter;
        private System.Windows.Forms.Label labelServerTime;
        private System.Windows.Forms.Button buttonSetting;
        private System.Windows.Forms.Panel panelTopWrite_Plate;
        private System.Windows.Forms.Label labelPlate_part3;
        private System.Windows.Forms.Label labelPlate_part2;
        private System.Windows.Forms.Label labelPlate_part1;
        private System.Windows.Forms.Label labelPlate_City;
        private System.Windows.Forms.PictureBox pictureBoxPlate;
        private System.Windows.Forms.Panel panelIcons;
        private System.Windows.Forms.PictureBox picGate;
        private System.Windows.Forms.PictureBox picDispenser;
        private System.Windows.Forms.PictureBox picCardReader;
        private System.Windows.Forms.PictureBox picNetwork;
        private System.Windows.Forms.PictureBox picKeyPress;
        private System.Windows.Forms.CheckBox checkBoxPrintNoCard;
        private System.Windows.Forms.Timer timerGetFace;
        private System.Windows.Forms.CheckBox checkBoxShowInvalidFace;
        private System.Windows.Forms.PictureBox picGetData;
        private System.Windows.Forms.Label labelFaceCamLastConnect;
        private System.Windows.Forms.CheckBox checkBoxHprint;
        private System.Windows.Forms.CheckBox checkBoxHCardOut;
        private System.Windows.Forms.Button buttonCardOut;
        private System.Windows.Forms.PictureBox pictureBoxPerson;
        private System.Windows.Forms.PictureBox pictureBoxPersonImage;
        private System.Windows.Forms.Label labelPersonName;
        private System.Windows.Forms.CheckBox checkBoxWelcome;
        private System.Windows.Forms.Button button1;
        private Vlc.DotNet.Forms.VlcControl vlcControl1;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Label labelWarningDown;
        private System.Windows.Forms.Button button3;
    }
}

