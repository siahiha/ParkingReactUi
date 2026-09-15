using EosParking.Controllers;
using EosParking.Core.ImportData;
using EosParking.Core.Models;
using EosParking.Data.EF.Entities;
using EosParkingTools.EosForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Text;
using System.Windows.Forms;

namespace EosParkingProfessional.EosForms
{
    public partial class ImportDataConfigurationForm : EosBaseForm
    {
        #region readonly & Constant
        private readonly ParkingEntity _parkingEntity;

        #endregion

        #region ctor
        public ImportDataConfigurationForm(ParkingEntity entity)
        {
            InitializeComponent();
            _parkingEntity = entity;
        }
        #endregion

        #region Events Handler
        private void ImportDataConfigurationForm_Load(object sender, EventArgs e)
        {
            InitializeForm();
        }

        private void SavedConfigurationButton_Click(object sender, EventArgs e)
        {
            SaveChanges();
        }

        private void cancelButton_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void TestConnectionButton_Click(object sender, EventArgs e)
        {
            WebServiceTestConnection();
        }

        #endregion

        #region private Method
        private void InitializeForm()
        {
            if (!String.IsNullOrEmpty(_parkingEntity.EtsDataProviderURL))
                webServiceURLTextBox.Text = _parkingEntity.EtsDataProviderURL;
        }
        private void WebServiceTestConnection()
        {
            if (String.IsNullOrEmpty(webServiceURLTextBox.Text))
            {
                MessageShowError("آدرس وب سرویس ETS را کامل نمایید!");
                return;
            }

            var etsDataService = new ETSData(webServiceURLTextBox.Text);
            bool test = false;
            try
            {
                IEnumerable<ExternalMember> result = null;

                DoWorkAsyncAndWait(() => {
                    try
                    {
                        test = etsDataService.TestConnection();
                        result = etsDataService.GetMembers();
                    }
                    catch { }
                }, false, true);
                
                if (result != null && result.Any())
                    MessageShowInformation("ارتباط با سرویس برقرار می باشد");
                else if (!test)
                    MessageShowError("قطع ارتباط با وب سرویس");
                else
                    MessageShowError("قطع ارتباط با سیستم حضور و غیاب");
            }
            catch(Exception ex)
            {
                MessageShowError(ex);
            }

        }
        private void SaveChanges()
        {
            _parkingEntity.EtsDataProviderURL = String.IsNullOrEmpty(webServiceURLTextBox.Text) ? null : webServiceURLTextBox.Text;

            ResponseResultWeb<bool> response = null;

            try{response  = PostJsonObjecToLink<bool>(ApiAddress.ParkingApi.Save, _parkingEntity);}
            catch{}

            if (response != null && response.HttpResponseType == HttpStatusCode.OK && response.Values)
            {
                MessageShowSucsess();
                this.Close();
            }
            else
                MessageShowError("امکان ذخیره تنظیمات وجود ندارد");
        }

        #endregion
    }
}
