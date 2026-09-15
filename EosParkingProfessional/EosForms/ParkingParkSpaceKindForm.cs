using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
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
using EosParkingProfessional.Models;

namespace EosParkingProfessional.EosForms
{
    public partial class ParkingParkSpaceKindForm : EosBaseForm
    {
        public ParkingEntity parking;
        private List<ParkingParkSpaceKindEntity> editParkSpaceTypes = new List<ParkingParkSpaceKindEntity>(); 

        private void AddToChangeList(ParkingParkSpaceKindEntity item)
        {
            if(item!=null)
                editParkSpaceTypes.Add(item);
            var deleteItemCount = editParkSpaceTypes.Count(q => q.Id < 0);
            var addItemCount = editParkSpaceTypes.Count(q => q.Id == 0);
            var editItemCount = editParkSpaceTypes.Count(q => q.Id > 0);
            infoLabel.Text = "تعداد موارد حذف شده " + deleteItemCount + " مورد";
            infoLabel.Text +=Environment.NewLine+ "تعداد موارد ایجاد شده " + addItemCount + " مورد";
            infoLabel.Text += Environment.NewLine + "تعداد موارد ویرایش شده " + editItemCount + " مورد";
        }

        private void FillGrid()
        {
            deleteGridColumn.Visible = PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingParkSpaceTypeDelete);
            

            var response = GetJsonObjecToLinkAndWait<List<ParkingParkSpaceKindEntity>>(ApiAddress.ParkingApi.GetParkingParkSpaceKinds, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                gridControl1.DataSource = response.Values;
            else
                MessageShowError(response);
        }

        public ParkingParkSpaceKindForm(ParkingEntity _parking)
        {
            InitializeComponent();
            parking = _parking;
        }

        private void ParkingParkSpaceKindForm_Load(object sender, EventArgs e)
        {
            FillGrid();
        }

        private void cardButtonEdit_TextChanged(object sender, EventArgs e)
        {
            try
            {
                (gridControl1.MainView as GridView).ActiveFilterString = $"Title like '%{cardButtonEdit.Text}%' ";
            }
            catch { }
        }

        private void cardButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingParkSpaceTypeAddOrEdit))
            {
                MessageShowErrorUserPermision(); 
                return;
            }
            try
            {
                if (string.IsNullOrEmpty( cardButtonEdit.Text))
                {
                    //MessageShowError("لطفا مقادیر را درست وارد کنید");
                    return;
                }
                if ((gridControl1.DataSource as List<ParkingParkSpaceKindEntity>).Any(q => q.Title == cardButtonEdit.Text))
                {
                    MessageShowError("جای پارکی با این شماره موجود است");
                    return;
                }
                var item = new ParkingParkSpaceKindEntity() { Title = cardButtonEdit.Text, PersistOn = DateTime.Now };
                (gridControl1.DataSource as List<ParkingParkSpaceKindEntity>).Add(item);
                AddToChangeList(item);
                gridControl1.RefreshDataSource();
                gridControl1.Refresh();
                cardButtonEdit.Text = "";
                //    } 
                //}
                //else
                //    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }

        }

        private void cardButtonEdit_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (e.KeyChar == (char)Keys.Enter)
            {
                cardButtonEdit_ButtonPressed(sender, null);
            }
        }


        private void gridView1_RowUpdated(object sender, DevExpress.XtraGrid.Views.Base.RowObjectEventArgs e)
        { 
            var item = e.Row as ParkingParkSpaceKindEntity;//(gridControl1.DataSource as List<CardEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]; 

            if (item.Id != 0)
            {
                if (!editParkSpaceTypes.Contains(item))
                    AddToChangeList(item);
            }
        }

        private void gridView1_InitNewRow(object sender, DevExpress.XtraGrid.Views.Grid.InitNewRowEventArgs e)
        {
            (gridControl1.DataSource as List<CardEntity>).Add(new CardEntity());
            gridControl1.RefreshDataSource();
        }
        private void gridView1_ValidatingEditor(object sender, DevExpress.XtraEditors.Controls.BaseContainerValidateEditorEventArgs e)
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingParkSpaceTypeAddOrEdit))
            {
                MessageShowErrorUserPermision();

                e.Valid = false;
                return ;
            }

            if ((gridControl1.MainView as GridView).FocusedColumn == titleGridColumn)
            {
                var item = (gridControl1.DataSource as List<ParkingParkSpaceKindEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()];
                if ((gridControl1.DataSource as List<ParkingParkSpaceKindEntity>).Any(q => q.Title == e.Value.ToString() && q.Id != item.Id))
                {
                    //MessageShowError("کارتی با این شماره موجود است");
                    gridControl1.MainView.CancelSelection();
                    e.Valid = false;
                    e.ErrorText = "نوع جای پارکی با این عنوان موجود است";
                    return;
                }
            }
            e.Valid = true;
        }

        bool Save()
        { 
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingParkSpaceTypeAddOrEdit))
            {
                MessageShowErrorUserPermision(); 
                return false;
            }
            try
            {
                //var item = new CardEntity() { CardNumber = cardButtonEdit.Text, ParkingId = parking.Id, IsBlock = false, PersistOn = DateTime.Now };
                var types = editParkSpaceTypes.ToList();
                foreach (var i in types)
                    i.ParkingId = parking.Id;
                //cards.AddRange(deletedCards.Select(q => new CardEntity { Id = -q.Id }).ToList());
                ResponseResultWeb<bool> response = null;
                var t = Task.Factory.StartNew(() => { response = PostJsonObjecToLinkAndWait<bool>(ApiAddress.ParkingApi.SaveAllParkingParkSpaceKind, types, false); });
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
                        editParkSpaceTypes.Clear();
                        AddToChangeList(null);
                        FillGrid();
                        //deletedCards.Clear();
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
            Save();
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            if (Save())
                Close();
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            DialogResult = DialogResult.Abort;
        }

        private void deleteRepositoryGridButtonEdit_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion(message: "آیا میخواهید حذف انجام گردد؟") != DialogResult.OK)
                return;
            var item = (gridControl1.DataSource as List<ParkingParkSpaceKindEntity>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()];
            if (item.IsUsing)
            {
                MessageShowError(EosParking.Core.Enums.ResponseResultTypes.CanNotDelete.DisplayString());
                return;
            }
            if (item.Id > 0)
                AddToChangeList(new ParkingParkSpaceKindEntity { Id = -item.Id });
            else
            {
                editParkSpaceTypes.Remove(item);
                AddToChangeList(null);
            }

            (gridControl1.MainView as GridView).DeleteSelectedRows();
            gridControl1.RefreshDataSource();
        }

        private void ParkingParkSpaceKindForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (editParkSpaceTypes.Count > 0)
                e.Cancel = ShowExitQuestion() != DialogResult.OK;
        }

        private void gridView1_RowCellStyle(object sender, RowCellStyleEventArgs e)
        {
            
        }

        private void gridView1_CustomDrawCell(object sender, DevExpress.XtraGrid.Views.Base.RowCellCustomDrawEventArgs e)
        {
            if (e.Column == persistOnGridColumn)
            {
                try
                {
                    var value = (DateTime)e.CellValue ;
                    e.DisplayText = value.ToPersianDate(false);
                }
                catch { }
            }
        }


    }
}
