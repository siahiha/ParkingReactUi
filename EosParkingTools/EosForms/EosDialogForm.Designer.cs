namespace EosParkingTools.EosForms
{
    partial class EosDialogForm
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
            this.messageLabel = new System.Windows.Forms.Label();
            this.dialogPictureBox = new System.Windows.Forms.PictureBox();
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.closeTimer = new System.Windows.Forms.Timer();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).BeginInit();
            this.panelControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).BeginInit();
            this.panelControl2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dialogPictureBox)).BeginInit();
            this.tableLayoutPanel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // panelControl1
            // 
            this.panelControl1.Controls.Add(this.tableLayoutPanel1);
            this.panelControl1.Size = new System.Drawing.Size(336, 103);
            // 
            // cancelButton
            // 
            this.cancelButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Cancel21;
            this.cancelButton.Location = new System.Drawing.Point(93, 3);
            // 
            // noButton
            // 
            this.noButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.No21;
            this.noButton.Location = new System.Drawing.Point(174, 3);
            // 
            // okButton
            // 
            this.okButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Ok21;
            this.okButton.Location = new System.Drawing.Point(12, 3);
            // 
            // panelControl2
            // 
            this.panelControl2.Location = new System.Drawing.Point(0, 103);
            this.panelControl2.Size = new System.Drawing.Size(336, 39);
            // 
            // styleController
            // 
            this.styleController.LookAndFeel.SkinName = "Office 2016 Colorful";
            // 
            // defaultLookAndFeel
            // 
            this.defaultLookAndFeel.LookAndFeel.SkinName = "Office 2016 Colorful";
            // 
            // messageLabel
            // 
            this.messageLabel.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.messageLabel.Location = new System.Drawing.Point(3, 0);
            this.messageLabel.Name = "messageLabel";
            this.messageLabel.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.messageLabel.Size = new System.Drawing.Size(250, 99);
            this.messageLabel.TabIndex = 2;
            this.messageLabel.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // dialogPictureBox
            // 
            this.dialogPictureBox.Image = global::EosParkingTools.Properties.Resources.Information80;
            this.dialogPictureBox.Location = new System.Drawing.Point(259, 3);
            this.dialogPictureBox.Name = "dialogPictureBox";
            this.dialogPictureBox.Padding = new System.Windows.Forms.Padding(0, 8, 0, 0);
            this.dialogPictureBox.Size = new System.Drawing.Size(70, 93);
            this.dialogPictureBox.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.dialogPictureBox.TabIndex = 3;
            this.dialogPictureBox.TabStop = false;
            this.dialogPictureBox.DoubleClick += new System.EventHandler(this.dialogPictureBox_DoubleClick);
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.ColumnCount = 2;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 77.29592F));
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 22.70408F));
            this.tableLayoutPanel1.Controls.Add(this.dialogPictureBox, 1, 0);
            this.tableLayoutPanel1.Controls.Add(this.messageLabel, 0, 0);
            this.tableLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tableLayoutPanel1.Location = new System.Drawing.Point(2, 2);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.RowCount = 1;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 142F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(332, 99);
            this.tableLayoutPanel1.TabIndex = 4;
            // 
            // closeTimer
            // 
            this.closeTimer.Interval = 1000;
            this.closeTimer.Tick += new System.EventHandler(this.closeTimer_Tick);
            // 
            // EosDialogForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(336, 142);
            this.Name = "EosDialogForm";
            this.Text = "";
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).EndInit();
            this.panelControl1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).EndInit();
            this.panelControl2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dialogPictureBox)).EndInit();
            this.tableLayoutPanel1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        public System.Windows.Forms.Label messageLabel;
        public System.Windows.Forms.PictureBox dialogPictureBox;
        public System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.Timer closeTimer;
    }
}