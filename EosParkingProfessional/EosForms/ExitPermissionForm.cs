using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Data.Dto;
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
    public partial class ExitPermissionForm : EosBaseForm
    {
        public ExitPermissionForm()
        {
            InitializeComponent();
        }

        private void ExitPermissionForm_Load(object sender, EventArgs e)
        {

        }

        private void btnLoadListDontExit_Click(object sender, EventArgs e)
        {
            var response = GetJsonObjecToLink<List<ExitBillDto>>(ApiAddress.TrafficApi.GetPermissions, 5);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                trafficGrid.DataSource = response.Values.Where(q=> q.ExitDateTime==null).OrderByDescending(q => q.DumpId).ToList();
                //SetTrafficGridDataSource(response.Values.OrderByDescending(q => q.DumpId).ToList());
            }

        }


        private bool SetTrafficGridDataSource(List<ExitBillDto> lists)
        {
            bool dtsChanged = false;
            try
            {
                List<ExitBillDto> currentList = (List<ExitBillDto>)trafficGrid.DataSource;
                bool isCompare = true;
                int differentCount = 0;
                if (currentList != null)
                {
                    var difList = currentList.Where(a => !lists.Any(a1 => a1.DumpId == a.DumpId && a1.EnterDateTime == a.EnterDateTime && a1.ExitDateTime == a.ExitDateTime))
                        .Union(lists.Where(a => !currentList.Any(a1 => a1.DumpId == a.DumpId && a1.EnterDateTime == a.EnterDateTime && a1.ExitDateTime == a.ExitDateTime)));
                    if (difList != null)
                    {
                        differentCount = difList.Count();
                    }

                    if ((differentCount > 0) || (currentList.Count != lists.Count))
                        isCompare = false;

                }
                else
                {
                    isCompare = false;
                }


                if (!isCompare)
                {
                    trafficGrid.DataSource = lists;
                    dtsChanged = true;
                }
            }
            catch (Exception)
            {
                // ignored
            }

            return dtsChanged;
        }
        class UpdatePermission{
            public long dumpID { get; set; }
            public bool exitPermission { get; set; }
            public long exitPermissionPersistBy { get; set; }

        }
        private void btnExitPermission_Click(object sender, EventArgs e)
        {

            var focuseItem = (trafficGrid.MainView as GridView).GetFocusedDataSourceRowIndex();

            if (focuseItem <0)
                return;
            try
            {
                UpdatePermission updatePermission = new UpdatePermission();
                updatePermission.dumpID = ((List<ExitBillDto>)trafficGrid.DataSource)[focuseItem].DumpId;
                if (((List<ExitBillDto>)trafficGrid.DataSource)[focuseItem].ExitPermission == null)
                    updatePermission.exitPermission = true;
                else
                    updatePermission.exitPermission = !(bool)((List<ExitBillDto>)trafficGrid.DataSource)[focuseItem].ExitPermission;
                updatePermission.exitPermissionPersistBy = PublicVariables.CurrentUser.Id;

                var response = GetJsonObjecToLink<List<ExitBillDto>>(ApiAddress.TrafficApi.TrafficDumpUpdatePermission+ $"{updatePermission.dumpID}&exitPermission={updatePermission.exitPermission.ToString()}&exitPermissionPersistBy={updatePermission.exitPermissionPersistBy}");
                if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                {
                    trafficGrid.DataSource = response.Values.OrderByDescending(q => q.DumpId).ToList();
                    //SetTrafficGridDataSource(response.Values.OrderByDescending(q => q.DumpId).ToList());
                }



            }
            catch (Exception ex)
            {
                MessageShowError(ex);
            }
        }

        private void tabPane1_SelectedPageChanged(object sender, DevExpress.XtraBars.Navigation.SelectedPageChangedEventArgs e)
        {
            //var a = 1;

            var response = GetJsonObjecToLink<List<ExitBillDto>>(ApiAddress.TrafficApi.GetTraffics,5);
            if (response != null && response.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
            {
                gridMojavezRemain.DataSource = response.Values.Where(q => q.ExitPermission == null || q.ExitPermission == false).OrderByDescending(q => q.DumpId).ToList();
                gridMojavezha.DataSource = response.Values.Where(q => q.ExitPermission == true).OrderByDescending(q => q.DumpId).ToList();
            }

        }
    }
}
