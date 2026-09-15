using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraTreeList;
using DevExpress.XtraTreeList.Columns;
using DevExpress.XtraTreeList.Nodes;
using EosParking.Controllers;
using EosParking.Data.EF.Dto;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using EosParking.Data.Dto;

namespace EosParkingProfessional.EosForms
{
    public partial class AccessLevelForm : EosBaseForm
    {

        private void FillGrid()
        {
            var response = GetJsonObjecToLinkAndWait<List<AccessLevelDto>>(ApiAddress.AccessLevelApi.Get);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                gridControl1.DataSource = response.Values.Where(accessLevel => accessLevel.IsSystemType == false).ToList();
            else
                MessageShowError(response);
        }
        private void FillDatailsTree()
        {
            detailsTreeList.ClearNodes();

            TreeListNode parent = null;
            detailsTreeList.BeginUnboundLoad();
            //detailsTreeList.DataSource = AccessItemDto.GetAccessItems();
            foreach (var i in AccessItemDto.GetAccessItems())
            {
                if (i.isVisible)
                {
                    var root = detailsTreeList.AppendNode(new object[] { i.Title/*+" " + i.AccessPermissionPart1.ToString() */}, parent);

                    root.Tag = i;
                    foreach (var c in i.Childs)
                    {
                        if (c.isVisible)
                        {
                            var root2 = detailsTreeList.AppendNode(new object[] { c.Title/* + " " + c.AccessPermissionPart1.ToString()*/ }, root);
                            root2.Tag = c;
                            foreach (var d in c.Childs)
                                if (d.isVisible)
                                    detailsTreeList.AppendNode(new object[] { d.Title /*+ " " + d.AccessPermissionPart1.ToString()*/ }, root2).Tag = d;
                        }
                    }
                }
            }
            detailsTreeList.EndUnboundLoad();
            detailsTreeList.Refresh();
        }
        void ClearForm()
        {
            nameTextBox.Text = "";
            descriptionTextBox.Text = "";
            detailsTreeList.SelectAll();
        }

        void PropertyPanelFill(AccessLevelDto entry,bool enable)
        {
            propertyPanel.Enabled= enable;
            actionPanel.Enabled = enable;
            actionPanel.Visible = enable;
            actionPanel.Tag = entry;
            cancelButton.Visible = okButton.Visible = enable;
            if (entry != null)
            {
                nameTextBox.Text = entry.Name;
                descriptionTextBox.Text = entry.Description;
                FillAccessDetails(entry.AccessPermissionPart1, entry.AccessPermissionPart2);
            }
            else
            {
                ClearForm();
            }
        }

        private void SaveItem()
        {
            var item = actionPanel.Tag as AccessLevelDto;
            if (item == null)
            {
                item = new AccessLevelDto();
                
            }

            item.Name = nameTextBox.Text;
            item.Description = descriptionTextBox.Text;
            
            item.PersistOn = DateTime.Now;
            var access=CalculateAccessPermission(detailsTreeList.Nodes);
            item.AccessPermissionPart1 = access.Key;
            item.AccessPermissionPart2 = access.Value;

            var response = PostJsonObjecToLink<long>(ApiAddress.AccessLevelApi.Save,item);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                if (item.Id == 0)
                {
                    item.Id = response.Values;
                    (gridControl1.DataSource as List<AccessLevelDto>).Add(item);
                }
                gridControl1.RefreshDataSource();
                gridControl1.Refresh();
                PropertyPanelFill(item, false);
            }
            else
                MessageShowError(response);
        }

