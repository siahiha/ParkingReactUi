
namespace EosParkingProfessional.EosForms
{
    partial class MonitoringAnprForm
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MonitoringAnprForm));
            this.splitContainerControl2 = new DevExpress.XtraEditors.SplitContainerControl();
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.tabPage1 = new System.Windows.Forms.TabPage();
            this.eosIpCamView1 = new EosParkingTools.EosControls.Views.EosIpCamView();
            this.btnReloadCamera = new DevExpress.XtraEditors.SimpleButton();
            this.tabPage2 = new System.Windows.Forms.TabPage();
            this.eosExitIpCamView2 = new EosParkingTools.EosControls.Views.EosIpCamView();
            this.CarPicture = new System.Windows.Forms.PictureBox();
            this.eosLabel3 = new EosParkingTools.EosControls.EosLabel();
            this.panel1 = new System.Windows.Forms.Panel();
            this.PlatePicture = new System.Windows.Forms.PictureBox();
            this.panel2 = new System.Windows.Forms.Panel();
            this.eosLabel2 = new EosParkingTools.EosControls.EosLabel();
            this.eosAnprSourceLable = new EosParkingTools.EosControls.EosLabel();
            this.AnprSourceGroup = new System.Windows.Forms.GroupBox();
            this.RbEosSourceElmoSanat = new System.Windows.Forms.RadioButton();
            this.RbEosSourceShahab = new System.Windows.Forms.RadioButton();
            this.panel3 = new System.Windows.Forms.Panel();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.anprRecordsGrid = new EosParkingTools.EosControls.EosGridControl();
            this.gridView2 = new DevExpress.XtraGrid.Views.Grid.GridView();
            this.gridColumnID = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnPlate = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnCamera = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnROI = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnIsNew = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnInsertTime = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnGetPlateTime = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnPlateImageName = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnCarImageName = new DevExpress.XtraGrid.Columns.GridColumn();
            this.gridColumnPlatePic = new DevExpress.XtraGrid.Columns.GridColumn();
            this.repositoryItemPictureEdit1 = new DevExpress.XtraEditors.Repository.RepositoryItemPictureEdit();
            this.gridColumnCarPic = new DevExpress.XtraGrid.Columns.GridColumn();
            this.repositoryItemImageEdit1 = new DevExpress.XtraEditors.Repository.RepositoryItemImageEdit();
            this.splitContainerControl1 = new DevExpress.XtraEditors.SplitContainerControl();
            this.splitContainerControl3 = new DevExpress.XtraEditors.SplitContainerControl();
            this.folderBrowserDialog1 = new System.Windows.Forms.FolderBrowserDialog();
            this.timerGetRecord = new System.Windows.Forms.Timer(this.components);
            this.doorsComboBox = new EosParkingTools.EosControls.EosComboBoxEdit();
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerControl2)).BeginInit();
            this.splitContainerControl2.SuspendLayout();
            this.tableLayoutPanel1.SuspendLayout();
            this.tabControl1.SuspendLayout();
            this.tabPage1.SuspendLayout();
            this.eosIpCamView1.SuspendLayout();
            this.tabPage2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.CarPicture)).BeginInit();
            this.panel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.PlatePicture)).BeginInit();
            this.panel2.SuspendLayout();
            this.AnprSourceGroup.SuspendLayout();
            this.panel3.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.anprRecordsGrid)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridView2)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.repositoryItemPictureEdit1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.repositoryItemImageEdit1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerControl1)).BeginInit();
            this.splitContainerControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerControl3)).BeginInit();
            this.splitContainerControl3.SuspendLayout();
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
            // splitContainerControl2
            // 
            this.splitContainerControl2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainerControl2.Horizontal = false;
            this.splitContainerControl2.IsSplitterFixed = true;
            this.splitContainerControl2.Location = new System.Drawing.Point(0, 0);
            this.splitContainerControl2.Name = "splitContainerControl2";
            this.splitContainerControl2.Panel1.Controls.Add(this.tableLayoutPanel1);
            this.splitContainerControl2.Panel1.Text = "Panel1";
            this.splitContainerControl2.Panel2.Controls.Add(this.anprRecordsGrid);
            this.splitContainerControl2.Panel2.Text = "Panel2";
            this.splitContainerControl2.Size = new System.Drawing.Size(996, 717);
            this.splitContainerControl2.SplitterPosition = 231;
            this.splitContainerControl2.TabIndex = 1;
            this.splitContainerControl2.Text = "splitContainerControl2";
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.ColumnCount = 4;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 33.33333F));
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 33.33333F));
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 33.33333F));
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 99F));
            this.tableLayoutPanel1.Controls.Add(this.tabControl1, 0, 1);
            this.tableLayoutPanel1.Controls.Add(this.CarPicture, 1, 1);
            this.tableLayoutPanel1.Controls.Add(this.eosLabel3, 1, 0);
            this.tableLayoutPanel1.Controls.Add(this.panel1, 2, 1);
            this.tableLayoutPanel1.Controls.Add(this.panel2, 2, 0);
            this.tableLayoutPanel1.Controls.Add(this.eosAnprSourceLable, 3, 0);
            this.tableLayoutPanel1.Controls.Add(this.AnprSourceGroup, 3, 1);
            this.tableLayoutPanel1.Controls.Add(this.panel3, 0, 0);
            this.tableLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tableLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.Padding = new System.Windows.Forms.Padding(0, 0, 0, 3);
            this.tableLayoutPanel1.RowCount = 2;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 19.04762F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 80.95238F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(996, 231);
            this.tableLayoutPanel1.TabIndex = 6;
            // 
            // tabControl1
            // 
            this.tabControl1.Controls.Add(this.tabPage1);
            this.tabControl1.Controls.Add(this.tabPage2);
            this.tabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabControl1.Location = new System.Drawing.Point(697, 43);
            this.tabControl1.Margin = new System.Windows.Forms.Padding(0);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(299, 185);
            this.tabControl1.TabIndex = 7;
            // 
            // tabPage1
            // 
            this.tabPage1.Controls.Add(this.eosIpCamView1);
            this.tabPage1.Location = new System.Drawing.Point(4, 22);
            this.tabPage1.Margin = new System.Windows.Forms.Padding(0);
            this.tabPage1.Name = "tabPage1";
            this.tabPage1.Padding = new System.Windows.Forms.Padding(1);
            this.tabPage1.Size = new System.Drawing.Size(291, 159);
            this.tabPage1.TabIndex = 0;
            this.tabPage1.Text = "دوربین ورودی";
            this.tabPage1.UseVisualStyleBackColor = true;
            // 
            // eosIpCamView1
            // 
            this.eosIpCamView1.ActivePlateDetector = false;
            this.eosIpCamView1.ActiveRegionSelector = false;
            this.eosIpCamView1.BackgroundImage = ((System.Drawing.Image)(resources.GetObject("eosIpCamView1.BackgroundImage")));
            this.eosIpCamView1.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Center;
            this.eosIpCamView1.Controls.Add(this.btnReloadCamera);
            this.eosIpCamView1.CurrentPlateBitmap = null;
            this.eosIpCamView1.DetectPlateRegion = new System.Drawing.Rectangle(0, 0, 800, 600);
            this.eosIpCamView1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.eosIpCamView1.DontCheckPlateInCurrentList = false;
            this.eosIpCamView1.IpCamUrl = null;
            this.eosIpCamView1.IsConnect = false;
            this.eosIpCamView1.LastPlateDateTime = new System.DateTime(((long)(0)));
            this.eosIpCamView1.LastUnDetectedPlateDateTime = new System.DateTime(((long)(0)));
            this.eosIpCamView1.Location = new System.Drawing.Point(1, 1);
            this.eosIpCamView1.Name = "eosIpCamView1";
            this.eosIpCamView1.Password = null;
            this.eosIpCamView1.Plate = null;
            this.eosIpCamView1.PlateDetectorAddress = "http://192.168.10.138:8080";
            this.eosIpCamView1.Port = 80;
            this.eosIpCamView1.Size = new System.Drawing.Size(289, 157);
            this.eosIpCamView1.StretchVideo = false;
            this.eosIpCamView1.TabIndex = 5;
            this.eosIpCamView1.UserName = null;
            this.eosIpCamView1.VideoSize = new System.Drawing.Size(0, 0);
            this.eosIpCamView1.WaiteForNextPlate = false;
            this.eosIpCamView1.Zoom = 0;
            // 
            // btnReloadCamera
            // 
            this.btnReloadCamera.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.HotFlat;
            this.btnReloadCamera.ImageOptions.Location = DevExpress.XtraEditors.ImageLocation.MiddleRight;
            this.btnReloadCamera.Location = new System.Drawing.Point(390, 191);
            this.btnReloadCamera.Margin = new System.Windows.Forms.Padding(5);
            this.btnReloadCamera.Name = "btnReloadCamera";
            this.btnReloadCamera.Size = new System.Drawing.Size(12, 12);
            this.btnReloadCamera.TabIndex = 14;
            this.btnReloadCamera.Visible = false;
            // 
            // tabPage2
            // 
            this.tabPage2.Controls.Add(this.eosExitIpCamView2);
            this.tabPage2.Location = new System.Drawing.Point(4, 22);
            this.tabPage2.Name = "tabPage2";
            this.tabPage2.Padding = new System.Windows.Forms.Padding(1);
            this.tabPage2.Size = new System.Drawing.Size(291, 159);
            this.tabPage2.TabIndex = 1;
            this.tabPage2.Text = "دوربین خروجی";
            this.tabPage2.UseVisualStyleBackColor = true;
            // 
            // eosExitIpCamView2
            // 
            this.eosExitIpCamView2.ActivePlateDetector = false;
            this.eosExitIpCamView2.ActiveRegionSelector = false;
            this.eosExitIpCamView2.BackgroundImage = ((System.Drawing.Image)(resources.GetObject("eosExitIpCamView2.BackgroundImage")));
            this.eosExitIpCamView2.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Center;
            this.eosExitIpCamView2.CurrentPlateBitmap = null;
            this.eosExitIpCamView2.DetectPlateRegion = new System.Drawing.Rectangle(0, 0, 800, 600);
            this.eosExitIpCamView2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.eosExitIpCamView2.DontCheckPlateInCurrentList = false;
            this.eosExitIpCamView2.IpCamUrl = null;
            this.eosExitIpCamView2.IsConnect = false;
            this.eosExitIpCamView2.LastPlateDateTime = new System.DateTime(((long)(0)));
            this.eosExitIpCamView2.LastUnDetectedPlateDateTime = new System.DateTime(((long)(0)));
            this.eosExitIpCamView2.Location = new System.Drawing.Point(1, 1);
            this.eosExitIpCamView2.Name = "eosExitIpCamView2";
            this.eosExitIpCamView2.Password = null;
            this.eosExitIpCamView2.Plate = null;
            this.eosExitIpCamView2.PlateDetectorAddress = "http://192.168.10.138:8080";
            this.eosExitIpCamView2.Port = 80;
            this.eosExitIpCamView2.Size = new System.Drawing.Size(289, 157);
            this.eosExitIpCamView2.StretchVideo = false;
            this.eosExitIpCamView2.TabIndex = 7;
            this.eosExitIpCamView2.UserName = null;
            this.eosExitIpCamView2.VideoSize = new System.Drawing.Size(0, 0);
            this.eosExitIpCamView2.WaiteForNextPlate = false;
            this.eosExitIpCamView2.Zoom = 0;
            // 
            // CarPicture
            // 
            this.CarPicture.BackgroundImage = ((System.Drawing.Image)(resources.GetObject("CarPicture.BackgroundImage")));
            this.CarPicture.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Center;
            this.CarPicture.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.CarPicture.Dock = System.Windows.Forms.DockStyle.Fill;
            this.CarPicture.Location = new System.Drawing.Point(401, 46);
            this.CarPicture.Name = "CarPicture";
            this.CarPicture.Size = new System.Drawing.Size(293, 179);
            this.CarPicture.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.CarPicture.TabIndex = 4;
            this.CarPicture.TabStop = false;
            // 
            // eosLabel3
            // 
            this.eosLabel3.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel3.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.eosLabel3.BorderWidth = 1;
            this.eosLabel3.Dock = System.Windows.Forms.DockStyle.Fill;
            this.eosLabel3.ForeColor = System.Drawing.Color.Maroon;
            this.eosLabel3.Location = new System.Drawing.Point(401, 3);
            this.eosLabel3.Margin = new System.Windows.Forms.Padding(3);
            this.eosLabel3.Name = "eosLabel3";
            this.eosLabel3.Size = new System.Drawing.Size(293, 37);
            this.eosLabel3.TabIndex = 1;
            this.eosLabel3.Text = "عکس تردد";
            this.eosLabel3.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.PlatePicture);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel1.Location = new System.Drawing.Point(102, 46);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(293, 179);
            this.panel1.TabIndex = 8;
            // 
            // PlatePicture
            // 
            this.PlatePicture.BackgroundImage = ((System.Drawing.Image)(resources.GetObject("PlatePicture.BackgroundImage")));
            this.PlatePicture.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Center;
            this.PlatePicture.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.PlatePicture.Dock = System.Windows.Forms.DockStyle.Fill;
            this.PlatePicture.Location = new System.Drawing.Point(0, 0);
            this.PlatePicture.Name = "PlatePicture";
            this.PlatePicture.Size = new System.Drawing.Size(293, 179);
            this.PlatePicture.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.PlatePicture.TabIndex = 7;
            this.PlatePicture.TabStop = false;
            // 
            // panel2
            // 
            this.panel2.Controls.Add(this.eosLabel2);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel2.Location = new System.Drawing.Point(102, 3);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(293, 37);
            this.panel2.TabIndex = 9;
            // 
            // eosLabel2
            // 
            this.eosLabel2.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel2.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.eosLabel2.BorderWidth = 1;
            this.eosLabel2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.eosLabel2.ForeColor = System.Drawing.Color.Maroon;
            this.eosLabel2.Location = new System.Drawing.Point(0, 0);
            this.eosLabel2.Margin = new System.Windows.Forms.Padding(3);
            this.eosLabel2.Name = "eosLabel2";
            this.eosLabel2.Size = new System.Drawing.Size(293, 37);
            this.eosLabel2.TabIndex = 3;
            this.eosLabel2.Text = "پلاک";
            this.eosLabel2.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // eosAnprSourceLable
            // 
            this.eosAnprSourceLable.AutoSize = true;
            this.eosAnprSourceLable.BorderColor = System.Drawing.Color.Maroon;
            this.eosAnprSourceLable.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.eosAnprSourceLable.BorderWidth = 1;
            this.eosAnprSourceLable.Dock = System.Windows.Forms.DockStyle.Fill;
            this.eosAnprSourceLable.ForeColor = System.Drawing.Color.Maroon;
            this.eosAnprSourceLable.Location = new System.Drawing.Point(3, 3);
            this.eosAnprSourceLable.Margin = new System.Windows.Forms.Padding(3);
            this.eosAnprSourceLable.Name = "eosAnprSourceLable";
            this.eosAnprSourceLable.Size = new System.Drawing.Size(93, 37);
            this.eosAnprSourceLable.TabIndex = 10;
            this.eosAnprSourceLable.Text = "منبع";
            this.eosAnprSourceLable.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // AnprSourceGroup
            // 
            this.AnprSourceGroup.Controls.Add(this.RbEosSourceElmoSanat);
            this.AnprSourceGroup.Controls.Add(this.RbEosSourceShahab);
            this.AnprSourceGroup.Dock = System.Windows.Forms.DockStyle.Fill;
            this.AnprSourceGroup.Location = new System.Drawing.Point(3, 46);
            this.AnprSourceGroup.Name = "AnprSourceGroup";
            this.AnprSourceGroup.Size = new System.Drawing.Size(93, 179);
            this.AnprSourceGroup.TabIndex = 11;
            this.AnprSourceGroup.TabStop = false;
            // 
            // RbEosSourceElmoSanat
            // 
            this.RbEosSourceElmoSanat.AutoSize = true;
            this.RbEosSourceElmoSanat.Location = new System.Drawing.Point(3, 43);
            this.RbEosSourceElmoSanat.Name = "RbEosSourceElmoSanat";
            this.RbEosSourceElmoSanat.Size = new System.Drawing.Size(84, 17);
            this.RbEosSourceElmoSanat.TabIndex = 1;
            this.RbEosSourceElmoSanat.TabStop = true;
            this.RbEosSourceElmoSanat.Text = "علم و صنعت";
            this.RbEosSourceElmoSanat.UseVisualStyleBackColor = true;
            this.RbEosSourceElmoSanat.CheckedChanged += new System.EventHandler(this.RbEosSourceElmoSanat_CheckedChanged);
            // 
            // RbEosSourceShahab
            // 
            this.RbEosSourceShahab.AutoSize = true;
            this.RbEosSourceShahab.Location = new System.Drawing.Point(33, 20);
            this.RbEosSourceShahab.Name = "RbEosSourceShahab";
            this.RbEosSourceShahab.Size = new System.Drawing.Size(54, 17);
            this.RbEosSourceShahab.TabIndex = 0;
            this.RbEosSourceShahab.TabStop = true;
            this.RbEosSourceShahab.Text = "شهاب";
            this.RbEosSourceShahab.UseVisualStyleBackColor = true;
            this.RbEosSourceShahab.CheckedChanged += new System.EventHandler(this.RbEosSourceShahab_CheckedChanged);
            // 
            // panel3
            // 
            this.panel3.Controls.Add(this.doorsComboBox);
            this.panel3.Controls.Add(this.eosLabel1);
            this.panel3.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel3.Location = new System.Drawing.Point(700, 3);
            this.panel3.Name = "panel3";
            this.panel3.Size = new System.Drawing.Size(293, 37);
            this.panel3.TabIndex = 12;
            // 
            // eosLabel1
            // 
            this.eosLabel1.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel1.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.ForeColor = System.Drawing.Color.Maroon;
            this.eosLabel1.Location = new System.Drawing.Point(225, 7);
            this.eosLabel1.Margin = new System.Windows.Forms.Padding(3);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(65, 22);
            this.eosLabel1.TabIndex = 2;
            this.eosLabel1.Text = "دوربین";
            this.eosLabel1.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // anprRecordsGrid
            // 
            this.anprRecordsGrid.Dock = System.Windows.Forms.DockStyle.Fill;
            this.anprRecordsGrid.EvenRowColor = System.Drawing.Color.AliceBlue;
            this.anprRecordsGrid.FocusRowSelectColor = System.Drawing.Color.LightBlue;
            this.anprRecordsGrid.Location = new System.Drawing.Point(0, 0);
            this.anprRecordsGrid.MainView = this.gridView2;
            this.anprRecordsGrid.Name = "anprRecordsGrid";
            this.anprRecordsGrid.OddRowColor = System.Drawing.Color.Empty;
            this.anprRecordsGrid.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[] {
            this.repositoryItemImageEdit1,
            this.repositoryItemPictureEdit1});
            this.anprRecordsGrid.ShowRowNumber = false;
            this.anprRecordsGrid.Size = new System.Drawing.Size(996, 474);
            this.anprRecordsGrid.TabIndex = 1;
            this.anprRecordsGrid.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[] {
            this.gridView2});
            // 
            // gridView2
            // 
            this.gridView2.ActiveFilterEnabled = false;
            this.gridView2.Appearance.EvenRow.BackColor = System.Drawing.Color.AliceBlue;
            this.gridView2.Appearance.EvenRow.Options.UseBackColor = true;
            this.gridView2.Appearance.FocusedRow.BackColor = System.Drawing.Color.LightBlue;
            this.gridView2.Appearance.FocusedRow.Options.UseBackColor = true;
            this.gridView2.Appearance.OddRow.Options.UseBackColor = true;
            this.gridView2.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[] {
            this.gridColumnID,
            this.gridColumnPlate,
            this.gridColumnCamera,
            this.gridColumnROI,
            this.gridColumnIsNew,
            this.gridColumnInsertTime,
            this.gridColumnGetPlateTime,
            this.gridColumnPlateImageName,
            this.gridColumnCarImageName,
            this.gridColumnPlatePic,
            this.gridColumnCarPic});
            this.gridView2.GridControl = this.anprRecordsGrid;
            this.gridView2.Name = "gridView2";
            this.gridView2.OptionsCustomization.AllowFilter = false;
            this.gridView2.OptionsFilter.AllowFilterEditor = false;
            this.gridView2.OptionsView.EnableAppearanceEvenRow = true;
            this.gridView2.OptionsView.EnableAppearanceOddRow = true;
            this.gridView2.OptionsView.HeaderFilterButtonShowMode = DevExpress.XtraEditors.Controls.FilterButtonShowMode.SmartTag;
            this.gridView2.OptionsView.ShowFilterPanelMode = DevExpress.XtraGrid.Views.Base.ShowFilterPanelMode.Never;
            this.gridView2.OptionsView.ShowGroupPanel = false;
            this.gridView2.CustomDrawCell += new DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventHandler(this.gridView2_CustomDrawCell);
            this.gridView2.FocusedRowChanged += new DevExpress.XtraGrid.Views.Base.FocusedRowChangedEventHandler(this.gridView2_FocusedRowChanged);
            // 
            // gridColumnID
            // 
            this.gridColumnID.Caption = "gridColumnID";
            this.gridColumnID.FieldName = "ID";
            this.gridColumnID.Name = "gridColumnID";
            this.gridColumnID.OptionsColumn.AllowEdit = false;
            // 
            // gridColumnPlate
            // 
            this.gridColumnPlate.Caption = "پلاک";
            this.gridColumnPlate.FieldName = "Plate";
            this.gridColumnPlate.Name = "gridColumnPlate";
            this.gridColumnPlate.OptionsColumn.AllowEdit = false;
            this.gridColumnPlate.Visible = true;
            this.gridColumnPlate.VisibleIndex = 0;
            // 
            // gridColumnCamera
            // 
            this.gridColumnCamera.Caption = "شماره دوربین";
            this.gridColumnCamera.FieldName = "Camera";
            this.gridColumnCamera.Name = "gridColumnCamera";
            this.gridColumnCamera.OptionsColumn.AllowEdit = false;
            this.gridColumnCamera.Visible = true;
            this.gridColumnCamera.VisibleIndex = 1;
            // 
            // gridColumnROI
            // 
            this.gridColumnROI.Caption = "gridColumnROI";
            this.gridColumnROI.FieldName = "ROI";
            this.gridColumnROI.Name = "gridColumnROI";
            this.gridColumnROI.OptionsColumn.AllowEdit = false;
            // 
            // gridColumnIsNew
            // 
            this.gridColumnIsNew.Caption = "gridColumnIsNew";
            this.gridColumnIsNew.FieldName = "IsNew";
            this.gridColumnIsNew.Name = "gridColumnIsNew";
            this.gridColumnIsNew.OptionsColumn.AllowEdit = false;
            // 
            // gridColumnInsertTime
            // 
            this.gridColumnInsertTime.Caption = "تاریخ";
            this.gridColumnInsertTime.FieldName = "InsertTime";
            this.gridColumnInsertTime.Name = "gridColumnInsertTime";
            this.gridColumnInsertTime.OptionsColumn.AllowEdit = false;
            this.gridColumnInsertTime.Visible = true;
            this.gridColumnInsertTime.VisibleIndex = 2;
            // 
            // gridColumnGetPlateTime
            // 
            this.gridColumnGetPlateTime.Caption = "gridColumnGetPlateTime";
            this.gridColumnGetPlateTime.FieldName = "GetPlateTime";
            this.gridColumnGetPlateTime.Name = "gridColumnGetPlateTime";
            this.gridColumnGetPlateTime.OptionsColumn.AllowEdit = false;
            // 
            // gridColumnPlateImageName
            // 
            this.gridColumnPlateImageName.Caption = "gridColumnPlateImageName";
            this.gridColumnPlateImageName.FieldName = "PlateImageName";
            this.gridColumnPlateImageName.Name = "gridColumnPlateImageName";
            this.gridColumnPlateImageName.OptionsColumn.AllowEdit = false;
            // 
            // gridColumnCarImageName
            // 
            this.gridColumnCarImageName.Caption = "gridColumnCarImageName";
            this.gridColumnCarImageName.FieldName = "CarImageName";
            this.gridColumnCarImageName.Name = "gridColumnCarImageName";
            this.gridColumnCarImageName.OptionsColumn.AllowEdit = false;
            // 
            // gridColumnPlatePic
            // 
            this.gridColumnPlatePic.Caption = "عکس پلاک";
            this.gridColumnPlatePic.ColumnEdit = this.repositoryItemPictureEdit1;
            this.gridColumnPlatePic.FieldName = "PlatePic";
            this.gridColumnPlatePic.Name = "gridColumnPlatePic";
            this.gridColumnPlatePic.OptionsColumn.AllowEdit = false;
            this.gridColumnPlatePic.Visible = true;
            this.gridColumnPlatePic.VisibleIndex = 4;
            // 
            // repositoryItemPictureEdit1
            // 
            this.repositoryItemPictureEdit1.Name = "repositoryItemPictureEdit1";
            this.repositoryItemPictureEdit1.NullText = "تصویری یافت نشد";
            this.repositoryItemPictureEdit1.ShowMenu = false;
            this.repositoryItemPictureEdit1.SizeMode = DevExpress.XtraEditors.Controls.PictureSizeMode.Zoom;
            // 
            // gridColumnCarPic
            // 
            this.gridColumnCarPic.Caption = "عکس تردد";
            this.gridColumnCarPic.ColumnEdit = this.repositoryItemPictureEdit1;
            this.gridColumnCarPic.FieldName = "CarPic";
            this.gridColumnCarPic.Name = "gridColumnCarPic";
            this.gridColumnCarPic.OptionsColumn.AllowEdit = false;
            this.gridColumnCarPic.Visible = true;
            this.gridColumnCarPic.VisibleIndex = 3;
            // 
            // repositoryItemImageEdit1
            // 
            this.repositoryItemImageEdit1.AutoHeight = false;
            this.repositoryItemImageEdit1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.repositoryItemImageEdit1.Name = "repositoryItemImageEdit1";
            // 
            // splitContainerControl1
            // 
            this.splitContainerControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainerControl1.Location = new System.Drawing.Point(0, 0);
            this.splitContainerControl1.Name = "splitContainerControl1";
            this.splitContainerControl1.Padding = new System.Windows.Forms.Padding(6);
            this.splitContainerControl1.Panel1.Controls.Add(this.splitContainerControl3);
            this.splitContainerControl1.Panel1.Text = "Panel1";
            this.splitContainerControl1.Panel2.Controls.Add(this.splitContainerControl2);
            this.splitContainerControl1.Panel2.Text = "Panel2";
            this.splitContainerControl1.PanelVisibility = DevExpress.XtraEditors.SplitPanelVisibility.Panel2;
            this.splitContainerControl1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.splitContainerControl1.Size = new System.Drawing.Size(1008, 729);
            this.splitContainerControl1.SplitterPosition = 300;
            this.splitContainerControl1.TabIndex = 1;
            this.splitContainerControl1.Text = "splitContainerControl1";
            // 
            // splitContainerControl3
            // 
            this.splitContainerControl3.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainerControl3.Horizontal = false;
            this.splitContainerControl3.Location = new System.Drawing.Point(0, 0);
            this.splitContainerControl3.Name = "splitContainerControl3";
            this.splitContainerControl3.Panel1.Text = "Panel1";
            this.splitContainerControl3.Panel2.Text = "Panel2";
            this.splitContainerControl3.Size = new System.Drawing.Size(0, 0);
            this.splitContainerControl3.SplitterPosition = 231;
            this.splitContainerControl3.TabIndex = 2;
            this.splitContainerControl3.Text = "splitContainerControl3";
            // 
            // timerGetRecord
            // 
            this.timerGetRecord.Tick += new System.EventHandler(this.timerGetRecord_Tick);
            // 
            // eosComboBoxEdit1
            // 
            this.doorsComboBox.ConvertNumberToEnglish = false;
            this.doorsComboBox.FormattingEnabled = true;
            this.doorsComboBox.HasHistoryItems = false;
            this.doorsComboBox.HistoryName = null;
            this.doorsComboBox.IsNeedIgnoreHistory = false;
            this.doorsComboBox.IsNumeric = false;
            this.doorsComboBox.Location = new System.Drawing.Point(69, 8);
            this.doorsComboBox.Name = "doorsComboBox";
            this.doorsComboBox.Size = new System.Drawing.Size(150, 21);
            this.doorsComboBox.TabIndex = 3;
            // 
            // MonitoringAnprForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1008, 729);
            this.Controls.Add(this.splitContainerControl1);
            this.Name = "MonitoringAnprForm";
            this.Text = "مانیتورینگ تشخیص پلاک";
            this.Load += new System.EventHandler(this.MonitoringAnprForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.styleController)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerControl2)).EndInit();
            this.splitContainerControl2.ResumeLayout(false);
            this.tableLayoutPanel1.ResumeLayout(false);
            this.tableLayoutPanel1.PerformLayout();
            this.tabControl1.ResumeLayout(false);
            this.tabPage1.ResumeLayout(false);
            this.eosIpCamView1.ResumeLayout(false);
            this.eosIpCamView1.PerformLayout();
            this.tabPage2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.CarPicture)).EndInit();
            this.panel1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.PlatePicture)).EndInit();
            this.panel2.ResumeLayout(false);
            this.AnprSourceGroup.ResumeLayout(false);
            this.AnprSourceGroup.PerformLayout();
            this.panel3.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.anprRecordsGrid)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridView2)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.repositoryItemPictureEdit1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.repositoryItemImageEdit1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerControl1)).EndInit();
            this.splitContainerControl1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerControl3)).EndInit();
            this.splitContainerControl3.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private DevExpress.XtraEditors.SplitContainerControl splitContainerControl2;
        private DevExpress.XtraEditors.SplitContainerControl splitContainerControl1;
        private EosParkingTools.EosControls.EosGridControl anprRecordsGrid;
        private DevExpress.XtraGrid.Views.Grid.GridView gridView2;
        private DevExpress.XtraEditors.SplitContainerControl splitContainerControl3;
        private System.Windows.Forms.FolderBrowserDialog folderBrowserDialog1;
        private System.Windows.Forms.Timer timerGetRecord;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnID;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnPlate;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnCamera;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnROI;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnIsNew;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnInsertTime;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnGetPlateTime;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnPlateImageName;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnCarImageName;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnPlatePic;
        private DevExpress.XtraEditors.Repository.RepositoryItemPictureEdit repositoryItemPictureEdit1;
        private DevExpress.XtraGrid.Columns.GridColumn gridColumnCarPic;
        private DevExpress.XtraEditors.Repository.RepositoryItemImageEdit repositoryItemImageEdit1;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage tabPage1;
        private EosParkingTools.EosControls.Views.EosIpCamView eosIpCamView1;
        private DevExpress.XtraEditors.SimpleButton btnReloadCamera;
        private System.Windows.Forms.TabPage tabPage2;
        private EosParkingTools.EosControls.Views.EosIpCamView eosExitIpCamView2;
        private System.Windows.Forms.PictureBox CarPicture;
        private EosParkingTools.EosControls.EosLabel eosLabel3;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.PictureBox PlatePicture;
        private System.Windows.Forms.Panel panel2;
        private EosParkingTools.EosControls.EosLabel eosLabel2;
        private EosParkingTools.EosControls.EosLabel eosAnprSourceLable;
        private System.Windows.Forms.GroupBox AnprSourceGroup;
        private System.Windows.Forms.RadioButton RbEosSourceElmoSanat;
        private System.Windows.Forms.RadioButton RbEosSourceShahab;
        private System.Windows.Forms.Panel panel3;
        private EosParkingTools.EosControls.EosLabel eosLabel1;
        private EosParkingTools.EosControls.EosComboBoxEdit doorsComboBox;
    }
}