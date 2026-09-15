using EosParking.Core.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace EosParkingTools.EosForms
{
    public partial class EosControlListDialogForm : EosBaseDialogForm
    {
        private ControlListTypes _controlListType;

        public ControlListTypes ControlListType { get => _controlListType; set => _controlListType = value; }
        public EosControlListDialogForm(ControlListTypes controlListType, string description)
        {
            InitializeComponent();
            //okButton.Location = new Point(123,28);
            textBox1.Text = "بدون شرح";
            _controlListType = controlListType;
            ChangeControlListType();
            if (!string.IsNullOrEmpty(description))
                textBox1.Text = description;
            textBox1.ReadOnly = true;
        }

        private void ChangeControlListType()
        {
            if(_controlListType==ControlListTypes.Black)
            {
                panelControl1.BackColor = Color.Black;
                panelControl1.ForeColor = Color.White;
                eosLabel1.Text = "این خودرو در لیست سیاه قرار دارد";
            }
            else if(_controlListType == ControlListTypes.Stealing)
            {
                eosLabel1.Text = "این خودرو سرقتی می باشد";
                panelControl1.BackColor = Color.Maroon;
                panelControl1.ForeColor = Color.White;
            }
            else if (_controlListType == ControlListTypes.Observation)
            {
                eosLabel1.Text = "این خودرو در لیست رصد قرار دارد";
                panelControl1.BackColor = Color.Yellow;
                panelControl1.ForeColor = Color.Black;
            }
            panelControl1.Appearance.Options.UseBackColor = true;
            panelControl1.Appearance.Options.UseForeColor = true;
        }

        public static DialogResult ShowControlDialog(ControlListTypes controlListType, string description)
        {
            using (var frm = new EosControlListDialogForm(controlListType, description))
                return frm.ShowDialog();
        }
    }
}
