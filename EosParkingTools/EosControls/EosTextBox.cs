using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using DevExpress.XtraEditors;
using System.Collections;

namespace EosParkingTools.EosControls
{

    public partial class EosTextBox : UserControl
    {
        private DockStyle labelAlign = DockStyle.Left;
        private EventHandler _textValueChanged;
        private EventHandler _selectedValueChanged;
        private EventHandler _selectedIndexChanged;
        private EventHandler _dropDown;
        private bool _enterKeyTap = true;
        private List<TagDisplay> _autoCompleteDataSource;
        private object _mainReferenceAutoCompleteDataSource;

        public string FormatString { get { return eosComboBoxEdit.FormatString; } set { eosComboBoxEdit.FormatString = value; } }

        //public AutoCompleteMode ComboAutoCompleteMode { get => eosComboBoxEdit.AutoCompleteMode; set; }
        public DockStyle LabelAlign { get => labelAlign; set { labelAlign = value; OnLabelAlign(); } }
        public int MaxLength { get => eosComboBoxEdit.MaxLength; set => eosComboBoxEdit.MaxLength = value == 0 ? eosComboBoxEdit.MaxLength : value; }
        //[DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public Label LabelObject { get => label1; set { label1 = value; OnChangeLable(); } }

        //[DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        [Browsable(true)]
        public virtual EosComboBoxEdit TextBoxObject { get => eosComboBoxEdit; set { eosComboBoxEdit = value; /*eosComboBoxEdit.Dock = DockStyle.Fill; eosComboBoxEdit.DropDownStyle = ComboBoxStyle.Simple;*/ } }
        
        public bool ConvertNumberToEnglish { get => eosComboBoxEdit.ConvertNumberToEnglish; set => eosComboBoxEdit.ConvertNumberToEnglish = value; }
        public AutoCompleteStringCollection AutoCompleteCustomSource { get => eosComboBoxEdit.AutoCompleteCustomSource; set => eosComboBoxEdit.AutoCompleteCustomSource = value; }
        public AutoCompleteMode AutoCompleteMode { get => eosComboBoxEdit.AutoCompleteMode; set => eosComboBoxEdit.AutoCompleteMode = value; }

        [Browsable(true)]
        public bool UsedAutoCompleteContainMode { get; set; }
        public ComboBoxStyle DropDownStyle { get => eosComboBoxEdit.DropDownStyle; set => eosComboBoxEdit.DropDownStyle = value; }
        public bool EnterKeyTap { get => _enterKeyTap; set => _enterKeyTap = value; }

        public bool IsNumeric { get { return eosComboBoxEdit.IsNumeric; } set { eosComboBoxEdit.IsNumeric = value; eosComboBoxEdit.MaxLength = 100; } }

        public string Label { get => label1.Text; set { label1.Text = value; label1.AutoSize = true; OnLabelAlign(); } }
        
        protected override void OnRightToLeftChanged(EventArgs e)
        {
            base.OnRightToLeftChanged(e);
            foreach (Control c in Controls)
                c.RightToLeft = RightToLeft;
        }

        public event EventHandler SelectedIndexChanged { add { _selectedIndexChanged += value; } remove { _selectedIndexChanged -= value; } }
        public event EventHandler SelectedValueChanged { add { _selectedValueChanged += value; } remove { _selectedValueChanged -= value; } }
        public event EventHandler DropDown { add { _dropDown += value; } remove { _dropDown -= value; } }
        [Browsable(true)]
        public event EventHandler TextValueChanged { add { _textValueChanged += value; } remove { _textValueChanged -= value; } }

        public override ISite Site { get => base.Site; set { base.Site = value; eosComboBoxEdit.Name = "Combo" + base.Name; label1.Name = "label" + base.Name; } }
        
        [Browsable(false)]
        public object AutoCompleteSelectedItem { get => (eosComboBoxEdit?.SelectedItem as TagDisplay)?.Tag; }

        [Browsable(false)]
        public object AutoCompleteDataSource
        {
            set
            {
                try
                {
                    _mainReferenceAutoCompleteDataSource = value;
                    RefreshAutoCompleteDataSource();
                }
                catch { }
            }
            get
            {
                //return _autoMainCompleteDataSource;
                return (object)_autoCompleteDataSource?.Select(q => q.Tag);
            }
        }

