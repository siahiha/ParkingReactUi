namespace EosParkingProfessional.EosForms
{
    partial class AboutForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
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
            this.okButton = new System.Windows.Forms.Button();
            this.linkLabel1 = new System.Windows.Forms.LinkLabel();
            this.logoPictureBox = new System.Windows.Forms.PictureBox();
            this.panel1 = new System.Windows.Forms.Panel();
            this.lblInfoFromLock = new System.Windows.Forms.Label();
            this.labelProductName = new System.Windows.Forms.Label();
            this.labelVersion = new System.Windows.Forms.Label();
            this.lblIMEI = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.logoPictureBox)).BeginInit();
            this.panel1.SuspendLayout();
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
            // okButton
            // 
            this.okButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.okButton.DialogResult = System.Windows.Forms.DialogResult.Cancel;
            this.okButton.Location = new System.Drawing.Point(9, 318);
            this.okButton.Name = "okButton";
            this.okButton.Size = new System.Drawing.Size(64, 20);
            this.okButton.TabIndex = 24;
            this.okButton.Text = "تایید";
            this.okButton.Click += new System.EventHandler(this.okButton_Click);
            // 
            // linkLabel1
            // 
            this.linkLabel1.AutoSize = true;
            this.linkLabel1.Location = new System.Drawing.Point(177, 320);
            this.linkLabel1.Margin = new System.Windows.Forms.Padding(3, 5, 3, 0);
            this.linkLabel1.Name = "linkLabel1";
            this.linkLabel1.Size = new System.Drawing.Size(107, 13);
            this.linkLabel1.TabIndex = 1;
            this.linkLabel1.TabStop = true;
            this.linkLabel1.Text = "www.elmosanat.com";
            this.linkLabel1.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
            this.linkLabel1.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel1_LinkClicked);
            // 
            // logoPictureBox
            // 
            this.logoPictureBox.Dock = System.Windows.Forms.DockStyle.Top;
            this.logoPictureBox.Image = global::EosParkingProfessional.Properties.Resources.EosLogo;
            this.logoPictureBox.Location = new System.Drawing.Point(9, 9);
            this.logoPictureBox.Name = "logoPictureBox";
            this.logoPictureBox.Size = new System.Drawing.Size(461, 103);
            this.logoPictureBox.SizeMode = System.Windows.Forms.PictureBoxSizeMode.CenterImage;
            this.logoPictureBox.TabIndex = 13;
            this.logoPictureBox.TabStop = false;
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.lblInfoFromLock);
            this.panel1.Controls.Add(this.labelProductName);
            this.panel1.Controls.Add(this.labelVersion);
            this.panel1.Controls.Add(this.lblIMEI);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel1.Location = new System.Drawing.Point(9, 112);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(461, 185);
            this.panel1.TabIndex = 28;
            // 
            // lblInfoFromLock
            // 
            this.lblInfoFromLock.Font = new System.Drawing.Font("Tahoma", 10F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.lblInfoFromLock.ImageAlign = System.Drawing.ContentAlignment.TopCenter;
            this.lblInfoFromLock.Location = new System.Drawing.Point(0, 56);
            this.lblInfoFromLock.Name = "lblInfoFromLock";
            this.lblInfoFromLock.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.lblInfoFromLock.Size = new System.Drawing.Size(461, 85);
            this.lblInfoFromLock.TabIndex = 32;
            this.lblInfoFromLock.Text = "   ";
            this.lblInfoFromLock.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // labelProductName
            // 
            this.labelProductName.Font = new System.Drawing.Font("Tahoma", 11F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelProductName.Location = new System.Drawing.Point(-3, 3);
            this.labelProductName.Name = "labelProductName";
            this.labelProductName.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelProductName.Size = new System.Drawing.Size(461, 53);
            this.labelProductName.TabIndex = 31;
            this.labelProductName.Text = "سیستم مدیریت پارکینگ";
            this.labelProductName.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // labelVersion
            // 
            this.labelVersion.Font = new System.Drawing.Font("Tahoma", 10F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelVersion.Location = new System.Drawing.Point(3, 165);
            this.labelVersion.Name = "labelVersion";
            this.labelVersion.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelVersion.Size = new System.Drawing.Size(461, 18);
            this.labelVersion.TabIndex = 30;
            this.labelVersion.Text = "نسخه";
            this.labelVersion.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.labelVersion.Visible = false;
            this.labelVersion.Click += new System.EventHandler(this.labelVersion_Click);
            // 
            // lblIMEI
            // 
            this.lblIMEI.Font = new System.Drawing.Font("Tahoma", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.lblIMEI.Location = new System.Drawing.Point(3, 141);
            this.lblIMEI.Name = "lblIMEI";
            this.lblIMEI.Size = new System.Drawing.Size(461, 24);
            this.lblIMEI.TabIndex = 29;
            this.lblIMEI.Text = "IMEI";
            this.lblIMEI.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            this.lblIMEI.DoubleClick += new System.EventHandler(this.lblIMEI_DoubleClick_1);
            // 
            // AboutForm
            // 
            this.AcceptButton = this.okButton;
            this.Appearance.Options.UseFont = true;
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(479, 366);
            this.Controls.Add(this.panel1);
            this.Controls.Add(this.okButton);
            this.Controls.Add(this.logoPictureBox);
            this.Controls.Add(this.linkLabel1);
            this.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Name = "AboutForm";
            this.Padding = new System.Windows.Forms.Padding(9);
            this.ShowIcon = false;
            this.ShowInTaskbar = false;
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "درباره نرم افزار";
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.logoPictureBox)).EndInit();
            this.panel1.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.Button okButton;
        private System.Windows.Forms.LinkLabel linkLabel1;
        private System.Windows.Forms.PictureBox logoPictureBox;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.Label labelProductName;
        private System.Windows.Forms.Label labelVersion;
        private System.Windows.Forms.Label lblIMEI;
        private System.Windows.Forms.Label lblInfoFromLock;
    }
}
