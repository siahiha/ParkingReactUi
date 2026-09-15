using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParking.Core.Helpers;
using DevExpress.XtraEditors;
using EosParking.Core.Enums;
using System.Configuration;

namespace EosParkingTools.EosControls
{
    public partial class EosPlateControl : UserControl
    {
        private int _LeftPart = 0;
        private int _RightPart = 0;
        private int _MiddlePart = 0;
        private int _MotorUpPart = 0;
        private int _MotorDownPart = 0;
        private int _roundRectRadius = 8;
        private Color _borderColor = Color.FromArgb(255, 200, 200, 230);
        private EventHandler _textChanged;
        private Font _plateDetailsFont = new Font("Tahoma", 8);
        private CarTypes _carType;

        private bool _skipMiddlePart = false;// bool.Parse(ConfigurationManager.AppSettings["SkipMiddlePart"]?.ToLower()??"false");
        public bool SkipMiddlePart { get=>_skipMiddlePart; set{ _skipMiddlePart = value; ChangeSkipMidlePart(); } }

        private void ChangeSkipMidlePart()
        {
            if (_skipMiddlePart)
            {
                typeComboBox.Enabled = false;
                typeComboBox.Text = "*";
                //typeComboBox.TabStop = true;
            }
            else
            {
                typeComboBox.Enabled = true;
                typeComboBox.Text = "";
            }
        }

        public CarTypes CarType { get => _carType; set { _carType = value; 
                if (_carType == CarTypes.Motor) 
                    motorButton_Click(this, new EventArgs());
                else 
                    carButton_Click(new SimpleButton() { Tag = (int)_carType }, new EventArgs());
            } }

        private void ChangeCarType()
        {
            //switch(_carType)
            //{
            //    case CarTypes.Car:
            //}
            try
            {
                foreach (Control contrle in panel2.Controls)
                    if (contrle is SimpleButton)
                    {
                        //if ((contrle as SimpleButton).ButtonStyle != DevExpress.XtraEditors.Controls.BorderStyles.NoBorder)
                        //    ChangeColor((Bitmap)(contrle as SimpleButton).ImageOptions.Image, Color.Black);
                        if (((CarTypes)int.Parse(contrle.Tag.ToString())) != _carType)
                            (contrle as SimpleButton).ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
                        else
                            (contrle as SimpleButton).ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.Default;
                    }
                eosLabel12.Text = /*"نوع خودرو: " +*/ _carType.DisplayString();
            }
            catch { }
        }

        bool validatedIsRunning = false;
        protected override void OnValidated(EventArgs e)
        {
            if (validatedIsRunning)
                return;
            //if(IsValid)
            try
            {
                
                    validatedIsRunning = true;
                    base.OnValidated(e);
                
            }
            finally { validatedIsRunning = false; }
            //validatedIsRunning = false;
        }

        public new void Validate()
        {
            OnValidated(new EventArgs());
        }
         
        public int RoundRectRadius { get => _roundRectRadius; set => _roundRectRadius = value; }

        public int LeftPart { get { int.TryParse(leftTextEdit.Text.Trim('_'), out _LeftPart); return _LeftPart; } set => leftTextEdit.Text = value.ToString("#"); }
        public string TypePart { get => typeComboBox.Text.Trim('_'); set => typeComboBox.Text = value; }
        public int RightPart { get { int.TryParse(rightTextEdit.Text.Trim('_'), out _RightPart); return _RightPart; } set => rightTextEdit.Text = value.ToString("#"); }
        public int MiddlePart { get { int.TryParse(middleTextEdit.Text.Trim('_'), out _MiddlePart); return _MiddlePart; } set => middleTextEdit.Text = value.ToString("#"); }

        public int MotorUpPart { get { int.TryParse(motorUpPartTextEdit.Text.Trim('_'), out _MotorUpPart); return _MotorUpPart; } set => motorUpPartTextEdit.Text = value.ToString("#"); }
        public int MotorDownPart { get { int.TryParse(motorDownPartTextEdit.Text.Trim('_'), out _MotorDownPart); return _MotorDownPart; } set => motorDownPartTextEdit.Text = value.ToString("#"); }

