using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using DevExpress.XtraEditors;
using System.Drawing.Design;
using EosParkingTools.Utils;

namespace EosParkingTools.EosControls
{
    public partial class EosEntityModifyToolsControl : UserControl
    {
        private EventHandler editButtonClick;
        private EventHandler newButtonClick;
        private EventHandler deleteButtonClick;
        private EosEntityModifyToolsControlButtons buttonsVisibility = EosEntityModifyToolsControlButtons.All;

        public event EventHandler ClickNewButton { add { newButtonClick+=value; } remove { newButtonClick -= value; } }
        public event EventHandler ClickEditButton { add { editButtonClick += value; } remove { editButtonClick -= value; } }
        public event EventHandler ClickDeleteButton { add { deleteButtonClick += value; } remove { deleteButtonClick -= value; } }

        [Editor(typeof(FlagEnumUIEditor), typeof(UITypeEditor))]
        [DefaultValue(EosEntityModifyToolsControlButtons.All)]
        public EosEntityModifyToolsControlButtons ButtonsVisibility { get => buttonsVisibility;
            set {
                buttonsVisibility = value;
                newButton.Visible = ((int)ButtonsVisibility & (int)EosEntityModifyToolsControlButtons.Add) == (int)EosEntityModifyToolsControlButtons.Add;
                editButton.Visible = ((int)ButtonsVisibility & (int)EosEntityModifyToolsControlButtons.Edit) == (int)EosEntityModifyToolsControlButtons.Edit;
                deleteButton.Visible = ((int)ButtonsVisibility & (int)EosEntityModifyToolsControlButtons.Delete) == (int)EosEntityModifyToolsControlButtons.Delete;
            }
        }
        public EosEntityModifyToolsControl()
        {
            InitializeComponent();
        }

        private void Button_Click(object sender, EventArgs e)
        {
            if ((sender as SimpleButton).Name == "newButton" && newButtonClick != null)
                newButtonClick(sender, e);
            else if ((sender as SimpleButton).Name == "editButton" && editButtonClick != null)
                editButtonClick(sender, e);
            else if ((sender as SimpleButton).Name == "deleteButton" && deleteButtonClick != null)
                deleteButtonClick(sender, e);


        }
    }

    public enum EosEntityModifyToolsControlButtons
    {
        All=0xffff,Add=2,Edit=4,Delete=8
    }



}