        private void RefreshAutoCompleteDataSource()
        {
            try
            {
                var records = (IEnumerable)_mainReferenceAutoCompleteDataSource;
                if (records != null)
                {
                    eosComboBoxEdit.Items.Clear();
                    _autoCompleteDataSource = new List<TagDisplay>();
                    foreach (var item in records)
                    {
                        _autoCompleteDataSource.Add(new TagDisplay() { ItemDisplay = item.ToString(), Tag = item });
                    }
                    //_autoMainCompleteDataSource = records;
                    eosComboBoxEdit.Items.AddRange(_autoCompleteDataSource.ToArray());
                }
            }
            catch { }
            
        }
        protected override void OnTextChanged(EventArgs e)
        {
            base.OnTextChanged(e);
            eosComboBoxEdit.Name = Name + "ComboBox";
        }

        public override void Refresh()
        {
            base.Refresh();

            if (UsedAutoCompleteContainMode)
                RefreshAutoCompleteDataSource();
        }
        public override AnchorStyles Anchor { get => base.Anchor; set => base.Anchor = value; }

        public EosTextBox()
        {
            InitializeComponent();
            if (eosComboBoxEdit.IsNumeric)
                eosComboBoxEdit.MaxLength = 100;
            else
                eosComboBoxEdit.MaxLength = 500;
        }

        public virtual void OnChangeLable()
        {
            label1.Visible = string.IsNullOrEmpty(label1.Text);
        }
        protected override void OnResize(EventArgs e)
        {
            if (Height != eosComboBoxEdit.Height + (labelAlign == DockStyle.Top || labelAlign == DockStyle.Bottom ? label1.Height : 0))
                Height = eosComboBoxEdit.Height + (labelAlign == DockStyle.Top || labelAlign == DockStyle.Bottom ? label1.Height : 0);
            base.OnResize(e);
        }
        public virtual void OnLabelAlign()
        {

            switch (LabelAlign)
            {
                case DockStyle.Left:
                    label1.Dock = DockStyle.Left;
                    break;
                case DockStyle.Right:
                    label1.Dock = DockStyle.Right;
                    break;
                case DockStyle.Top:
                    label1.Dock = DockStyle.Top;
                    break;
                case DockStyle.Bottom:
                    label1.Dock = DockStyle.Bottom;
                    break;
                case DockStyle.None:
                    label1.Visible = false;
                    break;
            }

        }

        public override string Text
        {
            get => eosComboBoxEdit.Text;
            set
            {
                eosComboBoxEdit.Text = value;
                if (IsNumeric)
                {
                    try
                    {
                        var dot = System.Globalization.NumberFormatInfo.CurrentInfo.NumberDecimalSeparator;
                        decimal dvalue = 0;
                        decimal.TryParse(Text.Replace(".", dot).Replace(",", "").Replace("/", dot), out dvalue);
                        eosComboBoxEdit.Text = dvalue.ToString(FormatString);
                    }
                    catch { }
                }
            }
        }

        [Browsable(false)]
        public int IntValue
        {
            get
            {
                var dot = System.Globalization.NumberFormatInfo.CurrentInfo.NumberDecimalSeparator;
                int value = 0;
                int.TryParse(Text.Replace(".", dot).Replace(",", "").Replace("/", dot), out value);
                return value;
            }
        }

        [Browsable(false)]
        public long LongValue
        {
            get
            {
                var dot = System.Globalization.NumberFormatInfo.CurrentInfo.NumberDecimalSeparator;
                decimal value = 0;
                decimal.TryParse(Text.Replace(".", dot).Replace(",", "").Replace("/", dot), out value);
                return (long)value;
            }
        }
        [Browsable(false)]
        public TimeSpan TimeValue
        {
            get
            {
                TimeSpan res;
                TimeSpan.TryParse(eosComboBoxEdit.Text, out res);
                return res;
            }
        }

