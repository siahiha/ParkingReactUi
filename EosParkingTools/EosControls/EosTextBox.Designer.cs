namespace EosParkingTools.EosControls
{
    partial class EosTextBox
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
            this.eosComboBoxEdit = new EosParkingTools.EosControls.EosComboBoxEdit();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Dock = System.Windows.Forms.DockStyle.Right;
            this.label1.Location = new System.Drawing.Point(163, 0);
            this.label1.Name = "label1";
            this.label1.Padding = new System.Windows.Forms.Padding(0, 3, 0, 0);
            this.label1.Size = new System.Drawing.Size(29, 16);
            this.label1.TabIndex = 1;
            this.label1.Text = "lable";
            this.label1.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // eosComboBoxEdit
            // 
            this.eosComboBoxEdit.ConvertNumberToEnglish = false;
            this.eosComboBoxEdit.Dock = System.Windows.Forms.DockStyle.Top;
            this.eosComboBoxEdit.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.eosComboBoxEdit.FormattingEnabled = true;
            this.eosComboBoxEdit.HasHistoryItems = false;
            this.eosComboBoxEdit.HistoryName = null;
            this.eosComboBoxEdit.IsNumeric = false;
            this.eosComboBoxEdit.Location = new System.Drawing.Point(0, 0);
            this.eosComboBoxEdit.Name = "eosComboBoxEdit";
            this.eosComboBoxEdit.Size = new System.Drawing.Size(163, 21);
            this.eosComboBoxEdit.TabIndex = 2;
            this.eosComboBoxEdit.DropDown += new System.EventHandler(this.eosComboBoxEdit_DropDown);
            this.eosComboBoxEdit.SelectedIndexChanged += new System.EventHandler(this.eosComboBoxEdit_SelectedIndexChanged);
            this.eosComboBoxEdit.TextUpdate += new System.EventHandler(this.eosComboBoxEdit_TextUpdate);
            this.eosComboBoxEdit.SelectedValueChanged += new System.EventHandler(this.eosComboBoxEdit_SelectedValueChanged);
            this.eosComboBoxEdit.TextChanged += new System.EventHandler(this.eosComboBoxEdit_TextChanged_1);
            this.eosComboBoxEdit.KeyUp += new System.Windows.Forms.KeyEventHandler(this.eosComboBoxEdit_KeyUp);
            this.eosComboBoxEdit.Validated += new System.EventHandler(this.eosComboBoxEdit_Validated);
            // 
            // EosTextBox
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.eosComboBoxEdit);
            this.Controls.Add(this.label1);
            this.MinimumSize = new System.Drawing.Size(50, 21);
            this.Name = "EosTextBox";
            this.Size = new System.Drawing.Size(192, 21);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.Label label1;
        private EosComboBoxEdit eosComboBoxEdit;
    }
}
