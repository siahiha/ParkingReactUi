using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DeviceHeartRate.Forms.Controls
{
    public partial class TrafficView : UserControl
    {
        public TrafficView()
        {
            InitializeComponent();
        }
        public string Plate
        {
            get
            {
                return labelPlate1.Text;

            }
            set
            {
                if (!String.IsNullOrEmpty(value.Trim()))
                {
                    var s3Num = value.Substring(value.Length - 5, 3);
                    var sIran = value.Substring(value.Length - 2, 2);
                    var s2Num = value.Substring(0, 2);
                    var sAlphabet = value.Remove(value.Length - 5).Remove(0, 2);

                    labelPlate1.Text = s2Num;
                    label1.Text = sAlphabet;
                    label2.Text = s3Num;

                    labelPlate2.Text = sIran;


                    /*
                    leftTextEdit.Text = plate.Substring(0, 2);
                    rightTextEdit.Text = plate.Substring(plate.Length - 2, 2);
                    middleTextEdit.Text = plate.Substring(plate.Length - 5, 3);
                    typeComboBox.Text = plate.Remove(plate.Length - 5).Remove(0, 2);
                    */


                }
                else
                {
                    labelPlate1.Text = "";
                    labelPlate2.Text = "";
                }
            }
        }
        public string TrafficTime
        {
            get
            {
                return labelTrafficTime.Text;

            }
            set
            {
                labelTrafficTime.Text = value;
            }
        }

        public string TrafficType
        {
            get
            {
                return label3.Text;

            }
            set
            {
                label3.Text = value;
            }
        }
        
        
        private void labelTrafficTime_Click(object sender, EventArgs e)
        {

        }
    }
}
