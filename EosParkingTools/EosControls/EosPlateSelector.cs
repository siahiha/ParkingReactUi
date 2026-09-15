using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using DevExpress.XtraEditors;
using EosParking.Core.Helpers;
using EosParking.Core.Enums;
using DevExpress.XtraGrid.Views.Grid;
using EosParking.Data.EF.Entities;

namespace EosParkingTools.EosControls
{
    public partial class EosPlateSelector : UserControl
    {
        private List<CarEntity> _plates = new List<CarEntity>();
        private CarEntity _selectedPlate;
        private EventHandler _clickOkButton;
        private EventHandler _clickCancelButton;
        private List<CarColorEntity> _carColors;
        private List<CarModelEntity> _carModels;

        [Browsable(false)]
        public CarEntity SelectedPlate { get => _selectedPlate; }
        [Browsable(false)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public List<CarEntity> Plates { get => _plates; set { _plates = value; SetPlates(); } }

        public event EventHandler ClickOkButton { add => _clickOkButton += value; remove => _clickOkButton -= value; }
        public event EventHandler ClickCancelButton { add => _clickCancelButton += value; remove => _clickCancelButton -= value; }

        protected override void OnEnter(EventArgs e)
        {
            base.OnEnter(e);
            gridView1.Focus();
        }

        protected override void OnGotFocus(EventArgs e)
        {
            base.OnGotFocus(e);
            gridView1.Focus();
        }
        public List<CarColorEntity> CarColors
        {
            get => _carColors;
            set
            {
                _carColors = value;
                if (_carColors == null || _carColors.Count == 0)
                    return;
                carColorTextBox.TextBoxObject.AutoCompleteMode = AutoCompleteMode.Suggest;
                carColorTextBox.TextBoxObject.AutoCompleteSource=AutoCompleteSource.ListItems;
                carColorTextBox.TextBoxObject.DropDownStyle = ComboBoxStyle.DropDown;
                carColorTextBox.TextBoxObject.SelectedValue = "Id";
                carColorTextBox.TextBoxObject.DisplayMember= "Title";
                carColorTextBox.TextBoxObject.DataSource = _carColors;
                var cSource = new AutoCompleteStringCollection();
                cSource.AddRange(_carColors.Select(q => q.Title).ToArray());
                carColorTextBox.TextBoxObject.AutoCompleteCustomSource = cSource;
            }
        }

        public List<CarModelEntity> CarModels
        {
            get => _carModels;
            set
            {
                _carModels = value;
                if (_carModels == null || _carModels.Count == 0)
                    return;
                //carModelTextBox.TextBoxObject.SelectedValue = "Id";
                //carModelTextBox.TextBoxObject.DisplayMember = "Title";
                //carModelTextBox.TextBoxObject.DataSource = _carModels;
                //carModelTextBox.TextBoxObject.AutoCompleteMode = AutoCompleteMode.Suggest;
                var cSource = new AutoCompleteStringCollection();
                cSource.AddRange(_carModels.Select(q => q.Title).ToArray());
                //carModelTextBox.TextBoxObject.AutoCompleteCustomSource = cSource;
                //carModelTextBox.TextBoxObject.AutoCompleteSource = AutoCompleteSource.CustomSource;

                //carModelTextBox.TextBoxObject.DropDownStyle = ComboBoxStyle.DropDown;

                carModelTextBox.TextBoxObject.AutoCompleteMode = AutoCompleteMode.Suggest;
                carModelTextBox.TextBoxObject.AutoCompleteSource = AutoCompleteSource.ListItems;
                carModelTextBox.TextBoxObject.DropDownStyle = ComboBoxStyle.DropDown;
                carModelTextBox.TextBoxObject.SelectedValue = "Id";
                carModelTextBox.TextBoxObject.DisplayMember = "Title";
                carModelTextBox.TextBoxObject.DataSource = _carModels; 
                carColorTextBox.TextBoxObject.AutoCompleteCustomSource = cSource;
            }
        }


        public void SetRounding(int radius, GraphicsHelper.RectangleCorners rectangleCorners = GraphicsHelper.RectangleCorners.All)
        {
            if (rectangleCorners == GraphicsHelper.RectangleCorners.None || radius == 0)
                Region = null;
            else
                Region = new Region(GraphicsHelper.CreateRoundRectangle(ClientRectangle, radius, GraphicsHelper.RectangleCorners.All));
            Refresh();
        }

        private void SetPlates()
        {
            try
            {

                if (Controls == null || _plates == null)
                {
                    NewPlateClick();
                    return;
                }
                CancelButton();
                foreach (Control c in selectPanel.Controls)
                    c.Visible = !(c is SimpleButton);
                //foreach (Control c in panel3.Controls)
                //{
                //    if (c.TabIndex <= _plates.Count)
                //    {
                //        c.Text = c.TabIndex.ToString() + "-     " + SmsHelper.PlateFormat(_plates[c.TabIndex - 1]);
                //        c.Visible = true;
                //    }
                //}
                carGridControl.DataSource = _plates.ToList(); 
                if (_plates.Count == 0)
                    newPlateButton1_Click(this, new EventArgs());
                Height = panel1.Bottom;
                SelectPlate(0);
            }
            catch { }
            //eosLabel3.Text ="-"+ (_plates.Count+1).ToString();
            // SetRounding(15);
        }

        public string CurrentPlate { get; set; }
        public EosPlateSelector()
        {
            InitializeComponent();
            this.AutoSize = !DesignMode;
        }

        private void simpleButton10_Click(object sender, EventArgs e)
        {
            SelectPlate((sender as Control).TabIndex - 1);
        }

        private void simpleButton1_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (char.IsDigit(e.KeyChar))
                SelectPlate(int.Parse(e.KeyChar.ToString()));
            else if (e.KeyChar == (char)Keys.Escape)
                cancelButton_Click(this, new EventArgs());
            else if (e.KeyChar == (char)Keys.Enter)
                if (sender != cancelButton)
                    okButton.Focus();
        }
        private void simpleButton1_KeyUp(object sender, KeyEventArgs e)
        {
            //if (char.IsDigit((char)e.KeyValue))
            //    SelectPlate(int.Parse(((char)e.KeyValue).ToString())-1);
            //else 
            if (e.KeyData == Keys.Escape)
            {
                cancelButton_Click(this, new EventArgs());
            }
            else if (e.KeyData == Keys.Enter)
                if (sender != cancelButton)
                    okButton.Focus();


        }
        protected override void OnKeyUp(KeyEventArgs e)
        {
            base.OnKeyUp(e);

            if (char.IsDigit((char)e.KeyData))
                SelectPlate(int.Parse(((char)e.KeyData).ToString()) - 1);
            else if (e.KeyData == Keys.Escape)
                cancelButton_Click(this, new EventArgs());
            else if (e.KeyData == Keys.Enter)
                cancelButton.Focus();
        }

