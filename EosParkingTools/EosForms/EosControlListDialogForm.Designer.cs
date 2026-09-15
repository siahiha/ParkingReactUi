namespace EosParkingTools.EosForms
{
    partial class EosControlListDialogForm
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(EosControlListDialogForm));
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.textBox1 = new System.Windows.Forms.TextBox();
            this.eosLabel2 = new EosParkingTools.EosControls.EosLabel();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).BeginInit();
            this.panelControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).BeginInit();
            this.panelControl2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            this.SuspendLayout();
            // 
            // panelControl1
            // 
            this.panelControl1.Appearance.Options.UseForeColor = true;
            this.panelControl1.BorderStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.panelControl1.Controls.Add(this.eosLabel2);
            this.panelControl1.Controls.Add(this.textBox1);
            this.panelControl1.Controls.Add(this.eosLabel1);
            this.panelControl1.LookAndFeel.UseDefaultLookAndFeel = false;
            this.panelControl1.Size = new System.Drawing.Size(330, 208);
            // 
            // cancelButton
            // 
            this.cancelButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("cancelButton.ImageOptions.Image")));
            this.cancelButton.Location = new System.Drawing.Point(153, 5);
            this.cancelButton.Visible = false;
            // 
            // noButton
            // 
            this.noButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("noButton.ImageOptions.Image")));
            this.noButton.Location = new System.Drawing.Point(234, 5);
            // 
            // okButton
            // 
            this.okButton.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.okButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("okButton.ImageOptions.Image")));
            this.okButton.Location = new System.Drawing.Point(105, 5);
            this.okButton.Size = new System.Drawing.Size(123, 28);
            this.okButton.Text = "متوجه شدم";
            // 
            // panelControl2
            // 
            this.panelControl2.Location = new System.Drawing.Point(0, 208);
            this.panelControl2.Size = new System.Drawing.Size(330, 39);
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
            this.eosLabel1.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Bold);
            this.eosLabel1.Location = new System.Drawing.Point(10, 37);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.eosLabel1.Size = new System.Drawing.Size(292, 21);
            this.eosLabel1.TabIndex = 4;
            this.eosLabel1.Text = "این خودرو سرقتی می باشد";
            this.eosLabel1.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            // 
            // textBox1
            // 
            this.textBox1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.textBox1.BackColor = System.Drawing.SystemColors.Info;
            this.textBox1.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.textBox1.Location = new System.Drawing.Point(10, 86);
            this.textBox1.Multiline = true;
            this.textBox1.Name = "textBox1";
            this.textBox1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.textBox1.Size = new System.Drawing.Size(292, 109);
            this.textBox1.TabIndex = 5;
            // 
            // eosLabel2
            // 
            this.eosLabel2.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.eosLabel2.AutoSize = true;
            this.eosLabel2.BorderColor = System.Drawing.Color.Black;
            this.eosLabel2.BorderWidth = 1;
            this.eosLabel2.Location = new System.Drawing.Point(254, 65);
            this.eosLabel2.Name = "eosLabel2";
            this.eosLabel2.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.eosLabel2.Size = new System.Drawing.Size(51, 13);
            this.eosLabel2.TabIndex = 6;
            this.eosLabel2.Text = "توضیحات:";
            // 
            // EosControlListDialogForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(330, 247);
            this.ControlBox = false;
            this.Name = "EosControlListDialogForm";
            this.Text = "کنترل خودرو ها";
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).EndInit();
            this.panelControl1.ResumeLayout(false);
            this.panelControl1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).EndInit();
            this.panelControl2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TextBox textBox1;
        private EosControls.EosLabel eosLabel1;
        private EosControls.EosLabel eosLabel2;
    }
}