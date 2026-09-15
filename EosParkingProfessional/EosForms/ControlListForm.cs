using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Data.EF.Entities;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class ControlListForm : EosBaseForm
    {
        List<CarEntity> editCarItems = new List<CarEntity>();
        private ControlListTypes _controlType = EosParking.Core.Enums.ControlListTypes.Black;

        public ControlListForm()
        {
            InitializeComponent();
        }

        private void ControlListForm_Load(object sender, EventArgs e)
        {
            FillGrid();
        }

        private void FillGrid()
        {
            
            var response = GetJsonObjecToLinkAndWait<List<CarEntity>>(ApiAddress.ParkingApi.GetAllControlListCars);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                gridControl1.DataSource = response.Values;
                FilterGrid(null);
            }
            else
                MessageShowError(response);
        }

        private void eosPlateControl1_TextChanged(object sender, EventArgs e)
        {
            FilterGrid("Plate Like '%" + eosPlateControl1.Plate.Replace("*","") + "%'");
        }

        private void FilterGrid(string filter)
        {
            try
            {
                if (string.IsNullOrEmpty(filter))
                    (gridControl1.MainView as GridView).ActiveFilterString = $"(ControlType = {(int)_controlType})";
                else
                    (gridControl1.MainView as GridView).ActiveFilterString = $"(ControlType={(int)_controlType}) and ({filter})";
            }
            catch { }
        }

        private void eosPlateControl1_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (e.KeyChar == (char)Keys.Enter && eosPlateControl1.IsValid )
            {
                insertButton_Click( sender,  e);
                //var item = new CarEntity { ControlType=_controlType, Plate = eosPlateControl1.Plate };
                //(gridControl1.DataSource as List<CarEntity>).Add(item);
                //AddToChangeList(item); 
                //gridControl1.RefreshDataSource();
                //eosPlateControl1.Clear();
                //FilterGrid(null);
            }
        }

        private void deleteRepositoryGridButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if(ShowQuestion("حذف")!=DialogResult.OK)
            {
                return;
            }
            var item = (CarEntity)(gridControl1.MainView as GridView).GetFocusedRow();
            if (item.Id == 0)
            {
                editCarItems.Remove(item);
            }
            else
            {
                item.ControlType = EosParking.Core.Enums.ControlListTypes.None;
                if (!editCarItems.Contains(item))
                    AddToChangeList(item);
            }

            (gridControl1.DataSource as List<CarEntity>).Remove(item);
            gridControl1.RefreshDataSource();
            AddToChangeList(null);
        }
        private void AddToChangeList(CarEntity item)
        {
            if (item != null)
                if (!editCarItems.Any(q => q.Plate == item.Plate))
                    editCarItems.Add(item);
            var deleteItemCount = editCarItems.Count(q => q.ControlType == EosParking.Core.Enums.ControlListTypes.None);
            var addItemCount = editCarItems.Count(q => q.Id == 0);
            var editItemCount = editCarItems.Count(q => q.Id > 0 && q.ControlType != EosParking.Core.Enums.ControlListTypes.None);
            infoLabel.Text = "تعداد موارد حذف شده " + deleteItemCount + " مورد";
            infoLabel.Text += Environment.NewLine + "تعداد موارد ایجاد شده " + addItemCount + " مورد";
            infoLabel.Text += Environment.NewLine + "تعداد موارد ویرایش شده " + editItemCount + " مورد";
            infoLabel.Visible = editCarItems.Count > 0;
        }

        bool Save()
        {
            try
            {
                //var item = new CardEntity() { CardNumber = cardButtonEdit.Text, ParkingId = parking.Id, IsBlock = false, PersistOn = DateTime.Now };
                var cars = editCarItems.ToList();
                //foreach (var i in cars)
                //    i.ParkingId = parking.Id;
                //cards.AddRange(deletedCards.Select(q => new CardEntity { Id = -q.Id }).ToList());
                ResponseResultWeb<bool> response = null;
                var t = Task.Factory.StartNew(() => { response = PostJsonObjecToLinkAndWait<bool>(ApiAddress.ParkingApi.SaveControlListCars, cars, false); });
                t.Wait(100);
                while (t.Status == TaskStatus.Running && response == null)
                    Application.DoEvents();

                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (response.Values)
                    {
                        //(gridControl1.DataSource as List<CardEntity>).Add(item);
                        //gridControl1.RefreshDataSource();
                        //gridControl1.Refresh();
                        //cardButtonEdit.Text = "";
                        editCarItems.Clear();
                        AddToChangeList(null);
                        //deletedCards.Clear();
                        FillGrid();
                        return true;
                    }
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
            return false;
        }

        private void applyButton_Click(object sender, EventArgs e)
        {
            if(Save())
                MessageShowSucsess();
            
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            if (Save())
                Close();
        }

        private void gridView1_RowUpdated(object sender, DevExpress.XtraGrid.Views.Base.RowObjectEventArgs e)
        {
            var item = e.Row as CarEntity;//(gridControl1.DataSource as List<CardEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]; 

            if (item.Id != 0)
            {
                if (!editCarItems.Any(q=>q.Plate==item.Plate))
                    AddToChangeList(item);
            }
        }

        private void gridView1_ValidatingEditor(object sender, DevExpress.XtraEditors.Controls.BaseContainerValidateEditorEventArgs e)
        {
            //var item = (gridControl1.DataSource as List<CarEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()];
            ////if (item.)
            ////{
            ////    MessageShowError(EosParking.Core.Enums.ResponseResultTypes.CanNotDelete.DisplayString());
            ////    return;
            ////}
            //if (item.Id > 0)
            //{
                
            //    AddToChangeList(item);
            //}
            //else
            //{
            //    //editParkSpaceTypes.Remove(item);
            //    AddToChangeList(null);
            //}

            //(gridControl1.MainView as GridView).DeleteSelectedRows();
            //gridControl1.RefreshDataSource();
        }

        private void insertButton_Click(object sender, EventArgs e)
        {
            if (!eosPlateControl1.IsValid)
            {
                MessageShowError("پلاک خودرو را صحیح وارد کنید");
                return;
            }
            if ( (gridControl1.DataSource as List<CarEntity>).Any(q => q.Plate == eosPlateControl1.Plate))
            {
                MessageShowError("پلاک خودرو قبلا وارد شده است");
                return;
            }
            var item = new CarEntity { ControlType = _controlType, Plate = eosPlateControl1.Plate };
            (gridControl1.DataSource as List<CarEntity>).Add(item);
            AddToChangeList(item);
            gridControl1.RefreshDataSource();
            eosPlateControl1.Clear();
            FilterGrid("");
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            Close();
        }

        private void BlackListForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            e.Cancel = editCarItems.Count > 0 && ShowExitQuestion() != DialogResult.OK;
        }

        private void xtraTabControl1_SelectedPageChanged(object sender, DevExpress.XtraTab.TabPageChangedEventArgs e)
        {
            actionTypeGridColumn.OptionsColumn.AllowEdit = true;
            if (e.Page == blackTabPage)
            {
                _controlType = EosParking.Core.Enums.ControlListTypes.Black;
                actionTypeGridColumn.OptionsColumn.AllowEdit = false;
            }
            else if (e.Page == stolenTabPage)
            {
                _controlType = EosParking.Core.Enums.ControlListTypes.Stealing;
                actionTypeGridColumn.OptionsColumn.AllowEdit= false;
            }
            else
                _controlType = EosParking.Core.Enums.ControlListTypes.Observation;
            FilterGrid(null);
        }

        private void gridView1_CustomDrawCell(object sender, DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs e)
        {
            if(e.Column== titleGridColumn)
            {
                e.DisplayText = EosParking.Core.Helpers.SmsHelper.PlateFormat(e.CellValue.ToString());
            }
        }

    }
}
