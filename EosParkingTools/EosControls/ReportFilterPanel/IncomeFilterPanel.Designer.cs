namespace EosParkingTools.EosControls.ReportFilterPanel
{
    partial class IncomeFilterPanel
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
            this.yearsTextBox = new DevExpress.XtraEditors.CheckedComboBoxEdit();
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.parkingsTextBox = new DevExpress.XtraEditors.CheckedComboBoxEdit();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel2 = new EosParkingTools.EosControls.EosLabel();
            ((System.ComponentModel.ISupportInitialize)(this.yearsTextBox.Properties)).BeginInit();
            this.flowLayoutPanel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.parkingsTextBox.Properties)).BeginInit();
            this.SuspendLayout();
            // 
            // yearsTextBox
            // 
            this.yearsTextBox.EditValue = "";
            this.yearsTextBox.Location = new System.Drawing.Point(299, 3);
            this.yearsTextBox.Name = "yearsTextBox";
            this.yearsTextBox.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.yearsTextBox.Properties.SelectAllItemCaption = "انتخاب همه";
            this.yearsTextBox.Size = new System.Drawing.Size(100, 20);
            this.yearsTextBox.TabIndex = 0;
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Controls.Add(this.eosLabel1);
            this.flowLayoutPanel1.Controls.Add(this.yearsTextBox);
            this.flowLayoutPanel1.Controls.Add(this.eosLabel2);
            this.flowLayoutPanel1.Controls.Add(this.parkingsTextBox);
            this.flowLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.flowLayoutPanel1.Size = new System.Drawing.Size(442, 71);
            this.flowLayoutPanel1.TabIndex = 1;
            // 
            // parkingsTextBox
            // 
            this.parkingsTextBox.EditValue = "";
            this.parkingsTextBox.Location = new System.Drawing.Point(74, 3);
            this.parkingsTextBox.Name = "parkingsTextBox";
            this.parkingsTextBox.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.parkingsTextBox.Properties.SelectAllItemCaption = "انتخاب همه";
            this.parkingsTextBox.Size = new System.Drawing.Size(138, 20);
            this.parkingsTextBox.TabIndex = 0;
            // 
            // eosLabel1
            // 
            this.eosLabel1.AutoSize = true;
            this.eosLabel1.BorderColor = System.Drawing.Color.Black;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Location = new System.Drawing.Point(405, 6);
            this.eosLabel1.Margin = new System.Windows.Forms.Padding(10, 6, 3, 0);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(27, 13);
            this.eosLabel1.TabIndex = 1;
            this.eosLabel1.Text = "سال";
            // 
            // eosLabel2
            // 
            this.eosLabel2.AutoSize = true;
            this.eosLabel2.BorderColor = System.Drawing.Color.Black;
            this.eosLabel2.BorderWidth = 1;
            this.eosLabel2.Location = new System.Drawing.Point(218, 6);
            this.eosLabel2.Margin = new System.Windows.Forms.Padding(3, 6, 3, 0);
            this.eosLabel2.Name = "eosLabel2";
            this.eosLabel2.Size = new System.Drawing.Size(75, 13);
            this.eosLabel2.TabIndex = 1;
            this.eosLabel2.Text = "انتخاب پارکینگ";
            // 
            // IncomeFilterPanel
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.flowLayoutPanel1);
            this.Name = "IncomeFilterPanel";
            this.Size = new System.Drawing.Size(442, 71);
            ((System.ComponentModel.ISupportInitialize)(this.yearsTextBox.Properties)).EndInit();
            this.flowLayoutPanel1.ResumeLayout(false);
            this.flowLayoutPanel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.parkingsTextBox.Properties)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private DevExpress.XtraEditors.CheckedComboBoxEdit yearsTextBox;
        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private EosLabel eosLabel1;
        private EosLabel eosLabel2;
        private DevExpress.XtraEditors.CheckedComboBoxEdit parkingsTextBox;
    }
}