        private void FillAccessDetails(long accessPermissionValuePart1, long accessPermissionValuePart2)
        {
            //detailsTreeList.Nodes.Clear();
            //detailsTreeList.Nodes.Add("همه").Tag= 281474976710655;
            foreach(TreeListNode node in detailsTreeList.Nodes)
            {
                node.CheckState = (((node.Tag as AccessItemDto).AccessPermissionPart1>0 && ((node.Tag as AccessItemDto).AccessPermissionPart1 & accessPermissionValuePart1) == (node.Tag as AccessItemDto).AccessPermissionPart1)) ? CheckState.Checked :
                    (((node.Tag as AccessItemDto).AccessPermissionPart2 > 0 && ((node.Tag as AccessItemDto).AccessPermissionPart2 & accessPermissionValuePart2) == (node.Tag as AccessItemDto).AccessPermissionPart2) ? CheckState.Checked : CheckState.Unchecked);
                                        
                foreach (TreeListNode node2 in node.Nodes)
                {
                    node2.CheckState = (((node2.Tag as AccessItemDto).AccessPermissionPart1 > 0 && ((node2.Tag as AccessItemDto).AccessPermissionPart1 & accessPermissionValuePart1) == (node2.Tag as AccessItemDto).AccessPermissionPart1)) ? CheckState.Checked :
                        (((node2.Tag as AccessItemDto).AccessPermissionPart2 > 0 && ((node2.Tag as AccessItemDto).AccessPermissionPart2 & accessPermissionValuePart2) == (node2.Tag as AccessItemDto).AccessPermissionPart2) ? CheckState.Checked : CheckState.Unchecked);
                    foreach (TreeListNode node3 in node2.Nodes)
                        node3.CheckState = (((node3.Tag as AccessItemDto).AccessPermissionPart1 > 0 && ((node3.Tag as AccessItemDto).AccessPermissionPart1 & accessPermissionValuePart1) == (node3.Tag as AccessItemDto).AccessPermissionPart1)) ? CheckState.Checked :
                            (((node3.Tag as AccessItemDto).AccessPermissionPart2 > 0 && ((node3.Tag as AccessItemDto).AccessPermissionPart2 & accessPermissionValuePart2) == (node3.Tag as AccessItemDto).AccessPermissionPart2) ? CheckState.Checked : CheckState.Unchecked);
                }
            }
            
        }

        KeyValuePair<long,long> CalculateAccessPermission(TreeListNodes nodes)
        {
            long access = 0;
            long reportAccess = 0;
            foreach (TreeListNode node in nodes)
            {
                if (node.CheckState != CheckState.Unchecked && !(node.Tag as AccessItemDto).Title.StartsWith("مشاهده"))
                {
                    access += (node.Tag as AccessItemDto).AccessPermissionPart1;
                    reportAccess += (node.Tag as AccessItemDto).AccessPermissionPart2;
                }
                if (node.Nodes.Count > 0)
                {
                    var nodeAccess= CalculateAccessPermission(node.Nodes);
                    access += nodeAccess.Key;
                    reportAccess+= nodeAccess.Value;
                }
            }
            return new KeyValuePair<long, long>(access,reportAccess);
        } 

        public AccessLevelForm()
        {
            InitializeComponent();
            FillGrid();
            FillDatailsTree();
            //FillAccessDetails(281474976710655, 281474976710655);
        }

        private void eosEntityModifyToolsControl1_ClickNewButton(object sender, EventArgs e)
        {
            PropertyPanelFill(null, true);
        }

        private void editGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            var entry = ((gridControl1.DataSource as List<AccessLevelDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
            PropertyPanelFill(entry, true);
        }

        private void deleteGridRepositoryButton_ButtonPressed(object sender, DevExpress.XtraEditors.Controls.ButtonPressedEventArgs e)
        {
            if (ShowQuestion() != DialogResult.OK)
                return;
            try
            {
                var entry = ((gridControl1.DataSource as List<AccessLevelDto>)[(gridControl1.MainView as GridView).GetFocusedDataSourceRowIndex()]);
                var result = GetJsonObjecToLinkAndWait<bool>(ApiAddress.AccessLevelApi.DeleteById, entry.Id);
                if (result.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && result.Values)
                    (gridControl1.MainView as GridView).DeleteSelectedRows();
                else
                    MessageShowError(result);
            }
            catch ( Exception ex)
            {
                MessageShowError(ex);
            }
        }

        private void gridView1_FocusedRowChanged(object sender, DevExpress.XtraGrid.Views.Base.FocusedRowChangedEventArgs e)
        {
            try
            {
                var entry = (gridControl1.MainView as GridView).GetFocusedRow() as AccessLevelDto;
                PropertyPanelFill(entry, false);
            }
            catch { }
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            //UserDto d = new UserDto() { UserName = "eosLogin1.UserName", UserPass = "eosLogin1.Password.Encrypt()" };
            //var response = PostJsonObjecToLink<AccessLevelEntity>(ApiAddress.AccessLevelApi.AccessLevelSave, d);
                //          PostJsonObjecToLinkAndWait<object>(ApiAddress.UserApi.Login, d, true);
            SaveItem();
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            PropertyPanelFill(null, false);
        }

        private void eosEntityModifyToolsControl1_Load(object sender, EventArgs e)
        {

        }
    }
}
