namespace EosParkingTools.EosControls
{
    partial class EosGroupGridControl
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
            this.pagingToolsGridControl = new EosParkingTools.EosControls.EosPagingToolsGridControl();
            this.entityModifyToolsControl = new EosParkingTools.EosControls.EosEntityModifyToolsControl();
            this.SuspendLayout();
            // 
            // pagingToolsGridControl
            // 
            this.pagingToolsGridControl.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.pagingToolsGridControl.Location = new System.Drawing.Point(0, 329);
            this.pagingToolsGridControl.Name = "pagingToolsGridControl";
            this.pagingToolsGridControl.Size = new System.Drawing.Size(466, 27);
            this.pagingToolsGridControl.TabIndex = 2;
            // 
            // entityModifyToolsControl
            // 
            this.entityModifyToolsControl.Dock = System.Windows.Forms.DockStyle.Top;
            this.entityModifyToolsControl.Location = new System.Drawing.Point(0, 0);
            this.entityModifyToolsControl.Margin = new System.Windows.Forms.Padding(0);
            this.entityModifyToolsControl.Name = "entityModifyToolsControl";
            this.entityModifyToolsControl.Size = new System.Drawing.Size(466, 29);
            this.entityModifyToolsControl.TabIndex = 3;
            // 
            // EosGroupGridControl
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.pagingToolsGridControl);
            this.Controls.Add(this.entityModifyToolsControl);
            this.Name = "EosGroupGridControl";
            this.Size = new System.Drawing.Size(466, 356);
            this.ResumeLayout(false);

        }

        #endregion
        private EosPagingToolsGridControl pagingToolsGridControl;
        private EosEntityModifyToolsControl entityModifyToolsControl;
    }
}
