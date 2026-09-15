namespace EosParkingTools.EosControls
{
    partial class EosActionRibbonPageGroup
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
            this.addButtonItem = new DevExpress.XtraBars.BarButtonItem();
            this.editButtonItem = new DevExpress.XtraBars.BarButtonItem();
            this.deleteButtonItem = new DevExpress.XtraBars.BarButtonItem();
            // 
            // addButtonItem
            // 
            this.addButtonItem.Caption = "ایجاد";
            this.addButtonItem.Id = 1;
            this.addButtonItem.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Add40;
            this.addButtonItem.Name = "addButtonItem";
            this.addButtonItem.RibbonStyle = DevExpress.XtraBars.Ribbon.RibbonItemStyles.Large;
            // 
            // editButtonItem
            // 
            this.editButtonItem.Caption = "ویرایش";
            this.editButtonItem.Id = 2;
            this.editButtonItem.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Edit40;
            this.editButtonItem.Name = "editButtonItem";
            this.editButtonItem.RibbonStyle = DevExpress.XtraBars.Ribbon.RibbonItemStyles.Large;
            // 
            // deleteButtonItem
            // 
            this.deleteButtonItem.Caption = "حذف";
            this.deleteButtonItem.Id = 3;
            this.deleteButtonItem.ImageOptions.Image = global::EosParkingTools.Properties.Resources.Delete40;
            this.deleteButtonItem.Name = "deleteButtonItem";
            this.deleteButtonItem.RibbonStyle = DevExpress.XtraBars.Ribbon.RibbonItemStyles.Large;
            // 
            // EosActionRibbonPageGroup
            // 
            this.ItemLinks.Add(this.addButtonItem);
            this.ItemLinks.Add(this.editButtonItem);
            this.ItemLinks.Add(this.deleteButtonItem);
            this.Text = "عملیات";

        }
        private DevExpress.XtraBars.BarButtonItem editButtonItem;
        private DevExpress.XtraBars.BarButtonItem deleteButtonItem;
        #endregion

        private DevExpress.XtraBars.BarButtonItem addButtonItem;
    }
}
