namespace EosParkingTools.EosControls
{
    partial class EosPagingToolsGridControl
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(EosPagingToolsGridControl));
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.panel1 = new System.Windows.Forms.Panel();
            this.label1 = new System.Windows.Forms.Label();
            this.pageCountComboBox = new DevExpress.XtraEditors.ComboBoxEdit();
            this.label2 = new System.Windows.Forms.Label();
            this.splitterControl1 = new DevExpress.XtraEditors.SplitterControl();
            this.lastPageButton = new DevExpress.XtraEditors.SimpleButton();
            this.nextButton = new DevExpress.XtraEditors.SimpleButton();
            this.previousButton = new DevExpress.XtraEditors.SimpleButton();
            this.firstPageButton = new DevExpress.XtraEditors.SimpleButton();
            this.splitterControl2 = new DevExpress.XtraEditors.SplitterControl();
            this.pageNomberLabel = new System.Windows.Forms.Label();
            this.flowLayoutPanel1.SuspendLayout();
            this.panel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pageCountComboBox.Properties)).BeginInit();
            this.SuspendLayout();
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Controls.Add(this.panel1);
            this.flowLayoutPanel1.Controls.Add(this.splitterControl1);
            this.flowLayoutPanel1.Controls.Add(this.lastPageButton);
            this.flowLayoutPanel1.Controls.Add(this.nextButton);
            this.flowLayoutPanel1.Controls.Add(this.previousButton);
            this.flowLayoutPanel1.Controls.Add(this.firstPageButton);
            this.flowLayoutPanel1.Controls.Add(this.splitterControl2);
            this.flowLayoutPanel1.Controls.Add(this.pageNomberLabel);
            this.flowLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(529, 27);
            this.flowLayoutPanel1.TabIndex = 0;
            // 
            // panel1
            // 
            this.panel1.AutoSize = true;
            this.panel1.Controls.Add(this.label1);
            this.panel1.Controls.Add(this.pageCountComboBox);
            this.panel1.Controls.Add(this.label2);
            this.panel1.Location = new System.Drawing.Point(0, 0);
            this.panel1.Margin = new System.Windows.Forms.Padding(0);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(179, 25);
            this.panel1.TabIndex = 9;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(3, 4);
            this.label1.Margin = new System.Windows.Forms.Padding(0);
            this.label1.Name = "label1";
            this.label1.Padding = new System.Windows.Forms.Padding(0, 3, 0, 0);
            this.label1.Size = new System.Drawing.Size(28, 16);
            this.label1.TabIndex = 3;
            this.label1.Text = "مورد";
            // 
            // pageCountComboBox
            // 
            this.pageCountComboBox.EditValue = "500";
            this.pageCountComboBox.Location = new System.Drawing.Point(33, 4);
            this.pageCountComboBox.Margin = new System.Windows.Forms.Padding(3, 3, 0, 3);
            this.pageCountComboBox.Name = "pageCountComboBox";
            this.pageCountComboBox.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.False;
            this.pageCountComboBox.Properties.BorderStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.pageCountComboBox.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.pageCountComboBox.Properties.Items.AddRange(new object[] {
            "10",
            "50",
            "500",
            "1000",
            "10000",
            "100000",
            "1000000",
            "10000000",
            "همه"});
            this.pageCountComboBox.Size = new System.Drawing.Size(85, 18);
            this.pageCountComboBox.TabIndex = 2;
            this.pageCountComboBox.Validated += new System.EventHandler(this.pageCountComboBox_Validated);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(118, 4);
            this.label2.Margin = new System.Windows.Forms.Padding(0);
            this.label2.Name = "label2";
            this.label2.Padding = new System.Windows.Forms.Padding(0, 3, 0, 0);
            this.label2.Size = new System.Drawing.Size(61, 16);
            this.label2.TabIndex = 3;
            this.label2.Text = "در هر صفحه";
            // 
            // splitterControl1
            // 
            this.splitterControl1.Location = new System.Drawing.Point(182, 3);
            this.splitterControl1.Name = "splitterControl1";
            this.splitterControl1.Size = new System.Drawing.Size(12, 20);
            this.splitterControl1.TabIndex = 4;
            this.splitterControl1.TabStop = false;
            // 
            // lastPageButton
            // 
            this.lastPageButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.lastPageButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("lastPageButton.ImageOptions.Image")));
            this.lastPageButton.ImageOptions.SvgImageSize = new System.Drawing.Size(15, 30);
            this.lastPageButton.Location = new System.Drawing.Point(197, 3);
            this.lastPageButton.Margin = new System.Windows.Forms.Padding(0, 3, 0, 3);
            this.lastPageButton.Name = "lastPageButton";
            this.lastPageButton.Size = new System.Drawing.Size(19, 20);
            this.lastPageButton.TabIndex = 11;
            this.lastPageButton.ToolTip = "صفحه آخر";
            this.lastPageButton.Click += new System.EventHandler(this.lastPageButton_Click);
            // 
            // nextButton
            // 
            this.nextButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.nextButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("nextButton.ImageOptions.Image")));
            this.nextButton.ImageOptions.ImageToTextAlignment = DevExpress.XtraEditors.ImageAlignToText.RightCenter;
            this.nextButton.ImageOptions.SvgImageSize = new System.Drawing.Size(15, 30);
            this.nextButton.Location = new System.Drawing.Point(216, 3);
            this.nextButton.Margin = new System.Windows.Forms.Padding(0, 3, 3, 3);
            this.nextButton.Name = "nextButton";
            this.nextButton.Size = new System.Drawing.Size(75, 20);
            this.nextButton.TabIndex = 5;
            this.nextButton.Text = "صفحه بعد";
            this.nextButton.Click += new System.EventHandler(this.nextButton_Click);
            // 
            // previousButton
            // 
            this.previousButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.previousButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("previousButton.ImageOptions.Image")));
            this.previousButton.ImageOptions.ImageToTextAlignment = DevExpress.XtraEditors.ImageAlignToText.LeftCenter;
            this.previousButton.ImageOptions.SvgImageSize = new System.Drawing.Size(15, 30);
            this.previousButton.Location = new System.Drawing.Point(297, 3);
            this.previousButton.Margin = new System.Windows.Forms.Padding(3, 3, 0, 3);
            this.previousButton.Name = "previousButton";
            this.previousButton.Size = new System.Drawing.Size(75, 20);
            this.previousButton.TabIndex = 6;
            this.previousButton.Text = "صفحه قبل";
            this.previousButton.Click += new System.EventHandler(this.previousButton_Click);
            // 
            // firstPageButton
            // 
            this.firstPageButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.firstPageButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("firstPageButton.ImageOptions.Image")));
            this.firstPageButton.ImageOptions.SvgImageSize = new System.Drawing.Size(15, 30);
            this.firstPageButton.Location = new System.Drawing.Point(372, 3);
            this.firstPageButton.Margin = new System.Windows.Forms.Padding(0, 3, 0, 3);
            this.firstPageButton.Name = "firstPageButton";
            this.firstPageButton.Size = new System.Drawing.Size(19, 20);
            this.firstPageButton.TabIndex = 10;
            this.firstPageButton.ToolTip = "صفحه اول";
            this.firstPageButton.Click += new System.EventHandler(this.firstPageButton_Click);
            // 
            // splitterControl2
            // 
            this.splitterControl2.Location = new System.Drawing.Point(394, 3);
            this.splitterControl2.Name = "splitterControl2";
            this.splitterControl2.Size = new System.Drawing.Size(12, 20);
            this.splitterControl2.TabIndex = 7;
            this.splitterControl2.TabStop = false;
            // 
            // pageNomberLabel
            // 
            this.pageNomberLabel.AutoSize = true;
            this.pageNomberLabel.Location = new System.Drawing.Point(412, 3);
            this.pageNomberLabel.Margin = new System.Windows.Forms.Padding(3, 3, 3, 0);
            this.pageNomberLabel.Name = "pageNomberLabel";
            this.pageNomberLabel.Padding = new System.Windows.Forms.Padding(0, 3, 0, 0);
            this.pageNomberLabel.Size = new System.Drawing.Size(0, 16);
            this.pageNomberLabel.TabIndex = 8;
            // 
            // EosPagingToolsGridControl
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.flowLayoutPanel1);
            this.Name = "EosPagingToolsGridControl";
            this.Size = new System.Drawing.Size(529, 27);
            this.Load += new System.EventHandler(this.PagingToolsGridControl_Load);
            this.flowLayoutPanel1.ResumeLayout(false);
            this.flowLayoutPanel1.PerformLayout();
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pageCountComboBox.Properties)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private DevExpress.XtraEditors.ComboBoxEdit pageCountComboBox;
        private System.Windows.Forms.Label label1;
        private DevExpress.XtraEditors.SplitterControl splitterControl1;
        private DevExpress.XtraEditors.SimpleButton previousButton;
        private DevExpress.XtraEditors.SimpleButton nextButton;
        private DevExpress.XtraEditors.SplitterControl splitterControl2;
        private System.Windows.Forms.Label pageNomberLabel;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Panel panel1;
        private DevExpress.XtraEditors.SimpleButton firstPageButton;
        private DevExpress.XtraEditors.SimpleButton lastPageButton;
    }
}
