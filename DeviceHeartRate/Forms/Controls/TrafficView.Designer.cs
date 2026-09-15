namespace DeviceHeartRate.Forms.Controls
{
    partial class TrafficView
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
            this.labelPlate1 = new System.Windows.Forms.Label();
            this.labelTrafficTime = new System.Windows.Forms.Label();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.labelPlate2 = new System.Windows.Forms.Label();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.SuspendLayout();
            // 
            // labelPlate1
            // 
            this.labelPlate1.BackColor = System.Drawing.Color.White;
            this.labelPlate1.Font = new System.Drawing.Font("B Yekan", 62F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelPlate1.ForeColor = System.Drawing.Color.Black;
            this.labelPlate1.Location = new System.Drawing.Point(345, 29);
            this.labelPlate1.Name = "labelPlate1";
            this.labelPlate1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.labelPlate1.Size = new System.Drawing.Size(159, 149);
            this.labelPlate1.TabIndex = 0;
            this.labelPlate1.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // labelTrafficTime
            // 
            this.labelTrafficTime.BackColor = System.Drawing.Color.Transparent;
            this.labelTrafficTime.Font = new System.Drawing.Font("B Yekan", 26.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelTrafficTime.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(128)))), ((int)(((byte)(64)))), ((int)(((byte)(64)))));
            this.labelTrafficTime.Location = new System.Drawing.Point(3, 74);
            this.labelTrafficTime.Name = "labelTrafficTime";
            this.labelTrafficTime.Size = new System.Drawing.Size(248, 124);
            this.labelTrafficTime.TabIndex = 1;
            this.labelTrafficTime.Text = "زمان تردد";
            this.labelTrafficTime.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.labelTrafficTime.Click += new System.EventHandler(this.labelTrafficTime_Click);
            // 
            // pictureBox1
            // 
            this.pictureBox1.Image = global::DeviceHeartRate.Properties.Resources.PlateFrame2;
            this.pictureBox1.Location = new System.Drawing.Point(257, 13);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(752, 185);
            this.pictureBox1.TabIndex = 2;
            this.pictureBox1.TabStop = false;
            // 
            // labelPlate2
            // 
            this.labelPlate2.BackColor = System.Drawing.Color.White;
            this.labelPlate2.Font = new System.Drawing.Font("B Yekan", 62.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.labelPlate2.ForeColor = System.Drawing.Color.Black;
            this.labelPlate2.Location = new System.Drawing.Point(842, 49);
            this.labelPlate2.Name = "labelPlate2";
            this.labelPlate2.Size = new System.Drawing.Size(151, 129);
            this.labelPlate2.TabIndex = 3;
            this.labelPlate2.Text = "..";
            this.labelPlate2.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // label1
            // 
            this.label1.BackColor = System.Drawing.Color.White;
            this.label1.Font = new System.Drawing.Font("B Yekan", 52F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.label1.ForeColor = System.Drawing.Color.Black;
            this.label1.Location = new System.Drawing.Point(510, 29);
            this.label1.Name = "label1";
            this.label1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.label1.Size = new System.Drawing.Size(159, 149);
            this.label1.TabIndex = 4;
            this.label1.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // label2
            // 
            this.label2.BackColor = System.Drawing.Color.White;
            this.label2.Font = new System.Drawing.Font("B Yekan", 62F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.label2.ForeColor = System.Drawing.Color.Black;
            this.label2.Location = new System.Drawing.Point(626, 29);
            this.label2.Name = "label2";
            this.label2.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.label2.Size = new System.Drawing.Size(210, 149);
            this.label2.TabIndex = 5;
            this.label2.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // label3
            // 
            this.label3.BackColor = System.Drawing.Color.Transparent;
            this.label3.Font = new System.Drawing.Font("B Titr", 26.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.label3.ForeColor = System.Drawing.Color.Blue;
            this.label3.Location = new System.Drawing.Point(3, 13);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(248, 61);
            this.label3.TabIndex = 6;
            this.label3.Text = "";
            this.label3.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // TrafficView
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.labelPlate2);
            this.Controls.Add(this.labelTrafficTime);
            this.Controls.Add(this.labelPlate1);
            this.Controls.Add(this.pictureBox1);
            this.Name = "TrafficView";
            this.Size = new System.Drawing.Size(1024, 256);
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Label labelPlate1;
        private System.Windows.Forms.Label labelTrafficTime;
        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.Label labelPlate2;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
    }
}