        private void SelectPlate(int index)
        {
            try
            {
                //if (index >= 0 && index < _plates.Count)
                //    _selectedPlate = _plates[index];
                //else if (index > 0)
                //    //_selectedPlate = eosPlateControl1.Plate;
                //    eosPlateControl1.Focus();
                //foreach (Control c in panel3.Controls)
                //    if (c is SimpleButton)
                //    {
                //        if (c.TabIndex == index + 1)
                //        {
                //            (c as SimpleButton).BorderStyle = DevExpress.XtraEditors.Controls.BorderStyles.Flat;
                //            c.Focus();
                //        }
                //        else
                //            (c as SimpleButton).BorderStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
                //    }
                //if (index >= _plates.Count)
                //    eosPlateControl1.Focus();
                if (index < _plates.Count)
                {
                    (carGridControl.MainView as GridView).SelectRow(index);
                    (carGridControl.MainView as GridView).FocusedRowHandle = (index);
                    _selectedPlate = _plates[index];
                }
                else
                {
                    (carGridControl.MainView as GridView).SelectRow(_plates.Count - 1);
                    (carGridControl.MainView as GridView).FocusedRowHandle = (_plates.Count - 1);
                    _selectedPlate = _plates[_plates.Count - 1];
                }
            }
            catch(Exception ex  ) { LogHelper.Log(System.Diagnostics.TraceEventType.Error, "SelectPlate " + ex.ToString()); }
        }

