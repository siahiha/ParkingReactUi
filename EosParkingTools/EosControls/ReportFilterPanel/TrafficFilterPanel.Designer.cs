namespace EosParkingTools.EosControls.ReportFilterPanel
{
    partial class TrafficFilterPanel
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
            this.yearTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.doorsTextBox = new DevExpress.XtraEditors.CheckedComboBoxEdit();
            this.flowLayoutPanel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.doorsTextBox.Properties)).BeginInit();
            this.SuspendLayout();
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Controls.Add(this.fromDateTimePicker);
            this.flowLayoutPanel1.Controls.Add(this.toDateTimePicker2);
            this.flowLayoutPanel1.Controls.Add(this.yearTextBox);
            this.flowLayoutPanel1.Controls.Add(this.eosLabel1);
            this.flowLayoutPanel1.Controls.Add(this.doorsTextBox);
            this.flowLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.flowLayoutPanel1.FlowDirection = System.Windows.Forms.FlowDirection.RightToLeft;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(511, 84);
            this.flowLayoutPanel1.TabIndex = 3;
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
            this.fromDateTimePicker.Location = new System.Drawing.Point(314, 3);
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
            this.fromDateTimePicker.Value = new System.DateTime(1, 1, 1, 9, 46, 41, 0);
            // 
            // toDateTimePicker2
            // 
            this.toDateTimePicker2.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.toDateTimePicker2.DatePicker = true;
            this.flowLayoutPanel1.SetFlowBreak(this.toDateTimePicker2, true);
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
            this.toDateTimePicker2.Location = new System.Drawing.Point(170, 3);
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
            this.toDateTimePicker2.Value = new System.DateTime(1, 1, 1, 9, 46, 41, 0);
            // 
            // yearTextBox
            // 
            this.yearTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.yearTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.yearTextBox.EnterKeyTap = true;
            this.yearTextBox.FormatString = "0000";
            this.yearTextBox.IsNumeric = true;
            this.yearTextBox.Label = "سال ";
            this.yearTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.yearTextBox.Location = new System.Drawing.Point(355, 40);
            this.yearTextBox.MaxLength = 0;
            this.yearTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.yearTextBox.Name = "yearTextBox";
            this.yearTextBox.Size = new System.Drawing.Size(153, 21);
            this.yearTextBox.TabIndex = 5;
            this.yearTextBox.Visible = false;
            // 
            // eosLabel1
            // 
            this.eosLabel1.AutoSize = true;
            this.eosLabel1.BorderColor = System.Drawing.Color.Black;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Location = new System.Drawing.Point(284, 47);
            this.eosLabel1.Margin = new System.Windows.Forms.Padding(3, 10, 10, 0);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(58, 13);
            this.eosLabel1.TabIndex = 4;
            this.eosLabel1.Text = "انتخاب درب";
            this.eosLabel1.Visible = false;
            // 
            // doorsTextBox
            // 
            this.doorsTextBox.Location = new System.Drawing.Point(156, 45);
            this.doorsTextBox.Margin = new System.Windows.Forms.Padding(3, 8, 3, 3);
            this.doorsTextBox.Name = "doorsTextBox";
            this.doorsTextBox.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.doorsTextBox.Properties.SelectAllItemCaption = "انتخاب همه";
            this.doorsTextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.doorsTextBox.Size = new System.Drawing.Size(122, 20);
            this.doorsTextBox.TabIndex = 3;
            this.doorsTextBox.Visible = false;
            this.doorsTextBox.ButtonPressed += new DevExpress.XtraEditors.Controls.ButtonPressedEventHandler(this.doorsTextBox_ButtonPressed);
            // 
            // TrafficFilterPanel
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.flowLayoutPanel1);
            this.Name = "TrafficFilterPanel";
            this.Size = new System.Drawing.Size(511, 84);
            this.flowLayoutPanel1.ResumeLayout(false);
            this.flowLayoutPanel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.doorsTextBox.Properties)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private EosDateTimePicker fromDateTimePicker;
        private EosDateTimePicker toDateTimePicker2;
        private DevExpress.XtraEditors.CheckedComboBoxEdit doorsTextBox;
        private EosLabel eosLabel1;
        private EosTextBox yearTextBox;
    }
}
