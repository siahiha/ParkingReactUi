namespace CardDespenser
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
            this.btnOpenDespenser = new System.Windows.Forms.Button();
            this.textBoxRestTime = new System.Windows.Forms.TextBox();
            this.label10 = new System.Windows.Forms.Label();
            this.button4 = new System.Windows.Forms.Button();
            this.checkBoxMoveToBin = new System.Windows.Forms.CheckBox();
            this.checkBoxShootOut = new System.Windows.Forms.CheckBox();
            this.textBox1 = new System.Windows.Forms.TextBox();
            this.btnPrintTest = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // btnOpenDespenser
            // 
            this.btnOpenDespenser.Location = new System.Drawing.Point(100, 64);
            this.btnOpenDespenser.Name = "btnOpenDespenser";
            this.btnOpenDespenser.Size = new System.Drawing.Size(114, 60);
            this.btnOpenDespenser.TabIndex = 95;
            this.btnOpenDespenser.Text = "Open Despenser";
            this.btnOpenDespenser.UseVisualStyleBackColor = true;
            this.btnOpenDespenser.Click += new System.EventHandler(this.btnOpenDespenser_Click);
            // 
            // textBoxRestTime
            // 
            this.textBoxRestTime.Location = new System.Drawing.Point(338, 142);
            this.textBoxRestTime.Name = "textBoxRestTime";
            this.textBoxRestTime.Size = new System.Drawing.Size(100, 20);
            this.textBoxRestTime.TabIndex = 106;
            this.textBoxRestTime.Text = "20";
            // 
            // label10
            // 
            this.label10.AutoSize = true;
            this.label10.Location = new System.Drawing.Point(256, 144);
            this.label10.Name = "label10";
            this.label10.Size = new System.Drawing.Size(80, 13);
            this.label10.TabIndex = 105;
            this.label10.Text = "RestTime(Sec):";
            // 
            // button4
            // 
            this.button4.Location = new System.Drawing.Point(101, 137);
            this.button4.Name = "button4";
            this.button4.Size = new System.Drawing.Size(114, 25);
            this.button4.TabIndex = 104;
            this.button4.Text = "Close Despenser";
            this.button4.UseVisualStyleBackColor = true;
            this.button4.Click += new System.EventHandler(this.button4_Click);
            // 
            // checkBoxMoveToBin
            // 
            this.checkBoxMoveToBin.AutoSize = true;
            this.checkBoxMoveToBin.Checked = true;
            this.checkBoxMoveToBin.CheckState = System.Windows.Forms.CheckState.Checked;
            this.checkBoxMoveToBin.Location = new System.Drawing.Point(258, 111);
            this.checkBoxMoveToBin.Name = "checkBoxMoveToBin";
            this.checkBoxMoveToBin.Size = new System.Drawing.Size(87, 17);
            this.checkBoxMoveToBin.TabIndex = 103;
            this.checkBoxMoveToBin.Text = "Move To Bin";
            this.checkBoxMoveToBin.UseVisualStyleBackColor = true;
            // 
            // checkBoxShootOut
            // 
            this.checkBoxShootOut.AutoSize = true;
            this.checkBoxShootOut.Location = new System.Drawing.Point(258, 84);
            this.checkBoxShootOut.Name = "checkBoxShootOut";
            this.checkBoxShootOut.Size = new System.Drawing.Size(74, 17);
            this.checkBoxShootOut.TabIndex = 102;
            this.checkBoxShootOut.Text = "Shoot Out";
            this.checkBoxShootOut.UseVisualStyleBackColor = true;
            // 
            // textBox1
            // 
            this.textBox1.Location = new System.Drawing.Point(86, 168);
            this.textBox1.Multiline = true;
            this.textBox1.Name = "textBox1";
            this.textBox1.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.textBox1.Size = new System.Drawing.Size(352, 451);
            this.textBox1.TabIndex = 101;
            // 
            // btnPrintTest
            // 
            this.btnPrintTest.Location = new System.Drawing.Point(488, 123);
            this.btnPrintTest.Name = "btnPrintTest";
            this.btnPrintTest.Size = new System.Drawing.Size(75, 23);
            this.btnPrintTest.TabIndex = 107;
            this.btnPrintTest.Text = "Print";
            this.btnPrintTest.UseVisualStyleBackColor = true;
            this.btnPrintTest.Click += new System.EventHandler(this.btnPrintTest_Click);
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 637);
            this.Controls.Add(this.btnPrintTest);
            this.Controls.Add(this.textBoxRestTime);
            this.Controls.Add(this.label10);
            this.Controls.Add(this.button4);
            this.Controls.Add(this.checkBoxMoveToBin);
            this.Controls.Add(this.checkBoxShootOut);
            this.Controls.Add(this.textBox1);
            this.Controls.Add(this.btnOpenDespenser);
            this.Name = "frmMain";
            this.Text = "Parking card despenser 1.0";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnOpenDespenser;
        private System.Windows.Forms.TextBox textBoxRestTime;
        private System.Windows.Forms.Label label10;
        private System.Windows.Forms.Button button4;
        private System.Windows.Forms.CheckBox checkBoxMoveToBin;
        private System.Windows.Forms.CheckBox checkBoxShootOut;
        private System.Windows.Forms.TextBox textBox1;
        private System.Windows.Forms.Button btnPrintTest;
    }
}

