
namespace EosParkingProfessional.EosForms
{
    partial class ImportDataConfigurationForm
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
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.label1 = new System.Windows.Forms.Label();
            this.webServiceURLTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.cancelButton = new DevExpress.XtraEditors.SimpleButton();
            this.SavedConfigurationButton = new DevExpress.XtraEditors.SimpleButton();
            this.TestConnectionButton = new DevExpress.XtraEditors.SimpleButton();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            this.groupBox1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.SuspendLayout();
            // 
            // styleController
            // 
            this.styleController.LookAndFeel.SkinName = "Office 2013";
            // 
            // defaultLookAndFeel
            // 
            this.defaultLookAndFeel.LookAndFeel.SkinName = "Office 2016 Colorful";
            // 
            // eosLabel1
            // 
            this.eosLabel1.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.eosLabel1.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel1.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Font = new System.Drawing.Font("Tahoma", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.eosLabel1.ForeColor = System.Drawing.Color.Maroon;
            this.eosLabel1.Location = new System.Drawing.Point(168, 19);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.eosLabel1.Size = new System.Drawing.Size(416, 19);
            this.eosLabel1.TabIndex = 104;
            this.eosLabel1.Text = "پیکربندی مشخصات ارتباط";
            // 
            // groupBox1
            // 
            this.groupBox1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.groupBox1.Controls.Add(this.TestConnectionButton);
            this.groupBox1.Controls.Add(this.label1);
            this.groupBox1.Controls.Add(this.webServiceURLTextBox);
            this.groupBox1.Location = new System.Drawing.Point(182, 50);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.groupBox1.Size = new System.Drawing.Size(402, 125);
            this.groupBox1.TabIndex = 106;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "ثبت مشخصات";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(285, 28);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(111, 13);
            this.label1.TabIndex = 2;
            this.label1.Text = "آدرس وب سرویس ETS";
            // 
            // webServiceURLTextBox
            // 
            this.webServiceURLTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.webServiceURLTextBox.AutoCompleteDataSource = null;
            this.webServiceURLTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.webServiceURLTextBox.ConvertNumberToEnglish = false;
            this.webServiceURLTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.webServiceURLTextBox.EnterKeyTap = true;
            this.webServiceURLTextBox.FormatString = "";
            this.webServiceURLTextBox.IsNumeric = false;
            this.webServiceURLTextBox.Label = "";
            this.webServiceURLTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.webServiceURLTextBox.Location = new System.Drawing.Point(10, 54);
            this.webServiceURLTextBox.MaxLength = 100;
            this.webServiceURLTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.webServiceURLTextBox.Name = "webServiceURLTextBox";
            this.webServiceURLTextBox.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.webServiceURLTextBox.Size = new System.Drawing.Size(383, 21);
            this.webServiceURLTextBox.TabIndex = 1;
            this.webServiceURLTextBox.UsedAutoCompleteContainMode = false;
            // 
            // cancelButton
            // 
            this.cancelButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.cancelButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Delete21;
            this.cancelButton.Location = new System.Drawing.Point(93, 184);
            this.cancelButton.Name = "cancelButton";
            this.cancelButton.Size = new System.Drawing.Size(75, 28);
            this.cancelButton.TabIndex = 108;
            this.cancelButton.Text = "لغو";
            this.cancelButton.Click += new System.EventHandler(this.cancelButton_Click);
            // 
            // SavedConfigurationButton
            // 
            this.SavedConfigurationButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.SavedConfigurationButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Ok21;
            this.SavedConfigurationButton.Location = new System.Drawing.Point(12, 184);
            this.SavedConfigurationButton.Name = "SavedConfigurationButton";
            this.SavedConfigurationButton.Size = new System.Drawing.Size(75, 28);
            this.SavedConfigurationButton.TabIndex = 107;
            this.SavedConfigurationButton.Text = "تایید";
            this.SavedConfigurationButton.Click += new System.EventHandler(this.SavedConfigurationButton_Click);
            // 
            // TestConnectionButton
            // 
            this.TestConnectionButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.TestConnectionButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.connected16;
            this.TestConnectionButton.Location = new System.Drawing.Point(10, 87);
            this.TestConnectionButton.Name = "TestConnectionButton";
            this.TestConnectionButton.Size = new System.Drawing.Size(93, 28);
            this.TestConnectionButton.TabIndex = 109;
            this.TestConnectionButton.Text = "تست ارتباط";
            this.TestConnectionButton.Click += new System.EventHandler(this.TestConnectionButton_Click);
            // 
            // pictureBox1
            // 
            this.pictureBox1.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Center;
            this.pictureBox1.Image = global::EosParkingProfessional.Properties.Resources.ConfigConnectionSync80;
            this.pictureBox1.Location = new System.Drawing.Point(12, 19);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(138, 115);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.pictureBox1.TabIndex = 105;
            this.pictureBox1.TabStop = false;
            // 
            // ImportDataConfigurationForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(596, 220);
            this.Controls.Add(this.cancelButton);
            this.Controls.Add(this.SavedConfigurationButton);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.pictureBox1);
            this.Controls.Add(this.eosLabel1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Name = "ImportDataConfigurationForm";
            this.Text = "تنظیم ارتباط با سایر سیستم ها";
            this.Load += new System.EventHandler(this.ImportDataConfigurationForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private EosParkingTools.EosControls.EosLabel eosLabel1;
        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.GroupBox groupBox1;
        public DevExpress.XtraEditors.SimpleButton cancelButton;
        public DevExpress.XtraEditors.SimpleButton SavedConfigurationButton;
        private EosParkingTools.EosControls.EosTextBox webServiceURLTextBox;
        public DevExpress.XtraEditors.SimpleButton TestConnectionButton;
        private System.Windows.Forms.Label label1;
    }
}