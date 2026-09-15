using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms; 

namespace EosParkingTools.EosControls
{
    public partial class EosDateTimePicker : UserControl
    {
        public EosDateTimePicker()
        {
            InitializeComponent();
            ChangeTimePicker();
        }

        private DockStyle labelAlign = DockStyle.Left;
        private bool _timeSecondShown=false;
        private bool _timeShown=false;

        //private string FormatString { get { return dateTimeSelector1.FormatString; } set { eosComboBoxEdit.FormatString = value; } }

        //public AutoCompleteMode ComboAutoCompleteMode { get => eosComboBoxEdit.AutoCompleteMode; set; }
        public DockStyle LabelAlign { get => labelAlign; set { labelAlign = value; OnLabelAlign(); } }

        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public Label LabelObject { get => label1; set { label1 = value; OnChangeLable(); } }

        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public virtual EosSolarDateTimePicker.EosDateTimePicker TextBoxObject { get => dateTimeSelector1; set { dateTimeSelector1 = value;  /*eosComboBoxEdit.Dock = DockStyle.Fill; eosComboBoxEdit.DropDownStyle = ComboBoxStyle.Simple;*/ } }

        public string Label { get => label1.Text; set { label1.Text = value; label1.AutoSize = true; OnLabelAlign(); } }

        public bool TimePicker { get => _timeShown; set { _timeShown = value; ChangeTimePicker(); } }
        public bool TimePickerSecond { get => _timeSecondShown; set { _timeSecondShown = value; ChangeTimePicker(); } }
        public bool DatePicker { get => dateTimeSelector1.DatePickerShown; set { dateTimeSelector1.DatePickerShown = value; ChangeTimePicker(); } }

        public TimeSpan? TimeValue { get => dateTimeSelector1.TimeValue; set => dateTimeSelector1.TimeValue = value; }

        public DateTime? Value { get => (dateTimeSelector1.MiladiDate?.Date.Add(dateTimeSelector1.TimeValue??new TimeSpan(0,0,0))); set { /*dateTimeSelector1.TimeValue = value?.TimeOfDay??new TimeSpan();*/ if(value.HasValue) dateTimeSelector1.MiladiDate = value.Value; } }

        private void ChangeTimePicker()
        {
            dateTimeSelector1.TimeShown = false;
            // dateTimeSelector1.TimeShown = _timePicker;
            dateTimeSelector1.TimeShown = _timeShown;
            dateTimeSelector1.TimeSecondShown = _timeSecondShown;
            Width = label1.Width + dateTimeSelector1.Width;
        }

        //public DatePic MyProperty { get; set; }
        public virtual void OnChangeLable()
        {
            label1.Visible = string.IsNullOrEmpty(label1.Text);
        }
        protected override void OnResize(EventArgs e)
        {
            if (Height != dateTimeSelector1.Height + (labelAlign == DockStyle.Top || labelAlign == DockStyle.Bottom ? label1.Height : 0))
                Height = dateTimeSelector1.Height + (labelAlign == DockStyle.Top || labelAlign == DockStyle.Bottom ? label1.Height : 0);
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
            ChangeTimePicker();
        }

        public override string Text { get => dateTimeSelector1.Text; set => dateTimeSelector1.Text = value; }
    }
}
