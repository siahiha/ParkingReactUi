namespace EosParkingTools.EosControls
{
    partial class BillCheckerControl
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
            this.panelButtons = new System.Windows.Forms.Panel();
            this.printButton = new DevExpress.XtraEditors.SimpleButton();
            this.cancelButton = new DevExpress.XtraEditors.SimpleButton();
            this.okButton = new DevExpress.XtraEditors.SimpleButton();
            this.IdNumbersSplitContainer = new System.Windows.Forms.SplitContainer();
            this.idNumber1TextBox = new EosParkingTools.EosControls.EosTextBox();
            this.idNumber2TextBox = new EosParkingTools.EosControls.EosTextBox();
            this.panel1 = new System.Windows.Forms.Panel();
            this.errorLabel = new System.Windows.Forms.Label();
            this.titleEosLabel = new EosParkingTools.EosControls.EosLabel();
            this.panelButtons.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.IdNumbersSplitContainer)).BeginInit();
            this.IdNumbersSplitContainer.Panel1.SuspendLayout();
            this.IdNumbersSplitContainer.Panel2.SuspendLayout();
            this.IdNumbersSplitContainer.SuspendLayout();
            this.panel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // panelButtons
            // 
            this.panelButtons.Controls.Add(this.printButton);
            this.panelButtons.Controls.Add(this.cancelButton);
            this.panelButtons.Controls.Add(this.okButton);
            this.panelButtons.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.panelButtons.Location = new System.Drawing.Point(0, 161);
            this.panelButtons.Name = "panelButtons";
            this.panelButtons.Size = new System.Drawing.Size(289, 46);
            this.panelButtons.TabIndex = 18;
            // 
            // printButton
            // 
            this.printButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.printButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Print;
            this.printButton.Location = new System.Drawing.Point(195, 9);
            this.printButton.Margin = new System.Windows.Forms.Padding(3, 3, 3, 10);
            this.printButton.Name = "printButton";
            this.printButton.Padding = new System.Windows.Forms.Padding(3);
            this.printButton.Size = new System.Drawing.Size(83, 27);
            this.printButton.TabIndex = 16;
            this.printButton.TabStop = false;
            this.printButton.Text = "چاپ";
            this.printButton.Visible = false;
            // 
            // cancelButton
            // 
            this.cancelButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.cancelButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Cancel21;
            this.cancelButton.Location = new System.Drawing.Point(101, 9);
            this.cancelButton.Margin = new System.Windows.Forms.Padding(3, 3, 3, 10);
            this.cancelButton.Name = "cancelButton";
            this.cancelButton.Padding = new System.Windows.Forms.Padding(3);
            this.cancelButton.Size = new System.Drawing.Size(83, 27);
            this.cancelButton.TabIndex = 6;
            this.cancelButton.Text = "لغو";
            this.cancelButton.TabIndexChanged += new System.EventHandler(this.cancelButton_TabIndexChanged);
            this.cancelButton.Click += new System.EventHandler(this.cancelButton_Click);
            // 
            // okButton
            // 
            this.okButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Ok21;
            this.okButton.Location = new System.Drawing.Point(7, 9);
            this.okButton.Name = "okButton";
            this.okButton.Padding = new System.Windows.Forms.Padding(3);
            this.okButton.Size = new System.Drawing.Size(83, 27);
            this.okButton.TabIndex = 5;
            this.okButton.Text = "تایید";
            this.okButton.Click += new System.EventHandler(this.okButton_Click);
            // 
            // IdNumbersSplitContainer
            // 
            this.IdNumbersSplitContainer.Dock = System.Windows.Forms.DockStyle.Top;
            this.IdNumbersSplitContainer.Location = new System.Drawing.Point(0, 21);
            this.IdNumbersSplitContainer.Name = "IdNumbersSplitContainer";
            this.IdNumbersSplitContainer.Orientation = System.Windows.Forms.Orientation.Horizontal;
            // 
            // IdNumbersSplitContainer.Panel1
            // 
            this.IdNumbersSplitContainer.Panel1.Controls.Add(this.idNumber1TextBox);
            // 
            // IdNumbersSplitContainer.Panel2
            // 
            this.IdNumbersSplitContainer.Panel2.Controls.Add(this.idNumber2TextBox);
            this.IdNumbersSplitContainer.Size = new System.Drawing.Size(289, 106);
            this.IdNumbersSplitContainer.SplitterDistance = 53;
            this.IdNumbersSplitContainer.TabIndex = 19;
            this.IdNumbersSplitContainer.TabStop = false;
            // 
            // idNumber1TextBox
            // 
            this.idNumber1TextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.idNumber1TextBox.ConvertNumberToEnglish = false;
            this.idNumber1TextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.idNumber1TextBox.EnterKeyTap = true;
            this.idNumber1TextBox.FormatString = "";
            this.idNumber1TextBox.IsNumeric = false;
            this.idNumber1TextBox.Label = "شماره شناسایی 1";
            this.idNumber1TextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.idNumber1TextBox.Location = new System.Drawing.Point(22, 15);
            this.idNumber1TextBox.MaxLength = 100;
            this.idNumber1TextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.idNumber1TextBox.Name = "idNumber1TextBox";
            this.idNumber1TextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.idNumber1TextBox.Size = new System.Drawing.Size(256, 21);
            this.idNumber1TextBox.TabIndex = 1;
            this.idNumber1TextBox.TextValueChanged += new System.EventHandler(this.idNumber1TextBox_TextValueChanged);
            // 
            // idNumber2TextBox
            // 
            this.idNumber2TextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.idNumber2TextBox.ConvertNumberToEnglish = false;
            this.idNumber2TextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.idNumber2TextBox.EnterKeyTap = true;
            this.idNumber2TextBox.FormatString = "";
            this.idNumber2TextBox.IsNumeric = false;
            this.idNumber2TextBox.Label = "شماره شناسایی 2";
            this.idNumber2TextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.idNumber2TextBox.Location = new System.Drawing.Point(22, 14);
            this.idNumber2TextBox.MaxLength = 100;
            this.idNumber2TextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.idNumber2TextBox.Name = "idNumber2TextBox";
            this.idNumber2TextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.idNumber2TextBox.Size = new System.Drawing.Size(256, 21);
            this.idNumber2TextBox.TabIndex = 3;
            this.idNumber2TextBox.TextValueChanged += new System.EventHandler(this.idNumber2TextBox_TextValueChanged);
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.errorLabel);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel1.Location = new System.Drawing.Point(0, 127);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(289, 33);
            this.panel1.TabIndex = 20;
            // 
            // errorLabel
            // 
            this.errorLabel.AutoSize = true;
            this.errorLabel.Dock = System.Windows.Forms.DockStyle.Right;
            this.errorLabel.ForeColor = System.Drawing.Color.Red;
            this.errorLabel.Location = new System.Drawing.Point(279, 0);
            this.errorLabel.Margin = new System.Windows.Forms.Padding(3, 7, 3, 3);
            this.errorLabel.Name = "errorLabel";
            this.errorLabel.Padding = new System.Windows.Forms.Padding(0, 7, 10, 0);
            this.errorLabel.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.errorLabel.Size = new System.Drawing.Size(10, 20);
            this.errorLabel.TabIndex = 0;
            this.errorLabel.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // titleEosLabel
            // 
            this.titleEosLabel.BackColor = System.Drawing.SystemColors.ActiveCaption;
            this.titleEosLabel.BorderColor = System.Drawing.Color.Maroon;
            this.titleEosLabel.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.titleEosLabel.BorderWidth = 1;
            this.titleEosLabel.Dock = System.Windows.Forms.DockStyle.Top;
            this.titleEosLabel.Font = new System.Drawing.Font("Tahoma", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.titleEosLabel.Location = new System.Drawing.Point(0, 0);
            this.titleEosLabel.Name = "titleEosLabel";
            this.titleEosLabel.Size = new System.Drawing.Size(289, 21);
            this.titleEosLabel.TabIndex = 16;
            this.titleEosLabel.Text = "چک کردن شماره شناسایی قبض ها";
            this.titleEosLabel.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // BillCheckerControl
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.panel1);
            this.Controls.Add(this.IdNumbersSplitContainer);
            this.Controls.Add(this.panelButtons);
            this.Controls.Add(this.titleEosLabel);
            this.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.Name = "BillCheckerControl";
            this.Size = new System.Drawing.Size(289, 207);
            this.Load += new System.EventHandler(this.BillCheckerControl_Load);
            this.panelButtons.ResumeLayout(false);
            this.IdNumbersSplitContainer.Panel1.ResumeLayout(false);
            this.IdNumbersSplitContainer.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.IdNumbersSplitContainer)).EndInit();
            this.IdNumbersSplitContainer.ResumeLayout(false);
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private EosLabel titleEosLabel;
        private System.Windows.Forms.Panel panelButtons;
        private System.Windows.Forms.SplitContainer IdNumbersSplitContainer;
        private EosTextBox idNumber1TextBox;
        private EosTextBox idNumber2TextBox;
        private DevExpress.XtraEditors.SimpleButton cancelButton;
        private DevExpress.XtraEditors.SimpleButton okButton;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.Label errorLabel;
        private DevExpress.XtraEditors.SimpleButton printButton;
    }
}