        public Font PlateDetailsFont { get => _plateDetailsFont; set { _plateDetailsFont = value; ChangeDetailsFont(); } }

        private void ChangeDetailsFont()
        {
            leftTextEdit.Font = _plateDetailsFont;
            typeComboBox.Font = _plateDetailsFont; ;
            rightTextEdit.Font = _plateDetailsFont;
            middleTextEdit.Font = _plateDetailsFont;
            motorUpPartTextEdit.Font = _plateDetailsFont;
            motorDownPartTextEdit.Font = _plateDetailsFont;

        }

        [Browsable(true)]
        public new event EventHandler TextChanged { add { _textChanged += value; } remove { _textChanged += value; } }


        public string Plate
        {
            get
            {
                try
                {
                    var plate = "";
                    if (motorPanel.Visible)
                    {
                        plate= motorUpPartTextEdit.Text.Trim('_') + motorDownPartTextEdit.Text.Trim('_');
                    }
                    else {
                        plate = leftTextEdit.Text.Trim('_') + 
                            (!string.IsNullOrEmpty(typeComboBox.Text.Trim('_'))?typeComboBox.Text.Trim('_'):(_skipMiddlePart?"*":""))
                            + middleTextEdit.Text.Trim('_') + rightTextEdit.Text.Trim('_');
                    }
                    return SmsHelper.ConvertPersianNumberToEnglish(plate);
                }
                catch { return null; }
            }
            set
            {
                if (value == null || value.Replace("-", "").Replace(" ", "").Length < 8)
                {
                    Clear();
                    return;
                }
                long platInt = 0;
                var plate =value.Replace("-", "").Replace(" ", "").ConvertPersianNumberToEnglish();
                if (long.TryParse(plate, out platInt))
                {
                    motorUpPartTextEdit.Text = plate.Substring(0, 3);
                    motorDownPartTextEdit.Text = plate.Substring(3);
                    motorButton_Click(motorButton, new EventArgs());
                }
                else
                {
                    leftTextEdit.Text = plate.Substring(0, 2);
                    rightTextEdit.Text = plate.Substring(plate.Length - 2, 2);
                    middleTextEdit.Text = plate.Substring(plate.Length - 5, 3);
                    typeComboBox.Text = plate.Remove(plate.Length - 5).Remove(0, 2);
                    ////carButton_Click(carButton, new EventArgs());
                    ///inja comment, چون با بودن هر نوعی که باشد را به 0 تبدیل می کند و تگ را بی اثر می نماید
                }
            }
        }

        public bool IsValid
        {
            get
            {
                try
                {
                    if (motorPanel.Visible)
                    {
                        return motorUpPartTextEdit.Text.ConvertPersianNumberToEnglish().Trim('_').Length == 3 && motorDownPartTextEdit.Text.ConvertPersianNumberToEnglish().Trim('_').Length == 5;
                    }
                    else { return leftTextEdit.Text.Trim('_').ConvertPersianNumberToEnglish().Length == 2 && (!string.IsNullOrEmpty(typeComboBox.Text.ConvertPersianNumberToEnglish().Trim('_')) || _skipMiddlePart) && middleTextEdit.Text.Trim('_').ConvertPersianNumberToEnglish().Length == 3 && rightTextEdit.Text.Trim('_').Length == 2; }
                }
                catch { return false; }
            }
        }
        public Color BorderColor { get => _borderColor; set => _borderColor = value; }
        public bool WaiteForNextPalte { get; set; }

        public EosPlateControl()
        {
            InitializeComponent();
            panel1.RightToLeft = RightToLeft.No;
            motorPanel.RightToLeft = RightToLeft.No;
            carPanel.RightToLeft = RightToLeft.No;
            
            
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            //Pen p = new Pen(Color.Black);
            //p.Width = 1.5f;
            //e.Graphics.FillRectangle(Brushes.Blue, 2, 1, 20, Height-2);
            //e.Graphics.FillPath(new Pen(Color.FromArgb(255,50,50,250),1).Brush, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, 20, Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.TopLeft | GraphicsHelper.RectangleCorners.BottomLeft));
            //e.Graphics.DrawPath(p, GraphicsHelper.CreateRoundRectangle(new Rectangle(1,1, Width - 2, Height - 2), 6, GraphicsHelper.RectangleCorners.All));
            //e.Graphics.DrawLine(p, 20, 1, 20, Height-2);
            //e.Graphics.DrawLine(p, rightTextEdit.Left-3, 1, rightTextEdit.Left-3, Height - 2);
        }

