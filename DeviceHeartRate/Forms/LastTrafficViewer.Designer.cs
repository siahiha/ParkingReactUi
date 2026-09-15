namespace DeviceHeartRate.Forms
{
    partial class LastTrafficViewer
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
            this.timerGetTraffics = new System.Windows.Forms.Timer(this.components);
            this.trafficView3 = new DeviceHeartRate.Forms.Controls.TrafficView();
            this.trafficView2 = new DeviceHeartRate.Forms.Controls.TrafficView();
            this.trafficView1 = new DeviceHeartRate.Forms.Controls.TrafficView();
            this.SuspendLayout();
            // 
            // timerGetTraffics
            // 
            this.timerGetTraffics.Enabled = true;
            this.timerGetTraffics.Interval = 500;
            this.timerGetTraffics.Tick += new System.EventHandler(this.timerGetTraffics_Tick);
            // 
            // trafficView3
            // 
            this.trafficView3.Dock = System.Windows.Forms.DockStyle.Top;
            this.trafficView3.Location = new System.Drawing.Point(0, 506);
            this.trafficView3.Name = "trafficView3";
            this.trafficView3.Plate = "";
            this.trafficView3.Size = new System.Drawing.Size(1107, 256);
            this.trafficView3.TabIndex = 2;
            this.trafficView3.TrafficTime = "";
            this.trafficView3.TrafficType = "";
            // 
            // trafficView2
            // 
            this.trafficView2.Dock = System.Windows.Forms.DockStyle.Top;
            this.trafficView2.Location = new System.Drawing.Point(0, 256);
            this.trafficView2.Name = "trafficView2";
            this.trafficView2.Plate = "";
            this.trafficView2.Size = new System.Drawing.Size(1107, 250);
            this.trafficView2.TabIndex = 1;
            this.trafficView2.TrafficTime = "";
            this.trafficView2.TrafficType = "";
            // 
            // trafficView1
            // 
            this.trafficView1.Dock = System.Windows.Forms.DockStyle.Top;
            this.trafficView1.Location = new System.Drawing.Point(0, 0);
            this.trafficView1.Name = "trafficView1";
            this.trafficView1.Plate = "";
            this.trafficView1.Size = new System.Drawing.Size(1107, 256);
            this.trafficView1.TabIndex = 0;
            this.trafficView1.TrafficTime = "";
            this.trafficView1.TrafficType = "";
            // 
            // LastTrafficViewer
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1107, 729);
            this.Controls.Add(this.trafficView3);
            this.Controls.Add(this.trafficView2);
            this.Controls.Add(this.trafficView1);
            this.Name = "LastTrafficViewer";
            this.Text = "LastTrafficViewer";
            this.TopMost = true;
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Timer timerGetTraffics;
        private Controls.TrafficView trafficView1;
        private Controls.TrafficView trafficView2;
        private Controls.TrafficView trafficView3;
    }
}