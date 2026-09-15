namespace EosParkingTools.EosControls
{
    partial class EosPlateControl
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(EosPlateControl));
            this.typeComboBox = new System.Windows.Forms.ComboBox();
            this.leftTextEdit = new DevExpress.XtraEditors.TextEdit();
            this.middleTextEdit = new DevExpress.XtraEditors.TextEdit();
            this.rightTextEdit = new DevExpress.XtraEditors.TextEdit();
            this.carPanel = new System.Windows.Forms.Panel();
            this.tableLayoutPanel2 = new System.Windows.Forms.TableLayoutPanel();
            this.panel1 = new System.Windows.Forms.Panel();
            this.panel2 = new System.Windows.Forms.Panel();
            this.motorButton = new DevExpress.XtraEditors.SimpleButton();
            this.simpleButton3 = new DevExpress.XtraEditors.SimpleButton();
            this.simpleButton2 = new DevExpress.XtraEditors.SimpleButton();
            this.simpleButton1 = new DevExpress.XtraEditors.SimpleButton();
            this.carButton = new DevExpress.XtraEditors.SimpleButton();
            this.motorPanel = new System.Windows.Forms.Panel();
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.motorUpPartTextEdit = new DevExpress.XtraEditors.TextEdit();
            this.motorDownPartTextEdit = new DevExpress.XtraEditors.TextEdit();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel4 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel3 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel2 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel5 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel10 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel9 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel8 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel7 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel6 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel11 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel12 = new EosParkingTools.EosControls.EosLabel();
            ((System.ComponentModel.ISupportInitialize)(this.leftTextEdit.Properties)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.middleTextEdit.Properties)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.rightTextEdit.Properties)).BeginInit();
            this.carPanel.SuspendLayout();
            this.tableLayoutPanel2.SuspendLayout();
            this.panel1.SuspendLayout();
            this.panel2.SuspendLayout();
            this.motorPanel.SuspendLayout();
            this.tableLayoutPanel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.motorUpPartTextEdit.Properties)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.motorDownPartTextEdit.Properties)).BeginInit();
            this.SuspendLayout();
            // 
            // typeComboBox
            // 
            this.typeComboBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.Append;
            this.typeComboBox.AutoCompleteSource = System.Windows.Forms.AutoCompleteSource.ListItems;
            this.typeComboBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.typeComboBox.DropDownWidth = 35;
            this.typeComboBox.FormattingEnabled = true;
            this.typeComboBox.Items.AddRange(new object[] {
            "الف",
            "ب",
            "پ",
            "ت",
            "ث",
            "ج",
            "چ",
            "ح",
            "خ",
            "د",
            "ذ",
            "ر",
            "ز",
            "ژ",
            "س",
            "ش",
            "ص",
            "ض",
            "ط",
            "ظ",
            "ع",
            "غ",
            "ف",
            "ق",
            "ک",
            "گ",
            "ل",
            "م",
            "ن",
            "و",
            "ه",
            "ی",
            "♿",
            "D",
            "S"});
            this.typeComboBox.Location = new System.Drawing.Point(37, 5);
            this.typeComboBox.Margin = new System.Windows.Forms.Padding(3, 5, 0, 3);
            this.typeComboBox.MaxDropDownItems = 10;
            this.typeComboBox.MaxLength = 3;
            this.typeComboBox.Name = "typeComboBox";
            this.typeComboBox.Size = new System.Drawing.Size(60, 21);
            this.typeComboBox.TabIndex = 3;
            this.typeComboBox.SelectedIndexChanged += new System.EventHandler(this.typeComboBox_SelectedIndexChanged);
            this.typeComboBox.TextChanged += new System.EventHandler(this.leftTextEdit_TextChanged);
            this.typeComboBox.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.leftTextEdit_KeyPress);
            this.typeComboBox.KeyUp += new System.Windows.Forms.KeyEventHandler(this.typeComboBox_KeyUp);
            this.typeComboBox.Validating += new System.ComponentModel.CancelEventHandler(this.typeComboBox_Validating);
            // 
            // leftTextEdit
            // 
            this.leftTextEdit.Dock = System.Windows.Forms.DockStyle.Fill;
            this.leftTextEdit.Location = new System.Drawing.Point(3, 5);
            this.leftTextEdit.Margin = new System.Windows.Forms.Padding(3, 5, 0, 3);
            this.leftTextEdit.Name = "leftTextEdit";
            this.leftTextEdit.Properties.Mask.EditMask = "###";
            this.leftTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Simple;
            this.leftTextEdit.Properties.MaxLength = 2;
            this.leftTextEdit.Size = new System.Drawing.Size(31, 20);
            this.leftTextEdit.TabIndex = 2;
            this.leftTextEdit.EditValueChanged += new System.EventHandler(this.leftTextEdit_EditValueChanged);
            this.leftTextEdit.TextChanged += new System.EventHandler(this.leftTextEdit_TextChanged);
            this.leftTextEdit.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.leftTextEdit_KeyPress);
            this.leftTextEdit.KeyUp += new System.Windows.Forms.KeyEventHandler(this.leftTextEdit_KeyUp);
            // 
            // middleTextEdit
            // 
            this.middleTextEdit.Dock = System.Windows.Forms.DockStyle.Fill;
            this.middleTextEdit.Location = new System.Drawing.Point(100, 5);
            this.middleTextEdit.Margin = new System.Windows.Forms.Padding(3, 5, 3, 3);
            this.middleTextEdit.Name = "middleTextEdit";
            this.middleTextEdit.Properties.EditFormat.FormatString = "#";
            this.middleTextEdit.Properties.EditFormat.FormatType = DevExpress.Utils.FormatType.Numeric;
            this.middleTextEdit.Properties.Mask.EditMask = "###";
            this.middleTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Simple;
            this.middleTextEdit.Properties.MaxLength = 3;
            this.middleTextEdit.Size = new System.Drawing.Size(57, 20);
            this.middleTextEdit.TabIndex = 4;
            this.middleTextEdit.TextChanged += new System.EventHandler(this.leftTextEdit_TextChanged);
            this.middleTextEdit.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.leftTextEdit_KeyPress);
            this.middleTextEdit.KeyUp += new System.Windows.Forms.KeyEventHandler(this.middleTextEdit_KeyUp);
            // 
            // rightTextEdit
            // 
            this.rightTextEdit.Dock = System.Windows.Forms.DockStyle.Fill;
            this.rightTextEdit.Location = new System.Drawing.Point(0, 11);
            this.rightTextEdit.Name = "rightTextEdit";
            this.rightTextEdit.Properties.EditFormat.FormatString = "#";
            this.rightTextEdit.Properties.EditFormat.FormatType = DevExpress.Utils.FormatType.Numeric;
            this.rightTextEdit.Properties.Mask.EditMask = "##";
            this.rightTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Simple;
            this.rightTextEdit.Properties.MaxLength = 2;
            this.rightTextEdit.Size = new System.Drawing.Size(45, 20);
            this.rightTextEdit.TabIndex = 5;
            this.rightTextEdit.Tag = "CarTypes.Motor";
            this.rightTextEdit.TextChanged += new System.EventHandler(this.leftTextEdit_TextChanged);
            this.rightTextEdit.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.leftTextEdit_KeyPress);
            this.rightTextEdit.KeyUp += new System.Windows.Forms.KeyEventHandler(this.rightTextEdit_KeyUp);
            // 
            // carPanel
            // 
            this.carPanel.BackColor = System.Drawing.Color.White;
            this.carPanel.Controls.Add(this.tableLayoutPanel2);
            this.carPanel.Controls.Add(this.eosLabel4);
            this.carPanel.Controls.Add(this.eosLabel3);
            this.carPanel.Controls.Add(this.eosLabel2);
            this.carPanel.Controls.Add(this.eosLabel5);
            this.carPanel.Controls.Add(this.eosLabel10);
            this.carPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.carPanel.Location = new System.Drawing.Point(0, 21);
            this.carPanel.Margin = new System.Windows.Forms.Padding(0);
            this.carPanel.Name = "carPanel";
            this.carPanel.Size = new System.Drawing.Size(237, 69);
            this.carPanel.TabIndex = 4;
            this.carPanel.Paint += new System.Windows.Forms.PaintEventHandler(this.panel1_Paint);
            // 
            // tableLayoutPanel2
            // 
            this.tableLayoutPanel2.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tableLayoutPanel2.ColumnCount = 4;
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 16.44016F));
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 30.14706F));
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 30.14706F));
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 22.34765F));
            this.tableLayoutPanel2.Controls.Add(this.leftTextEdit, 0, 0);
            this.tableLayoutPanel2.Controls.Add(this.typeComboBox, 1, 0);
            this.tableLayoutPanel2.Controls.Add(this.middleTextEdit, 2, 0);
            this.tableLayoutPanel2.Controls.Add(this.panel1, 3, 0);
            this.tableLayoutPanel2.Location = new System.Drawing.Point(25, 2);
            this.tableLayoutPanel2.Margin = new System.Windows.Forms.Padding(0);
            this.tableLayoutPanel2.Name = "tableLayoutPanel2";
            this.tableLayoutPanel2.RowCount = 1;
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel2.Size = new System.Drawing.Size(208, 65);
            this.tableLayoutPanel2.TabIndex = 8;
            this.tableLayoutPanel2.Paint += new System.Windows.Forms.PaintEventHandler(this.tableLayoutPanel2_Paint);
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.rightTextEdit);
            this.panel1.Controls.Add(this.eosLabel1);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel1.Location = new System.Drawing.Point(163, 0);
            this.panel1.Margin = new System.Windows.Forms.Padding(3, 0, 0, 3);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(45, 62);
            this.panel1.TabIndex = 3;
            this.panel1.Paint += new System.Windows.Forms.PaintEventHandler(this.panel1_Paint_1);
            // 
            // panel2
            // 
            this.panel2.BackColor = System.Drawing.SystemColors.InactiveBorder;
            this.panel2.Controls.Add(this.eosLabel12);
            this.panel2.Controls.Add(this.motorButton);
            this.panel2.Controls.Add(this.simpleButton3);
            this.panel2.Controls.Add(this.simpleButton2);
            this.panel2.Controls.Add(this.simpleButton1);
            this.panel2.Controls.Add(this.carButton);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel2.Location = new System.Drawing.Point(0, 0);
            this.panel2.Margin = new System.Windows.Forms.Padding(1, 0, 1, 0);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(237, 21);
            this.panel2.TabIndex = 100;
            // 
            // motorButton
            // 
            this.motorButton.AllowFocus = false;
            this.motorButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.motorButton.Dock = System.Windows.Forms.DockStyle.Right;
            this.motorButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("motorButton.ImageOptions.Image")));
            this.motorButton.Location = new System.Drawing.Point(122, 0);
            this.motorButton.LookAndFeel.UseDefaultLookAndFeel = false;
            this.motorButton.Margin = new System.Windows.Forms.Padding(1, 0, 3, 0);
            this.motorButton.Name = "motorButton";
            this.motorButton.ShowFocusRectangle = DevExpress.Utils.DefaultBoolean.False;
            this.motorButton.Size = new System.Drawing.Size(23, 21);
            this.motorButton.TabIndex = 5;
            this.motorButton.Tag = "1";
            this.motorButton.ToolTip = "موتور";
            this.motorButton.Click += new System.EventHandler(this.motorButton_Click);
            // 
            // simpleButton3
            // 
            this.simpleButton3.AllowFocus = false;
            this.simpleButton3.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.simpleButton3.Dock = System.Windows.Forms.DockStyle.Right;
            this.simpleButton3.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("simpleButton3.ImageOptions.Image")));
            this.simpleButton3.Location = new System.Drawing.Point(145, 0);
            this.simpleButton3.LookAndFeel.UseDefaultLookAndFeel = false;
            this.simpleButton3.Margin = new System.Windows.Forms.Padding(1, 0, 3, 0);
            this.simpleButton3.Name = "simpleButton3";
            this.simpleButton3.ShowFocusRectangle = DevExpress.Utils.DefaultBoolean.False;
            this.simpleButton3.Size = new System.Drawing.Size(23, 21);
            this.simpleButton3.TabIndex = 4;
            this.simpleButton3.Tag = "4";
            this.simpleButton3.ToolTip = "تریلی";
            this.simpleButton3.Click += new System.EventHandler(this.carButton_Click);
            // 
            // simpleButton2
            // 
            this.simpleButton2.AllowFocus = false;
            this.simpleButton2.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.simpleButton2.Dock = System.Windows.Forms.DockStyle.Right;
            this.simpleButton2.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("simpleButton2.ImageOptions.Image")));
            this.simpleButton2.Location = new System.Drawing.Point(168, 0);
            this.simpleButton2.LookAndFeel.UseDefaultLookAndFeel = false;
            this.simpleButton2.Margin = new System.Windows.Forms.Padding(1, 0, 3, 0);
            this.simpleButton2.Name = "simpleButton2";
            this.simpleButton2.ShowFocusRectangle = DevExpress.Utils.DefaultBoolean.False;
            this.simpleButton2.Size = new System.Drawing.Size(23, 21);
            this.simpleButton2.TabIndex = 3;
            this.simpleButton2.Tag = "3";
            this.simpleButton2.ToolTip = "اتوبوس - کامیون";
            this.simpleButton2.Click += new System.EventHandler(this.carButton_Click);
            // 
            // simpleButton1
            // 
            this.simpleButton1.AllowFocus = false;
            this.simpleButton1.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.simpleButton1.Dock = System.Windows.Forms.DockStyle.Right;
            this.simpleButton1.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("simpleButton1.ImageOptions.Image")));
            this.simpleButton1.Location = new System.Drawing.Point(191, 0);
            this.simpleButton1.LookAndFeel.UseDefaultLookAndFeel = false;
            this.simpleButton1.Margin = new System.Windows.Forms.Padding(1, 0, 3, 0);
            this.simpleButton1.Name = "simpleButton1";
            this.simpleButton1.ShowFocusRectangle = DevExpress.Utils.DefaultBoolean.False;
            this.simpleButton1.Size = new System.Drawing.Size(23, 21);
            this.simpleButton1.TabIndex = 2;
            this.simpleButton1.Tag = "2";
            this.simpleButton1.ToolTip = "ون - مینی بوس";
            this.simpleButton1.Click += new System.EventHandler(this.carButton_Click);
            // 
            // carButton
            // 
            this.carButton.AllowFocus = false;
            this.carButton.Dock = System.Windows.Forms.DockStyle.Right;
            this.carButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("carButton.ImageOptions.Image")));
            this.carButton.Location = new System.Drawing.Point(214, 0);
            this.carButton.LookAndFeel.UseDefaultLookAndFeel = false;
            this.carButton.Margin = new System.Windows.Forms.Padding(1, 0, 3, 0);
            this.carButton.Name = "carButton";
            this.carButton.ShowFocusRectangle = DevExpress.Utils.DefaultBoolean.False;
            this.carButton.Size = new System.Drawing.Size(23, 21);
            this.carButton.TabIndex = 1;
            this.carButton.Tag = "0";
            this.carButton.ToolTip = "سواری و وانت";
            this.carButton.Click += new System.EventHandler(this.carButton_Click);
            // 
            // motorPanel
            // 
            this.motorPanel.BackColor = System.Drawing.Color.White;
            this.motorPanel.Controls.Add(this.tableLayoutPanel1);
            this.motorPanel.Controls.Add(this.eosLabel9);
            this.motorPanel.Controls.Add(this.eosLabel8);
            this.motorPanel.Controls.Add(this.eosLabel7);
            this.motorPanel.Controls.Add(this.eosLabel6);
            this.motorPanel.Controls.Add(this.eosLabel11);
            this.motorPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.motorPanel.Location = new System.Drawing.Point(0, 21);
            this.motorPanel.Margin = new System.Windows.Forms.Padding(0);
            this.motorPanel.Name = "motorPanel";
            this.motorPanel.Size = new System.Drawing.Size(237, 69);
            this.motorPanel.TabIndex = 6;
            this.motorPanel.Visible = false;
            this.motorPanel.Paint += new System.Windows.Forms.PaintEventHandler(this.motorPanel_Paint);
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tableLayoutPanel1.ColumnCount = 2;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 56.30252F));
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 43.69748F));
            this.tableLayoutPanel1.Controls.Add(this.motorUpPartTextEdit, 0, 0);
            this.tableLayoutPanel1.Controls.Add(this.motorDownPartTextEdit, 1, 0);
            this.tableLayoutPanel1.Location = new System.Drawing.Point(25, 2);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.RowCount = 1;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(205, 65);
            this.tableLayoutPanel1.TabIndex = 9;
            this.tableLayoutPanel1.Paint += new System.Windows.Forms.PaintEventHandler(this.tableLayoutPanel1_Paint);
            // 
            // motorUpPartTextEdit
            // 
            this.motorUpPartTextEdit.Dock = System.Windows.Forms.DockStyle.Fill;
            this.motorUpPartTextEdit.Location = new System.Drawing.Point(3, 3);
            this.motorUpPartTextEdit.Name = "motorUpPartTextEdit";
            this.motorUpPartTextEdit.Properties.EditFormat.FormatString = "#";
            this.motorUpPartTextEdit.Properties.EditFormat.FormatType = DevExpress.Utils.FormatType.Numeric;
            this.motorUpPartTextEdit.Properties.Mask.EditMask = "###";
            this.motorUpPartTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            this.motorUpPartTextEdit.Properties.MaxLength = 3;
            this.motorUpPartTextEdit.Size = new System.Drawing.Size(109, 20);
            this.motorUpPartTextEdit.TabIndex = 6;
            this.motorUpPartTextEdit.TextChanged += new System.EventHandler(this.leftTextEdit_TextChanged);
            this.motorUpPartTextEdit.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.leftTextEdit_KeyPress);
            // 
            // motorDownPartTextEdit
            // 
            this.motorDownPartTextEdit.Dock = System.Windows.Forms.DockStyle.Fill;
            this.motorDownPartTextEdit.Location = new System.Drawing.Point(118, 3);
            this.motorDownPartTextEdit.Name = "motorDownPartTextEdit";
            this.motorDownPartTextEdit.Properties.EditFormat.FormatString = "#";
            this.motorDownPartTextEdit.Properties.EditFormat.FormatType = DevExpress.Utils.FormatType.Numeric;
            this.motorDownPartTextEdit.Properties.Mask.EditMask = "#####";
            this.motorDownPartTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            this.motorDownPartTextEdit.Properties.MaxLength = 5;
            this.motorDownPartTextEdit.Size = new System.Drawing.Size(84, 20);
            this.motorDownPartTextEdit.TabIndex = 7;
            this.motorDownPartTextEdit.TextChanged += new System.EventHandler(this.leftTextEdit_TextChanged);
            this.motorDownPartTextEdit.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.leftTextEdit_KeyPress);
            this.motorDownPartTextEdit.KeyUp += new System.Windows.Forms.KeyEventHandler(this.motorDownPartTextEdit_KeyUp);
            // 
            // eosLabel1
            // 
            this.eosLabel1.AutoSize = true;
            this.eosLabel1.BackColor = System.Drawing.Color.Transparent;
            this.eosLabel1.BorderColor = System.Drawing.Color.Black;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.eosLabel1.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel1.Location = new System.Drawing.Point(0, 0);
            this.eosLabel1.Margin = new System.Windows.Forms.Padding(0);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(24, 11);
            this.eosLabel1.TabIndex = 4;
            this.eosLabel1.Text = "ایران";
            this.eosLabel1.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            // 
            // eosLabel4
            // 
            this.eosLabel4.BackColor = System.Drawing.Color.Red;
            this.eosLabel4.BorderColor = System.Drawing.Color.Empty;
            this.eosLabel4.BorderWidth = 1;
            this.eosLabel4.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel4.Location = new System.Drawing.Point(12, 7);
            this.eosLabel4.Name = "eosLabel4";
            this.eosLabel4.Size = new System.Drawing.Size(2, 2);
            this.eosLabel4.TabIndex = 6;
            // 
            // eosLabel3
            // 
            this.eosLabel3.BackColor = System.Drawing.Color.Red;
            this.eosLabel3.BorderColor = System.Drawing.Color.Empty;
            this.eosLabel3.BorderWidth = 1;
            this.eosLabel3.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel3.Location = new System.Drawing.Point(7, 10);
            this.eosLabel3.Name = "eosLabel3";
            this.eosLabel3.Size = new System.Drawing.Size(12, 3);
            this.eosLabel3.TabIndex = 5;
            // 
            // eosLabel2
            // 
            this.eosLabel2.BackColor = System.Drawing.Color.LimeGreen;
            this.eosLabel2.BorderColor = System.Drawing.Color.Empty;
            this.eosLabel2.BorderWidth = 1;
            this.eosLabel2.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel2.Location = new System.Drawing.Point(7, 4);
            this.eosLabel2.Name = "eosLabel2";
            this.eosLabel2.Size = new System.Drawing.Size(12, 3);
            this.eosLabel2.TabIndex = 4;
            // 
            // eosLabel5
            // 
            this.eosLabel5.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.eosLabel5.AutoSize = true;
            this.eosLabel5.BackColor = System.Drawing.Color.Transparent;
            this.eosLabel5.BorderColor = System.Drawing.Color.Black;
            this.eosLabel5.BorderWidth = 1;
            this.eosLabel5.Font = new System.Drawing.Font("Tahoma", 4F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel5.ForeColor = System.Drawing.Color.White;
            this.eosLabel5.Location = new System.Drawing.Point(3, 50);
            this.eosLabel5.Name = "eosLabel5";
            this.eosLabel5.Size = new System.Drawing.Size(20, 14);
            this.eosLabel5.TabIndex = 4;
            this.eosLabel5.Text = "I.R\r\nIRAN";
            this.eosLabel5.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // eosLabel10
            // 
            this.eosLabel10.BackColor = System.Drawing.Color.White;
            this.eosLabel10.BorderColor = System.Drawing.Color.Empty;
            this.eosLabel10.BorderWidth = 1;
            this.eosLabel10.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel10.Location = new System.Drawing.Point(7, 7);
            this.eosLabel10.Name = "eosLabel10";
            this.eosLabel10.Size = new System.Drawing.Size(12, 3);
            this.eosLabel10.TabIndex = 7;
            // 
            // eosLabel9
            // 
            this.eosLabel9.BackColor = System.Drawing.Color.Red;
            this.eosLabel9.BorderColor = System.Drawing.Color.Empty;
            this.eosLabel9.BorderWidth = 1;
            this.eosLabel9.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel9.Location = new System.Drawing.Point(11, 8);
            this.eosLabel9.Name = "eosLabel9";
            this.eosLabel9.Size = new System.Drawing.Size(2, 2);
            this.eosLabel9.TabIndex = 6;
            // 
            // eosLabel8
            // 
            this.eosLabel8.BackColor = System.Drawing.Color.Red;
            this.eosLabel8.BorderColor = System.Drawing.Color.Empty;
            this.eosLabel8.BorderWidth = 1;
            this.eosLabel8.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel8.Location = new System.Drawing.Point(6, 11);
            this.eosLabel8.Name = "eosLabel8";
            this.eosLabel8.Size = new System.Drawing.Size(12, 3);
            this.eosLabel8.TabIndex = 5;
            // 
            // eosLabel7
            // 
            this.eosLabel7.BackColor = System.Drawing.Color.LimeGreen;
            this.eosLabel7.BorderColor = System.Drawing.Color.Empty;
            this.eosLabel7.BorderWidth = 1;
            this.eosLabel7.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel7.Location = new System.Drawing.Point(6, 5);
            this.eosLabel7.Name = "eosLabel7";
            this.eosLabel7.Size = new System.Drawing.Size(12, 3);
            this.eosLabel7.TabIndex = 4;
            // 
            // eosLabel6
            // 
            this.eosLabel6.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.eosLabel6.AutoSize = true;
            this.eosLabel6.BackColor = System.Drawing.Color.Transparent;
            this.eosLabel6.BorderColor = System.Drawing.Color.Black;
            this.eosLabel6.BorderWidth = 1;
            this.eosLabel6.Font = new System.Drawing.Font("Tahoma", 4F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel6.ForeColor = System.Drawing.Color.White;
            this.eosLabel6.Location = new System.Drawing.Point(2, 51);
            this.eosLabel6.Name = "eosLabel6";
            this.eosLabel6.Size = new System.Drawing.Size(20, 14);
            this.eosLabel6.TabIndex = 4;
            this.eosLabel6.Text = "I.R\r\nIRAN";
            this.eosLabel6.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // eosLabel11
            // 
            this.eosLabel11.BackColor = System.Drawing.Color.White;
            this.eosLabel11.BorderColor = System.Drawing.Color.Empty;
            this.eosLabel11.BorderWidth = 1;
            this.eosLabel11.Font = new System.Drawing.Font("Tahoma", 6.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel11.Location = new System.Drawing.Point(6, 8);
            this.eosLabel11.Name = "eosLabel11";
            this.eosLabel11.Size = new System.Drawing.Size(12, 3);
            this.eosLabel11.TabIndex = 8;
            // 
            // eosLabel12
            // 
            this.eosLabel12.BorderColor = System.Drawing.Color.Black;
            this.eosLabel12.BorderWidth = 1;
            this.eosLabel12.Dock = System.Windows.Forms.DockStyle.Fill;
            this.eosLabel12.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel12.ForeColor = System.Drawing.Color.Maroon;
            this.eosLabel12.Location = new System.Drawing.Point(0, 0);
            this.eosLabel12.Name = "eosLabel12";
            this.eosLabel12.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.eosLabel12.Size = new System.Drawing.Size(122, 21);
            this.eosLabel12.TabIndex = 6;
            this.eosLabel12.Text = "سواری - وانت";
            this.eosLabel12.TextAlign = System.Drawing.ContentAlignment.TopRight;
            // 
            // EosPlateControl
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.carPanel);
            this.Controls.Add(this.motorPanel);
            this.Controls.Add(this.panel2);
            this.MinimumSize = new System.Drawing.Size(159, 30);
            this.Name = "EosPlateControl";
            this.Size = new System.Drawing.Size(237, 90);
            ((System.ComponentModel.ISupportInitialize)(this.leftTextEdit.Properties)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.middleTextEdit.Properties)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.rightTextEdit.Properties)).EndInit();
            this.carPanel.ResumeLayout(false);
            this.carPanel.PerformLayout();
            this.tableLayoutPanel2.ResumeLayout(false);
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            this.panel2.ResumeLayout(false);
            this.motorPanel.ResumeLayout(false);
            this.motorPanel.PerformLayout();
            this.tableLayoutPanel1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.motorUpPartTextEdit.Properties)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.motorDownPartTextEdit.Properties)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion
        private System.Windows.Forms.ComboBox typeComboBox;
        private DevExpress.XtraEditors.TextEdit leftTextEdit;
        private DevExpress.XtraEditors.TextEdit middleTextEdit;
        private DevExpress.XtraEditors.TextEdit rightTextEdit;
        private System.Windows.Forms.Panel carPanel;
        private System.Windows.Forms.Panel panel2;
        private DevExpress.XtraEditors.SimpleButton motorButton;
        private DevExpress.XtraEditors.SimpleButton carButton;
        private System.Windows.Forms.Panel motorPanel;
        private DevExpress.XtraEditors.TextEdit motorDownPartTextEdit;
        private DevExpress.XtraEditors.TextEdit motorUpPartTextEdit;
        private EosLabel eosLabel4;
        private EosLabel eosLabel3;
        private EosLabel eosLabel2;
        private EosLabel eosLabel5;
        private EosLabel eosLabel1;
        private EosLabel eosLabel9;
        private EosLabel eosLabel8;
        private EosLabel eosLabel7;
        private EosLabel eosLabel6;
        private EosLabel eosLabel10;
        private EosLabel eosLabel11;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel2;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.Panel panel1;
        private DevExpress.XtraEditors.SimpleButton simpleButton3;
        private DevExpress.XtraEditors.SimpleButton simpleButton2;
        private DevExpress.XtraEditors.SimpleButton simpleButton1;
        private EosLabel eosLabel12;
    }
}