        protected override void OnVisibleChanged(EventArgs e)
        {
            if (Visible)
            {

                carGridControl.Focus();
                okButton.Focus();
                gridView1.Focus();
            }
            base.OnVisibleChanged(e);
        }

        protected override void OnKeyPress(KeyPressEventArgs e)
        {
            if (char.IsDigit(e.KeyChar))
                SelectPlate(int.Parse(e.KeyChar.ToString()) - 1);
            else if (e.KeyChar == (char)Keys.Escape)
                cancelButton_Click(this, new EventArgs());
            else if (e.KeyChar == (char)Keys.Enter)
                cancelButton.Focus();

            base.OnKeyPress(e);
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            
            if (newPanel.Visible)
            {
                _selectedPlate = new CarEntity
                {
                    Id = 0,
                    CarColorId = long.Parse((carColorTextBox.TextBoxObject.SelectedValue != null ? (carColorTextBox.TextBoxObject.SelectedValue as CarColorEntity).Id.ToString() : "0")),
                    DtoViewCarColorTitle = carColorTextBox.Text,
                    Name=carNameTextBox.Text,
                    DtoViewCarModelTitle= carModelTextBox.Text,
                    CarType = eosPlateControl1.CarType,
                    Plate = eosPlateControl1.Plate
                };
                clearNew();
                newPanel.Hide();
            }
            else
            {
                _selectedPlate = _plates[gridView1.GetFocusedDataSourceRowIndex()];
            }
            if (_clickOkButton != null)
                _clickOkButton(sender, e);
        }

        void clearNew()
        {
            eosPlateControl1.Clear();
            carNameTextBox.Text = "";
            carModelTextBox.Text = "";
            carColorTextBox.Text = "";

        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            CancelButton(); 
            if (_clickCancelButton != null)
                _clickCancelButton(sender, e);
        }

        public void CancelButton()
        {
            if (newPanel.Visible)
            {
                selectPanel.Show();
                newPanel.Hide();
                clearNew();
                return;
            } 
        }

        private void eosPlateControl1_Validated(object sender, EventArgs e)
        {
            carNameTextBox.Focus();
        }

        private void panel3_PreviewKeyDown(object sender, PreviewKeyDownEventArgs e)
        {
            if (char.IsDigit((char)e.KeyValue))
                SelectPlate(int.Parse(((char)e.KeyValue).ToString()) - 1);
            else if (e.KeyData == Keys.Escape)
                cancelButton_Click(this, new EventArgs());
            else if (e.KeyData == Keys.Enter)
                if (sender != cancelButton)
                    okButton.Focus();
        }

        private void eosPlateControl1_Validated_1(object sender, EventArgs e)
        {
            //_selectedPlate = eosPlateControl1.Plate;


            if (!eosPlateControl1.IsValid)
            {
                //MessageShowError("پلاک معتبر نمی باشد");
                eosPlateControl1.Focus();
                return;
            }
            okButton.Focus();
        }

        private void newPlateButton1_Click(object sender, EventArgs e)
        {
            NewPlateClick();
        }

        public void NewPlateClick()
        {
            selectPanel.Hide();
            newPanel.Show();
        }

        private void gridView1_CustomDrawCell(object sender, DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs e)
        {
            if (e.Column == gridColumn1)
                e.DisplayText = SmsHelper.PlateFormat(e.CellValue as string);
        }
    }
}
