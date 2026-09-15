using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParkingProfessional.Models;

namespace EosParkingProfessional.EosForms
{
    public partial class ParkingSectionForm : EosBaseForm
    {
        ParkingEntity parking = null;
        public ParkingSectionForm(ParkingEntity parking)
        {
            InitializeComponent();
            this.parking = parking;
        }
        private void ParkingSectionForm_Load(object sender, EventArgs e)
        {
            FillFloorCombo();
            FillGrid();
        }

        private void FillGrid()
        {
            deleteGridColumn.Visible = PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingZoonDelete);
            var response = GetJsonObjecToLinkAndWait<List<ParkingSectionDto>>(ApiAddress.ParkingApi.GetParkingSections, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                gridControl1.DataSource = response.Values;
                PropertyPanelFill(response.Values.FirstOrDefault(), false);
            }
            else
                MessageShowError(response);
        }

        private void FillFloorCombo()
        {
            var response = GetJsonObjecToLinkAndWait<List<ParkingFloorDto>>(ApiAddress.ParkingApi.GetParkingFloors, parking.Id);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                floorsTextBox.TextBoxObject.DataSource = response.Values;
                floorsTextBox.TextBoxObject.ValueMember = "Id";
                floorsTextBox.TextBoxObject.DisplayMember = "Title";
                
            }
            //else
            //    MessageShowError(response);
        }

        private void FillParkSpaceGrid(ParkingSectionDto section)
        {
            if (!this.Visible)
                return;
            if (floorsTextBox.TextBoxObject.DataSource == null)
            {
                FillFloorCombo();
                if (floorsTextBox.TextBoxObject.DataSource == null)
                    return;
            }
            var floors = floorsTextBox.TextBoxObject.DataSource as List<ParkingFloorDto>;
            var floor = floors.ToList().FirstOrDefault(q=>q.Id==long.Parse(floorsTextBox.TextBoxObject.SelectedValue.ToString()));
            if (floor != null)
            {
                foreach (var i in floor?.ParkSpaces.Where(p => !p.ParkingSectionId.HasValue && p.ParkingSection != null))
                    i.ParkingSection = null;
            }
            var x = new List<ParkingParkSpaceEntity>();
            if (section != null)
            {
                floor?.ParkSpaces.Where(p => !p.HasSection).Select(q => q).Union(section.ParkSpaces.ToList()).ToList().ForEach((item) =>
                {
                    x.Add(item.Clone());
                });
                //sectionParkSpaceGrid.DataSource =  x.ToList();
            }
            else
            {
                floor?.ParkSpaces.ToList().Where(p => !p.HasSection).ToList().ForEach((item) =>
                {
                    x.Add(item.Clone());
                });
            }
            
            sectionParkSpaceGrid.DataSource = x.OrderBy(q => q.Title).ToList() ;
            //else
            //    MessageShowError(response);
        }

        void ClearForm()
        {
            titleTextBox.Text = "";
            descriptionTextBox.Text = "";
            sectionParkSpaceGrid.DataSource = null;
        }
        private void PropertyPanelFill(ParkingSectionDto entry, bool enable)
        {
            propertyPanel.Enabled = enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;
            actionPanel.Tag = entry;
            cancelButton.Visible = okButton.Visible = enable;

            floorsTextBox.Enabled = true;
            if (entry != null)
            {
                if (entry.ParkSpaces.Count > 0)
                {
                    floorsTextBox.TextBoxObject.SelectedValue = entry.ParkSpaces.FirstOrDefault().ParkingFloorId;
                    floorsTextBox.Enabled = false;
                }
                titleTextBox.Text= zoonTitleLabel.Text = entry.Title; 
                descriptionTextBox.Text = entry.Description;
                //sectionParkSpaceGrid.DataSource = entry.ParkSpaces;
               
            }
            else
            {
                ClearForm();
            }
            FillParkSpaceGrid(entry);

        }

        bool IsValidat()
        {
            if (!PublicVariables.CheckUserAccess(EosParking.Core.Enums.AccessItemTypes.ParkingZoonAddOrEdit))
            {
                MessageShowErrorUserPermision();
                return false;
            }
            if (string.IsNullOrEmpty(titleTextBox.Text) )
            {
                MessageShowError("اطلاعات وارد شده معتبر نمی باشد..");
                return false;
            } 

            return true;
        }

        private void SaveItem()
        {
            if (!IsValidat())
                return;
            try
            {
                var item = actionPanel.Tag as ParkingSectionDto;
                if (item == null)
                {
                    item = new ParkingSectionDto();
                    
                }
                item.Title = titleTextBox.Text;
                item.Description=descriptionTextBox.Text;
                item.ParkingId = parking.Id;
                    foreach(var i in (sectionParkSpaceGrid.DataSource as List<ParkingParkSpaceEntity>).Where(q => q.HasSection).ToList())
                    {
                        i.ParkingSectionId = i.ParkingSection?.Id ?? i.ParkingSectionId;
                    }
                item.ParkSpaces = (sectionParkSpaceGrid.DataSource as List<ParkingParkSpaceEntity>).Where(q => q.HasSection).ToList();
                
                var response = PostJsonObjecToLinkAndWait<long>(ApiAddress.ParkingApi.SaveParkingSection, item, false);
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    if (item.Id == 0)
                    {
                        item.Id = response.Values;
                        (gridControl1.DataSource as List<ParkingSectionDto>).Add(item);
                    }
                    RefreshParkSpaces();
                    gridControl1.RefreshDataSource();
                    gridControl1.Refresh();
                    PropertyPanelFill(item, false);
                }
                else
                    MessageShowError(response);
            }
            catch (Exception ex) { MessageShowError(ex); }
        }

        void RefreshParkSpaces()
        {
            var floors = floorsTextBox.TextBoxObject.DataSource as List<ParkingFloorDto>;
            var floor = floors.ToList().FirstOrDefault(q => q.Id == long.Parse(floorsTextBox.TextBoxObject.SelectedValue.ToString()));
            (gridView2.DataSource as List<ParkingParkSpaceEntity>).ForEach((item) =>
                {
                    floor.ParkSpaces.RemoveAll(q => q.Id == item.Id);
                    floor.ParkSpaces.Add(item);
                });
        }

        private void eosEntityModifyToolsControl1_ClickNewButton(object sender, EventArgs e)
        {
            PropertyPanelFill(new ParkingSectionDto(), true);
        }

        private void editGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = ((gridControl1.DataSource as List<ParkingSectionDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion() != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<ParkingSectionDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.ParkingApi.DeleteParkingSectionById, entry.Id);
                if (result.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && result.Values)
                {
                    FillFloorCombo();
                    (gridControl1.MainView as GridView).DeleteSelectedRows();
                }
                else
                    MessageShowError(result);
            }
            catch (Exception ex)
            {
                MessageShowError(ex);
            }
        }

        private void gridView1_FocusedRowChanged(object sender, DevExpress.XtraGrid.Views.Base.FocusedRowChangedEventArgs e)
        {
            try
            {
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as ParkingSectionDto;
                PropertyPanelFill(entry, false);
            }
            catch { }
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            //ParkingSectionDto d = new ParkingSectionDto() { UserName = "eosLogin1.UserName", UserPass = "eosLogin1.Password.Encrypt()" };
            //var response = PostJsonObjecToLink<AccessLevelEntity>(ApiAddress.AccessLevelApi.AccessLevelSave, d);
            //          PostJsonObjecToLinkAndWait<object>(ApiAddress.UserApi.Login, d, true);
            SaveItem();
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            PropertyPanelFill(null, false);
        }

        private void gridView2_CellValueChanged(object sender, DevExpress.XtraGrid.Views.Base.CellValueChangedEventArgs e)
        {
            if (e.Column.VisibleIndex == 0)
            {
                var entrySection = actionPanel.Tag as ParkingSectionDto; //((gridControl1.DataSource as List<ParkingSectionDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                var entry = ((sectionParkSpaceGrid.DataSource as List<ParkingParkSpaceEntity>)[e.RowHandle]);
                if (!entry.ParkingSectionId.HasValue && entry.ParkingSection == null)
                {
                    //entry.ParkingSectionId = entrySection.Id;
                    entry.ParkingSection = entrySection.Get();
                }
                else
                {
                    entry.ParkingSectionId = null;
                    entry.ParkingSection = null;
                }
                floorsTextBox.Enabled = !(sectionParkSpaceGrid.DataSource as List<ParkingParkSpaceEntity>).Any(q => q.ParkingSectionId.HasValue);
            }
        }

        private void floorsTextBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            try
            {
                if(this.Visible)
                    FillParkSpaceGrid(actionPanel.Tag as ParkingSectionDto);
            }
            catch { }
        }


    }
}
