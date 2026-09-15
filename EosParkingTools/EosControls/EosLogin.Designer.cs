namespace EosParkingTools.EosControls
{
    partial class EosLogin
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
            this.label2 = new System.Windows.Forms.Label();
            this.label1 = new System.Windows.Forms.Label();
            this.usePassTextEdit = new DevExpress.XtraEditors.TextEdit();
            this.captchaLabel = new System.Windows.Forms.Label();
            this.captchaPictureBox = new System.Windows.Forms.PictureBox();
            this.captchaTextEdit = new DevExpress.XtraEditors.TextEdit();
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.userNameComboBox = new EosParkingTools.EosControls.EosComboBoxEdit();
            this.checkBox1 = new System.Windows.Forms.CheckBox();
            this.tableLayoutPanel2 = new System.Windows.Forms.TableLayoutPanel();
            ((System.ComponentModel.ISupportInitialize)(this.usePassTextEdit.Properties)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.captchaPictureBox)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.captchaTextEdit.Properties)).BeginInit();
            this.tableLayoutPanel1.SuspendLayout();
            this.tableLayoutPanel2.SuspendLayout();
            this.SuspendLayout();
            // 
            // label2
            // 
            this.label2.Dock = System.Windows.Forms.DockStyle.Top;
            this.label2.Location = new System.Drawing.Point(149, 25);
            this.label2.Name = "label2";
            this.label2.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.label2.Size = new System.Drawing.Size(69, 23);
            this.label2.TabIndex = 5;
            this.label2.Text = "کلمه عبور";
            this.label2.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // label1
            // 
            this.label1.Dock = System.Windows.Forms.DockStyle.Top;
            this.label1.Location = new System.Drawing.Point(149, 0);
            this.label1.Name = "label1";
            this.label1.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.label1.Size = new System.Drawing.Size(69, 23);
            this.label1.TabIndex = 6;
            this.label1.Text = "نام کاربری";
            this.label1.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // usePassTextEdit
            // 
            this.usePassTextEdit.Dock = System.Windows.Forms.DockStyle.Fill;
            this.usePassTextEdit.Location = new System.Drawing.Point(3, 28);
            this.usePassTextEdit.Margin = new System.Windows.Forms.Padding(3, 3, 3, 0);
            this.usePassTextEdit.Name = "usePassTextEdit";
            this.usePassTextEdit.Properties.PasswordChar = '*';
            this.usePassTextEdit.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.usePassTextEdit.Size = new System.Drawing.Size(140, 20);
            this.usePassTextEdit.TabIndex = 4;
            this.usePassTextEdit.TextChanged += new System.EventHandler(this.usePassTextEdit_TextChanged);
            this.usePassTextEdit.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.captchaTextEdit_KeyPress);
            // 
            // captchaLabel
            // 
            this.captchaLabel.Location = new System.Drawing.Point(152, 45);
            this.captchaLabel.Name = "captchaLabel";
            this.captchaLabel.Size = new System.Drawing.Size(62, 23);
            this.captchaLabel.TabIndex = 5;
            this.captchaLabel.Text = "کد امنیتی";
            this.captchaLabel.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.captchaLabel.Visible = false;
            // 
            // captchaPictureBox
            // 
            this.captchaPictureBox.Location = new System.Drawing.Point(0, 0);
            this.captchaPictureBox.Margin = new System.Windows.Forms.Padding(0);
            this.captchaPictureBox.Name = "captchaPictureBox";
            this.captchaPictureBox.Size = new System.Drawing.Size(124, 45);
            this.captchaPictureBox.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.captchaPictureBox.TabIndex = 3;
            this.captchaPictureBox.TabStop = false;
            this.captchaPictureBox.Visible = false;
            // 
            // captchaTextEdit
            // 
            this.captchaTextEdit.Location = new System.Drawing.Point(3, 48);
            this.captchaTextEdit.Margin = new System.Windows.Forms.Padding(3, 3, 3, 0);
            this.captchaTextEdit.Name = "captchaTextEdit";
            this.captchaTextEdit.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.captchaTextEdit.Size = new System.Drawing.Size(140, 20);
            this.captchaTextEdit.TabIndex = 4;
            this.captchaTextEdit.Visible = false;
            this.captchaTextEdit.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.captchaTextEdit_KeyPress);
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.ColumnCount = 2;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 66.28352F));
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 33.71648F));
            this.tableLayoutPanel1.Controls.Add(this.label1, 1, 0);
            this.tableLayoutPanel1.Controls.Add(this.label2, 1, 1);
            this.tableLayoutPanel1.Controls.Add(this.userNameComboBox, 0, 0);
            this.tableLayoutPanel1.Controls.Add(this.usePassTextEdit, 0, 1);
            this.tableLayoutPanel1.Controls.Add(this.checkBox1, 0, 2);
            this.tableLayoutPanel1.Location = new System.Drawing.Point(3, 3);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.RowCount = 3;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 25F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 21F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 20F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(221, 75);
            this.tableLayoutPanel1.TabIndex = 7;
            // 
            // userNameComboBox
            // 
            this.userNameComboBox.AutoCompleteMode = System.Windows.Forms.AutoCompleteMode.SuggestAppend;
            this.userNameComboBox.AutoCompleteSource = System.Windows.Forms.AutoCompleteSource.ListItems;
            this.userNameComboBox.ConvertNumberToEnglish = false;
            this.userNameComboBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.userNameComboBox.FormattingEnabled = true;
            this.userNameComboBox.HasHistoryItems = true;
            this.userNameComboBox.HistoryName = null;
            this.userNameComboBox.IsNumeric = false;
            this.userNameComboBox.Items.AddRange(new object[] {
            "admin",
            "zxc",
            "admin",
            "zxc",
            "admin",
            "zxc",
            "admin",
            "zxc"});
            this.userNameComboBox.Location = new System.Drawing.Point(3, 3);
            this.userNameComboBox.Name = "userNameComboBox";
            this.userNameComboBox.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.userNameComboBox.Size = new System.Drawing.Size(140, 21);
            this.userNameComboBox.TabIndex = 0;
            this.userNameComboBox.TextChanged += new System.EventHandler(this.userNameComboBox_TextChanged);
            this.userNameComboBox.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.userNameComboBox_KeyPress);
            this.userNameComboBox.KeyUp += new System.Windows.Forms.KeyEventHandler(this.userNameComboBox_KeyUp);
            // 
            // checkBox1
            // 
            this.checkBox1.AutoSize = true;
            this.checkBox1.CheckAlign = System.Drawing.ContentAlignment.MiddleRight;
            this.checkBox1.Location = new System.Drawing.Point(3, 53);
            this.checkBox1.Name = "checkBox1";
            this.checkBox1.Size = new System.Drawing.Size(124, 17);
            this.checkBox1.TabIndex = 7;
            this.checkBox1.Text = "کلمه عبور ذخیره شود";
            this.checkBox1.UseVisualStyleBackColor = true;
            this.checkBox1.Visible = false;
            this.checkBox1.CheckedChanged += new System.EventHandler(this.checkBox1_CheckedChanged);
            // 
            // tableLayoutPanel2
            // 
            this.tableLayoutPanel2.ColumnCount = 2;
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 66.28352F));
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 33.71648F));
            this.tableLayoutPanel2.Controls.Add(this.captchaTextEdit, 0, 1);
            this.tableLayoutPanel2.Controls.Add(this.captchaLabel, 1, 1);
            this.tableLayoutPanel2.Controls.Add(this.captchaPictureBox, 0, 0);
            this.tableLayoutPanel2.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.tableLayoutPanel2.Location = new System.Drawing.Point(0, 76);
            this.tableLayoutPanel2.Name = "tableLayoutPanel2";
            this.tableLayoutPanel2.RowCount = 2;
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 65.21739F));
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 34.78261F));
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 37F));
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 21F));
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 20F));
            this.tableLayoutPanel2.Size = new System.Drawing.Size(226, 69);
            this.tableLayoutPanel2.TabIndex = 8;
            this.tableLayoutPanel2.Visible = false;
            // 
            // EosLogin
            // 
            this.Controls.Add(this.tableLayoutPanel2);
            this.Controls.Add(this.tableLayoutPanel1);
            this.Name = "EosLogin";
            this.Size = new System.Drawing.Size(226, 145);
            ((System.ComponentModel.ISupportInitialize)(this.usePassTextEdit.Properties)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.captchaPictureBox)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.captchaTextEdit.Properties)).EndInit();
            this.tableLayoutPanel1.ResumeLayout(false);
            this.tableLayoutPanel1.PerformLayout();
            this.tableLayoutPanel2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label1;
        private DevExpress.XtraEditors.TextEdit usePassTextEdit;
        private EosComboBoxEdit userNameComboBox;
        private System.Windows.Forms.Label captchaLabel;
        private System.Windows.Forms.PictureBox captchaPictureBox;
        private DevExpress.XtraEditors.TextEdit captchaTextEdit;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel2;
        private System.Windows.Forms.CheckBox checkBox1;
    }
}
