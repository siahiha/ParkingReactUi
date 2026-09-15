using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.IO;
using EosParking.Core.Helpers;

namespace EosParkingTools.EosControls
{
    public partial class EosLogin : UserControl
    {
        private EventHandler onLoginValidate;
        private bool _isPasswordHeosCorrupt;
        public string UserName { get => userNameComboBox.Text; set => userNameComboBox.Text = value; }
        public string Password { get => usePassTextEdit.Text; }

        public event EventHandler OnLoginValidate { add { onLoginValidate += value; } remove { onLoginValidate += value; } }
        
        public bool IsValid
        {
            get
            {
                try
                {
                    if (!userNameComboBox.Items.Contains(userNameComboBox.Text))
                        userNameComboBox.Items.Add(userNameComboBox.Text);
                }
                catch { }
                return !string.IsNullOrEmpty(userNameComboBox.Text) && !string.IsNullOrEmpty(usePassTextEdit.Text);
            }
        }

        public EosLogin()
        {
            _isPasswordHeosCorrupt = false;
            InitializeComponent();
            SetCaptcha(null);
            initPasswordCheck();
            //Controls.Add(userNameComboBox, 1, 0);
            //if (DesignMode && this.ColumnStyles.Count > 0)
            //{
            //    this.ColumnStyles[0].SizeType = System.Windows.Forms.SizeType.Percent;
            //    this.ColumnStyles[0].Width = 27;
            //    this.ColumnStyles[1].SizeType = System.Windows.Forms.SizeType.Percent;
            //    this.ColumnStyles[1].Width = 73;
            //}
            if (userNameComboBox.HasHistoryItems)
                userNameComboBox.DataSource=LoadUsers();

        }
        protected override void OnEnter(EventArgs e)
        {
            base.OnEnter(e);
        }
        private void userNameComboBox_Validated(object sender, EventArgs e)
        {
            //userNameComboBox.Items.Add(userNameComboBox.Text);
        }

        public void SetCaptcha(Bitmap bitmap)
        {
            //this.RowStyles[2].Height = bitmap != null?30:0;
            //this.RowStyles[3].Height = bitmap != null?25:0;
            //RowCount = bitmap != null ? 4 : 2;
            tableLayoutPanel1.Top = bitmap != null?3:30;
            tableLayoutPanel2.Visible = bitmap != null;
            captchaPictureBox.Image = bitmap;
            captchaPictureBox.Visible = bitmap!=null;
            captchaTextEdit.Visible = bitmap != null;
            captchaLabel.Visible = bitmap != null;
        }

        private string LoadPassword(string user)
        {
            try
            {
                var folder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                if (!folder.EndsWith("\\")) folder += "\\";
                if (File.Exists(folder + "passwords.heos"))
                {
                    var items = File.ReadAllText(folder + "passwords.heos").Split('\t');
                    if (!items.Where(q => q == "#check:false" || q == "#check:true").Any())
                        return "";
                    if (items.Where(q => q == "#check:false").Any())
                        return "";
                    var selectCase = items.Where(q => !string.IsNullOrEmpty(q) && q.Split(':')[0] == user.ToLower()).Select(q => new KeyValuePair<string, string>(q.Split(':')[0], q.Split(':').Length > 1 ? q.Split(':')[1] : ""));
                    if (selectCase.Any())
                        return selectCase.FirstOrDefault().Value.Decrypt();

                }
            }
            catch { }
            return "";
        }

        private List<string> LoadUsers()
        {
            try
            {
                var folder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                if (!folder.EndsWith("\\")) folder += "\\";
                if (File.Exists(folder + "passwords.heos"))
                {
                    var items = File.ReadAllText(folder + "passwords.heos").Split('\t');
                    if (!items.Where(q => (q == "#check:false" || q == "#check:true")).Any())
                        return new List<string>();
                    if (items.Where(q => q.StartsWith("\0")).Any())
                    {
                        _isPasswordHeosCorrupt = true;
                        return new List<string>();
                    }
                    var selectCase = items.Where(q => !string.IsNullOrEmpty(q) && !q.StartsWith("#check")).Select(q => q.Split(':')[0]);
                    return selectCase.ToList();
                }
            }
            catch { }
            return new List<string>();
        }

