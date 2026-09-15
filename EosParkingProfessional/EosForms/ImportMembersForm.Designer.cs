
namespace EosParkingProfessional.EosForms
{
    partial class ImportMembersForm
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
            DevExpress.XtraGrid.GridFormatRule gridFormatRule1 = new DevExpress.XtraGrid.GridFormatRule();
            DevExpress.XtraEditors.FormatConditionRuleValue formatConditionRuleValue1 = new DevExpress.XtraEditors.FormatConditionRuleValue();
            DevExpress.XtraGrid.GridFormatRule gridFormatRule2 = new DevExpress.XtraGrid.GridFormatRule();
            DevExpress.XtraEditors.FormatConditionRuleExpression formatConditionRuleExpression1 = new DevExpress.XtraEditors.FormatConditionRuleExpression();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.externalImportPictureBox = new System.Windows.Forms.PictureBox();
            this.employeeGridControl = new EosParkingTools.EosControls.EosGrid();
            this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
            this.MemberCodeColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.cardNumberGridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.NationalCodeGridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.firstNameGridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.lastNameGridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.PhoneNumberColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.StatusTypegridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.AddressColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.checkResultGridColumn = new DevExpress.XtraGrid.Columns.GridColumn();
            this.CheckedrepositoryItemCheckEdit = new DevExpress.XtraEditors.Repository.RepositoryItemCheckEdit();
            this.cancelButton = new DevExpress.XtraEditors.SimpleButton();
            this.updateMemberButton = new DevExpress.XtraEditors.SimpleButton();
            this.eosLabel2 = new EosParkingTools.EosControls.EosLabel();
            this.getEmployeeInfoButton = new DevExpress.XtraEditors.SimpleButton();
            this.openFileDialog1 = new System.Windows.Forms.OpenFileDialog();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.externalImportPictureBox)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.employeeGridControl)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridView1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.CheckedrepositoryItemCheckEdit)).BeginInit();
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
            this.eosLabel1.Location = new System.Drawing.Point(103, 12);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.eosLabel1.Size = new System.Drawing.Size(882, 19);
            this.eosLabel1.TabIndex = 105;
            this.eosLabel1.Text = "بروز رسانی اطلاعات اعضا از سیستم پرسنلی";
            // 
            // externalImportPictureBox
            // 
            this.externalImportPictureBox.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Center;
            this.externalImportPictureBox.Image = global::EosParkingProfessional.Properties.Resources.etsUpdate;
            this.externalImportPictureBox.Location = new System.Drawing.Point(12, 12);
            this.externalImportPictureBox.Name = "externalImportPictureBox";
            this.externalImportPictureBox.Size = new System.Drawing.Size(72, 73);
            this.externalImportPictureBox.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.externalImportPictureBox.TabIndex = 106;
            this.externalImportPictureBox.TabStop = false;
            // 
            // employeeGridControl
            // 
            this.employeeGridControl.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.employeeGridControl.EvenRowColor = System.Drawing.Color.LightSkyBlue;
            this.employeeGridControl.FocusRowSelectColor = System.Drawing.Color.LightYellow;
            this.employeeGridControl.Location = new System.Drawing.Point(12, 99);
            this.employeeGridControl.MainView = this.gridView1;
            this.employeeGridControl.Name = "employeeGridControl";
            this.employeeGridControl.OddRowColor = System.Drawing.Color.Empty;
            this.employeeGridControl.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[] {
            this.CheckedrepositoryItemCheckEdit});
            this.employeeGridControl.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.employeeGridControl.Size = new System.Drawing.Size(970, 426);
            this.employeeGridControl.TabIndex = 10;
            this.employeeGridControl.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[] {
            this.gridView1});
            // 
            // gridView1
            // 
            this.gridView1.Appearance.FocusedRow.BackColor = System.Drawing.Color.LightYellow;
            this.gridView1.Appearance.FocusedRow.Options.UseBackColor = true;
            this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[] {
            this.StatusTypegridColumn,
            this.MemberCodeColumn,
            this.cardNumberGridColumn,
            this.NationalCodeGridColumn,
            this.firstNameGridColumn,
            this.lastNameGridColumn,
            this.PhoneNumberColumn,
            this.AddressColumn,
            this.checkResultGridColumn});
            this.gridView1.CustomizationFormBounds = new System.Drawing.Rectangle(850, 529, 202, 176);
            gridFormatRule1.ApplyToRow = true;
            gridFormatRule1.Name = "ShowRedRowForError";
            formatConditionRuleValue1.Appearance.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(255)))), ((int)(((byte)(128)))), ((int)(((byte)(128)))));
            formatConditionRuleValue1.Appearance.Options.UseBackColor = true;
            formatConditionRuleValue1.Condition = DevExpress.XtraEditors.FormatCondition.Expression;
            formatConditionRuleValue1.Expression = "ToStr([StatusType]) = \'Error\'";
            gridFormatRule1.Rule = formatConditionRuleValue1;
            gridFormatRule2.ApplyToRow = true;
            gridFormatRule2.Name = "ShowYellowRowForError";
            formatConditionRuleExpression1.Appearance.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(255)))), ((int)(((byte)(255)))), ((int)(((byte)(128)))));
            formatConditionRuleExpression1.Appearance.Options.UseBackColor = true;
            formatConditionRuleExpression1.Expression = "ToStr([StatusType]) = \'Alert\'";
            gridFormatRule2.Rule = formatConditionRuleExpression1;
            this.gridView1.FormatRules.Add(gridFormatRule1);
            this.gridView1.FormatRules.Add(gridFormatRule2);
            this.gridView1.GridControl = this.employeeGridControl;
            this.gridView1.Name = "gridView1";
            this.gridView1.OptionsSelection.CheckBoxSelectorColumnWidth = 40;
            this.gridView1.OptionsSelection.MultiSelect = true;
            this.gridView1.OptionsSelection.MultiSelectMode = DevExpress.XtraGrid.Views.Grid.GridMultiSelectMode.CheckBoxRowSelect;
            this.gridView1.OptionsSelection.ShowCheckBoxSelectorInColumnHeader = DevExpress.Utils.DefaultBoolean.True;
            // 
            // MemberCodeColumn
            // 
            this.MemberCodeColumn.Caption = "کد عضویت";
            this.MemberCodeColumn.FieldName = "MemberCode";
            this.MemberCodeColumn.Name = "MemberCodeColumn";
            this.MemberCodeColumn.Visible = true;
            this.MemberCodeColumn.VisibleIndex = 1;
            // 
            // cardNumberGridColumn
            // 
            this.cardNumberGridColumn.Caption = "شماره کارت";
            this.cardNumberGridColumn.FieldName = "CardNumber";
            this.cardNumberGridColumn.MaxWidth = 120;
            this.cardNumberGridColumn.MinWidth = 100;
            this.cardNumberGridColumn.Name = "cardNumberGridColumn";
            this.cardNumberGridColumn.OptionsColumn.AllowEdit = false;
            this.cardNumberGridColumn.OptionsColumn.AllowMove = false;
            this.cardNumberGridColumn.OptionsColumn.AllowShowHide = false;
            this.cardNumberGridColumn.Visible = true;
            this.cardNumberGridColumn.VisibleIndex = 2;
            this.cardNumberGridColumn.Width = 120;
            // 
            // NationalCodeGridColumn
            // 
            this.NationalCodeGridColumn.Caption = "کد ملی";
            this.NationalCodeGridColumn.FieldName = "NationalCode";
            this.NationalCodeGridColumn.MinWidth = 50;
            this.NationalCodeGridColumn.Name = "NationalCodeGridColumn";
            this.NationalCodeGridColumn.OptionsColumn.AllowEdit = false;
            this.NationalCodeGridColumn.OptionsColumn.AllowMove = false;
            this.NationalCodeGridColumn.OptionsColumn.AllowShowHide = false;
            this.NationalCodeGridColumn.OptionsColumn.AllowSize = false;
            this.NationalCodeGridColumn.Visible = true;
            this.NationalCodeGridColumn.VisibleIndex = 3;
            this.NationalCodeGridColumn.Width = 100;
            // 
            // firstNameGridColumn
            // 
            this.firstNameGridColumn.Caption = "نام";
            this.firstNameGridColumn.FieldName = "Name";
            this.firstNameGridColumn.MaxWidth = 140;
            this.firstNameGridColumn.MinWidth = 120;
            this.firstNameGridColumn.Name = "firstNameGridColumn";
            this.firstNameGridColumn.OptionsColumn.AllowEdit = false;
            this.firstNameGridColumn.OptionsColumn.AllowMove = false;
            this.firstNameGridColumn.OptionsColumn.AllowShowHide = false;
            this.firstNameGridColumn.Visible = true;
            this.firstNameGridColumn.VisibleIndex = 4;
            this.firstNameGridColumn.Width = 120;
            // 
            // lastNameGridColumn
            // 
            this.lastNameGridColumn.Caption = "نام خانوادگی";
            this.lastNameGridColumn.FieldName = "Family";
            this.lastNameGridColumn.MaxWidth = 140;
            this.lastNameGridColumn.MinWidth = 120;
            this.lastNameGridColumn.Name = "lastNameGridColumn";
            this.lastNameGridColumn.OptionsColumn.AllowEdit = false;
            this.lastNameGridColumn.OptionsColumn.AllowMove = false;
            this.lastNameGridColumn.OptionsColumn.AllowShowHide = false;
            this.lastNameGridColumn.Visible = true;
            this.lastNameGridColumn.VisibleIndex = 5;
            this.lastNameGridColumn.Width = 140;
            // 
            // PhoneNumberColumn
            // 
            this.PhoneNumberColumn.Caption = "شماره همراه";
            this.PhoneNumberColumn.FieldName = "PhoneNumber";
            this.PhoneNumberColumn.Name = "PhoneNumberColumn";
            this.PhoneNumberColumn.Visible = true;
            this.PhoneNumberColumn.VisibleIndex = 6;
            // 
            // StatusTypegridColumn
            // 
            this.StatusTypegridColumn.Caption = "StatusType";
            this.StatusTypegridColumn.FieldName = "StatusType";
            this.StatusTypegridColumn.Name = "StatusTypegridColumn";
            // 
            // AddressColumn
            // 
            this.AddressColumn.Caption = "آدرس";
            this.AddressColumn.FieldName = "Address";
            this.AddressColumn.Name = "AddressColumn";
            this.AddressColumn.Visible = true;
            this.AddressColumn.VisibleIndex = 7;
            // 
            // checkResultGridColumn
            // 
            this.checkResultGridColumn.Caption = "نتیجه";
            this.checkResultGridColumn.FieldName = "CheckResult";
            this.checkResultGridColumn.Name = "checkResultGridColumn";
            this.checkResultGridColumn.OptionsColumn.AllowEdit = false;
            this.checkResultGridColumn.OptionsColumn.AllowMove = false;
            this.checkResultGridColumn.OptionsColumn.AllowShowHide = false;
            this.checkResultGridColumn.Visible = true;
            this.checkResultGridColumn.VisibleIndex = 8;
            this.checkResultGridColumn.Width = 194;
            // 
            // CheckedrepositoryItemCheckEdit
            // 
            this.CheckedrepositoryItemCheckEdit.AutoHeight = false;
            this.CheckedrepositoryItemCheckEdit.Name = "CheckedrepositoryItemCheckEdit";
            this.CheckedrepositoryItemCheckEdit.NullStyle = DevExpress.XtraEditors.Controls.StyleIndeterminate.Unchecked;
            // 
            // cancelButton
            // 
            this.cancelButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.cancelButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.Delete21;
            this.cancelButton.Location = new System.Drawing.Point(140, 531);
            this.cancelButton.Name = "cancelButton";
            this.cancelButton.Size = new System.Drawing.Size(75, 28);
            this.cancelButton.TabIndex = 15;
            this.cancelButton.Text = "لغو";
            this.cancelButton.Click += new System.EventHandler(this.cancelButton_Click);
            // 
            // updateMemberButton
            // 
            this.updateMemberButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.updateMemberButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.icons8_update_24;
            this.updateMemberButton.Location = new System.Drawing.Point(11, 531);
            this.updateMemberButton.Name = "updateMemberButton";
            this.updateMemberButton.Size = new System.Drawing.Size(123, 28);
            this.updateMemberButton.TabIndex = 20;
            this.updateMemberButton.Text = "بروز رسانی اعضا";
            this.updateMemberButton.Click += new System.EventHandler(this.updateMemberButton_Click);
            // 
            // eosLabel2
            // 
            this.eosLabel2.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.eosLabel2.AutoSize = true;
            this.eosLabel2.BorderColor = System.Drawing.Color.Black;
            this.eosLabel2.BorderWidth = 1;
            this.eosLabel2.Location = new System.Drawing.Point(670, 56);
            this.eosLabel2.Name = "eosLabel2";
            this.eosLabel2.Size = new System.Drawing.Size(319, 13);
            this.eosLabel2.TabIndex = 111;
            this.eosLabel2.Text = "جهت دریافت لیست پرسنل جاری لطفا بر روی دکمه روبرو کلیک نمایید";
            // 
            // getEmployeeInfoButton
            // 
            this.getEmployeeInfoButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.getEmployeeInfoButton.ImageOptions.Image = global::EosParkingProfessional.Properties.Resources.GetInfo_24;
            this.getEmployeeInfoButton.Location = new System.Drawing.Point(516, 49);
            this.getEmployeeInfoButton.Name = "getEmployeeInfoButton";
            this.getEmployeeInfoButton.Size = new System.Drawing.Size(148, 28);
            this.getEmployeeInfoButton.TabIndex = 1;
            this.getEmployeeInfoButton.Text = "دریافت اطلاعات پرسنل";
            this.getEmployeeInfoButton.Click += new System.EventHandler(this.getEmployeeInfoButton_Click);
            // 
            // openFileDialog1
            // 
            this.openFileDialog1.FileName = "*.xls";
            this.openFileDialog1.Filter = "Excel files (*.xls)|*.xls";
            this.openFileDialog1.Title = "انتخاب اکسل اعضا";
            // 
            // ImportMembersForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(997, 566);
            this.Controls.Add(this.getEmployeeInfoButton);
            this.Controls.Add(this.eosLabel2);
            this.Controls.Add(this.cancelButton);
            this.Controls.Add(this.updateMemberButton);
            this.Controls.Add(this.employeeGridControl);
            this.Controls.Add(this.externalImportPictureBox);
            this.Controls.Add(this.eosLabel1);
            this.Name = "ImportMembersForm";
            this.Text = "انتقال اطلاعات پرسنل از سایر سیستم ها";
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.externalImportPictureBox)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.employeeGridControl)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridView1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.CheckedrepositoryItemCheckEdit)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private EosParkingTools.EosControls.EosLabel eosLabel1;
        private System.Windows.Forms.PictureBox externalImportPictureBox;
        private EosParkingTools.EosControls.EosGrid employeeGridControl;
        private DevExpress.XtraGrid.Views.Grid.GridView gridView1;
        public DevExpress.XtraEditors.SimpleButton cancelButton;
        public DevExpress.XtraEditors.SimpleButton updateMemberButton;
        private EosParkingTools.EosControls.EosLabel eosLabel2;
        public DevExpress.XtraEditors.SimpleButton getEmployeeInfoButton;
        private DevExpress.XtraGrid.Columns.GridColumn NationalCodeGridColumn;
        private DevExpress.XtraGrid.Columns.GridColumn firstNameGridColumn;
        private DevExpress.XtraGrid.Columns.GridColumn lastNameGridColumn;
        private DevExpress.XtraGrid.Columns.GridColumn cardNumberGridColumn;
        private DevExpress.XtraGrid.Columns.GridColumn checkResultGridColumn;
        private DevExpress.XtraEditors.Repository.RepositoryItemCheckEdit CheckedrepositoryItemCheckEdit;
        private DevExpress.XtraGrid.Columns.GridColumn StatusTypegridColumn;
        private System.Windows.Forms.OpenFileDialog openFileDialog1;
        private DevExpress.XtraGrid.Columns.GridColumn MemberCodeColumn;
        private DevExpress.XtraGrid.Columns.GridColumn PhoneNumberColumn;
        private DevExpress.XtraGrid.Columns.GridColumn AddressColumn;
    }
}