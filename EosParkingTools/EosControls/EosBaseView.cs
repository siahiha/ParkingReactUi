using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParking.Data.EF;
using EosParkingTools.Interfaces;

namespace EosParkingTools.EosControls
{
    public  partial class EosBaseView : UserControl
    {
        
        public EosBaseView()
        {
            InitializeComponent();
        }

        public bool ShowCaption { get { return label1.Visible; } set { label1.Visible = value; } }

        public override string Text
        {
            get => base.Text;
            set {
                base.Text = value;
                label1.Text = value;
                if (Parent != null)
                this.Parent.Text = Text;
            }
        }


        internal void InitializeParent()
        {
            if (Parent == null)
                return;
            this.Parent.Text = Text;

        }
         
    }
}
