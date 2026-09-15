using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class PlateDetectedList : EosBaseForm
    {
        public ManualTrafficControlForm myParentForm;
        public PlateDetectedList()
        {
            InitializeComponent();
        }

        private void SetPlate(string plate_)
        {
            try
            {
                myParentForm.SetPlate(plate_);
            }
            catch { }
        }

        private void PlateDetectedList_Load(object sender, EventArgs e)
        {

        }

        private void PlateDetectedList_FormClosed(object sender, FormClosedEventArgs e)
        {
            try
            {
                myParentForm.EnablePlateListButton();
            }
            catch { }

        }
    }
}
