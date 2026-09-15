namespace EosParkingTools.EosControls
{
    partial class EosEntityModifyToolsControl
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
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.newButton = new DevExpress.XtraEditors.SimpleButton();
            this.editButton = new DevExpress.XtraEditors.SimpleButton();
            this.deleteButton = new DevExpress.XtraEditors.SimpleButton();
            this.flowLayoutPanel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Controls.Add(this.newButton);
            this.flowLayoutPanel1.Controls.Add(this.editButton);
            this.flowLayoutPanel1.Controls.Add(this.deleteButton);
            this.flowLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.flowLayoutPanel1.Margin = new System.Windows.Forms.Padding(0);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(440, 34);
            this.flowLayoutPanel1.TabIndex = 1;
            // 
            // newButton
            // 
            this.newButton.ImageOptions.AllowGlyphSkinning = DevExpress.Utils.DefaultBoolean.False;
            this.newButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Add21;
            this.newButton.Location = new System.Drawing.Point(3, 3);
            this.newButton.Margin = new System.Windows.Forms.Padding(3, 3, 0, 3);
            this.newButton.Name = "newButton";
            this.newButton.Size = new System.Drawing.Size(75, 28);
            this.newButton.TabIndex = 6;
            this.newButton.Text = "جدید";
            this.newButton.Click += new System.EventHandler(this.Button_Click);
            // 
            // editButton
            // 
            this.editButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Edit21;
            this.editButton.ImageOptions.SvgImageSize = new System.Drawing.Size(15, 30);
            this.editButton.Location = new System.Drawing.Point(78, 3);
            this.editButton.Margin = new System.Windows.Forms.Padding(0, 3, 0, 3);
            this.editButton.Name = "editButton";
            this.editButton.Size = new System.Drawing.Size(75, 28);
            this.editButton.TabIndex = 5;
            this.editButton.Text = "ویرایش";
            this.editButton.Click += new System.EventHandler(this.Button_Click);
            // 
            // deleteButton
            // 
            this.deleteButton.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Cancel21;
            this.deleteButton.ImageOptions.SvgImageSize = new System.Drawing.Size(15, 30);
            this.deleteButton.Location = new System.Drawing.Point(153, 3);
            this.deleteButton.Margin = new System.Windows.Forms.Padding(0, 3, 3, 3);
            this.deleteButton.Name = "deleteButton";
            this.deleteButton.Size = new System.Drawing.Size(75, 28);
            this.deleteButton.TabIndex = 9;
            this.deleteButton.Text = "حذف";
            this.deleteButton.Click += new System.EventHandler(this.Button_Click);
            // 
            // EosEntityModifyToolsControl
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.flowLayoutPanel1);
            this.Margin = new System.Windows.Forms.Padding(0);
            this.Name = "EosEntityModifyToolsControl";
            this.Size = new System.Drawing.Size(440, 34);
            this.flowLayoutPanel1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private DevExpress.XtraEditors.SimpleButton newButton;
        private DevExpress.XtraEditors.SimpleButton editButton;
        private DevExpress.XtraEditors.SimpleButton deleteButton;
    }
}