        private void SavePasswordCheck(bool value)
        {
            try
            {
                var folder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                if (!folder.EndsWith("\\")) folder += "\\";
                if (File.Exists(folder + "passwords.heos"))
                {
                    var items = File.ReadAllText(folder + "passwords.heos").Replace("#check:true", "").Replace("#check:false", "");
                    //items.Replace("check:true","") || items.Contains("check:false"))
                    items = "#check:" + (value ? "true" : "false") + '\t'.ToString() + items;
                    File.WriteAllText(folder + "passwords.heos", items);
                }
            }
            catch { }
        }
        private void initPasswordCheck()
        {
            try
            {
                var folder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                if (!folder.EndsWith("\\")) folder += "\\";
                if (File.Exists(folder + "passwords.heos"))
                {
                    var items = File.ReadAllText(folder + "passwords.heos");
                    checkBox1.Checked = items.Contains("#check:true");
                    return;
                }
            }
            catch { }
            checkBox1.Checked = false;
        }

        public void SavePassword() { SavePassword(userNameComboBox.Text, usePassTextEdit.Text); SavePasswordCheck(checkBox1.Checked); }
        private void SavePassword(string user, string password)
        {
            //if (!checkBox1.Checked)
            //    return;
            var folder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            if (!folder.EndsWith("\\")) folder += "\\";
            if (!File.Exists(folder + "passwords.heos"))
            {
                File.WriteAllText(folder + "passwords.heos",  user + ":" + password.Encrypt() );
                return;
            }
            if (_isPasswordHeosCorrupt && File.Exists(folder + "passwords.heos"))
            {
                using(FileStream fs = File.Open(folder + "passwords.heos", FileMode.OpenOrCreate, FileAccess.ReadWrite))
                {
                    lock (fs)
                    {
                        fs.SetLength(0);
                    }
                }

                File.WriteAllText(folder + "passwords.heos", user + ":" + password.Encrypt());
                _isPasswordHeosCorrupt = false;
            }
            var items = File.ReadAllText(folder + "passwords.heos").Split('\t').Select(q => new KeyValuePair<string, string>(q.Split(':')[0], q.Split(':').Length > 1 ? q.Split(':')[1] : "" ));
            if(!items.Where(q=>q.Key.ToLower()==user.ToLower()).Any())
            {
                File.AppendAllText(folder + "passwords.heos",  user+":"+password.Encrypt());
                return;
            }
            var item = items.Where(q => q.Key.ToLower() == user.ToLower()).FirstOrDefault();
            item = new KeyValuePair<string, string>(user, password.Encrypt());
            string str = "";
            foreach (KeyValuePair<string,string> e in items.Where(q=>!string.IsNullOrEmpty(q.Key)))
            {
                if (!string.IsNullOrEmpty(e.ToString()))
                    str += e.Key+":"+e.Value + "\t";
            }
            File.WriteAllText(folder + "passwords.heos", str);

        }

        private void usePassTextEdit_TextChanged(object sender, EventArgs e)
        {

        }

        private void userNameComboBox_TextChanged(object sender, EventArgs e)
        {
            try
            {
                var pass = LoadPassword(userNameComboBox.Text);
                if (!string.IsNullOrEmpty(pass))
                {
                    usePassTextEdit.Tag = usePassTextEdit.Text;
                    usePassTextEdit.Text = pass;
                }
                else
                {
                    if (string.IsNullOrEmpty(pass) && !string.IsNullOrEmpty(usePassTextEdit.Tag as string))
                    {
                        usePassTextEdit.Text = usePassTextEdit.Tag as string;
                        usePassTextEdit.Tag = "";
                    }
                }
            }
            catch { }
        }

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {
        }

        private void captchaTextEdit_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (e.KeyChar == (char)Keys.Enter)
            {
                if (onLoginValidate != null)
                    onLoginValidate(this, new EventArgs());
            }
        }

        private void userNameComboBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (e.KeyChar == (char)Keys.Enter)
            {
                usePassTextEdit.Focus();
            }
        }

        private void userNameComboBox_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                usePassTextEdit.Focus();
            }
        }
    }
}
