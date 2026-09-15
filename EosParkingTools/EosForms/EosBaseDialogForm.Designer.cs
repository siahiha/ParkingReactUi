namespace EosParkingTools.EosForms
{
    partial class EosBaseDialogForm
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
            this.panelControl1 = new DevExpress.XtraEditors.PanelControl();
            this.okButton = new DevExpress.XtraEditors.SimpleButton();
            this.cancelButton = new DevExpress.XtraEditors.SimpleButton();
            this.noButton = new DevExpress.XtraEditors.SimpleButton();
            this.panelControl2 = new DevExpress.XtraEditors.PanelControl();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).BeginInit();
            this.panelControl2.SuspendLayout();
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
            // panelControl1
            // 
            this.panelControl1.BorderStyle = DevExpress.XtraEditors.Controls.BorderStyles.Simple;
            this.panelControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panelControl1.Location = new System.Drawing.Point(0, 0);
            this.panelControl1.Name = "panelControl1";
            this.panelControl1.Size = new System.Drawing.Size(484, 146);
            this.panelControl1.TabIndex = 0;
            // 
            // okButton
            // 
            this.okButton.DialogResult = System.Windows.Forms.DialogResult.OK;
            this.okButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Ok21;
            this.okButton.Location = new System.Drawing.Point(9, 5);
            this.okButton.Name = "okButton";
            this.okButton.Size = new System.Drawing.Size(75, 28);
            this.okButton.TabIndex = 0;
            this.okButton.Text = "تایید";
            // 
            // cancelButton
            // 
            this.cancelButton.DialogResult = System.Windows.Forms.DialogResult.Cancel;
            this.cancelButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Cancel21;
            this.cancelButton.Location = new System.Drawing.Point(90, 5);
            this.cancelButton.Name = "cancelButton";
            this.cancelButton.Size = new System.Drawing.Size(75, 28);
            this.cancelButton.TabIndex = 0;
            this.cancelButton.Text = "لغو";
            // 
            // noButton
            // 
            this.noButton.DialogResult = System.Windows.Forms.DialogResult.No;
            this.noButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.No21;
            this.noButton.Location = new System.Drawing.Point(171, 5);
            this.noButton.Name = "noButton";
            this.noButton.Size = new System.Drawing.Size(77, 28);
            this.noButton.TabIndex = 0;
            this.noButton.Text = "خیر";
            this.noButton.Visible = false;
            // 
            // panelControl2
            // 
            this.panelControl2.BorderStyle = DevExpress.XtraEditors.Controls.BorderStyles.Simple;
            this.panelControl2.Controls.Add(this.okButton);
            this.panelControl2.Controls.Add(this.noButton);
            this.panelControl2.Controls.Add(this.cancelButton);
            this.panelControl2.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.panelControl2.Location = new System.Drawing.Point(0, 146);
            this.panelControl2.Name = "panelControl2";
            this.panelControl2.Size = new System.Drawing.Size(484, 39);
            this.panelControl2.TabIndex = 3;
            // 
            // EosBaseDialogForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(484, 185);
            this.Controls.Add(this.panelControl1);
            this.Controls.Add(this.panelControl2);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Name = "EosBaseDialogForm";
            this.ShowInTaskbar = false;
            this.Text = "EosBaseDialogForm";
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).EndInit();
            this.panelControl2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        public DevExpress.XtraEditors.PanelControl panelControl1;
        public DevExpress.XtraEditors.SimpleButton cancelButton;
        public DevExpress.XtraEditors.SimpleButton noButton;
        public DevExpress.XtraEditors.SimpleButton okButton;
        public DevExpress.XtraEditors.PanelControl panelControl2;
    }
}