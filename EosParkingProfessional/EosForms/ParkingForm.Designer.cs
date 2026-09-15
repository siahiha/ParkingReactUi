namespace EosParkingProfessional.EosForms
{
    partial class ParkingForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(ParkingForm));
            this.nameTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.addressTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.tellTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.shift1GroupControl = new DevExpress.XtraEditors.GroupControl();
            this.shift1FromTextBox = new EosParkingTools.EosControls.EosDateTimePicker();
            this.shift1ToTextBox = new EosParkingTools.EosControls.EosDateTimePicker();
            this.shift2GroupControl = new DevExpress.XtraEditors.GroupControl();
            this.shift2FromTextBox = new EosParkingTools.EosControls.EosDateTimePicker();
            this.shift2ToTextBox = new EosParkingTools.EosControls.EosDateTimePicker();
            this.shift3GroupControl = new DevExpress.XtraEditors.GroupControl();
            this.shift3FromTextBox = new EosParkingTools.EosControls.EosDateTimePicker();
            this.shift3ToTextBox = new EosParkingTools.EosControls.EosDateTimePicker();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.groupControl1 = new DevExpress.XtraEditors.GroupControl();
            this.hasBillControlCheckBox = new System.Windows.Forms.CheckBox();
            this.eosLabel8 = new EosParkingTools.EosControls.EosLabel();
            this.moneyValueTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.eosLabel7 = new EosParkingTools.EosControls.EosLabel();
            this.moneyBorderTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.taxTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.eosLabel6 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel4 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel5 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel3 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel2 = new EosParkingTools.EosControls.EosLabel();
            this.hostelryCheckBox = new System.Windows.Forms.CheckBox();
            this.costOfCardTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.maxOfTransferCredit = new EosParkingTools.EosControls.EosTextBox();
            this.minOnHostelryHours = new EosParkingTools.EosControls.EosTextBox();
            this.minOfNotFoundCarTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.groupControl2 = new DevExpress.XtraEditors.GroupControl();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).BeginInit();
            this.panelControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).BeginInit();
            this.panelControl2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.shift1GroupControl)).BeginInit();
            this.shift1GroupControl.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.shift2GroupControl)).BeginInit();
            this.shift2GroupControl.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.shift3GroupControl)).BeginInit();
            this.shift3GroupControl.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.groupControl1)).BeginInit();
            this.groupControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.groupControl2)).BeginInit();
            this.groupControl2.SuspendLayout();
            this.SuspendLayout();
            // 
            // panelControl1
            // 
            this.panelControl1.Controls.Add(this.eosLabel1);
            this.panelControl1.Controls.Add(this.pictureBox1);
            this.panelControl1.Controls.Add(this.tellTextBox);
            this.panelControl1.Controls.Add(this.addressTextBox);
            this.panelControl1.Controls.Add(this.nameTextBox);
            this.panelControl1.Controls.Add(this.groupControl2);
            this.panelControl1.Controls.Add(this.groupControl1);
            this.panelControl1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.panelControl1.Size = new System.Drawing.Size(596, 487);
            // 
            // cancelButton
            // 
            this.cancelButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("cancelButton.ImageOptions.Image")));
            this.cancelButton.TabIndex = 101;
            // 
            // noButton
            // 
            this.noButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("noButton.ImageOptions.Image")));
            this.noButton.TabIndex = 102;
            // 
            // okButton
            // 
            this.okButton.DialogResult = System.Windows.Forms.DialogResult.None;
            this.okButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("okButton.ImageOptions.Image")));
            this.okButton.TabIndex = 100;
            this.okButton.Click += new System.EventHandler(this.okButton_Click);
            // 
            // panelControl2
            // 
            this.panelControl2.Location = new System.Drawing.Point(0, 487);
            this.panelControl2.Size = new System.Drawing.Size(596, 39);
            // 
            // styleController
            // 
            this.styleController.LookAndFeel.SkinName = "Office 2013";
            // 
            // defaultLookAndFeel
            // 
            this.defaultLookAndFeel.LookAndFeel.SkinName = "Office 2016 Colorful";
            // 
            // nameTextBox
            // 
            this.nameTextBox.AutoCompleteDataSource = null;
            this.nameTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.nameTextBox.ConvertNumberToEnglish = false;
            this.nameTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.nameTextBox.EnterKeyTap = true;
            this.nameTextBox.FormatString = "";
            this.nameTextBox.IsNumeric = false;
            this.nameTextBox.Label = "نام";
            this.nameTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.nameTextBox.Location = new System.Drawing.Point(334, 46);
            this.nameTextBox.MaxLength = 100;
            this.nameTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.nameTextBox.Name = "nameTextBox";
            this.nameTextBox.Size = new System.Drawing.Size(192, 21);
            this.nameTextBox.TabIndex = 0;
            this.nameTextBox.UsedAutoCompleteContainMode = false;
            // 
            // addressTextBox
            // 
            this.addressTextBox.AutoCompleteDataSource = null;
            this.addressTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.addressTextBox.ConvertNumberToEnglish = false;
            this.addressTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.addressTextBox.EnterKeyTap = true;
            this.addressTextBox.FormatString = "";
            this.addressTextBox.IsNumeric = false;
            this.addressTextBox.Label = "آدرس";
            this.addressTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.addressTextBox.Location = new System.Drawing.Point(334, 73);
            this.addressTextBox.MaxLength = 100;
            this.addressTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.addressTextBox.Name = "addressTextBox";
            this.addressTextBox.Size = new System.Drawing.Size(204, 21);
            this.addressTextBox.TabIndex = 1;
            this.addressTextBox.UsedAutoCompleteContainMode = false;
            // 
            // tellTextBox
            // 
            this.tellTextBox.AutoCompleteDataSource = null;
            this.tellTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.tellTextBox.ConvertNumberToEnglish = false;
            this.tellTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.tellTextBox.EnterKeyTap = true;
            this.tellTextBox.FormatString = "0";
            this.tellTextBox.IsNumeric = true;
            this.tellTextBox.Label = "تلفن";
            this.tellTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.tellTextBox.Location = new System.Drawing.Point(334, 100);
            this.tellTextBox.MaxLength = 100;
            this.tellTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.tellTextBox.Name = "tellTextBox";
            this.tellTextBox.Size = new System.Drawing.Size(200, 21);
            this.tellTextBox.TabIndex = 2;
            this.tellTextBox.UsedAutoCompleteContainMode = false;
            // 
            // pictureBox1
            // 
            this.pictureBox1.Image = ((System.Drawing.Image)(resources.GetObject("pictureBox1.Image")));
            this.pictureBox1.Location = new System.Drawing.Point(0, 0);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(149, 140);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.pictureBox1.TabIndex = 1;
            this.pictureBox1.TabStop = false;
            // 
            // shift1GroupControl
            // 
            this.shift1GroupControl.Controls.Add(this.shift1FromTextBox);
            this.shift1GroupControl.Controls.Add(this.shift1ToTextBox);
            this.shift1GroupControl.Location = new System.Drawing.Point(316, 25);
            this.shift1GroupControl.Name = "shift1GroupControl";
            this.shift1GroupControl.Size = new System.Drawing.Size(136, 90);
            this.shift1GroupControl.TabIndex = 4;
            this.shift1GroupControl.Text = "شیفت کاری اول";
            // 
            // shift1FromTextBox
            // 
            this.shift1FromTextBox.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift1FromTextBox.DatePicker = false;
            this.shift1FromTextBox.Label = "از";
            this.shift1FromTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.shift1FromTextBox.LabelObject.AutoSize = true;
            this.shift1FromTextBox.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.shift1FromTextBox.LabelObject.Location = new System.Drawing.Point(73, 0);
            this.shift1FromTextBox.LabelObject.Name = "label1";
            this.shift1FromTextBox.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.shift1FromTextBox.LabelObject.Size = new System.Drawing.Size(14, 17);
            this.shift1FromTextBox.LabelObject.TabIndex = 1;
            this.shift1FromTextBox.LabelObject.Text = "از";
            this.shift1FromTextBox.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.shift1FromTextBox.Location = new System.Drawing.Point(20, 30);
            this.shift1FromTextBox.MaximumSize = new System.Drawing.Size(10000, 24);
            this.shift1FromTextBox.Name = "shift1FromTextBox";
            this.shift1FromTextBox.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.shift1FromTextBox.Size = new System.Drawing.Size(87, 24);
            this.shift1FromTextBox.TabIndex = 5;
            // 
            // 
            // 
            this.shift1FromTextBox.TextBoxObject.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift1FromTextBox.TextBoxObject.DatePickerShown = false;
            this.shift1FromTextBox.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.shift1FromTextBox.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.shift1FromTextBox.TextBoxObject.MiladiDate = null;
            this.shift1FromTextBox.TextBoxObject.Name = "dateTimeSelector1";
            this.shift1FromTextBox.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.shift1FromTextBox.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.shift1FromTextBox.TextBoxObject.Size = new System.Drawing.Size(73, 24);
            this.shift1FromTextBox.TextBoxObject.TabIndex = 2;
            this.shift1FromTextBox.TextBoxObject.TimeSecondShown = false;
            this.shift1FromTextBox.TextBoxObject.TimeShown = true;
            this.shift1FromTextBox.TextBoxObject.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift1FromTextBox.TimePicker = true;
            this.shift1FromTextBox.TimePickerSecond = false;
            this.shift1FromTextBox.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift1FromTextBox.Value = null;
            // 
            // shift1ToTextBox
            // 
            this.shift1ToTextBox.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift1ToTextBox.DatePicker = false;
            this.shift1ToTextBox.Label = "تا";
            this.shift1ToTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.shift1ToTextBox.LabelObject.AutoSize = true;
            this.shift1ToTextBox.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.shift1ToTextBox.LabelObject.Location = new System.Drawing.Point(74, 0);
            this.shift1ToTextBox.LabelObject.Name = "label1";
            this.shift1ToTextBox.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.shift1ToTextBox.LabelObject.Size = new System.Drawing.Size(13, 17);
            this.shift1ToTextBox.LabelObject.TabIndex = 1;
            this.shift1ToTextBox.LabelObject.Text = "تا";
            this.shift1ToTextBox.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.shift1ToTextBox.Location = new System.Drawing.Point(20, 59);
            this.shift1ToTextBox.MaximumSize = new System.Drawing.Size(10000, 24);
            this.shift1ToTextBox.Name = "shift1ToTextBox";
            this.shift1ToTextBox.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.shift1ToTextBox.Size = new System.Drawing.Size(87, 24);
            this.shift1ToTextBox.TabIndex = 6;
            // 
            // 
            // 
            this.shift1ToTextBox.TextBoxObject.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift1ToTextBox.TextBoxObject.DatePickerShown = false;
            this.shift1ToTextBox.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.shift1ToTextBox.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.shift1ToTextBox.TextBoxObject.MiladiDate = null;
            this.shift1ToTextBox.TextBoxObject.Name = "dateTimeSelector1";
            this.shift1ToTextBox.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.shift1ToTextBox.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.shift1ToTextBox.TextBoxObject.Size = new System.Drawing.Size(74, 24);
            this.shift1ToTextBox.TextBoxObject.TabIndex = 2;
            this.shift1ToTextBox.TextBoxObject.TimeSecondShown = false;
            this.shift1ToTextBox.TextBoxObject.TimeShown = true;
            this.shift1ToTextBox.TextBoxObject.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift1ToTextBox.TimePicker = true;
            this.shift1ToTextBox.TimePickerSecond = false;
            this.shift1ToTextBox.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift1ToTextBox.Value = null;
            // 
            // shift2GroupControl
            // 
            this.shift2GroupControl.Controls.Add(this.shift2FromTextBox);
            this.shift2GroupControl.Controls.Add(this.shift2ToTextBox);
            this.shift2GroupControl.Location = new System.Drawing.Point(174, 25);
            this.shift2GroupControl.Name = "shift2GroupControl";
            this.shift2GroupControl.Size = new System.Drawing.Size(136, 90);
            this.shift2GroupControl.TabIndex = 7;
            this.shift2GroupControl.Text = "شیفت کاری دوم";
            // 
            // shift2FromTextBox
            // 
            this.shift2FromTextBox.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift2FromTextBox.DatePicker = false;
            this.shift2FromTextBox.Label = "از";
            this.shift2FromTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.shift2FromTextBox.LabelObject.AutoSize = true;
            this.shift2FromTextBox.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.shift2FromTextBox.LabelObject.Location = new System.Drawing.Point(73, 0);
            this.shift2FromTextBox.LabelObject.Name = "label1";
            this.shift2FromTextBox.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.shift2FromTextBox.LabelObject.Size = new System.Drawing.Size(14, 17);
            this.shift2FromTextBox.LabelObject.TabIndex = 1;
            this.shift2FromTextBox.LabelObject.Text = "از";
            this.shift2FromTextBox.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.shift2FromTextBox.Location = new System.Drawing.Point(12, 30);
            this.shift2FromTextBox.MaximumSize = new System.Drawing.Size(10000, 24);
            this.shift2FromTextBox.Name = "shift2FromTextBox";
            this.shift2FromTextBox.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.shift2FromTextBox.Size = new System.Drawing.Size(87, 24);
            this.shift2FromTextBox.TabIndex = 8;
            // 
            // 
            // 
            this.shift2FromTextBox.TextBoxObject.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift2FromTextBox.TextBoxObject.DatePickerShown = false;
            this.shift2FromTextBox.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.shift2FromTextBox.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.shift2FromTextBox.TextBoxObject.MiladiDate = null;
            this.shift2FromTextBox.TextBoxObject.Name = "dateTimeSelector1";
            this.shift2FromTextBox.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.shift2FromTextBox.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.shift2FromTextBox.TextBoxObject.Size = new System.Drawing.Size(73, 24);
            this.shift2FromTextBox.TextBoxObject.TabIndex = 2;
            this.shift2FromTextBox.TextBoxObject.TimeSecondShown = false;
            this.shift2FromTextBox.TextBoxObject.TimeShown = true;
            this.shift2FromTextBox.TextBoxObject.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift2FromTextBox.TimePicker = true;
            this.shift2FromTextBox.TimePickerSecond = false;
            this.shift2FromTextBox.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift2FromTextBox.Value = null;
            // 
            // shift2ToTextBox
            // 
            this.shift2ToTextBox.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift2ToTextBox.DatePicker = false;
            this.shift2ToTextBox.Label = "تا";
            this.shift2ToTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.shift2ToTextBox.LabelObject.AutoSize = true;
            this.shift2ToTextBox.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.shift2ToTextBox.LabelObject.Location = new System.Drawing.Point(74, 0);
            this.shift2ToTextBox.LabelObject.Name = "label1";
            this.shift2ToTextBox.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.shift2ToTextBox.LabelObject.Size = new System.Drawing.Size(13, 17);
            this.shift2ToTextBox.LabelObject.TabIndex = 1;
            this.shift2ToTextBox.LabelObject.Text = "تا";
            this.shift2ToTextBox.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.shift2ToTextBox.Location = new System.Drawing.Point(12, 59);
            this.shift2ToTextBox.MaximumSize = new System.Drawing.Size(10000, 24);
            this.shift2ToTextBox.Name = "shift2ToTextBox";
            this.shift2ToTextBox.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.shift2ToTextBox.Size = new System.Drawing.Size(87, 24);
            this.shift2ToTextBox.TabIndex = 9;
            // 
            // 
            // 
            this.shift2ToTextBox.TextBoxObject.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift2ToTextBox.TextBoxObject.DatePickerShown = false;
            this.shift2ToTextBox.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.shift2ToTextBox.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.shift2ToTextBox.TextBoxObject.MiladiDate = null;
            this.shift2ToTextBox.TextBoxObject.Name = "dateTimeSelector1";
            this.shift2ToTextBox.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.shift2ToTextBox.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.shift2ToTextBox.TextBoxObject.Size = new System.Drawing.Size(74, 24);
            this.shift2ToTextBox.TextBoxObject.TabIndex = 2;
            this.shift2ToTextBox.TextBoxObject.TimeSecondShown = false;
            this.shift2ToTextBox.TextBoxObject.TimeShown = true;
            this.shift2ToTextBox.TextBoxObject.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift2ToTextBox.TimePicker = true;
            this.shift2ToTextBox.TimePickerSecond = false;
            this.shift2ToTextBox.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift2ToTextBox.Value = null;
            this.shift2ToTextBox.Validated += new System.EventHandler(this.shift2ToTextBox_Validated);
            // 
            // shift3GroupControl
            // 
            this.shift3GroupControl.Controls.Add(this.shift3FromTextBox);
            this.shift3GroupControl.Controls.Add(this.shift3ToTextBox);
            this.shift3GroupControl.Enabled = false;
            this.shift3GroupControl.Location = new System.Drawing.Point(32, 25);
            this.shift3GroupControl.Name = "shift3GroupControl";
            this.shift3GroupControl.Size = new System.Drawing.Size(136, 90);
            this.shift3GroupControl.TabIndex = 10;
            this.shift3GroupControl.Text = "شیفت کاری سوم";
            // 
            // shift3FromTextBox
            // 
            this.shift3FromTextBox.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift3FromTextBox.DatePicker = false;
            this.shift3FromTextBox.Label = "از";
            this.shift3FromTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.shift3FromTextBox.LabelObject.AutoSize = true;
            this.shift3FromTextBox.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.shift3FromTextBox.LabelObject.Location = new System.Drawing.Point(73, 0);
            this.shift3FromTextBox.LabelObject.Name = "label1";
            this.shift3FromTextBox.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.shift3FromTextBox.LabelObject.Size = new System.Drawing.Size(14, 17);
            this.shift3FromTextBox.LabelObject.TabIndex = 1;
            this.shift3FromTextBox.LabelObject.Text = "از";
            this.shift3FromTextBox.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.shift3FromTextBox.Location = new System.Drawing.Point(15, 30);
            this.shift3FromTextBox.MaximumSize = new System.Drawing.Size(10000, 24);
            this.shift3FromTextBox.Name = "shift3FromTextBox";
            this.shift3FromTextBox.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.shift3FromTextBox.Size = new System.Drawing.Size(87, 24);
            this.shift3FromTextBox.TabIndex = 11;
            // 
            // 
            // 
            this.shift3FromTextBox.TextBoxObject.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift3FromTextBox.TextBoxObject.DatePickerShown = false;
            this.shift3FromTextBox.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.shift3FromTextBox.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.shift3FromTextBox.TextBoxObject.MiladiDate = null;
            this.shift3FromTextBox.TextBoxObject.Name = "dateTimeSelector1";
            this.shift3FromTextBox.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.shift3FromTextBox.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.shift3FromTextBox.TextBoxObject.Size = new System.Drawing.Size(73, 24);
            this.shift3FromTextBox.TextBoxObject.TabIndex = 2;
            this.shift3FromTextBox.TextBoxObject.TimeSecondShown = false;
            this.shift3FromTextBox.TextBoxObject.TimeShown = true;
            this.shift3FromTextBox.TextBoxObject.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift3FromTextBox.TimePicker = true;
            this.shift3FromTextBox.TimePickerSecond = false;
            this.shift3FromTextBox.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift3FromTextBox.Value = null;
            // 
            // shift3ToTextBox
            // 
            this.shift3ToTextBox.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift3ToTextBox.DatePicker = false;
            this.shift3ToTextBox.Label = "تا";
            this.shift3ToTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.shift3ToTextBox.LabelObject.AutoSize = true;
            this.shift3ToTextBox.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.shift3ToTextBox.LabelObject.Location = new System.Drawing.Point(74, 0);
            this.shift3ToTextBox.LabelObject.Name = "label1";
            this.shift3ToTextBox.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.shift3ToTextBox.LabelObject.Size = new System.Drawing.Size(13, 17);
            this.shift3ToTextBox.LabelObject.TabIndex = 1;
            this.shift3ToTextBox.LabelObject.Text = "تا";
            this.shift3ToTextBox.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.shift3ToTextBox.Location = new System.Drawing.Point(15, 59);
            this.shift3ToTextBox.MaximumSize = new System.Drawing.Size(10000, 24);
            this.shift3ToTextBox.Name = "shift3ToTextBox";
            this.shift3ToTextBox.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.shift3ToTextBox.Size = new System.Drawing.Size(87, 24);
            this.shift3ToTextBox.TabIndex = 12;
            // 
            // 
            // 
            this.shift3ToTextBox.TextBoxObject.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.shift3ToTextBox.TextBoxObject.DatePickerShown = false;
            this.shift3ToTextBox.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.shift3ToTextBox.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.shift3ToTextBox.TextBoxObject.MiladiDate = null;
            this.shift3ToTextBox.TextBoxObject.Name = "dateTimeSelector1";
            this.shift3ToTextBox.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.shift3ToTextBox.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.shift3ToTextBox.TextBoxObject.Size = new System.Drawing.Size(74, 24);
            this.shift3ToTextBox.TextBoxObject.TabIndex = 2;
            this.shift3ToTextBox.TextBoxObject.TimeSecondShown = false;
            this.shift3ToTextBox.TextBoxObject.TimeShown = true;
            this.shift3ToTextBox.TextBoxObject.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift3ToTextBox.TimePicker = true;
            this.shift3ToTextBox.TimePickerSecond = false;
            this.shift3ToTextBox.TimeValue = System.TimeSpan.Parse("00:00:00");
            this.shift3ToTextBox.Value = null;
            // 
            // eosLabel1
            // 
            this.eosLabel1.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel1.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Location = new System.Drawing.Point(155, 16);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(429, 18);
            this.eosLabel1.TabIndex = 5;
            this.eosLabel1.Text = "مشخصات پارکینگ";
            // 
            // groupControl1
            // 
            this.groupControl1.Controls.Add(this.hasBillControlCheckBox);
            this.groupControl1.Controls.Add(this.eosLabel8);
            this.groupControl1.Controls.Add(this.moneyValueTextBox);
            this.groupControl1.Controls.Add(this.eosLabel7);
            this.groupControl1.Controls.Add(this.moneyBorderTextBox);
            this.groupControl1.Controls.Add(this.taxTextBox);
            this.groupControl1.Controls.Add(this.eosLabel6);
            this.groupControl1.Controls.Add(this.eosLabel4);
            this.groupControl1.Controls.Add(this.eosLabel5);
            this.groupControl1.Controls.Add(this.eosLabel3);
            this.groupControl1.Controls.Add(this.eosLabel2);
            this.groupControl1.Controls.Add(this.hostelryCheckBox);
            this.groupControl1.Controls.Add(this.costOfCardTextBox);
            this.groupControl1.Controls.Add(this.maxOfTransferCredit);
            this.groupControl1.Controls.Add(this.minOnHostelryHours);
            this.groupControl1.Controls.Add(this.minOfNotFoundCarTextBox);
            this.groupControl1.Location = new System.Drawing.Point(38, 256);
            this.groupControl1.Name = "groupControl1";
            this.groupControl1.Size = new System.Drawing.Size(517, 213);
            this.groupControl1.TabIndex = 12;
            this.groupControl1.Text = "تنظیمات";
            // 
            // hasBillControlCheckBox
            // 
            this.hasBillControlCheckBox.AutoSize = true;
            this.hasBillControlCheckBox.Location = new System.Drawing.Point(223, 188);
            this.hasBillControlCheckBox.Name = "hasBillControlCheckBox";
            this.hasBillControlCheckBox.Size = new System.Drawing.Size(239, 17);
            this.hasBillControlCheckBox.TabIndex = 23;
            this.hasBillControlCheckBox.Text = "امکان ثبت فیش های کنترلی وجود داشته باشد";
            this.hasBillControlCheckBox.UseVisualStyleBackColor = true;
            // 
            // eosLabel8
            // 
            this.eosLabel8.AutoSize = true;
            this.eosLabel8.BorderColor = System.Drawing.Color.Black;
            this.eosLabel8.BorderWidth = 1;
            this.eosLabel8.Location = new System.Drawing.Point(146, 163);
            this.eosLabel8.Name = "eosLabel8";
            this.eosLabel8.Size = new System.Drawing.Size(22, 13);
            this.eosLabel8.TabIndex = 21;
            this.eosLabel8.Text = "ريال";
            // 
            // moneyValueTextBox
            // 
            this.moneyValueTextBox.AutoCompleteDataSource = null;
            this.moneyValueTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.moneyValueTextBox.ConvertNumberToEnglish = false;
            this.moneyValueTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.moneyValueTextBox.EnterKeyTap = true;
            this.moneyValueTextBox.FormatString = "#,#";
            this.moneyValueTextBox.IsNumeric = true;
            this.moneyValueTextBox.Label = "مقدار گرد کردن مبالغ دریافتی";
            this.moneyValueTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.moneyValueTextBox.Location = new System.Drawing.Point(174, 161);
            this.moneyValueTextBox.MaxLength = 100;
            this.moneyValueTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.moneyValueTextBox.Name = "moneyValueTextBox";
            this.moneyValueTextBox.Size = new System.Drawing.Size(288, 21);
            this.moneyValueTextBox.TabIndex = 22;
            this.moneyValueTextBox.UsedAutoCompleteContainMode = false;
            // 
            // eosLabel7
            // 
            this.eosLabel7.AutoSize = true;
            this.eosLabel7.BorderColor = System.Drawing.Color.Black;
            this.eosLabel7.BorderWidth = 1;
            this.eosLabel7.Location = new System.Drawing.Point(146, 138);
            this.eosLabel7.Name = "eosLabel7";
            this.eosLabel7.Size = new System.Drawing.Size(22, 13);
            this.eosLabel7.TabIndex = 19;
            this.eosLabel7.Text = "ريال";
            // 
            // moneyBorderTextBox
            // 
            this.moneyBorderTextBox.AutoCompleteDataSource = null;
            this.moneyBorderTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.moneyBorderTextBox.ConvertNumberToEnglish = false;
            this.moneyBorderTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.moneyBorderTextBox.EnterKeyTap = true;
            this.moneyBorderTextBox.FormatString = "#,#";
            this.moneyBorderTextBox.IsNumeric = true;
            this.moneyBorderTextBox.Label = "مرز گرد کردن مبالغ دریافتی";
            this.moneyBorderTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.moneyBorderTextBox.Location = new System.Drawing.Point(174, 137);
            this.moneyBorderTextBox.MaxLength = 100;
            this.moneyBorderTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.moneyBorderTextBox.Name = "moneyBorderTextBox";
            this.moneyBorderTextBox.Size = new System.Drawing.Size(288, 21);
            this.moneyBorderTextBox.TabIndex = 20;
            this.moneyBorderTextBox.UsedAutoCompleteContainMode = false;
            // 
            // taxTextBox
            // 
            this.taxTextBox.AutoCompleteDataSource = null;
            this.taxTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.taxTextBox.ConvertNumberToEnglish = false;
            this.taxTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.taxTextBox.EnterKeyTap = true;
            this.taxTextBox.FormatString = "0";
            this.taxTextBox.IsNumeric = true;
            this.taxTextBox.Label = "درصد مالیات بر ارزش افزوده";
            this.taxTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.taxTextBox.Location = new System.Drawing.Point(270, 113);
            this.taxTextBox.MaxLength = 3;
            this.taxTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.taxTextBox.Name = "taxTextBox";
            this.taxTextBox.Size = new System.Drawing.Size(192, 21);
            this.taxTextBox.TabIndex = 18;
            this.taxTextBox.UsedAutoCompleteContainMode = false;
            // 
            // eosLabel6
            // 
            this.eosLabel6.AutoSize = true;
            this.eosLabel6.BorderColor = System.Drawing.Color.Black;
            this.eosLabel6.BorderWidth = 1;
            this.eosLabel6.Location = new System.Drawing.Point(248, 116);
            this.eosLabel6.Name = "eosLabel6";
            this.eosLabel6.Size = new System.Drawing.Size(18, 13);
            this.eosLabel6.TabIndex = 5;
            this.eosLabel6.Text = "%";
            this.eosLabel6.Visible = false;
            // 
            // eosLabel4
            // 
            this.eosLabel4.AutoSize = true;
            this.eosLabel4.BorderColor = System.Drawing.Color.Black;
            this.eosLabel4.BorderWidth = 1;
            this.eosLabel4.Location = new System.Drawing.Point(92, 115);
            this.eosLabel4.Name = "eosLabel4";
            this.eosLabel4.Size = new System.Drawing.Size(22, 13);
            this.eosLabel4.TabIndex = 5;
            this.eosLabel4.Text = "ريال";
            this.eosLabel4.Visible = false;
            // 
            // eosLabel5
            // 
            this.eosLabel5.AutoSize = true;
            this.eosLabel5.BorderColor = System.Drawing.Color.Black;
            this.eosLabel5.BorderWidth = 1;
            this.eosLabel5.Location = new System.Drawing.Point(40, 65);
            this.eosLabel5.Name = "eosLabel5";
            this.eosLabel5.Size = new System.Drawing.Size(22, 13);
            this.eosLabel5.TabIndex = 5;
            this.eosLabel5.Text = "ريال";
            // 
            // eosLabel3
            // 
            this.eosLabel3.AutoSize = true;
            this.eosLabel3.BorderColor = System.Drawing.Color.Black;
            this.eosLabel3.BorderWidth = 1;
            this.eosLabel3.Location = new System.Drawing.Point(92, 91);
            this.eosLabel3.Name = "eosLabel3";
            this.eosLabel3.Size = new System.Drawing.Size(22, 13);
            this.eosLabel3.TabIndex = 5;
            this.eosLabel3.Text = "ريال";
            // 
            // eosLabel2
            // 
            this.eosLabel2.AutoSize = true;
            this.eosLabel2.BorderColor = System.Drawing.Color.Black;
            this.eosLabel2.BorderWidth = 1;
            this.eosLabel2.Location = new System.Drawing.Point(75, 45);
            this.eosLabel2.Name = "eosLabel2";
            this.eosLabel2.Size = new System.Drawing.Size(194, 13);
            this.eosLabel2.TabIndex = 5;
            this.eosLabel2.Text = "ساعت شامل توقف شبانه روزی می گردد";
            // 
            // hostelryCheckBox
            // 
            this.hostelryCheckBox.AutoSize = true;
            this.hostelryCheckBox.Location = new System.Drawing.Point(281, 22);
            this.hostelryCheckBox.Name = "hostelryCheckBox";
            this.hostelryCheckBox.Size = new System.Drawing.Size(181, 17);
            this.hostelryCheckBox.TabIndex = 13;
            this.hostelryCheckBox.Text = "دارای تعرفه شبانه روزی می باشد";
            this.hostelryCheckBox.UseVisualStyleBackColor = true;
            this.hostelryCheckBox.CheckedChanged += new System.EventHandler(this.hostelryCheckBox_CheckedChanged);
            // 
            // costOfCardTextBox
            // 
            this.costOfCardTextBox.AutoCompleteDataSource = null;
            this.costOfCardTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.costOfCardTextBox.ConvertNumberToEnglish = false;
            this.costOfCardTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.costOfCardTextBox.EnterKeyTap = true;
            this.costOfCardTextBox.FormatString = "#,#";
            this.costOfCardTextBox.IsNumeric = true;
            this.costOfCardTextBox.Label = "مبلغ دریافتی درصورت مفقود شدن کارت";
            this.costOfCardTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.costOfCardTextBox.Location = new System.Drawing.Point(120, 113);
            this.costOfCardTextBox.MaxLength = 100;
            this.costOfCardTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.costOfCardTextBox.Name = "costOfCardTextBox";
            this.costOfCardTextBox.Size = new System.Drawing.Size(345, 21);
            this.costOfCardTextBox.TabIndex = 17;
            this.costOfCardTextBox.UsedAutoCompleteContainMode = false;
            this.costOfCardTextBox.Visible = false;
            // 
            // maxOfTransferCredit
            // 
            this.maxOfTransferCredit.AutoCompleteDataSource = null;
            this.maxOfTransferCredit.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.maxOfTransferCredit.ConvertNumberToEnglish = false;
            this.maxOfTransferCredit.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.maxOfTransferCredit.EnterKeyTap = true;
            this.maxOfTransferCredit.FormatString = "#,#";
            this.maxOfTransferCredit.IsNumeric = true;
            this.maxOfTransferCredit.Label = "حداکثر اعتبار قابل انتقال به طرح جدید";
            this.maxOfTransferCredit.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.maxOfTransferCredit.Location = new System.Drawing.Point(120, 89);
            this.maxOfTransferCredit.MaxLength = 100;
            this.maxOfTransferCredit.MinimumSize = new System.Drawing.Size(50, 21);
            this.maxOfTransferCredit.Name = "maxOfTransferCredit";
            this.maxOfTransferCredit.Size = new System.Drawing.Size(345, 21);
            this.maxOfTransferCredit.TabIndex = 16;
            this.maxOfTransferCredit.UsedAutoCompleteContainMode = false;
            // 
            // minOnHostelryHours
            // 
            this.minOnHostelryHours.AutoCompleteDataSource = null;
            this.minOnHostelryHours.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.minOnHostelryHours.ConvertNumberToEnglish = false;
            this.minOnHostelryHours.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.minOnHostelryHours.EnterKeyTap = true;
            this.minOnHostelryHours.FormatString = "#";
            this.minOnHostelryHours.IsNumeric = true;
            this.minOnHostelryHours.Label = "توقف بیشتر از ";
            this.minOnHostelryHours.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.minOnHostelryHours.Location = new System.Drawing.Point(272, 41);
            this.minOnHostelryHours.MaxLength = 100;
            this.minOnHostelryHours.MinimumSize = new System.Drawing.Size(50, 21);
            this.minOnHostelryHours.Name = "minOnHostelryHours";
            this.minOnHostelryHours.Size = new System.Drawing.Size(192, 21);
            this.minOnHostelryHours.TabIndex = 14;
            this.minOnHostelryHours.UsedAutoCompleteContainMode = false;
            // 
            // minOfNotFoundCarTextBox
            // 
            this.minOfNotFoundCarTextBox.AutoCompleteDataSource = null;
            this.minOfNotFoundCarTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.minOfNotFoundCarTextBox.ConvertNumberToEnglish = false;
            this.minOfNotFoundCarTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.minOfNotFoundCarTextBox.EnterKeyTap = true;
            this.minOfNotFoundCarTextBox.FormatString = "#,#";
            this.minOfNotFoundCarTextBox.IsNumeric = true;
            this.minOfNotFoundCarTextBox.Label = "حد اقل دریافتی از خودرو هایی که ورود نامشخص دارند";
            this.minOfNotFoundCarTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.minOfNotFoundCarTextBox.Location = new System.Drawing.Point(65, 65);
            this.minOfNotFoundCarTextBox.MaxLength = 100;
            this.minOfNotFoundCarTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.minOfNotFoundCarTextBox.Name = "minOfNotFoundCarTextBox";
            this.minOfNotFoundCarTextBox.Size = new System.Drawing.Size(400, 21);
            this.minOfNotFoundCarTextBox.TabIndex = 15;
            this.minOfNotFoundCarTextBox.UsedAutoCompleteContainMode = false;
            // 
            // groupControl2
            // 
            this.groupControl2.Controls.Add(this.shift3GroupControl);
            this.groupControl2.Controls.Add(this.shift1GroupControl);
            this.groupControl2.Controls.Add(this.shift2GroupControl);
            this.groupControl2.Location = new System.Drawing.Point(38, 137);
            this.groupControl2.Name = "groupControl2";
            this.groupControl2.Size = new System.Drawing.Size(517, 122);
            this.groupControl2.TabIndex = 3;
            this.groupControl2.Text = "شیفت های پارکینگ";
            // 
            // ParkingForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(596, 526);
            this.Name = "ParkingForm";
            this.ShowIcon = false;
            this.Text = "مشخصات پارکینگ";
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).EndInit();
            this.panelControl1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).EndInit();
            this.panelControl2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.shift1GroupControl)).EndInit();
            this.shift1GroupControl.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.shift2GroupControl)).EndInit();
            this.shift2GroupControl.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.shift3GroupControl)).EndInit();
            this.shift3GroupControl.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.groupControl1)).EndInit();
            this.groupControl1.ResumeLayout(false);
            this.groupControl1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.groupControl2)).EndInit();
            this.groupControl2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private EosParkingTools.EosControls.EosTextBox nameTextBox;
        private System.Windows.Forms.PictureBox pictureBox1;
        private EosParkingTools.EosControls.EosTextBox tellTextBox;
        private EosParkingTools.EosControls.EosTextBox addressTextBox;
        private DevExpress.XtraEditors.GroupControl shift3GroupControl;
        private DevExpress.XtraEditors.GroupControl shift2GroupControl;
        private DevExpress.XtraEditors.GroupControl shift1GroupControl;
        private EosParkingTools.EosControls.EosDateTimePicker shift1FromTextBox;
        private EosParkingTools.EosControls.EosDateTimePicker shift1ToTextBox;
        private EosParkingTools.EosControls.EosDateTimePicker shift3FromTextBox;
        private EosParkingTools.EosControls.EosDateTimePicker shift3ToTextBox;
        private EosParkingTools.EosControls.EosDateTimePicker shift2FromTextBox;
        private EosParkingTools.EosControls.EosDateTimePicker shift2ToTextBox;
        private EosParkingTools.EosControls.EosLabel eosLabel1;
        private DevExpress.XtraEditors.GroupControl groupControl2;
        private DevExpress.XtraEditors.GroupControl groupControl1;
        private EosParkingTools.EosControls.EosLabel eosLabel4;
        private EosParkingTools.EosControls.EosLabel eosLabel5;
        private EosParkingTools.EosControls.EosLabel eosLabel3;
        private EosParkingTools.EosControls.EosLabel eosLabel2;
        private System.Windows.Forms.CheckBox hostelryCheckBox;
        private EosParkingTools.EosControls.EosTextBox costOfCardTextBox;
        private EosParkingTools.EosControls.EosTextBox maxOfTransferCredit;
        private EosParkingTools.EosControls.EosTextBox minOnHostelryHours;
        private EosParkingTools.EosControls.EosTextBox minOfNotFoundCarTextBox;
        private EosParkingTools.EosControls.EosTextBox taxTextBox;
        private EosParkingTools.EosControls.EosLabel eosLabel6;
        private EosParkingTools.EosControls.EosLabel eosLabel8;
        private EosParkingTools.EosControls.EosTextBox moneyValueTextBox;
        private EosParkingTools.EosControls.EosLabel eosLabel7;
        private EosParkingTools.EosControls.EosTextBox moneyBorderTextBox;
        private System.Windows.Forms.CheckBox hasBillControlCheckBox;
    }
}