namespace EosParkingTools.EosControls
{
    partial class EosWaitPanel
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
            this.progressPanel = new DevExpress.XtraWaitForm.ProgressPanel();
            this.panel1 = new System.Windows.Forms.Panel();
            this.cancelButton = new DevExpress.XtraEditors.SimpleButton();
            this.panel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // progressPanel
            // 
            this.progressPanel.Appearance.BackColor = System.Drawing.Color.Transparent;
            this.progressPanel.Appearance.Options.UseBackColor = true;
            this.progressPanel.AppearanceCaption.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.progressPanel.AppearanceCaption.Options.UseFont = true;
            this.progressPanel.AppearanceCaption.Options.UseTextOptions = true;
            this.progressPanel.AppearanceCaption.TextOptions.VAlignment = DevExpress.Utils.VertAlignment.Top;
            this.progressPanel.AppearanceDescription.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.progressPanel.AppearanceDescription.Options.UseFont = true;
            this.progressPanel.AppearanceDescription.Options.UseTextOptions = true;
            this.progressPanel.AppearanceDescription.TextOptions.VAlignment = DevExpress.Utils.VertAlignment.Bottom;
            this.progressPanel.AppearanceDescription.TextOptions.WordWrap = DevExpress.Utils.WordWrap.Wrap;
            this.progressPanel.BarAnimationElementThickness = 2;
            this.progressPanel.BorderStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.progressPanel.Caption = "لطفا صبر کنید";
            this.progressPanel.Description = "درحال دریافت داه ها";
            this.progressPanel.Dock = System.Windows.Forms.DockStyle.Top;
            this.progressPanel.Location = new System.Drawing.Point(0, 0);
            this.progressPanel.Name = "progressPanel";
            this.progressPanel.Padding = new System.Windows.Forms.Padding(10, 0, 0, 0);
            this.progressPanel.Size = new System.Drawing.Size(157, 62);
            this.progressPanel.TabIndex = 0;
            // 
            // panel1
            // 
            this.panel1.Anchor = System.Windows.Forms.AnchorStyles.None;
            this.panel1.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.panel1.Controls.Add(this.cancelButton);
            this.panel1.Controls.Add(this.progressPanel);
            this.panel1.Location = new System.Drawing.Point(0, 0);
            this.panel1.Margin = new System.Windows.Forms.Padding(0);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(159, 79);
            this.panel1.TabIndex = 0;
            // 
            // cancelButton
            // 
            this.cancelButton.Anchor = System.Windows.Forms.AnchorStyles.None;
            this.cancelButton.AutoSize = true;
            this.cancelButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Cancel21;
            this.cancelButton.ImageOptions.ImageToTextAlignment = DevExpress.XtraEditors.ImageAlignToText.LeftCenter;
            this.cancelButton.Location = new System.Drawing.Point(36, 49);
            this.cancelButton.Name = "cancelButton";
            this.cancelButton.Size = new System.Drawing.Size(82, 25);
            this.cancelButton.TabIndex = 0;
            this.cancelButton.Text = "لغو عملیات";
            this.cancelButton.Click += new System.EventHandler(this.OnCancelButtonClick);
            // 
            // EosWaitPanel
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.panel1);
            this.MinimumSize = new System.Drawing.Size(159, 79);
            this.Name = "EosWaitPanel";
            this.Size = new System.Drawing.Size(159, 79);
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private DevExpress.XtraWaitForm.ProgressPanel progressPanel;
        private System.Windows.Forms.Panel panel1;
        public DevExpress.XtraEditors.SimpleButton cancelButton;
    }
}