        [Browsable(false)]
        public decimal DecimalValue
        {
            get
            {
                var dot = System.Globalization.NumberFormatInfo.CurrentInfo.NumberDecimalSeparator;
                decimal value = 0;
                decimal.TryParse(Text.Replace(".", dot).Replace(",", "").Replace("/", dot), out value);
                return value;
            }
        }

        [Browsable(false)]
        public double doubleValue
        {
            get
            {
                var dot = System.Globalization.NumberFormatInfo.CurrentInfo.NumberDecimalSeparator;
                double res = 0;
                double.TryParse(Text.Replace(".", dot).Replace(",", "").Replace("/", dot), out res);

                return res;
            }
        }


        private void eosComboBoxEdit_TextChanged(object sender, EventArgs e)
        {
            this.OnTextChanged(e);
        }

        private void eosComboBoxEdit_SelectedValueChanged(object sender, EventArgs e)
        {
            if (_selectedValueChanged != null)
                _selectedValueChanged(this, e);
        }

        private void eosComboBoxEdit_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (_selectedIndexChanged != null)
                _selectedIndexChanged(this, e);
        }

        private void eosComboBoxEdit_DropDown(object sender, EventArgs e)
        {
            if (_dropDown != null)
                _dropDown(this, e);
        }

        private void eosComboBoxEdit_Validated(object sender, EventArgs e)
        {
            // this.OnValidated(e);
            //Validate();

            if (IsNumeric)
            {
                var dot = System.Globalization.NumberFormatInfo.CurrentInfo.NumberDecimalSeparator;
                decimal value = 0;
                decimal.TryParse(Text.Replace(".", dot).Replace(",", "").Replace("/", dot), out value);
                Text = value.ToString(FormatString);
            }
        }

        private void eosComboBoxEdit_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter && EnterKeyTap)
                SendKeys.Send("{Tab}");
            base.OnKeyUp(e);
        }


        //protected override void OnKeyDown(KeyEventArgs e)
        //{
        //    if (IsNummeric && !char.IsControl((char)e.KeyCode) && char.IsDigit((char)e.KeyCode) && ((char)e.KeyCode != '.') && ((char)e.KeyCode != ','))
        //    {
        //        e.Handled = true;
        //    }

        //    //// If you want, you can allow decimal (float) numbers
        //    //if ((e.KeyChar == '.') && ((sender as TextBox).Text.IndexOf('.') > -1))
        //    //{
        //    //    e.Handled = true;
        //    //}
        //    base.OnKeyDown(e);
        //}
        public new void Validate()
        {
            OnValidated(new EventArgs());
        }

        private void eosComboBoxEdit_KeyDown(object sender, KeyEventArgs e)
        {
            //if (IsNummeric && !char.IsControl((char)e.KeyCode) && char.IsDigit((char)e.KeyCode) && ((char)e.KeyCode != '.') && ((char)e.KeyCode != ','))
            //{
            //    e.Handled = true;
            //}
            //else
            //    e.Handled = false;
        }

        private void eosComboBoxEdit_TextChanged_1(object sender, EventArgs e)
        {
            if (_textValueChanged != null)
                _textValueChanged(sender, e);
        }

        private void eosComboBoxEdit_TextUpdate(object sender, EventArgs e)
        {
            try
            {
                if (UsedAutoCompleteContainMode)
                {
                    eosComboBoxEdit.Items.Clear();


                    //var newItems = _autoCompleteDataSource?.Where(q => q.ToString().Contains(Text) || String.IsNullOrEmpty(Text))?.ToArray();
                    var newItems = _autoCompleteDataSource?.Where(q => q.ItemDisplay.Contains(Text) || String.IsNullOrEmpty(Text))?.ToArray();


                    if (newItems == null)
                        return;

                    eosComboBoxEdit.Items.AddRange(newItems);
                    this.eosComboBoxEdit.SelectionStart = this.eosComboBoxEdit.Text.Length;
                    Cursor = Cursors.Default;
                    eosComboBoxEdit.DroppedDown = true;
                }
            }
            catch { }
        }
    }

    class TagDisplay
    {
        public string ItemDisplay { get; set; }
        public object Tag { get; set; }

        public override string ToString()
        {
            return ItemDisplay;
        }
    }

}
