namespace EosParkingTools.EosControls.ReportFilterPanel
{
    partial class CargoDetailsFilterPanel
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

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.showAttachmentcheckBox = new System.Windows.Forms.CheckBox();
            this.panel1 = new System.Windows.Forms.Panel();
            this.panel2 = new System.Windows.Forms.Panel();
            this.fromDateTimePicker = new EosParkingTools.EosControls.EosDateTimePicker();
            this.toDateTimePicker2 = new EosParkingTools.EosControls.EosDateTimePicker();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.eosPlateControl1 = new EosParkingTools.EosControls.EosPlateControl();
            this.merchandiseTitleTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.driverFullNameTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.detinationCompanyTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.originCompnayTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.flowLayoutPanel1.SuspendLayout();
            this.panel1.SuspendLayout();
            this.panel2.SuspendLayout();
            this.SuspendLayout();
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Controls.Add(this.fromDateTimePicker);
            this.flowLayoutPanel1.Controls.Add(this.toDateTimePicker2);
            this.flowLayoutPanel1.Controls.Add(this.showAttachmentcheckBox);
            this.flowLayoutPanel1.Controls.Add(this.eosLabel1);
            this.flowLayoutPanel1.Controls.Add(this.eosPlateControl1);
            this.flowLayoutPanel1.Controls.Add(this.panel1);
            this.flowLayoutPanel1.Controls.Add(this.panel2);
            this.flowLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.flowLayoutPanel1.FlowDirection = System.Windows.Forms.FlowDirection.RightToLeft;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(738, 117);
            this.flowLayoutPanel1.TabIndex = 0;
            // 
            // showAttachmentcheckBox
            // 
            this.flowLayoutPanel1.SetFlowBreak(this.showAttachmentcheckBox, true);
            this.showAttachmentcheckBox.Location = new System.Drawing.Point(119, 3);
            this.showAttachmentcheckBox.Name = "showAttachmentcheckBox";
            this.showAttachmentcheckBox.Padding = new System.Windows.Forms.Padding(0, 0, 20, 0);
            this.showAttachmentcheckBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.showAttachmentcheckBox.Size = new System.Drawing.Size(272, 24);
            this.showAttachmentcheckBox.TabIndex = 9;
            this.showAttachmentcheckBox.Text = "پیوست مدارک نشان داده شود.";
            this.showAttachmentcheckBox.UseVisualStyleBackColor = true;
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.merchandiseTitleTextBox);
            this.panel1.Controls.Add(this.driverFullNameTextBox);
            this.panel1.Location = new System.Drawing.Point(241, 37);
            this.panel1.Margin = new System.Windows.Forms.Padding(0);
            this.panel1.Name = "panel1";
            this.panel1.Padding = new System.Windows.Forms.Padding(20);
            this.panel1.Size = new System.Drawing.Size(232, 74);
            this.panel1.TabIndex = 7;
            // 
            // panel2
            // 
            this.panel2.Controls.Add(this.detinationCompanyTextBox);
            this.panel2.Controls.Add(this.originCompnayTextBox);
            this.panel2.Location = new System.Drawing.Point(9, 37);
            this.panel2.Margin = new System.Windows.Forms.Padding(0);
            this.panel2.Name = "panel2";
            this.panel2.Padding = new System.Windows.Forms.Padding(20);
            this.panel2.Size = new System.Drawing.Size(232, 74);
            this.panel2.TabIndex = 8;
            // 
            // fromDateTimePicker
            // 
            this.fromDateTimePicker.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.fromDateTimePicker.DatePicker = true;
            this.fromDateTimePicker.Label = "تاریخ ورود از ";
            this.fromDateTimePicker.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.fromDateTimePicker.LabelObject.AutoSize = true;
            this.fromDateTimePicker.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.fromDateTimePicker.LabelObject.Location = new System.Drawing.Point(121, 0);
            this.fromDateTimePicker.LabelObject.Name = "label1";
            this.fromDateTimePicker.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.fromDateTimePicker.LabelObject.Size = new System.Drawing.Size(63, 17);
            this.fromDateTimePicker.LabelObject.TabIndex = 1;
            this.fromDateTimePicker.LabelObject.Text = "تاریخ ورود از ";
            this.fromDateTimePicker.LabelObject.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            this.fromDateTimePicker.Location = new System.Drawing.Point(541, 3);
            this.fromDateTimePicker.Margin = new System.Windows.Forms.Padding(3, 3, 3, 10);
            this.fromDateTimePicker.MaximumSize = new System.Drawing.Size(1000, 24);
            this.fromDateTimePicker.MinimumSize = new System.Drawing.Size(130, 24);
            this.fromDateTimePicker.Name = "fromDateTimePicker";
            this.fromDateTimePicker.Padding = new System.Windows.Forms.Padding(0, 0, 10, 0);
            this.fromDateTimePicker.Size = new System.Drawing.Size(194, 24);
            this.fromDateTimePicker.TabIndex = 3;
            // 
            // 
            // 
            this.fromDateTimePicker.TextBoxObject.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.fromDateTimePicker.TextBoxObject.DatePickerShown = true;
            this.fromDateTimePicker.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Left;
            this.fromDateTimePicker.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.fromDateTimePicker.TextBoxObject.MiladiDate = null;
            this.fromDateTimePicker.TextBoxObject.Name = "dateTimeSelector1";
            this.fromDateTimePicker.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.fromDateTimePicker.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.fromDateTimePicker.TextBoxObject.Size = new System.Drawing.Size(123, 24);
            this.fromDateTimePicker.TextBoxObject.TabIndex = 2;
            this.fromDateTimePicker.TextBoxObject.TimeSecondShown = false;
            this.fromDateTimePicker.TextBoxObject.TimeShown = false;
            this.fromDateTimePicker.TextBoxObject.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.fromDateTimePicker.TimePicker = false;
            this.fromDateTimePicker.TimePickerSecond = false;
            this.fromDateTimePicker.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.fromDateTimePicker.Value = null;
            // 
            // toDateTimePicker2
            // 
            this.toDateTimePicker2.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.toDateTimePicker2.DatePicker = true;
            this.toDateTimePicker2.Label = "تا";
            this.toDateTimePicker2.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.toDateTimePicker2.LabelObject.AutoSize = true;
            this.toDateTimePicker2.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.toDateTimePicker2.LabelObject.Location = new System.Drawing.Point(125, 0);
            this.toDateTimePicker2.LabelObject.Name = "label1";
            this.toDateTimePicker2.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.toDateTimePicker2.LabelObject.Size = new System.Drawing.Size(13, 17);
            this.toDateTimePicker2.LabelObject.TabIndex = 1;
            this.toDateTimePicker2.LabelObject.Text = "تا";
            this.toDateTimePicker2.LabelObject.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            this.toDateTimePicker2.Location = new System.Drawing.Point(397, 3);
            this.toDateTimePicker2.Margin = new System.Windows.Forms.Padding(3, 3, 3, 10);
            this.toDateTimePicker2.MaximumSize = new System.Drawing.Size(1000, 24);
            this.toDateTimePicker2.MinimumSize = new System.Drawing.Size(125, 24);
            this.toDateTimePicker2.Name = "toDateTimePicker2";
            this.toDateTimePicker2.Size = new System.Drawing.Size(138, 24);
            this.toDateTimePicker2.TabIndex = 4;
            // 
            // 
            // 
            this.toDateTimePicker2.TextBoxObject.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.toDateTimePicker2.TextBoxObject.DatePickerShown = true;
            this.toDateTimePicker2.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Left;
            this.toDateTimePicker2.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.toDateTimePicker2.TextBoxObject.MiladiDate = null;
            this.toDateTimePicker2.TextBoxObject.Name = "dateTimeSelector1";
            this.toDateTimePicker2.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.toDateTimePicker2.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.toDateTimePicker2.TextBoxObject.Size = new System.Drawing.Size(123, 24);
            this.toDateTimePicker2.TextBoxObject.TabIndex = 2;
            this.toDateTimePicker2.TextBoxObject.TimeSecondShown = false;
            this.toDateTimePicker2.TextBoxObject.TimeShown = false;
            this.toDateTimePicker2.TextBoxObject.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.toDateTimePicker2.TimePicker = false;
            this.toDateTimePicker2.TimePickerSecond = false;
            this.toDateTimePicker2.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.toDateTimePicker2.Value = null;
            // 
            // eosLabel1
            // 
            this.eosLabel1.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel1.BorderSide = System.Windows.Forms.Border3DSide.Left;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Location = new System.Drawing.Point(684, 37);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(51, 74);
            this.eosLabel1.TabIndex = 5;
            this.eosLabel1.Text = "اختیاری";
            this.eosLabel1.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // eosPlateControl1
            // 
            this.eosPlateControl1.BorderColor = System.Drawing.Color.FromArgb(((int)(((byte)(200)))), ((int)(((byte)(200)))), ((int)(((byte)(230)))));
            this.eosPlateControl1.CarType = EosParking.Core.Enums.CarTypes.Car;
            this.eosPlateControl1.LeftPart = 0;
            this.eosPlateControl1.Location = new System.Drawing.Point(476, 42);
            this.eosPlateControl1.Margin = new System.Windows.Forms.Padding(3, 5, 3, 3);
            this.eosPlateControl1.MiddlePart = 0;
            this.eosPlateControl1.MinimumSize = new System.Drawing.Size(159, 30);
            this.eosPlateControl1.MotorDownPart = 0;
            this.eosPlateControl1.MotorUpPart = 0;
            this.eosPlateControl1.Name = "eosPlateControl1";
            this.eosPlateControl1.Plate = "";
            this.eosPlateControl1.PlateDetailsFont = new System.Drawing.Font("Tahoma", 12F);
            this.eosPlateControl1.RightPart = 0;
            this.eosPlateControl1.RoundRectRadius = 8;
            this.eosPlateControl1.Size = new System.Drawing.Size(202, 65);
            this.eosPlateControl1.SkipMiddlePart = false;
            this.eosPlateControl1.TabIndex = 6;
            this.eosPlateControl1.TypePart = "";
            this.eosPlateControl1.WaiteForNextPalte = false;
            // 
            // merchandiseTitleTextBox
            // 
            this.merchandiseTitleTextBox.AutoCompleteDataSource = null;
            this.merchandiseTitleTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.merchandiseTitleTextBox.ConvertNumberToEnglish = false;
            this.merchandiseTitleTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDown;
            this.merchandiseTitleTextBox.EnterKeyTap = true;
            this.merchandiseTitleTextBox.FormatString = "";
            this.merchandiseTitleTextBox.IsNumeric = false;
            this.merchandiseTitleTextBox.Label = "عنوان کالا";
            this.merchandiseTitleTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.merchandiseTitleTextBox.Location = new System.Drawing.Point(12, 46);
            this.merchandiseTitleTextBox.MaxLength = 500;
            this.merchandiseTitleTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.merchandiseTitleTextBox.Name = "merchandiseTitleTextBox";
            this.merchandiseTitleTextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.merchandiseTitleTextBox.Size = new System.Drawing.Size(217, 21);
            this.merchandiseTitleTextBox.TabIndex = 1;
            this.merchandiseTitleTextBox.UsedAutoCompleteContainMode = true;
            // 
            // driverFullNameTextBox
            // 
            this.driverFullNameTextBox.AutoCompleteDataSource = null;
            this.driverFullNameTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.driverFullNameTextBox.ConvertNumberToEnglish = false;
            this.driverFullNameTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDown;
            this.driverFullNameTextBox.EnterKeyTap = true;
            this.driverFullNameTextBox.FormatString = "";
            this.driverFullNameTextBox.IsNumeric = false;
            this.driverFullNameTextBox.Label = "نام راننده ";
            this.driverFullNameTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.driverFullNameTextBox.Location = new System.Drawing.Point(12, 5);
            this.driverFullNameTextBox.MaxLength = 500;
            this.driverFullNameTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.driverFullNameTextBox.Name = "driverFullNameTextBox";
            this.driverFullNameTextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.driverFullNameTextBox.Size = new System.Drawing.Size(217, 21);
            this.driverFullNameTextBox.TabIndex = 0;
            this.driverFullNameTextBox.UsedAutoCompleteContainMode = true;
            // 
            // detinationCompanyTextBox
            // 
            this.detinationCompanyTextBox.AutoCompleteDataSource = null;
            this.detinationCompanyTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.detinationCompanyTextBox.ConvertNumberToEnglish = false;
            this.detinationCompanyTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDown;
            this.detinationCompanyTextBox.EnterKeyTap = true;
            this.detinationCompanyTextBox.FormatString = "";
            this.detinationCompanyTextBox.IsNumeric = false;
            this.detinationCompanyTextBox.Label = "   مقصد";
            this.detinationCompanyTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.detinationCompanyTextBox.Location = new System.Drawing.Point(12, 46);
            this.detinationCompanyTextBox.MaxLength = 500;
            this.detinationCompanyTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.detinationCompanyTextBox.Name = "detinationCompanyTextBox";
            this.detinationCompanyTextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.detinationCompanyTextBox.Size = new System.Drawing.Size(217, 21);
            this.detinationCompanyTextBox.TabIndex = 1;
            this.detinationCompanyTextBox.UsedAutoCompleteContainMode = true;
            // 
            // originCompnayTextBox
            // 
            this.originCompnayTextBox.AutoCompleteDataSource = null;
            this.originCompnayTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.originCompnayTextBox.ConvertNumberToEnglish = false;
            this.originCompnayTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDown;
            this.originCompnayTextBox.EnterKeyTap = true;
            this.originCompnayTextBox.FormatString = "";
            this.originCompnayTextBox.IsNumeric = false;
            this.originCompnayTextBox.Label = "   مبدا   ";
            this.originCompnayTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.originCompnayTextBox.Location = new System.Drawing.Point(12, 5);
            this.originCompnayTextBox.MaxLength = 500;
            this.originCompnayTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.originCompnayTextBox.Name = "originCompnayTextBox";
            this.originCompnayTextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.originCompnayTextBox.Size = new System.Drawing.Size(217, 21);
            this.originCompnayTextBox.TabIndex = 0;
            this.originCompnayTextBox.UsedAutoCompleteContainMode = true;
            // 
            // CargoDetailsFilterPanel
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.flowLayoutPanel1);
            this.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.Name = "CargoDetailsFilterPanel";
            this.Size = new System.Drawing.Size(738, 117);
            this.flowLayoutPanel1.ResumeLayout(false);
            this.panel1.ResumeLayout(false);
            this.panel2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private EosDateTimePicker fromDateTimePicker;
        private EosDateTimePicker toDateTimePicker2;
        private EosLabel eosLabel1;
        private EosPlateControl eosPlateControl1;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.CheckBox showAttachmentcheckBox;
        private EosTextBox merchandiseTitleTextBox;
        private EosTextBox driverFullNameTextBox;
        private System.Windows.Forms.Panel panel2;
        private EosTextBox detinationCompanyTextBox;
        private EosTextBox originCompnayTextBox;
    }
}
