namespace EosParkingProfessional.EosForms
{
    partial class ParkingUserShiftForm
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
            DevExpress.XtraEditors.Controls.EditorButtonImageOptions editorButtonImageOptions1 = new DevExpress.XtraEditors.Controls.EditorButtonImageOptions();
            DevExpress.Utils.SerializableAppearanceObject serializableAppearanceObject1 = new DevExpress.Utils.SerializableAppearanceObject();
            DevExpress.Utils.SerializableAppearanceObject serializableAppearanceObject2 = new DevExpress.Utils.SerializableAppearanceObject();
            DevExpress.Utils.SerializableAppearanceObject serializableAppearanceObject3 = new DevExpress.Utils.SerializableAppearanceObject();
            DevExpress.Utils.SerializableAppearanceObject serializableAppearanceObject4 = new DevExpress.Utils.SerializableAppearanceObject();
            this.applyButton = new DevExpress.XtraEditors.SimpleButton();
            this.cancelButton = new DevExpress.XtraEditors.SimpleButton();
            this.panelControl1 = new DevExpress.XtraEditors.PanelControl();
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.startDateTimePicker = new EosParkingTools.EosControls.EosDateTimePicker();
            this.endDateTimePicker = new EosParkingTools.EosControls.EosDateTimePicker();
            this.separatorControl1 = new DevExpress.XtraEditors.SeparatorControl();
            this.doorsTextBox = new EosParkingTools.EosControls.EosTextBox();
            this.showButton = new DevExpress.XtraEditors.SimpleButton();
            this.deleteRepositoryGridButtonEdit = new DevExpress.XtraEditors.Repository.RepositoryItemButtonEdit();
            this.deleteGridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.FullNameOnShift3GridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.shiftRepositoryItemComboBox = new DevExpress.XtraEditors.Repository.RepositoryItemComboBox();
            this.okButton = new DevExpress.XtraEditors.SimpleButton();
            this.FullNameOnShift2GridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
            this.gridColumn1 = new DevExpress.XtraGrid.Columns.GridColumn();
            this.workShiftDateGridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.FullNameOnShift1GridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridControl1 = new EosParkingTools.EosControls.EosGridControl();
            this.panelControl2 = new DevExpress.XtraEditors.PanelControl();
            this.copyButton = new DevExpress.XtraEditors.SimpleButton();
            this.popupWinControl1 = new EosParkingTools.EosControls.PopupWinControl();
            this.shift3CheckBox = new System.Windows.Forms.CheckBox();
            this.shift2CheckBox = new System.Windows.Forms.CheckBox();
            this.shift1CheckBox = new System.Windows.Forms.CheckBox();
            this.popupCancelButton = new DevExpress.XtraEditors.SimpleButton();
            this.popupOkButton = new DevExpress.XtraEditors.SimpleButton();
            this.copyFromDateTimePicker = new EosParkingTools.EosControls.EosDateTimePicker();
            this.copyToDateTimePicker = new EosParkingTools.EosControls.EosDateTimePicker();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).BeginInit();
            this.panelControl1.SuspendLayout();
            this.flowLayoutPanel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.separatorControl1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.deleteRepositoryGridButtonEdit)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.shiftRepositoryItemComboBox)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridView1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridControl1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).BeginInit();
            this.panelControl2.SuspendLayout();
            this.popupWinControl1.SuspendLayout();
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
            // applyButton
            // 
            this.applyButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Ok21;
            this.applyButton.Location = new System.Drawing.Point(77, 6);
            this.applyButton.Name = "applyButton";
            this.applyButton.Size = new System.Drawing.Size(61, 28);
            this.applyButton.TabIndex = 0;
            this.applyButton.Text = "اعمال";
            this.applyButton.Click += new System.EventHandler(this.applyButton_Click);
            // 
            // cancelButton
            // 
            this.cancelButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Cancel21;
            this.cancelButton.Location = new System.Drawing.Point(142, 6);
            this.cancelButton.Name = "cancelButton";
            this.cancelButton.Size = new System.Drawing.Size(61, 28);
            this.cancelButton.TabIndex = 0;
            this.cancelButton.Text = "خروج";
            this.cancelButton.Click += new System.EventHandler(this.cancelButton_Click);
            // 
            // panelControl1
            // 
            this.panelControl1.Controls.Add(this.flowLayoutPanel1);
            this.panelControl1.Dock = System.Windows.Forms.DockStyle.Top;
            this.panelControl1.Location = new System.Drawing.Point(0, 0);
            this.panelControl1.Name = "panelControl1";
            this.panelControl1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.panelControl1.Size = new System.Drawing.Size(810, 56);
            this.panelControl1.TabIndex = 3;
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Controls.Add(this.startDateTimePicker);
            this.flowLayoutPanel1.Controls.Add(this.endDateTimePicker);
            this.flowLayoutPanel1.Controls.Add(this.separatorControl1);
            this.flowLayoutPanel1.Controls.Add(this.doorsTextBox);
            this.flowLayoutPanel1.Controls.Add(this.showButton);
            this.flowLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Right;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(30, 2);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Padding = new System.Windows.Forms.Padding(0, 5, 0, 0);
            this.flowLayoutPanel1.Size = new System.Drawing.Size(778, 52);
            this.flowLayoutPanel1.TabIndex = 1;
            // 
            // startDateTimePicker
            // 
            this.startDateTimePicker.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.startDateTimePicker.DatePicker = true;
            this.startDateTimePicker.Label = "از تاریخ";
            this.startDateTimePicker.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.startDateTimePicker.LabelObject.AutoSize = true;
            this.startDateTimePicker.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.startDateTimePicker.LabelObject.Location = new System.Drawing.Point(161, 0);
            this.startDateTimePicker.LabelObject.Name = "label1";
            this.startDateTimePicker.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.startDateTimePicker.LabelObject.Size = new System.Drawing.Size(38, 17);
            this.startDateTimePicker.LabelObject.TabIndex = 1;
            this.startDateTimePicker.LabelObject.Text = "از تاریخ";
            this.startDateTimePicker.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.startDateTimePicker.Location = new System.Drawing.Point(576, 13);
            this.startDateTimePicker.Margin = new System.Windows.Forms.Padding(3, 8, 3, 3);
            this.startDateTimePicker.MaximumSize = new System.Drawing.Size(1000, 24);
            this.startDateTimePicker.Name = "startDateTimePicker";
            this.startDateTimePicker.Size = new System.Drawing.Size(199, 24);
            this.startDateTimePicker.TabIndex = 2;
            // 
            // 
            // 
            this.startDateTimePicker.TextBoxObject.DatePickerShown = true;
            this.startDateTimePicker.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.startDateTimePicker.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.startDateTimePicker.TextBoxObject.MiladiDate = null;
            this.startDateTimePicker.TextBoxObject.Name = "dateTimeSelector1";
            this.startDateTimePicker.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.startDateTimePicker.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.startDateTimePicker.TextBoxObject.Size = new System.Drawing.Size(161, 24);
            this.startDateTimePicker.TextBoxObject.TabIndex = 2;
            this.startDateTimePicker.TextBoxObject.TimeSecondShown = false;
            this.startDateTimePicker.TextBoxObject.TimeShown = false;
            this.startDateTimePicker.TextBoxObject.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.startDateTimePicker.TimePicker = false;
            this.startDateTimePicker.TimePickerSecond = false;
            this.startDateTimePicker.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.startDateTimePicker.Value = null;
            // 
            // endDateTimePicker
            // 
            this.endDateTimePicker.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.endDateTimePicker.DatePicker = true;
            this.endDateTimePicker.Label = "تا";
            this.endDateTimePicker.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.endDateTimePicker.LabelObject.AutoSize = true;
            this.endDateTimePicker.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.endDateTimePicker.LabelObject.Location = new System.Drawing.Point(135, 0);
            this.endDateTimePicker.LabelObject.Name = "label1";
            this.endDateTimePicker.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.endDateTimePicker.LabelObject.Size = new System.Drawing.Size(13, 17);
            this.endDateTimePicker.LabelObject.TabIndex = 1;
            this.endDateTimePicker.LabelObject.Text = "تا";
            this.endDateTimePicker.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.endDateTimePicker.Location = new System.Drawing.Point(422, 13);
            this.endDateTimePicker.Margin = new System.Windows.Forms.Padding(3, 8, 3, 3);
            this.endDateTimePicker.MaximumSize = new System.Drawing.Size(1000, 24);
            this.endDateTimePicker.Name = "endDateTimePicker";
            this.endDateTimePicker.Size = new System.Drawing.Size(148, 24);
            this.endDateTimePicker.TabIndex = 2;
            // 
            // 
            // 
            this.endDateTimePicker.TextBoxObject.DatePickerShown = true;
            this.endDateTimePicker.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.endDateTimePicker.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.endDateTimePicker.TextBoxObject.MiladiDate = null;
            this.endDateTimePicker.TextBoxObject.Name = "dateTimeSelector1";
            this.endDateTimePicker.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.endDateTimePicker.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.endDateTimePicker.TextBoxObject.Size = new System.Drawing.Size(135, 24);
            this.endDateTimePicker.TextBoxObject.TabIndex = 2;
            this.endDateTimePicker.TextBoxObject.TimeSecondShown = false;
            this.endDateTimePicker.TextBoxObject.TimeShown = false;
            this.endDateTimePicker.TextBoxObject.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.endDateTimePicker.TimePicker = false;
            this.endDateTimePicker.TimePickerSecond = false;
            this.endDateTimePicker.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.endDateTimePicker.Value = null;
            // 
            // separatorControl1
            // 
            this.separatorControl1.LineAlignment = DevExpress.XtraEditors.Alignment.Center;
            this.separatorControl1.LineOrientation = System.Windows.Forms.Orientation.Vertical;
            this.separatorControl1.LineThickness = 2;
            this.separatorControl1.Location = new System.Drawing.Point(413, 5);
            this.separatorControl1.Margin = new System.Windows.Forms.Padding(0);
            this.separatorControl1.Name = "separatorControl1";
            this.separatorControl1.Padding = new System.Windows.Forms.Padding(0);
            this.separatorControl1.Size = new System.Drawing.Size(6, 45);
            this.separatorControl1.TabIndex = 1;
            // 
            // doorsTextBox
            // 
            this.doorsTextBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.None;
            this.doorsTextBox.ConvertNumberToEnglish = false;
            this.doorsTextBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDown;
            this.doorsTextBox.EnterKeyTap = true;
            this.doorsTextBox.FormatString = "";
            this.doorsTextBox.IsNumeric = false;
            this.doorsTextBox.Label = "درب";
            this.doorsTextBox.LabelAlign = System.Windows.Forms.DockStyle.Right;
            this.doorsTextBox.Location = new System.Drawing.Point(218, 13);
            this.doorsTextBox.Margin = new System.Windows.Forms.Padding(3, 8, 3, 3);
            this.doorsTextBox.MaxLength = 100;
            this.doorsTextBox.MinimumSize = new System.Drawing.Size(50, 21);
            this.doorsTextBox.Name = "doorsTextBox";
            this.doorsTextBox.Size = new System.Drawing.Size(192, 21);
            this.doorsTextBox.TabIndex = 3;
            // 
            // showButton
            // 
            this.showButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Report21;
            this.showButton.Location = new System.Drawing.Point(137, 9);
            this.showButton.Margin = new System.Windows.Forms.Padding(3, 4, 3, 3);
            this.showButton.Name = "showButton";
            this.showButton.Size = new System.Drawing.Size(75, 28);
            this.showButton.TabIndex = 0;
            this.showButton.Text = "نمایش";
            this.showButton.Click += new System.EventHandler(this.showButton_Click);
            // 
            // deleteRepositoryGridButtonEdit
            // 
            this.deleteRepositoryGridButtonEdit.AutoHeight = false;
            editorButtonImageOptions1.Image = global::EosParkingProfessional.Properties.Resources.Delete21;
            this.deleteRepositoryGridButtonEdit.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Glyph, "", -1, true, true, false, editorButtonImageOptions1, new DevExpress.Utils.KeyShortcut(System.Windows.Forms.Keys.None), serializableAppearanceObject1, serializableAppearanceObject2, serializableAppearanceObject3, serializableAppearanceObject4, "", null, null, DevExpress.Utils.ToolTipAnchor.Default)});
            this.deleteRepositoryGridButtonEdit.Name = "deleteRepositoryGridButtonEdit";
            this.deleteRepositoryGridButtonEdit.TextEditStyle = DevExpress.XtraEditors.Controls.TextEditStyles.HideTextEditor;
            // 
            // deleteGridColumn
            // 
            this.deleteGridColumn.ColumnEdit = this.deleteRepositoryGridButtonEdit;
            this.deleteGridColumn.Name = "deleteGridColumn";
            this.deleteGridColumn.OptionsColumn.FixedWidth = true;
            this.deleteGridColumn.Width = 30;
            // 
            // FullNameOnShift3GridColumn
            // 
            this.FullNameOnShift3GridColumn.Caption = "شیفت سوم";
            this.FullNameOnShift3GridColumn.ColumnEdit = this.shiftRepositoryItemComboBox;
            this.FullNameOnShift3GridColumn.FieldName = "FullNameOnShift3";
            this.FullNameOnShift3GridColumn.Name = "FullNameOnShift3GridColumn";
            this.FullNameOnShift3GridColumn.Visible = true;
            this.FullNameOnShift3GridColumn.VisibleIndex = 4;
            this.FullNameOnShift3GridColumn.Width = 215;
            // 
            // shiftRepositoryItemComboBox
            // 
            this.shiftRepositoryItemComboBox.AutoHeight = false;
            this.shiftRepositoryItemComboBox.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.shiftRepositoryItemComboBox.Name = "shiftRepositoryItemComboBox";
            this.shiftRepositoryItemComboBox.ButtonPressed += new DevExpress.XtraEditors.Controls.ButtonPressedEventHandler(this.shiftRepositoryItemComboBox_ButtonPressed);
            this.shiftRepositoryItemComboBox.EditValueChanging += new DevExpress.XtraEditors.Controls.ChangingEventHandler(this.shiftRepositoryItemComboBox_EditValueChanging);
            // 
            // okButton
            // 
            this.okButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Ok21;
            this.okButton.Location = new System.Drawing.Point(12, 6);
            this.okButton.Name = "okButton";
            this.okButton.Size = new System.Drawing.Size(61, 28);
            this.okButton.TabIndex = 0;
            this.okButton.Text = "ذخیره";
            this.okButton.Click += new System.EventHandler(this.okButton_Click);
            // 
            // FullNameOnShift2GridColumn
            // 
            this.FullNameOnShift2GridColumn.Caption = "شیفت دوم";
            this.FullNameOnShift2GridColumn.ColumnEdit = this.shiftRepositoryItemComboBox;
            this.FullNameOnShift2GridColumn.FieldName = "FullNameOnShift2";
            this.FullNameOnShift2GridColumn.Name = "FullNameOnShift2GridColumn";
            this.FullNameOnShift2GridColumn.ShowButtonMode = DevExpress.XtraGrid.Views.Base.ShowButtonModeEnum.ShowOnlyInEditor;
            this.FullNameOnShift2GridColumn.Visible = true;
            this.FullNameOnShift2GridColumn.VisibleIndex = 3;
            this.FullNameOnShift2GridColumn.Width = 189;
            // 
            // gridView1
            // 
            this.gridView1.ActiveFilterEnabled = false;
            this.gridView1.Appearance.EvenRow.BackColor = System.Drawing.Color.AliceBlue;
            this.gridView1.Appearance.EvenRow.Options.UseBackColor = true;
            this.gridView1.Appearance.FocusedRow.BackColor = System.Drawing.Color.LightBlue;
            this.gridView1.Appearance.FocusedRow.Options.UseBackColor = true;
            this.gridView1.Appearance.OddRow.Options.UseBackColor = true;
            this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[] {
            this.gridColumn1,
            this.workShiftDateGridColumn,
            this.FullNameOnShift1GridColumn,
            this.FullNameOnShift2GridColumn,
            this.FullNameOnShift3GridColumn,
            this.deleteGridColumn});
            this.gridView1.GridControl = this.gridControl1;
            this.gridView1.Name = "gridView1";
            this.gridView1.OptionsCustomization.AllowFilter = false;
            this.gridView1.OptionsFilter.AllowFilterEditor = false;
            this.gridView1.OptionsLayout.Columns.AddNewColumns = false;
            this.gridView1.OptionsNavigation.AutoFocusNewRow = true;
            this.gridView1.OptionsSelection.MultiSelectMode = DevExpress.XtraGrid.Views.Grid.GridMultiSelectMode.CellSelect;
            this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
            this.gridView1.OptionsView.EnableAppearanceOddRow = true;
            this.gridView1.OptionsView.HeaderFilterButtonShowMode = DevExpress.XtraEditors.Controls.FilterButtonShowMode.SmartTag;
            this.gridView1.OptionsView.ShowFilterPanelMode = DevExpress.XtraGrid.Views.Base.ShowFilterPanelMode.Never;
            this.gridView1.OptionsView.ShowGroupPanel = false;
            this.gridView1.SynchronizeClones = false;
            this.gridView1.RowStyle += new DevExpress.XtraGrid.Views.Grid.RowStyleEventHandler(this.gridView1_RowStyle);
            this.gridView1.CellValueChanging += new DevExpress.XtraGrid.Views.Base.CellValueChangedEventHandler(this.gridView1_CellValueChanging);
            this.gridView1.ValidateRow += new DevExpress.XtraGrid.Views.Base.ValidateRowEventHandler(this.gridView1_ValidateRow);
            this.gridView1.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.gridView1_KeyPress);
            this.gridView1.ValidatingEditor += new DevExpress.XtraEditors.Controls.BaseContainerValidateEditorEventHandler(this.gridView1_ValidatingEditor);
            // 
            // gridColumn1
            // 
            this.gridColumn1.Caption = "روز هفته";
            this.gridColumn1.FieldName = "SolarDayOnWeekWork";
            this.gridColumn1.Name = "gridColumn1";
            this.gridColumn1.OptionsColumn.AllowEdit = false;
            this.gridColumn1.Visible = true;
            this.gridColumn1.VisibleIndex = 0;
            // 
            // workShiftDateGridColumn
            // 
            this.workShiftDateGridColumn.Caption = "تاریخ";
            this.workShiftDateGridColumn.FieldName = "SolarWorkDate";
            this.workShiftDateGridColumn.Name = "workShiftDateGridColumn";
            this.workShiftDateGridColumn.OptionsColumn.AllowEdit = false;
            this.workShiftDateGridColumn.Visible = true;
            this.workShiftDateGridColumn.VisibleIndex = 1;
            this.workShiftDateGridColumn.Width = 136;
            // 
            // FullNameOnShift1GridColumn
            // 
            this.FullNameOnShift1GridColumn.Caption = "شیفت اول";
            this.FullNameOnShift1GridColumn.ColumnEdit = this.shiftRepositoryItemComboBox;
            this.FullNameOnShift1GridColumn.FieldName = "FullNameOnShift1";
            this.FullNameOnShift1GridColumn.Name = "FullNameOnShift1GridColumn";
            this.FullNameOnShift1GridColumn.ShowButtonMode = DevExpress.XtraGrid.Views.Base.ShowButtonModeEnum.ShowOnlyInEditor;
            this.FullNameOnShift1GridColumn.Visible = true;
            this.FullNameOnShift1GridColumn.VisibleIndex = 2;
            this.FullNameOnShift1GridColumn.Width = 220;
            // 
            // gridControl1
            // 
            this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.gridControl1.EvenRowColor = System.Drawing.Color.AliceBlue;
            this.gridControl1.FocusRowSelectColor = System.Drawing.Color.LightBlue;
            this.gridControl1.Location = new System.Drawing.Point(0, 56);
            this.gridControl1.MainView = this.gridView1;
            this.gridControl1.Name = "gridControl1";
            this.gridControl1.OddRowColor = System.Drawing.Color.Empty;
            this.gridControl1.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[] {
            this.deleteRepositoryGridButtonEdit,
            this.shiftRepositoryItemComboBox});
            this.gridControl1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.gridControl1.ShowRowNumber = false;
            this.gridControl1.Size = new System.Drawing.Size(810, 446);
            this.gridControl1.TabIndex = 4;
            this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[] {
            this.gridView1});
            // 
            // panelControl2
            // 
            this.panelControl2.Controls.Add(this.copyButton);
            this.panelControl2.Controls.Add(this.applyButton);
            this.panelControl2.Controls.Add(this.okButton);
            this.panelControl2.Controls.Add(this.cancelButton);
            this.panelControl2.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.panelControl2.Location = new System.Drawing.Point(0, 502);
            this.panelControl2.Name = "panelControl2";
            this.panelControl2.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.panelControl2.Size = new System.Drawing.Size(810, 41);
            this.panelControl2.TabIndex = 5;
            this.panelControl2.Paint += new System.Windows.Forms.PaintEventHandler(this.panelControl2_Paint);
            // 
            // copyButton
            // 
            this.copyButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Copy21;
            this.copyButton.Location = new System.Drawing.Point(630, 8);
            this.copyButton.Name = "copyButton";
            this.copyButton.Size = new System.Drawing.Size(168, 28);
            this.copyButton.TabIndex = 1;
            this.copyButton.Text = "رونوشت به به روزهای دیگر";
            this.copyButton.Click += new System.EventHandler(this.simpleButton1_Click);
            // 
            // popupWinControl1
            // 
            this.popupWinControl1.CaptionAlignment = System.Drawing.ContentAlignment.MiddleCenter;
            this.popupWinControl1.CaptionColor = System.Drawing.SystemColors.ActiveCaption;
            this.popupWinControl1.CaptionText = "رونوشت";
            this.popupWinControl1.Controls.Add(this.shift3CheckBox);
            this.popupWinControl1.Controls.Add(this.shift2CheckBox);
            this.popupWinControl1.Controls.Add(this.shift1CheckBox);
            this.popupWinControl1.Controls.Add(this.popupCancelButton);
            this.popupWinControl1.Controls.Add(this.popupOkButton);
            this.popupWinControl1.Controls.Add(this.copyFromDateTimePicker);
            this.popupWinControl1.Controls.Add(this.copyToDateTimePicker);
            this.popupWinControl1.IsNewItem = false;
            this.popupWinControl1.Location = new System.Drawing.Point(251, 101);
            this.popupWinControl1.Name = "popupWinControl1";
            this.popupWinControl1.Padding = new System.Windows.Forms.Padding(1);
            this.popupWinControl1.RealHeigth = 0;
            this.popupWinControl1.Rounding = 10;
            this.popupWinControl1.Size = new System.Drawing.Size(360, 166);
            this.popupWinControl1.TabIndex = 6;
            this.popupWinControl1.Visible = false;
            // 
            // shift3CheckBox
            // 
            this.shift3CheckBox.AutoSize = true;
            this.shift3CheckBox.Enabled = false;
            this.shift3CheckBox.Location = new System.Drawing.Point(66, 33);
            this.shift3CheckBox.Name = "shift3CheckBox";
            this.shift3CheckBox.Size = new System.Drawing.Size(66, 17);
            this.shift3CheckBox.TabIndex = 6;
            this.shift3CheckBox.Text = "شیفت 1";
            this.shift3CheckBox.TextAlign = System.Drawing.ContentAlignment.TopLeft;
            this.shift3CheckBox.UseVisualStyleBackColor = true;
            // 
            // shift2CheckBox
            // 
            this.shift2CheckBox.AutoSize = true;
            this.shift2CheckBox.Enabled = false;
            this.shift2CheckBox.Location = new System.Drawing.Point(138, 33);
            this.shift2CheckBox.Name = "shift2CheckBox";
            this.shift2CheckBox.Size = new System.Drawing.Size(66, 17);
            this.shift2CheckBox.TabIndex = 6;
            this.shift2CheckBox.Text = "شیفت 2";
            this.shift2CheckBox.TextAlign = System.Drawing.ContentAlignment.TopLeft;
            this.shift2CheckBox.UseVisualStyleBackColor = true;
            // 
            // shift1CheckBox
            // 
            this.shift1CheckBox.AutoSize = true;
            this.shift1CheckBox.Enabled = false;
            this.shift1CheckBox.Location = new System.Drawing.Point(210, 33);
            this.shift1CheckBox.Name = "shift1CheckBox";
            this.shift1CheckBox.Size = new System.Drawing.Size(66, 17);
            this.shift1CheckBox.TabIndex = 6;
            this.shift1CheckBox.Text = "شیفت 1";
            this.shift1CheckBox.TextAlign = System.Drawing.ContentAlignment.TopLeft;
            this.shift1CheckBox.UseVisualStyleBackColor = true;
            // 
            // popupCancelButton
            // 
            this.popupCancelButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Cancel21;
            this.popupCancelButton.Location = new System.Drawing.Point(93, 134);
            this.popupCancelButton.Margin = new System.Windows.Forms.Padding(3, 4, 3, 3);
            this.popupCancelButton.Name = "popupCancelButton";
            this.popupCancelButton.Size = new System.Drawing.Size(72, 23);
            this.popupCancelButton.TabIndex = 5;
            this.popupCancelButton.Text = "لغو";
            this.popupCancelButton.Click += new System.EventHandler(this.popupCancelButton_Click);
            // 
            // popupOkButton
            // 
            this.popupOkButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Ok21;
            this.popupOkButton.Location = new System.Drawing.Point(14, 134);
            this.popupOkButton.Margin = new System.Windows.Forms.Padding(3, 4, 3, 3);
            this.popupOkButton.Name = "popupOkButton";
            this.popupOkButton.Size = new System.Drawing.Size(72, 23);
            this.popupOkButton.TabIndex = 5;
            this.popupOkButton.Text = "رونوشت";
            this.popupOkButton.Click += new System.EventHandler(this.popupOkButton_Click);
            // 
            // copyFromDateTimePicker
            // 
            this.copyFromDateTimePicker.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.copyFromDateTimePicker.DatePicker = true;
            this.copyFromDateTimePicker.Label = "از تاریخ";
            this.copyFromDateTimePicker.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.copyFromDateTimePicker.LabelObject.AutoSize = true;
            this.copyFromDateTimePicker.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.copyFromDateTimePicker.LabelObject.Location = new System.Drawing.Point(126, 0);
            this.copyFromDateTimePicker.LabelObject.Name = "label1";
            this.copyFromDateTimePicker.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.copyFromDateTimePicker.LabelObject.Size = new System.Drawing.Size(38, 17);
            this.copyFromDateTimePicker.LabelObject.TabIndex = 1;
            this.copyFromDateTimePicker.LabelObject.Text = "از تاریخ";
            this.copyFromDateTimePicker.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.copyFromDateTimePicker.Location = new System.Drawing.Point(108, 61);
            this.copyFromDateTimePicker.Margin = new System.Windows.Forms.Padding(3, 8, 3, 3);
            this.copyFromDateTimePicker.MaximumSize = new System.Drawing.Size(1000, 24);
            this.copyFromDateTimePicker.Name = "copyFromDateTimePicker";
            this.copyFromDateTimePicker.Size = new System.Drawing.Size(164, 24);
            this.copyFromDateTimePicker.TabIndex = 3;
            // 
            // 
            // 
            this.copyFromDateTimePicker.TextBoxObject.DatePickerShown = true;
            this.copyFromDateTimePicker.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.copyFromDateTimePicker.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.copyFromDateTimePicker.TextBoxObject.MiladiDate = null;
            this.copyFromDateTimePicker.TextBoxObject.Name = "dateTimeSelector1";
            this.copyFromDateTimePicker.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.copyFromDateTimePicker.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.copyFromDateTimePicker.TextBoxObject.Size = new System.Drawing.Size(126, 24);
            this.copyFromDateTimePicker.TextBoxObject.TabIndex = 2;
            this.copyFromDateTimePicker.TextBoxObject.TimeSecondShown = false;
            this.copyFromDateTimePicker.TextBoxObject.TimeShown = false;
            this.copyFromDateTimePicker.TextBoxObject.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.copyFromDateTimePicker.TimePicker = false;
            this.copyFromDateTimePicker.TimePickerSecond = false;
            this.copyFromDateTimePicker.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.copyFromDateTimePicker.Value = null;
            // 
            // copyToDateTimePicker
            // 
            this.copyToDateTimePicker.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.copyToDateTimePicker.DatePicker = true;
            this.copyToDateTimePicker.Label = "تا";
            this.copyToDateTimePicker.LabelAlign = System.Windows.Forms.DockStyle.Right;
            // 
            // 
            // 
            this.copyToDateTimePicker.LabelObject.AutoSize = true;
            this.copyToDateTimePicker.LabelObject.Dock = System.Windows.Forms.DockStyle.Right;
            this.copyToDateTimePicker.LabelObject.Location = new System.Drawing.Point(123, 0);
            this.copyToDateTimePicker.LabelObject.Name = "label1";
            this.copyToDateTimePicker.LabelObject.Padding = new System.Windows.Forms.Padding(0, 4, 0, 0);
            this.copyToDateTimePicker.LabelObject.Size = new System.Drawing.Size(13, 17);
            this.copyToDateTimePicker.LabelObject.TabIndex = 1;
            this.copyToDateTimePicker.LabelObject.Text = "تا";
            this.copyToDateTimePicker.LabelObject.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.copyToDateTimePicker.Location = new System.Drawing.Point(108, 94);
            this.copyToDateTimePicker.Margin = new System.Windows.Forms.Padding(3, 8, 3, 3);
            this.copyToDateTimePicker.MaximumSize = new System.Drawing.Size(1000, 24);
            this.copyToDateTimePicker.Name = "copyToDateTimePicker";
            this.copyToDateTimePicker.Size = new System.Drawing.Size(136, 24);
            this.copyToDateTimePicker.TabIndex = 4;
            // 
            // 
            // 
            this.copyToDateTimePicker.TextBoxObject.DatePickerShown = true;
            this.copyToDateTimePicker.TextBoxObject.Dock = System.Windows.Forms.DockStyle.Fill;
            this.copyToDateTimePicker.TextBoxObject.Location = new System.Drawing.Point(0, 0);
            this.copyToDateTimePicker.TextBoxObject.MiladiDate = null;
            this.copyToDateTimePicker.TextBoxObject.Name = "dateTimeSelector1";
            this.copyToDateTimePicker.TextBoxObject.PopupBackColor = System.Drawing.Color.White;
            this.copyToDateTimePicker.TextBoxObject.PopupFont = new System.Drawing.Font("Tahoma", 8F);
            this.copyToDateTimePicker.TextBoxObject.Size = new System.Drawing.Size(123, 24);
            this.copyToDateTimePicker.TextBoxObject.TabIndex = 2;
            this.copyToDateTimePicker.TextBoxObject.TimeSecondShown = false;
            this.copyToDateTimePicker.TextBoxObject.TimeShown = false;
            this.copyToDateTimePicker.TextBoxObject.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.copyToDateTimePicker.TimePicker = false;
            this.copyToDateTimePicker.TimePickerSecond = false;
            this.copyToDateTimePicker.TimeValue = System.TimeSpan.Parse("09:46:41");
            this.copyToDateTimePicker.Value = null;
            // 
            // ParkingUserShiftForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(810, 543);
            this.Controls.Add(this.popupWinControl1);
            this.Controls.Add(this.gridControl1);
            this.Controls.Add(this.panelControl2);
            this.Controls.Add(this.panelControl1);
            this.Name = "ParkingUserShiftForm";
            this.PopupControl = this.popupWinControl1;
            this.Text = "اختصاص شیفت کاربران";
            this.Load += new System.EventHandler(this.ParkingUserShiftForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl1)).EndInit();
            this.panelControl1.ResumeLayout(false);
            this.flowLayoutPanel1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.separatorControl1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.deleteRepositoryGridButtonEdit)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.shiftRepositoryItemComboBox)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridView1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridControl1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.panelControl2)).EndInit();
            this.panelControl2.ResumeLayout(false);
            this.popupWinControl1.ResumeLayout(false);
            this.popupWinControl1.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private DevExpress.XtraEditors.SimpleButton applyButton;
        private DevExpress.XtraEditors.SimpleButton cancelButton;
        private DevExpress.XtraEditors.PanelControl panelControl1;
        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private EosParkingTools.EosControls.EosDateTimePicker startDateTimePicker;
        private EosParkingTools.EosControls.EosDateTimePicker endDateTimePicker;
        private DevExpress.XtraEditors.SeparatorControl separatorControl1;
        private EosParkingTools.EosControls.EosTextBox doorsTextBox;
        private DevExpress.XtraEditors.SimpleButton showButton;
        private DevExpress.XtraEditors.Repository.RepositoryItemButtonEdit deleteRepositoryGridButtonEdit;
        private DevExpress.XtraGrid.Columns.GridColumn deleteGridColumn;
        private DevExpress.XtraGrid.Columns.GridColumn FullNameOnShift3GridColumn;
        private DevExpress.XtraEditors.SimpleButton okButton;
        private DevExpress.XtraGrid.Columns.GridColumn FullNameOnShift2GridColumn;
        private DevExpress.XtraGrid.Views.Grid.GridView gridView1;
        private DevExpress.XtraGrid.Columns.GridColumn workShiftDateGridColumn;
        private DevExpress.XtraGrid.Columns.GridColumn FullNameOnShift1GridColumn;
        private EosParkingTools.EosControls.EosGridControl gridControl1;
        private DevExpress.XtraEditors.PanelControl panelControl2;
        private DevExpress.XtraEditors.Repository.RepositoryItemComboBox shiftRepositoryItemComboBox;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumn1;
        private EosParkingTools.EosControls.PopupWinControl popupWinControl1;
        private DevExpress.XtraEditors.SimpleButton popupCancelButton;
        private DevExpress.XtraEditors.SimpleButton popupOkButton;
        private EosParkingTools.EosControls.EosDateTimePicker copyFromDateTimePicker;
        private EosParkingTools.EosControls.EosDateTimePicker copyToDateTimePicker;
        private System.Windows.Forms.CheckBox shift3CheckBox;
        private System.Windows.Forms.CheckBox shift2CheckBox;
        private System.Windows.Forms.CheckBox shift1CheckBox;
        private DevExpress.XtraEditors.SimpleButton copyButton;
    }
}