namespace DeviceHeartRate
{
    partial class frmMain
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
            this.dataGridView1 = new System.Windows.Forms.DataGridView();
            this.timerRefreshData = new System.Windows.Forms.Timer();
            this.spViewDiviceHeartRateBindingSource = new System.Windows.Forms.BindingSource();
            this.eosParking_workDataSet = new DeviceHeartRate.EosParking_workDataSet();
            this.spViewDiviceHeartRateTableAdapter = new DeviceHeartRate.EosParking_workDataSetTableAdapters.spViewDiviceHeartRateTableAdapter();
            this.IP = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.Port = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.Relay = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.anprServerIPAddressDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.deviceTypeDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.deviceNameDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.deviceNumberDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.lastHeartRateDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.lastHeartRateFaDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.elapsedsecDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            ((System.ComponentModel.ISupportInitialize)(this.dataGridView1)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.spViewDiviceHeartRateBindingSource)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.eosParking_workDataSet)).BeginInit();
            this.SuspendLayout();
            // 
            // dataGridView1
            // 
            this.dataGridView1.AllowUserToAddRows = false;
            this.dataGridView1.AllowUserToDeleteRows = false;
            this.dataGridView1.AutoGenerateColumns = false;
            this.dataGridView1.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dataGridView1.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.IP,
            this.Port,
            this.Relay,
            this.anprServerIPAddressDataGridViewTextBoxColumn,
            this.deviceTypeDataGridViewTextBoxColumn,
            this.deviceNameDataGridViewTextBoxColumn,
            this.deviceNumberDataGridViewTextBoxColumn,
            this.lastHeartRateDataGridViewTextBoxColumn,
            this.lastHeartRateFaDataGridViewTextBoxColumn,
            this.elapsedsecDataGridViewTextBoxColumn});
            this.dataGridView1.DataSource = this.spViewDiviceHeartRateBindingSource;
            this.dataGridView1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dataGridView1.Location = new System.Drawing.Point(0, 0);
            this.dataGridView1.MultiSelect = false;
            this.dataGridView1.Name = "dataGridView1";
            this.dataGridView1.ReadOnly = true;
            this.dataGridView1.Size = new System.Drawing.Size(553, 210);
            this.dataGridView1.TabIndex = 0;
            this.dataGridView1.DoubleClick += new System.EventHandler(this.dataGridView1_DoubleClick);
            // 
            // timerRefreshData
            // 
            this.timerRefreshData.Enabled = true;
            this.timerRefreshData.Interval = 10000;
            this.timerRefreshData.Tick += new System.EventHandler(this.timerRefreshData_Tick);
            // 
            // spViewDiviceHeartRateBindingSource
            // 
            this.spViewDiviceHeartRateBindingSource.DataMember = "spViewDiviceHeartRate";
            this.spViewDiviceHeartRateBindingSource.DataSource = this.eosParking_workDataSet;
            // 
            // eosParking_workDataSet
            // 
            this.eosParking_workDataSet.DataSetName = "EosParking_workDataSet";
            this.eosParking_workDataSet.SchemaSerializationMode = System.Data.SchemaSerializationMode.IncludeSchema;
            // 
            // spViewDiviceHeartRateTableAdapter
            // 
            this.spViewDiviceHeartRateTableAdapter.ClearBeforeFill = true;
            // 
            // IP
            // 
            this.IP.DataPropertyName = "IP";
            this.IP.HeaderText = "IP";
            this.IP.Name = "IP";
            this.IP.ReadOnly = true;
            this.IP.Visible = false;
            // 
            // Port
            // 
            this.Port.DataPropertyName = "Port";
            this.Port.HeaderText = "Port";
            this.Port.Name = "Port";
            this.Port.ReadOnly = true;
            this.Port.Visible = false;
            // 
            // Relay
            // 
            this.Relay.DataPropertyName = "Relay";
            this.Relay.HeaderText = "Relay";
            this.Relay.Name = "Relay";
            this.Relay.ReadOnly = true;
            this.Relay.Visible = false;
            // 
            // anprServerIPAddressDataGridViewTextBoxColumn
            // 
            this.anprServerIPAddressDataGridViewTextBoxColumn.DataPropertyName = "AnprServerIPAddress";
            this.anprServerIPAddressDataGridViewTextBoxColumn.HeaderText = "AnprServerIPAddress";
            this.anprServerIPAddressDataGridViewTextBoxColumn.Name = "anprServerIPAddressDataGridViewTextBoxColumn";
            this.anprServerIPAddressDataGridViewTextBoxColumn.ReadOnly = true;
            this.anprServerIPAddressDataGridViewTextBoxColumn.Visible = false;
            // 
            // deviceTypeDataGridViewTextBoxColumn
            // 
            this.deviceTypeDataGridViewTextBoxColumn.DataPropertyName = "DeviceType";
            this.deviceTypeDataGridViewTextBoxColumn.HeaderText = "DeviceType";
            this.deviceTypeDataGridViewTextBoxColumn.Name = "deviceTypeDataGridViewTextBoxColumn";
            this.deviceTypeDataGridViewTextBoxColumn.ReadOnly = true;
            // 
            // deviceNameDataGridViewTextBoxColumn
            // 
            this.deviceNameDataGridViewTextBoxColumn.DataPropertyName = "DeviceName";
            this.deviceNameDataGridViewTextBoxColumn.HeaderText = "DeviceName";
            this.deviceNameDataGridViewTextBoxColumn.Name = "deviceNameDataGridViewTextBoxColumn";
            this.deviceNameDataGridViewTextBoxColumn.ReadOnly = true;
            // 
            // deviceNumberDataGridViewTextBoxColumn
            // 
            this.deviceNumberDataGridViewTextBoxColumn.DataPropertyName = "DeviceNumber";
            this.deviceNumberDataGridViewTextBoxColumn.HeaderText = "DeviceNumber";
            this.deviceNumberDataGridViewTextBoxColumn.Name = "deviceNumberDataGridViewTextBoxColumn";
            this.deviceNumberDataGridViewTextBoxColumn.ReadOnly = true;
            this.deviceNumberDataGridViewTextBoxColumn.Visible = false;
            // 
            // lastHeartRateDataGridViewTextBoxColumn
            // 
            this.lastHeartRateDataGridViewTextBoxColumn.DataPropertyName = "LastHeartRate";
            this.lastHeartRateDataGridViewTextBoxColumn.HeaderText = "LastHeartRate";
            this.lastHeartRateDataGridViewTextBoxColumn.Name = "lastHeartRateDataGridViewTextBoxColumn";
            this.lastHeartRateDataGridViewTextBoxColumn.ReadOnly = true;
            this.lastHeartRateDataGridViewTextBoxColumn.Visible = false;
            // 
            // lastHeartRateFaDataGridViewTextBoxColumn
            // 
            this.lastHeartRateFaDataGridViewTextBoxColumn.DataPropertyName = "LastHeartRateFa";
            this.lastHeartRateFaDataGridViewTextBoxColumn.HeaderText = "LastHeartRateFa";
            this.lastHeartRateFaDataGridViewTextBoxColumn.Name = "lastHeartRateFaDataGridViewTextBoxColumn";
            this.lastHeartRateFaDataGridViewTextBoxColumn.ReadOnly = true;
            this.lastHeartRateFaDataGridViewTextBoxColumn.Width = 170;
            // 
            // elapsedsecDataGridViewTextBoxColumn
            // 
            this.elapsedsecDataGridViewTextBoxColumn.DataPropertyName = "elapsed_sec";
            this.elapsedsecDataGridViewTextBoxColumn.HeaderText = "ElapsedRate(Sec)";
            this.elapsedsecDataGridViewTextBoxColumn.Name = "elapsedsecDataGridViewTextBoxColumn";
            this.elapsedsecDataGridViewTextBoxColumn.ReadOnly = true;
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(553, 210);
            this.Controls.Add(this.dataGridView1);
            this.Name = "frmMain";
            this.ShowIcon = false;
            this.Text = "Device Hearth Rate 1.1";
            this.TopMost = true;
            this.Load += new System.EventHandler(this.frmMain_Load);
            ((System.ComponentModel.ISupportInitialize)(this.dataGridView1)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.spViewDiviceHeartRateBindingSource)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.eosParking_workDataSet)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.DataGridView dataGridView1;
        private EosParking_workDataSet eosParking_workDataSet;
        private System.Windows.Forms.BindingSource spViewDiviceHeartRateBindingSource;
        private EosParking_workDataSetTableAdapters.spViewDiviceHeartRateTableAdapter spViewDiviceHeartRateTableAdapter;
        private System.Windows.Forms.Timer timerRefreshData;
        private System.Windows.Forms.DataGridViewTextBoxColumn IP;
        private System.Windows.Forms.DataGridViewTextBoxColumn Port;
        private System.Windows.Forms.DataGridViewTextBoxColumn Relay;
        private System.Windows.Forms.DataGridViewTextBoxColumn anprServerIPAddressDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn deviceTypeDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn deviceNameDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn deviceNumberDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn lastHeartRateDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn lastHeartRateFaDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn elapsedsecDataGridViewTextBoxColumn;
    }
}

