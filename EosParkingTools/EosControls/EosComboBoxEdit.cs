using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.IO;
using System.Text.RegularExpressions;
using System.Globalization;
using EosParking.Core.Helpers;

namespace EosParkingTools.EosControls
{
    public partial class EosComboBoxEdit : ComboBox
    {
        private bool _hasHistoryItems=false;
        private bool _isNeedIgnoreHistory;
        public bool IsNumeric { get; set; }

        public bool ConvertNumberToEnglish { get; set; } = false;

        public bool HasHistoryItems { get => _hasHistoryItems; set { _hasHistoryItems = value; LoadHistory(); } }
        public string HistoryName { get; set; }

        public bool IsNeedIgnoreHistory { get => _isNeedIgnoreHistory; set => _isNeedIgnoreHistory = value; }
        public EosComboBoxEdit()
        {
            InitializeComponent(); 
        }

        //protected override void OnTextChanged(EventArgs e)
        //{
        //    var dot = NumberFormatInfo.CurrentInfo.NumberDecimalSeparator;
        //    string pattern = @"[^-.0-9]|(?<!^)-|(?<=\..*)\.";// String.Format(@"[^\{1}\d\{0}]",".",//NumberFormatInfo.CurrentInfo.NumberDecimalSeparator,NumberFormatInfo.CurrentInfo.NegativeSign);
        //    if (IsNumeric /*&& base.Text.Where(q => q == '.').Count() > 1 && !Regex.IsMatch(base.Text, @"\d+")*/)
        //    {
        //        //var regex = new Regex(@"^[0-9]*(?:\.[0-9]*)?$");
        //        //var m=regex.Match(base.Text);
        //        //if(m.Success)
        //        //{
        //        decimal d = 0;
        //        //decimal.TryParse(/*Regex.Replace(base.Text, pattern, string.Empty)*/Regex.Match(base.Text, @"/^\d*\.?\d*$/", string.Empty).Value, out d);
        //        Text = System.Text.RegularExpressions.Regex.Replace(Text, pattern, string.Empty);

        //        //base.Text = d.ToString(FormatString);
        //        //}
        //        //CultureInfo ci = CultureInfo.CurrentCulture;
        //        //var decimalSeparator = ci.NumberFormat.NumberDecimalSeparator;
        //        //var floatRegex = string.Format(@"[-+]?\d+({0}\d+)?", decimalSeparator);
        //        return;
        //    }
        //    base.OnTextChanged(e);
        //} 
        protected override void OnKeyPress(KeyPressEventArgs e)
        {
            //if (ConvertNumberToEnglish)
               // e.KeyChar = e.KeyChar.ConvertPersianNumberToEnglish();
            if (IsNumeric && !char.IsControl((char)e.KeyChar) && !char.IsDigit((char)e.KeyChar) && ((char)e.KeyChar != '.') && ((char)e.KeyChar != ','))
                e.KeyChar = (char)Keys.None;

            base.OnKeyPress(e);
        }

        protected override void OnTextUpdate(EventArgs e)
        {
            Text = Text.ConvertPersianNumberToEnglish();
            var start = SelectionStart;
            try
            {
                if (!string.IsNullOrEmpty(FormatString) && IsNumeric)
                    Text = double.Parse(Text).ToString(FormatString);
            }
            catch { }
            this.Select(start, 0);
            base.OnTextUpdate(e);
        }

        protected override void OnEnter(EventArgs e)
        {
            base.OnEnter(e);
            LoadHistory();
        }

        private void LoadHistory()
        {
            try
            {
                if (IsNeedIgnoreHistory)
                    return;

                if (!_hasHistoryItems)
                {
                    Items.Clear();
                    return;
                }
                var folder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                if (!folder.EndsWith("\\")) folder += "\\";
                if (string.IsNullOrEmpty(HistoryName))
                {
                    var items = File.ReadAllText(folder + "history.heos").Split('\t').Where(q => !string.IsNullOrEmpty(q)).ToArray();
                    Items.Clear();
                    Items.AddRange(items);
                }
                else
                {
                    var items = File.ReadAllText(folder + HistoryName).Split('\t').Where(q => !string.IsNullOrEmpty(q)).ToArray();
                    Items.Clear();
                    Items.AddRange(items);
                }
            }
            catch { }
        }


        public void SaveHistory()
        {
            try
            {
                if (IsNeedIgnoreHistory)
                    return;

                if (!_hasHistoryItems)
                    return;
                var folder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                if (!folder.EndsWith("\\")) folder += "\\";
                if (string.IsNullOrEmpty(HistoryName))
                {
                    string str = "";
                    foreach (object e in Items)
                    {
                        if (!string.IsNullOrEmpty(e.ToString()))
                            str += e.ToString() + "\t";
                    }
                    File.WriteAllText(folder + "history.heos", str);
                }
                else
                {
                    string str = "";
                    foreach (object e in Items)
                    {
                        str += e.ToString() + "\t";
                    }
                    File.WriteAllText(folder + HistoryName, str);
                }
            }
            catch { }
        }
    }
}
