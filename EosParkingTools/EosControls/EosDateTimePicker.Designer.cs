namespace EosParkingTools.EosControls
{
    partial class EosDateTimePicker
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
            this.label1 = new System.Windows.Forms.Label();
            this.dateTimeSelector1 = new EosSolarDateTimePicker.EosDateTimePicker();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Dock = System.Windows.Forms.DockStyle.Left;
            this.label1.Location = new System.Drawing.Point(0, 0);
            this.label1.Name = "label1";
            this.label1.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.label1.Size = new System.Drawing.Size(65, 17);
            this.label1.TabIndex = 1;
            this.label1.Text = "تاریخ و زمان";
            this.label1.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            // 
            // dateTimeSelector1
            // 
            this.dateTimeSelector1.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.dateTimeSelector1.DatePickerShown = true;
            this.dateTimeSelector1.Dock = System.Windows.Forms.DockStyle.Left;
            this.dateTimeSelector1.Location = new System.Drawing.Point(65, 0);
            this.dateTimeSelector1.MiladiDate = null;
            this.dateTimeSelector1.Name = "dateTimeSelector1";
            this.dateTimeSelector1.PopupBackColor = System.Drawing.Color.White;
            this.dateTimeSelector1.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.dateTimeSelector1.Size = new System.Drawing.Size(123, 24);
            this.dateTimeSelector1.TabIndex = 2;
            this.dateTimeSelector1.TimeSecondShown = false;
            this.dateTimeSelector1.TimeShown = false;
            this.dateTimeSelector1.TimeValue = System.TimeSpan.Parse("09:46:41");
            // 
            // EosDateTimePicker
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.Controls.Add(this.dateTimeSelector1);
            this.Controls.Add(this.label1);
            this.MaximumSize = new System.Drawing.Size(1000, 24);
            this.Name = "EosDateTimePicker";
            this.Size = new System.Drawing.Size(200, 24);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.Label label1;
        private EosSolarDateTimePicker.EosDateTimePicker dateTimeSelector1;
    }
}
