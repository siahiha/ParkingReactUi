using System.Drawing;

namespace EosParkingProfessional.EosForms
{
    partial class PayForm
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
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(PayForm));
            this.titleLabel = new EosParkingTools.EosControls.EosLabel();
            this.detailLabel = new EosParkingTools.EosControls.EosLabel();
            this.qrCodePictureBox = new System.Windows.Forms.PictureBox();
            this.timer1 = new System.Windows.Forms.Timer(this.components);
            this.posPayButton = new DevExpress.XtraEditors.SimpleButton();
            this.showPriceButton = new DevExpress.XtraEditors.SimpleButton();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).BeginInit();
            this.panelControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).BeginInit();
            this.panelControl2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.qrCodePictureBox)).BeginInit();
            this.SuspendLayout();
            // 
            // panelControl1
            // 
            this.panelControl1.Controls.Add(this.label2);
            this.panelControl1.Controls.Add(this.showPriceButton);
            this.panelControl1.Controls.Add(this.qrCodePictureBox);
            this.panelControl1.Controls.Add(this.detailLabel);
            this.panelControl1.Controls.Add(this.titleLabel);
            this.panelControl1.Size = new System.Drawing.Size(316, 380);
            this.panelControl1.MouseEnter += new System.EventHandler(this.panelControl2_MouseEnter);
            // 
            // cancelButton
            // 
            this.cancelButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("cancelButton.ImageOptions.Image")));
            this.cancelButton.Location = new System.Drawing.Point(108, 5);
            this.cancelButton.Text = "خروج";
            // 
            // noButton
            // 
            this.noButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("noButton.ImageOptions.Image")));
            this.noButton.Location = new System.Drawing.Point(189, 5);
            // 
            // okButton
            // 
            this.okButton.DialogResult = System.Windows.Forms.DialogResult.None;
            this.okButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("okButton.ImageOptions.Image")));
            this.okButton.Size = new System.Drawing.Size(93, 28);
            this.okButton.Text = "تایید و پرداخت";
            this.okButton.Click += new System.EventHandler(this.okButton_Click);
            // 
            // panelControl2
            // 
            this.panelControl2.Controls.Add(this.posPayButton);
            this.panelControl2.Location = new System.Drawing.Point(0, 380);
            this.panelControl2.Size = new System.Drawing.Size(316, 39);
            this.panelControl2.MouseEnter += new System.EventHandler(this.panelControl2_MouseEnter);
            this.panelControl2.Controls.SetChildIndex(this.cancelButton, 0);
            this.panelControl2.Controls.SetChildIndex(this.noButton, 0);
            this.panelControl2.Controls.SetChildIndex(this.okButton, 0);
            this.panelControl2.Controls.SetChildIndex(this.posPayButton, 0);
            // 
            // styleController
            // 
            this.styleController.LookAndFeel.SkinName = "Office 2013";
            // 
            // defaultLookAndFeel
            // 
            this.defaultLookAndFeel.LookAndFeel.SkinName = "Office 2016 Colorful";
            // 
            // titleLabel
            // 
            this.titleLabel.BorderColor = System.Drawing.Color.Maroon;
            this.titleLabel.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.titleLabel.BorderWidth = 1;
            this.titleLabel.Dock = System.Windows.Forms.DockStyle.Top;
            this.titleLabel.Location = new System.Drawing.Point(2, 2);
            this.titleLabel.Name = "titleLabel";
            this.titleLabel.Size = new System.Drawing.Size(312, 34);
            this.titleLabel.TabIndex = 4;
            this.titleLabel.Text = "جزئیات هزینه";
            this.titleLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            this.titleLabel.MouseEnter += new System.EventHandler(this.panelControl2_MouseEnter);
            // 
            // detailLabel
            // 
            this.detailLabel.BorderColor = System.Drawing.Color.Black;
            this.detailLabel.BorderWidth = 1;
            this.detailLabel.Location = new System.Drawing.Point(12, 48);
            this.detailLabel.Name = "detailLabel";
            this.detailLabel.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.detailLabel.Size = new System.Drawing.Size(304, 237);
            this.detailLabel.TabIndex = 5;
            this.detailLabel.MouseEnter += new System.EventHandler(this.panelControl2_MouseEnter);
            // 
            // qrCodePictureBox
            // 
            this.qrCodePictureBox.Location = new System.Drawing.Point(12, 194);
            this.qrCodePictureBox.Name = "qrCodePictureBox";
            this.qrCodePictureBox.Size = new System.Drawing.Size(100, 91);
            this.qrCodePictureBox.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.qrCodePictureBox.TabIndex = 6;
            this.qrCodePictureBox.TabStop = false;
            // 
            // timer1
            // 
            this.timer1.Interval = 1000;
            this.timer1.Tick += new System.EventHandler(this.timer1_Tick);
            // 
            // posPayButton
            // 
            this.posPayButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Pos21;
            this.posPayButton.Location = new System.Drawing.Point(189, 5);
            this.posPayButton.Name = "posPayButton";
            this.posPayButton.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.posPayButton.Size = new System.Drawing.Size(102, 28);
            this.posPayButton.TabIndex = 1;
            this.posPayButton.Text = "پرداخت با Pos";
            this.posPayButton.Visible = false;
            this.posPayButton.Click += new System.EventHandler(this.simpleButton1_Click);
            // 
            // showPriceButton
            // 
            this.showPriceButton.Appearance.Options.UseTextOptions = true;
            this.showPriceButton.Appearance.TextOptions.WordWrap = DevExpress.Utils.WordWrap.Wrap;
            this.showPriceButton.Location = new System.Drawing.Point(9, 2);
            this.showPriceButton.Name = "showPriceButton";
            this.showPriceButton.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.showPriceButton.Size = new System.Drawing.Size(77, 32);
            this.showPriceButton.TabIndex = 7;
            this.showPriceButton.Text = "نمایش مجدد مبلغ روی LCD";
            this.showPriceButton.Visible = false;
            this.showPriceButton.Click += new System.EventHandler(this.showPriceButton_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Tahoma", 38F);
            this.label1.Location = new System.Drawing.Point(36, 311);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(35, 13);
            this.label1.TabIndex = 8;
            this.label1.Text = "...";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(12, 314);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(35, 13);
            this.label2.TabIndex = 8;
            this.label2.Font = new System.Drawing.Font("Tahoma", 38F);
            this.label2.Text = "....";
            // 
            // PayForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(316, 419);
            this.Name = "PayForm";
            this.Text = "";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.PayForm_FormClosing);
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).EndInit();
            this.panelControl1.ResumeLayout(false);
            ////this.panelControl1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).EndInit();
            this.panelControl2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.qrCodePictureBox)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.PictureBox qrCodePictureBox;
        private EosParkingTools.EosControls.EosLabel detailLabel;
        private EosParkingTools.EosControls.EosLabel titleLabel;
        private System.Windows.Forms.Timer timer1;
        private DevExpress.XtraEditors.SimpleButton posPayButton;
        private DevExpress.XtraEditors.SimpleButton showPriceButton;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
    }
}