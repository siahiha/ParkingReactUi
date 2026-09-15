using DevExpress.XtraGrid.Views.Grid;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Interfaces;
using EosParking.Core.Models;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParking.ImportData;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class ImportMembersForm : EosBaseForm
    {
        #region Readonly & constant

        private readonly ParkingEntity CurrentParking;
        private readonly IExternalData ExternalData;

        #endregion Readonly & constant

        private bool ExcelMode = false;

        #region ctor

        public ImportMembersForm(ParkingEntity entity)
        {
            // EXCEL MODE
            InitializeComponent();
            CurrentParking = entity;
            ExternalData = null;
            ExcelMode = true;
            eosLabel1.Text = "بروز رسانی اطلاعات اعضا از اکسل";
            eosLabel2.Text = "جهت دریافت لیست پرسنل اکسل لطفا بر روی دکمه روبرو کلیک نمایید";
        }

        public ImportMembersForm(ParkingEntity entity, IExternalData externalData)
        {
            InitializeComponent();
            CurrentParking = entity;
            ExternalData = externalData;
        }

        #endregion ctor

        private List<ExternalMember> ToList(DataTable dt)
        {
            var convertedList = (from rw in dt.AsEnumerable()
                                 select new ExternalMember()
                                 {
                                     MemberCode = Convert.ToString(rw[0]),
                                     CardNumber = Convert.ToString(rw[1]),
                                     FirstName = Convert.ToString(rw[2]),
                                     LastName = Convert.ToString(rw[3]),
                                     Address = Convert.ToString(rw[4]),
                                     NationalCode = Convert.ToString(rw[5]),
                                     PhoneNumber = Convert.ToInt64(rw[6])
                                 }).ToList();

            return convertedList;
        }

        #region eventHandler

        private void getEmployeeInfoButton_Click(object sender, EventArgs e)
        {
            bool hasProblem = false;
            if (ExcelMode)
            {
                openFileDialog1.ShowDialog();
                string fileName = openFileDialog1.FileName;
                if (File.Exists(fileName))
                {
                    FileInfo fi = new FileInfo(fileName);
                    //if (fi.Extension.ToLower() != ".xls")
                    //{
                    //    MessageShowError("فایل اکسل انتخابی معتبر نمی باشد");
                    //    //return;
                    //}

                    ImportExcel importExcel = new ImportExcel();
                    var data = importExcel.ReadExcelDataReader(fileName);
                    var excelData = ToList(data);
                    int iColumnCounts = data.Columns.Count;
                    int iRowCounts = data.Rows.Count;

                    DoWorkAsyncAndWait(() =>
                    {
                        var response = PostJsonObjecToLink<IEnumerable<MembersCheckResult>>
                            (ApiAddress.MemberApi.CheckingExternalMember + $"{CurrentParking.Id}", excelData);

                        if (response.HttpResponseType == System.Net.HttpStatusCode.OK || response.Values != null)
                        {
                            if (employeeGridControl.InvokeRequired)
                                employeeGridControl.Invoke(new MethodInvoker(() => { employeeGridControl.DataSource = response.Values; }));
                            else
                                employeeGridControl.DataSource = response.Values;
                        }
                        else
                            hasProblem = true;
                    });
                }
                else
                {
                    MessageShowError("فایل یافت نشد");
                }
            }
            else
            {
                DoWorkAsyncAndWait(() =>
                    {
                        var result = ExternalData.GetMembers();
                        var response = PostJsonObjecToLink<IEnumerable<MembersCheckResult>>
                            (ApiAddress.MemberApi.CheckingExternalMember + $"{CurrentParking.Id}", result);

                        if (response.HttpResponseType == System.Net.HttpStatusCode.OK || response.Values != null)
                        {
                            if (employeeGridControl.InvokeRequired)
                                employeeGridControl.Invoke(new MethodInvoker(() => { employeeGridControl.DataSource = response.Values; }));
                            else
                                employeeGridControl.DataSource = response.Values;
                        }
                        else
                            hasProblem = true;
                    });
            }
            if (hasProblem)
                MessageShowError("خطا در دریافت اطلاعات ");
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void updateMemberButton_Click(object sender, EventArgs e)
        {
            int[] handles = (employeeGridControl.MainView as GridView)?.GetSelectedRows();
            List<ExternalMember> members = new List<ExternalMember>();

            if (handles == null && handles.Length == 0)
            {
                MessageShowError("هیچگونه اطلاعاتی انتخاب نشده است");
                return;
            }

            foreach (var handle in handles)
            {
                var member = employeeGridControl.MainView.GetRow(handle) as MembersCheckResult;

                if (member == null)
                    continue;

                if (member.StatusType == CheckingStatusType.Error)
                {
                    MessageShowError("لطفا رکورد های بدون خطا را انتخاب نمایید");
                    return;
                }

                members.Add(member.GetExternalMember());
            }

            if (members.Count == 0)
            {
                MessageShowError("رکورد های انتخاب شده غیر قابل انتقال می باشند");
                return;
            }
            ResponseResultWeb<bool> response;
            if (ExcelMode)
            {
                response = PostJsonObjecToLinkAndWait<bool>(ApiAddress.MemberApi.ImportMembersExternalSource +
                    $"{CurrentParking.Id}", members, false);
            }
            else
            {
                response = PostJsonObjecToLinkAndWait<bool>(ApiAddress.MemberApi.UpdatingMembersThroughExternalSource +
                    $"{CurrentParking.Id}", members, false);
            }
            if (response.HttpResponseType == System.Net.HttpStatusCode.OK && response.Values)
            {
                if (ExcelMode)
                {
                    MessageShowInformation("دریافت اطلاعات اعضا از اکسل با موفقیت انجام شد");
                }
                else
                {
                    MessageShowInformation("بروز رسانی اعضا با موفقیت انجام شد");
                }
                this.Close();
            }
            else
            {
                MessageShowError("بروز رسانی با خطا روبرو شد");
            }
        }

        #endregion eventHandler
    }
}