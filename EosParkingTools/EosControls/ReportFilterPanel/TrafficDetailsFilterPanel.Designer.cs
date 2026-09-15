namespace EosParkingTools.EosControls.ReportFilterPanel
{
    partial class TrafficDetailsFilterPanel
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
            this.fromDateTimePicker = new EosParkingTools.EosControls.EosDateTimePicker();
            this.toDateTimePicker2 = new EosParkingTools.EosControls.EosDateTimePicker();
            this.parkingPanel = new System.Windows.Forms.Panel();
            this.eosLabel2 = new EosParkingTools.EosControls.EosLabel();
            this.parkingsTextBox = new DevExpress.XtraEditors.CheckedComboBoxEdit();
            this.panel3 = new System.Windows.Forms.Panel();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.eosPlateControl1 = new EosParkingTools.EosControls.EosPlateControl();
            this.panel1 = new System.Windows.Forms.Panel();
            this.lblCarType = new EosParkingTools.EosControls.EosLabel();
            this.carTypeComboBox = new EosParkingTools.EosControls.EosComboBoxEdit();
            this.justPresenceCheckBox = new System.Windows.Forms.CheckBox();
            this.imageCheckBox = new System.Windows.Forms.CheckBox();
            this.memberCodeTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.flowLayoutPanel1.SuspendLayout();
            this.parkingPanel.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.parkingsTextBox.Properties)).BeginInit();
            this.panel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Controls.Add(this.fromDateTimePicker);
            this.flowLayoutPanel1.Controls.Add(this.toDateTimePicker2);
            this.flowLayoutPanel1.Controls.Add(this.parkingPanel);
            this.flowLayoutPanel1.Controls.Add(this.panel3);
            this.flowLayoutPanel1.Controls.Add(this.eosLabel1);
            this.flowLayoutPanel1.Controls.Add(this.eosPlateControl1);
            this.flowLayoutPanel1.Controls.Add(this.panel1);
            this.flowLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.flowLayoutPanel1.FlowDirection = System.Windows.Forms.FlowDirection.RightToLeft;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(619, 118);
            this.flowLayoutPanel1.TabIndex = 2;
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
            this.fromDateTimePicker.LabelObject.Location = new System.Drawing.Point(113, 0);
            this.fromDateTimePicker.LabelObject.Name = "label1";
            this.fromDateTimePicker.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.fromDateTimePicker.LabelObject.Size = new System.Drawing.Size(71, 17);
            this.fromDateTimePicker.LabelObject.TabIndex = 1;
            this.fromDateTimePicker.LabelObject.Text = "تاریخ ورود از ";
            this.fromDateTimePicker.LabelObject.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            this.fromDateTimePicker.Location = new System.Drawing.Point(422, 3);
            this.fromDateTimePicker.Margin = new System.Windows.Forms.Padding(3, 3, 3, 10);
            this.fromDateTimePicker.MaximumSize = new System.Drawing.Size(1000, 24);
            this.fromDateTimePicker.MinimumSize = new System.Drawing.Size(130, 24);
            this.fromDateTimePicker.Name = "fromDateTimePicker";
            this.fromDateTimePicker.Padding = new System.Windows.Forms.Padding(0, 0, 10, 0);
            this.fromDateTimePicker.Size = new System.Drawing.Size(194, 24);
            this.fromDateTimePicker.TabIndex = 1;
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
            this.toDateTimePicker2.LabelObject.Location = new System.Drawing.Point(123, 0);
            this.toDateTimePicker2.LabelObject.Name = "label1";
            this.toDateTimePicker2.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.toDateTimePicker2.LabelObject.Size = new System.Drawing.Size(15, 17);
            this.toDateTimePicker2.LabelObject.TabIndex = 1;
            this.toDateTimePicker2.LabelObject.Text = "تا";
            this.toDateTimePicker2.LabelObject.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            this.toDateTimePicker2.Location = new System.Drawing.Point(278, 3);
            this.toDateTimePicker2.Margin = new System.Windows.Forms.Padding(3, 3, 3, 10);
            this.toDateTimePicker2.MaximumSize = new System.Drawing.Size(1000, 24);
            this.toDateTimePicker2.MinimumSize = new System.Drawing.Size(125, 24);
            this.toDateTimePicker2.Name = "toDateTimePicker2";
            this.toDateTimePicker2.Size = new System.Drawing.Size(138, 24);
            this.toDateTimePicker2.TabIndex = 2;
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
            // parkingPanel
            // 
            this.parkingPanel.Controls.Add(this.eosLabel2);
            this.parkingPanel.Controls.Add(this.parkingsTextBox);
            this.parkingPanel.Location = new System.Drawing.Point(35, 0);
            this.parkingPanel.Margin = new System.Windows.Forms.Padding(0);
            this.parkingPanel.Name = "parkingPanel";
            this.parkingPanel.Size = new System.Drawing.Size(240, 36);
            this.parkingPanel.TabIndex = 10;
            // 
            // eosLabel2
            // 
            this.eosLabel2.BorderColor = System.Drawing.Color.Black;
            this.eosLabel2.BorderWidth = 1;
            this.eosLabel2.Location = new System.Drawing.Point(151, 6);
            this.eosLabel2.Margin = new System.Windows.Forms.Padding(5, 6, 10, 0);
            this.eosLabel2.Name = "eosLabel2";
            this.eosLabel2.Size = new System.Drawing.Size(75, 21);
            this.eosLabel2.TabIndex = 9;
            this.eosLabel2.Text = "انتخاب پارکینگ";
            this.eosLabel2.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // parkingsTextBox
            // 
            this.parkingsTextBox.EditValue = "";
            this.parkingsTextBox.Location = new System.Drawing.Point(10, 7);
            this.parkingsTextBox.Margin = new System.Windows.Forms.Padding(3, 6, 3, 3);
            this.parkingsTextBox.Name = "parkingsTextBox";
            this.parkingsTextBox.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.parkingsTextBox.Properties.SelectAllItemCaption = "انتخاب همه";
            this.parkingsTextBox.Size = new System.Drawing.Size(136, 20);
            this.parkingsTextBox.TabIndex = 8;
            // 
            // panel3
            // 
            this.flowLayoutPanel1.SetFlowBreak(this.panel3, true);
            this.panel3.Location = new System.Drawing.Point(22, 3);
            this.panel3.Name = "panel3";
            this.panel3.Size = new System.Drawing.Size(10, 33);
            this.panel3.TabIndex = 11;
            // 
            // eosLabel1
            // 
            this.eosLabel1.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel1.BorderSide = System.Windows.Forms.Border3DSide.Left;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Location = new System.Drawing.Point(565, 39);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(51, 74);
            this.eosLabel1.TabIndex = 4;
            this.eosLabel1.Text = "اختیاری";
            this.eosLabel1.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // eosPlateControl1
            // 
            this.eosPlateControl1.BorderColor = System.Drawing.Color.FromArgb(((int)(((byte)(200)))), ((int)(((byte)(200)))), ((int)(((byte)(230)))));
            this.eosPlateControl1.CarType = EosParking.Core.Enums.CarTypes.Car;
            this.eosPlateControl1.LeftPart = 0;
            this.eosPlateControl1.Location = new System.Drawing.Point(357, 44);
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
            this.eosPlateControl1.TabIndex = 3;
            this.eosPlateControl1.TypePart = "";
            this.eosPlateControl1.WaiteForNextPalte = false;
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.lblCarType);
            this.panel1.Controls.Add(this.carTypeComboBox);
            this.panel1.Controls.Add(this.justPresenceCheckBox);
            this.panel1.Controls.Add(this.imageCheckBox);
            this.panel1.Controls.Add(this.memberCodeTextBox);
            this.flowLayoutPanel1.SetFlowBreak(this.panel1, true);
            this.panel1.Location = new System.Drawing.Point(11, 44);
            this.panel1.Margin = new System.Windows.Forms.Padding(3, 5, 3, 3);
            this.panel1.Name = "panel1";
            this.panel1.Padding = new System.Windows.Forms.Padding(0, 5, 0, 0);
            this.panel1.Size = new System.Drawing.Size(340, 65);
            this.panel1.TabIndex = 6;
            // 
            // lblCarType
            // 
            this.lblCarType.AutoSize = true;
            this.lblCarType.BorderColor = System.Drawing.Color.Black;
            this.lblCarType.BorderWidth = 1;
            this.lblCarType.Location = new System.Drawing.Point(259, 41);
            this.lblCarType.Margin = new System.Windows.Forms.Padding(3, 8, 3, 5);
            this.lblCarType.Name = "lblCarType";
            this.lblCarType.Size = new System.Drawing.Size(78, 13);
            this.lblCarType.TabIndex = 0;
            this.lblCarType.Text = "نوع وسیله نقلیه";
            // 
            // carTypeComboBox
            // 
            this.carTypeComboBox.ConvertNumberToEnglish = false;
            this.carTypeComboBox.FormattingEnabled = true;
            this.carTypeComboBox.HasHistoryItems = false;
            this.carTypeComboBox.HistoryName = null;
            this.carTypeComboBox.IsNumeric = false;
            this.carTypeComboBox.Location = new System.Drawing.Point(142, 33);
            this.carTypeComboBox.Name = "carTypeComboBox";
            this.carTypeComboBox.Size = new System.Drawing.Size(111, 21);
            this.carTypeComboBox.TabIndex = 1;
            // 
            // justPresenceCheckBox
            // 
            this.justPresenceCheckBox.Location = new System.Drawing.Point(11, 37);
            this.justPresenceCheckBox.Name = "justPresenceCheckBox";
            this.justPresenceCheckBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.justPresenceCheckBox.Size = new System.Drawing.Size(125, 17);
            this.justPresenceCheckBox.TabIndex = 2;
            this.justPresenceCheckBox.Text = "فقط نمایش حاضرین";
            this.justPresenceCheckBox.UseVisualStyleBackColor = true;
            // 
            // imageCheckBox
            // 
            this.imageCheckBox.Location = new System.Drawing.Point(11, 8);
            this.imageCheckBox.Name = "imageCheckBox";
            this.imageCheckBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.imageCheckBox.Size = new System.Drawing.Size(125, 17);
            this.imageCheckBox.TabIndex = 1;
            this.imageCheckBox.Text = "همراه با تصویر ورود";
            this.imageCheckBox.UseVisualStyleBackColor = true;
            // 
            // memberCodeTextBox
            // 
            this.memberCodeTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.memberCodeTextBox.ConvertNumberToEnglish = false;
            this.memberCodeTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.memberCodeTextBox.EnterKeyTap = true;
            this.memberCodeTextBox.FormatString = "";
            this.memberCodeTextBox.IsNumeric = false;
            this.memberCodeTextBox.Label = "  کد عضویت";
            this.memberCodeTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.memberCodeTextBox.Location = new System.Drawing.Point(142, 4);
            this.memberCodeTextBox.Margin = new System.Windows.Forms.Padding(3, 8, 3, 3);
            this.memberCodeTextBox.MaxLength = 100;
            this.memberCodeTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.memberCodeTextBox.Name = "memberCodeTextBox";
            this.memberCodeTextBox.Size = new System.Drawing.Size(195, 21);
            this.memberCodeTextBox.TabIndex = 0;
            // 
            // TrafficDetailsFilterPanel
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.flowLayoutPanel1);
            this.MinimumSize = new System.Drawing.Size(550, 118);
            this.Name = "TrafficDetailsFilterPanel";
            this.Size = new System.Drawing.Size(619, 118);
            this.flowLayoutPanel1.ResumeLayout(false);
            this.parkingPanel.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.parkingsTextBox.Properties)).EndInit();
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private EosDateTimePicker fromDateTimePicker;
        private EosDateTimePicker toDateTimePicker2;
        private EosLabel eosLabel1;
        private EosPlateControl eosPlateControl1;
        private System.Windows.Forms.CheckBox imageCheckBox;
        private EosTextBox memberCodeTextBox;
        private EosComboBoxEdit carTypeComboBox;
        private EosLabel lblCarType;
        private System.Windows.Forms.CheckBox justPresenceCheckBox;
        private EosLabel eosLabel2;
        private DevExpress.XtraEditors.CheckedComboBoxEdit parkingsTextBox;
        private System.Windows.Forms.Panel parkingPanel;
        private System.Windows.Forms.Panel panel3;
        private System.Windows.Forms.Panel panel1;
    }
}
