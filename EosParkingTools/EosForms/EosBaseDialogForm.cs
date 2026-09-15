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
    public partial class EosBaseDialogForm : EosBaseForm
    {
        public EosBaseDialogForm()
        {
            InitializeComponent();
        }

        public virtual bool IsValid { get; }

    }
}
