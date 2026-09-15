namespace EosParkingTools.EosControls
{
    partial class EosPlateSelector
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
            this.okButton = new DevExpress.XtraEditors.SimpleButton();
            this.cancelButton = new DevExpress.XtraEditors.SimpleButton();
            this.panel1 = new System.Windows.Forms.Panel();
            this.newPlateButton = new DevExpress.XtraEditors.SimpleButton();
            this.newPanel = new System.Windows.Forms.Panel();
            this.carColorTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.carModelTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.carNameTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.eosPlateControl1 = new EosParkingTools.EosControls.EosPlateControl();
            this.selectPanel = new System.Windows.Forms.Panel();
            this.carGridControl = new EosParkingTools.EosControls.EosGridControl();
            this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
            this.gridColumn1 = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumn2 = new DevExpress.XtraGrid.Columns.GridColumn();
            this.eosLabel2 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.panel1.SuspendLayout();
            this.newPanel.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.selectPanel.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.carGridControl)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridView1)).BeginInit();
            this.SuspendLayout();
            // 
            // okButton
            // 
            this.okButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Ok21;
            this.okButton.Location = new System.Drawing.Point(18, 7);
            this.okButton.Name = "okButton";
            this.okButton.Padding = new System.Windows.Forms.Padding(3);
            this.okButton.Size = new System.Drawing.Size(64, 27);
            this.okButton.TabIndex = 13;
            this.okButton.Text = "تایید";
            this.okButton.Click += new System.EventHandler(this.okButton_Click);
            this.okButton.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.simpleButton1_KeyPress);
            this.okButton.KeyUp += new System.Windows.Forms.KeyEventHandler(this.simpleButton1_KeyUp);
            // 
            // cancelButton
            // 
            this.cancelButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.cancelButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Cancel21;
            this.cancelButton.Location = new System.Drawing.Point(86, 7);
            this.cancelButton.Name = "cancelButton";
            this.cancelButton.Padding = new System.Windows.Forms.Padding(3);
            this.cancelButton.Size = new System.Drawing.Size(67, 27);
            this.cancelButton.TabIndex = 13;
            this.cancelButton.Text = "لغو";
            this.cancelButton.Click += new System.EventHandler(this.cancelButton_Click);
            this.cancelButton.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.simpleButton1_KeyPress);
            this.cancelButton.KeyUp += new System.Windows.Forms.KeyEventHandler(this.simpleButton1_KeyUp);
            // 
            // panel1
            // 
            this.panel1.BackColor = System.Drawing.Color.Transparent;
            this.panel1.Controls.Add(this.newPlateButton);
            this.panel1.Controls.Add(this.cancelButton);
            this.panel1.Controls.Add(this.okButton);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel1.Location = new System.Drawing.Point(0, 418);
            this.panel1.Name = "panel1";
            this.panel1.Padding = new System.Windows.Forms.Padding(3);
            this.panel1.Size = new System.Drawing.Size(306, 42);
            this.panel1.TabIndex = 14;
            // 
            // newPlateButton
            // 
            this.newPlateButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Ok21;
            this.newPlateButton.Location = new System.Drawing.Point(158, 7);
            this.newPlateButton.Name = "newPlateButton";
            this.newPlateButton.Padding = new System.Windows.Forms.Padding(3);
            this.newPlateButton.Size = new System.Drawing.Size(85, 27);
            this.newPlateButton.TabIndex = 14;
            this.newPlateButton.Text = "پلاک جدید";
            this.newPlateButton.Click += new System.EventHandler(this.newPlateButton1_Click);
            // 
            // newPanel
            // 
            this.newPanel.Controls.Add(this.carColorTextBox);
            this.newPanel.Controls.Add(this.carModelTextBox);
            this.newPanel.Controls.Add(this.carNameTextBox);
            this.newPanel.Controls.Add(this.pictureBox1);
            this.newPanel.Controls.Add(this.eosPlateControl1);
            this.newPanel.Dock = System.Windows.Forms.DockStyle.Top;
            this.newPanel.Location = new System.Drawing.Point(0, 225);
            this.newPanel.Name = "newPanel";
            this.newPanel.Padding = new System.Windows.Forms.Padding(20, 0, 20, 0);
            this.newPanel.Size = new System.Drawing.Size(306, 193);
            this.newPanel.TabIndex = 16;
            this.newPanel.Visible = false;
            // 
            // carColorTextBox
            // 
            this.carColorTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.carColorTextBox.ConvertNumberToEnglish = false;
            this.carColorTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.carColorTextBox.EnterKeyTap = true;
            this.carColorTextBox.FormatString = "";
            this.carColorTextBox.IsNumeric = false;
            this.carColorTextBox.Label = "رنگ خودرو";
            this.carColorTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.carColorTextBox.Location = new System.Drawing.Point(23, 154);
            this.carColorTextBox.MaxLength = 100;
            this.carColorTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.carColorTextBox.Name = "carColorTextBox";
            this.carColorTextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.carColorTextBox.Size = new System.Drawing.Size(238, 21);
            this.carColorTextBox.TabIndex = 16;
            this.carColorTextBox.KeyUp += new System.Windows.Forms.KeyEventHandler(this.simpleButton1_KeyUp);
            // 
            // carModelTextBox
            // 
            this.carModelTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.carModelTextBox.ConvertNumberToEnglish = false;
            this.carModelTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.carModelTextBox.EnterKeyTap = true;
            this.carModelTextBox.FormatString = "";
            this.carModelTextBox.IsNumeric = false;
            this.carModelTextBox.Label = "مدل خودرو";
            this.carModelTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.carModelTextBox.Location = new System.Drawing.Point(23, 125);
            this.carModelTextBox.MaxLength = 100;
            this.carModelTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.carModelTextBox.Name = "carModelTextBox";
            this.carModelTextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.carModelTextBox.Size = new System.Drawing.Size(239, 21);
            this.carModelTextBox.TabIndex = 16;
            this.carModelTextBox.KeyUp += new System.Windows.Forms.KeyEventHandler(this.simpleButton1_KeyUp);
            // 
            // carNameTextBox
            // 
            this.carNameTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.carNameTextBox.ConvertNumberToEnglish = false;
            this.carNameTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.Simple;
            this.carNameTextBox.EnterKeyTap = true;
            this.carNameTextBox.FormatString = "";
            this.carNameTextBox.IsNumeric = false;
            this.carNameTextBox.Label = "نام خودرو";
            this.carNameTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.carNameTextBox.Location = new System.Drawing.Point(23, 96);
            this.carNameTextBox.MaxLength = 100;
            this.carNameTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.carNameTextBox.Name = "carNameTextBox";
            this.carNameTextBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.carNameTextBox.Size = new System.Drawing.Size(235, 21);
            this.carNameTextBox.TabIndex = 15;
            this.carNameTextBox.KeyUp += new System.Windows.Forms.KeyEventHandler(this.simpleButton1_KeyUp);
            // 
            // pictureBox1
            // 
            this.pictureBox1.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.pictureBox1.Image = global::EosParkingTools.Properties.Resources.Add40;
            this.pictureBox1.Location = new System.Drawing.Point(233, 49);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(24, 25);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.pictureBox1.TabIndex = 13;
            this.pictureBox1.TabStop = false;
            this.pictureBox1.Visible = false;
            // 
            // eosPlateControl1
            // 
            this.eosPlateControl1.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.eosPlateControl1.BorderColor = System.Drawing.Color.FromArgb(((int)(((byte)(200)))), ((int)(((byte)(200)))), ((int)(((byte)(230)))));
            this.eosPlateControl1.CarType = EosParking.Core.Enums.CarTypes.Car;
            this.eosPlateControl1.LeftPart = 0;
            this.eosPlateControl1.Location = new System.Drawing.Point(19, 16);
            this.eosPlateControl1.MiddlePart = 0;
            this.eosPlateControl1.MinimumSize = new System.Drawing.Size(159, 30);
            this.eosPlateControl1.MotorDownPart = 0;
            this.eosPlateControl1.MotorUpPart = 0;
            this.eosPlateControl1.Name = "eosPlateControl1";
            this.eosPlateControl1.Plate = "";
            this.eosPlateControl1.PlateDetailsFont = new System.Drawing.Font("Tahoma", 14F);
            this.eosPlateControl1.RightPart = 0;
            this.eosPlateControl1.RoundRectRadius = 8;
            this.eosPlateControl1.Size = new System.Drawing.Size(208, 72);
            this.eosPlateControl1.SkipMiddlePart = false;
            this.eosPlateControl1.TabIndex = 12;
            this.eosPlateControl1.TypePart = "";
            this.eosPlateControl1.WaiteForNextPalte = false;
            this.eosPlateControl1.Validated += new System.EventHandler(this.eosPlateControl1_Validated_1);
            // 
            // selectPanel
            // 
            this.selectPanel.AutoSize = true;
            this.selectPanel.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.selectPanel.Controls.Add(this.carGridControl);
            this.selectPanel.Dock = System.Windows.Forms.DockStyle.Top;
            this.selectPanel.Font = new System.Drawing.Font("Tahoma", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.selectPanel.Location = new System.Drawing.Point(0, 33);
            this.selectPanel.Name = "selectPanel";
            this.selectPanel.Padding = new System.Windows.Forms.Padding(20, 0, 20, 5);
            this.selectPanel.Size = new System.Drawing.Size(306, 192);
            this.selectPanel.TabIndex = 1;
            this.selectPanel.PreviewKeyDown += new System.Windows.Forms.PreviewKeyDownEventHandler(this.panel3_PreviewKeyDown);
            // 
            // carGridControl
            // 
            this.carGridControl.Dock = System.Windows.Forms.DockStyle.Top;
            this.carGridControl.EvenRowColor = System.Drawing.Color.AliceBlue;
            this.carGridControl.FocusRowSelectColor = System.Drawing.Color.LightBlue;
            this.carGridControl.Location = new System.Drawing.Point(20, 0);
            this.carGridControl.MainView = this.gridView1;
            this.carGridControl.Name = "carGridControl";
            this.carGridControl.OddRowColor = System.Drawing.Color.Empty;
            this.carGridControl.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.carGridControl.ShowRowNumber = true;
            this.carGridControl.Size = new System.Drawing.Size(266, 187);
            this.carGridControl.TabIndex = 1;
            this.carGridControl.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[] {
            this.gridView1});
            this.carGridControl.KeyDown += new System.Windows.Forms.KeyEventHandler(this.simpleButton1_KeyUp);
            this.carGridControl.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.simpleButton1_KeyPress);
            // 
            // gridView1
            // 
            this.gridView1.ActiveFilterEnabled = false;
            this.gridView1.Appearance.EvenRow.BackColor = System.Drawing.Color.AliceBlue;
            this.gridView1.Appearance.EvenRow.Options.UseBackColor = true;
            this.gridView1.Appearance.FocusedRow.BackColor = System.Drawing.Color.LightBlue;
            this.gridView1.Appearance.FocusedRow.Options.UseBackColor = true;
            this.gridView1.Appearance.OddRow.Options.UseBackColor = true;
            this.gridView1.Appearance.SelectedRow.BackColor = System.Drawing.Color.SeaShell;
            this.gridView1.Appearance.SelectedRow.BorderColor = System.Drawing.Color.Red;
            this.gridView1.Appearance.SelectedRow.Options.UseBackColor = true;
            this.gridView1.Appearance.SelectedRow.Options.UseBorderColor = true;
            this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[] {
            this.gridColumn1,
            this.gridColumn2});
            this.gridView1.GridControl = this.carGridControl;
            this.gridView1.IndicatorWidth = 30;
            this.gridView1.Name = "gridView1";
            this.gridView1.OptionsCustomization.AllowFilter = false;
            this.gridView1.OptionsFilter.AllowFilterEditor = false;
            this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
            this.gridView1.OptionsView.EnableAppearanceOddRow = true;
            this.gridView1.OptionsView.HeaderFilterButtonShowMode = DevExpress.XtraEditors.Controls.FilterButtonShowMode.SmartTag;
            this.gridView1.OptionsView.ShowDetailButtons = false;
            this.gridView1.OptionsView.ShowFilterPanelMode = DevExpress.XtraGrid.Views.Base.ShowFilterPanelMode.Never;
            this.gridView1.OptionsView.ShowGroupPanel = false;
            this.gridView1.OptionsView.ShowPreviewRowLines = DevExpress.Utils.DefaultBoolean.False;
            this.gridView1.CustomDrawCell += new DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventHandler(this.gridView1_CustomDrawCell);
            // 
            // gridColumn1
            // 
            this.gridColumn1.Caption = "پلاک";
            this.gridColumn1.FieldName = "Plate";
            this.gridColumn1.Name = "gridColumn1";
            this.gridColumn1.OptionsColumn.AllowEdit = false;
            this.gridColumn1.Visible = true;
            this.gridColumn1.VisibleIndex = 0;
            // 
            // gridColumn2
            // 
            this.gridColumn2.Caption = "نوع";
            this.gridColumn2.FieldName = "CarType";
            this.gridColumn2.Name = "gridColumn2";
            this.gridColumn2.OptionsColumn.AllowEdit = false;
            this.gridColumn2.Visible = true;
            this.gridColumn2.VisibleIndex = 1;
            // 
            // eosLabel2
            // 
            this.eosLabel2.BackColor = System.Drawing.Color.Transparent;
            this.eosLabel2.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel2.BorderWidth = 1;
            this.eosLabel2.Dock = System.Windows.Forms.DockStyle.Top;
            this.eosLabel2.Font = new System.Drawing.Font("Tahoma", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel2.Location = new System.Drawing.Point(0, 21);
            this.eosLabel2.Name = "eosLabel2";
            this.eosLabel2.Size = new System.Drawing.Size(306, 12);
            this.eosLabel2.TabIndex = 17;
            this.eosLabel2.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // eosLabel1
            // 
            this.eosLabel1.BackColor = System.Drawing.SystemColors.ActiveCaption;
            this.eosLabel1.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel1.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.eosLabel1.Font = new System.Drawing.Font("Tahoma", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel1.Location = new System.Drawing.Point(0, 0);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(306, 21);
            this.eosLabel1.TabIndex = 15;
            this.eosLabel1.Text = "انتخاب پلاک";
            this.eosLabel1.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // EosPlateSelector
            // 
            this.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.BackColor = System.Drawing.Color.WhiteSmoke;
            this.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.Controls.Add(this.panel1);
            this.Controls.Add(this.newPanel);
            this.Controls.Add(this.selectPanel);
            this.Controls.Add(this.eosLabel2);
            this.Controls.Add(this.eosLabel1);
            this.MinimumSize = new System.Drawing.Size(308, 10);
            this.Name = "EosPlateSelector";
            this.Size = new System.Drawing.Size(306, 464);
            this.panel1.ResumeLayout(false);
            this.newPanel.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.selectPanel.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.carGridControl)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridView1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private DevExpress.XtraEditors.SimpleButton okButton;
        private DevExpress.XtraEditors.SimpleButton cancelButton;
        private System.Windows.Forms.Panel panel1;
        private EosLabel eosLabel1;
        private System.Windows.Forms.Panel newPanel;
        private System.Windows.Forms.PictureBox pictureBox1;
        private EosPlateControl eosPlateControl1;
        private EosLabel eosLabel2;
        private System.Windows.Forms.Panel selectPanel;
        private EosGridControl carGridControl;
        private DevExpress.XtraGrid.Views.Grid.GridView gridView1;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumn1;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumn2;
        private DevExpress.XtraEditors.SimpleButton newPlateButton;
        private EosTextBox carColorTextBox;
        private EosTextBox carModelTextBox;
        private EosTextBox carNameTextBox;
    }
}
