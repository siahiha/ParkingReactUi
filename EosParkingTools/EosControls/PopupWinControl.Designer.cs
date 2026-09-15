namespace EosParkingTools.EosControls
{
    partial class PopupWinControl
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
            this.label1 = new EosParkingTools.EosControls.EosLabel();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.BackColor = System.Drawing.Color.Transparent;
            this.label1.BorderColor = System.Drawing.Color.Black;
            this.label1.BorderWidth = 1;
            this.label1.Dock = System.Windows.Forms.DockStyle.Top;
            this.label1.Location = new System.Drawing.Point(0, 0);
            this.label1.Margin = new System.Windows.Forms.Padding(5, 0, 5, 0);
            this.label1.Name = "label1";
            this.label1.Padding = new System.Windows.Forms.Padding(5, 2, 5, 0);
            this.label1.Size = new System.Drawing.Size(500, 23);
            this.label1.TabIndex = 0;
            this.label1.Text = "caption";
            this.label1.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.label1.MouseDown += new System.Windows.Forms.MouseEventHandler(this.label1_MouseDown);
            // 
            // eosLabel1
            // 
            this.eosLabel1.AutoSize = true;
            this.eosLabel1.BackColor = System.Drawing.Color.Maroon;
            this.eosLabel1.BorderColor = System.Drawing.Color.Maroon;
            this.eosLabel1.BorderSide = ((System.Windows.Forms.Border3DSide)(((((System.Windows.Forms.Border3DSide.Left | System.Windows.Forms.Border3DSide.Top) 
            | System.Windows.Forms.Border3DSide.Right) 
            | System.Windows.Forms.Border3DSide.Bottom) 
            | System.Windows.Forms.Border3DSide.Middle)));
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Cursor = System.Windows.Forms.Cursors.Hand;
            this.eosLabel1.Font = new System.Drawing.Font("Microsoft Sans Serif", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(178)));
            this.eosLabel1.ForeColor = System.Drawing.Color.White;
            this.eosLabel1.Location = new System.Drawing.Point(0, 0);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(25, 23);
            this.eosLabel1.TabIndex = 0;
            this.eosLabel1.Text = "^";
            this.eosLabel1.Click += new System.EventHandler(this.eosLabel1_Click);
            // 
            // PopupWinControl
            // 
            this.Padding = new System.Windows.Forms.Padding(1);
            this.Size = new System.Drawing.Size(360, 313);
            this.ResumeLayout(false);

        }

        #endregion

        private EosLabel label1;
        private EosLabel eosLabel1;
    }
}