        private void leftTextEdit_KeyUp(object sender, KeyEventArgs e)
        {
            if (leftTextEdit.Text.Trim('_').Length >= 2)
            {
                if (_skipMiddlePart)
                    middleTextEdit.Focus();
                else
                    typeComboBox.Focus();
            }
        }

        public void Clear()
        {
            motorUpPartTextEdit.Text = "";
            motorDownPartTextEdit.Text = "";
            leftTextEdit.Text = "";
            rightTextEdit.Text = "";
            middleTextEdit.Text = "";
            typeComboBox.Text = "";
        }

        private void typeComboBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            //middleTextEdit.Focus();
        }

        private void middleTextEdit_KeyUp(object sender, KeyEventArgs e)
        {
            if (middleTextEdit.Text.Trim('_').Length >= 3)
                rightTextEdit.Focus();
            else if (middleTextEdit.Text.Trim('_').Length == 0 && e.KeyCode == Keys.Back)
                typeComboBox.Focus();


        }

        private void rightTextEdit_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.KeyValue == 13 && IsValid)
            {
                //SendKeys.Send("{tab}");
                //Validate();
                if(this.Parent!=null)
                this.Parent.SelectNextControl(this, true, false, true, true);
                //OnValidated(new EventArgs());
            }
            else if (rightTextEdit.Text.Trim('_').Length == 0 && e.KeyCode == Keys.Back)
                middleTextEdit.Focus();
        }

        private void panel1_Paint(object sender, PaintEventArgs e)
        {
            Pen p = new Pen(_borderColor);
            p.Width = 1.5f;

            e.Graphics.FillPath(new Pen(Color.FromArgb(255, 0, 51, 153), 1).Brush, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, 20, carPanel.Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.TopLeft | GraphicsHelper.RectangleCorners.BottomLeft));
            e.Graphics.DrawPath(p, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, carPanel.Width - 3, carPanel.Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.All));
            //e.Graphics.DrawLine(p, 20, 1, 20, carPanel.Height - 2);
            //e.Graphics.DrawLine(p, rightTextEdit.Left - 3, 1, rightTextEdit.Left - 3, carPanel.Height - 2);
        }

        void ChangeColor(Bitmap bmp, Color color)
        {
            for (int i = 0; i < bmp.Width; i++)
                for (int j = 0; j < bmp.Height; j++)
                    if (bmp.GetPixel(i, j).B == 0)
                        bmp.SetPixel(i, j, color);
        }

        private void carButton_Click(object sender, EventArgs e)
        {

            var ctrl = sender as SimpleButton;
            if (ctrl == null)
                return;

            carPanel.Visible = true;
            motorPanel.Visible = false;

            //foreach (Control contrle in panel2.Controls)
            //    if (contrle is SimpleButton)
            //    {
            //        //if ((contrle as SimpleButton).ButtonStyle != DevExpress.XtraEditors.Controls.BorderStyles.NoBorder)
            //        //    ChangeColor((Bitmap)(contrle as SimpleButton).ImageOptions.Image, Color.Black);
            //        (contrle as SimpleButton).ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            //    }

            //eosLabel12.Text = /*"نوع خودرو: " +*/ ctrl.Text;
            ////motorButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            //ctrl.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.Default;
            //ctrl.Appearance.BorderColor = Color.Maroon;
            var tagID = ctrl.Tag;
            _carType = (CarTypes)int.Parse(ctrl.Tag.ToString());
            ChangeCarType();
            //ChangeColor((Bitmap)ctrl.ImageOptions.Image, Color.Orange);

        }

        private void motorButton_Click(object sender, EventArgs e)
        {
            //foreach (Control contrle in panel2.Controls)
            //    if (contrle is SimpleButton)
            //        (contrle as SimpleButton).ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            motorPanel.Visible = true;
            carPanel.Visible = false;
            //motorButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.UltraFlat;
            //eosLabel12.Text = /*"نوع خودرو: " +*/ motorButton.Text;
            //carButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            //motorButton.Appearance.BorderColor = Color.Maroon;
            _carType = (CarTypes)int.Parse(motorButton.Tag.ToString());
            ChangeCarType();
        }

        private void motorPanel_Paint(object sender, PaintEventArgs e)
        {
            Pen p = new Pen(BorderColor);
            p.Width = 1.5f;

            e.Graphics.FillPath(new Pen(Color.FromArgb(255, 0, 51, 153), 1).Brush, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, 20, carPanel.Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.TopLeft | GraphicsHelper.RectangleCorners.BottomLeft));
            e.Graphics.DrawPath(p, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, carPanel.Width - 3, carPanel.Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.All));
            //e.Graphics.DrawLine(p, 20, 1, 20, motorPanel.Height - 2);
            //e.Graphics.DrawLine(p, rightTextEdit.Left - 3, 1, rightTextEdit.Left - 3, carPanel.Height - 2);
        }

        private void leftTextEdit_TextChanged(object sender, EventArgs e)
        {
            if (_textChanged != null)
                _textChanged(sender, e);
        }

        private void leftTextEdit_KeyPress(object sender, KeyPressEventArgs e)
        {
            this.OnKeyPress(e);
        }

        private void tableLayoutPanel2_Paint(object sender, PaintEventArgs e)
        {
            Pen p = new Pen(_borderColor);
            p.Width = 1.5f;

            // e.Graphics.FillPath(new Pen(Color.FromArgb(255, 0, 51, 153), 1).Brush, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, 20, carPanel.Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.TopLeft | GraphicsHelper.RectangleCorners.BottomLeft));
            //e.Graphics.DrawPath(p, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, carPanel.Width - 3, carPanel.Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.All));
            //e.Graphics.DrawLine(p, 1, 1, 1, carPanel.Height - 2);
            e.Graphics.DrawLine(p, panel1.Left - 3, 1, panel1.Left - 3, carPanel.Height - 2);
        }

        private void tableLayoutPanel1_Paint(object sender, PaintEventArgs e)
        {
            Pen p = new Pen(_borderColor);
            p.Width = 1.5f;

            // e.Graphics.FillPath(new Pen(Color.FromArgb(255, 0, 51, 153), 1).Brush, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, 20, carPanel.Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.TopLeft | GraphicsHelper.RectangleCorners.BottomLeft));
            //e.Graphics.DrawPath(p, GraphicsHelper.CreateRoundRectangle(new Rectangle(2, 1, carPanel.Width - 3, carPanel.Height - 2), RoundRectRadius, GraphicsHelper.RectangleCorners.All));
            //e.Graphics.DrawLine(p, 1, 1, 1, carPanel.Height - 2);
            e.Graphics.DrawLine(p, motorDownPartTextEdit.Left - 3, 1, motorDownPartTextEdit.Left - 3, carPanel.Height - 2);
        }

        private void motorDownPartTextEdit_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.KeyValue == 13)
            {
                SendKeys.Send("{tab}");
                Validate();
            }
        }

        private void typeComboBox_KeyUp(object sender, KeyEventArgs e)
        {
            if (middleTextEdit.Text.Trim('_').Length == 0 && e.KeyCode == Keys.Back)
                leftTextEdit.Focus();
            if (e.KeyValue == 13)
            {
                middleTextEdit.Focus();
            }
        }

        private void typeComboBox_Validating(object sender, CancelEventArgs e)
        {
            if (typeComboBox.SelectedIndex < 0 && (!string.IsNullOrEmpty(typeComboBox.Text)))
                e.Cancel = !_skipMiddlePart || (typeComboBox.SelectedIndex < 0 && !string.IsNullOrEmpty(typeComboBox.Text));
        }

        private void panel1_Paint_1(object sender, PaintEventArgs e)
        {

        }

        private void leftTextEdit_EditValueChanged(object sender, EventArgs e)
        {

        }
    }
}
