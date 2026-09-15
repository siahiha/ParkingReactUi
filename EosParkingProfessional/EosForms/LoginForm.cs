using System;
using System.Windows.Forms;
using EosParking.Controllers;
using EosParking.Core.Helpers;
using EosParking.Data.Dto;
using EosParkingProfessional.Models;
using Newtonsoft.Json.Linq;

namespace EosParkingProfessional.EosForms
{
    public partial class LoginForm : EosParkingTools.EosForms.EosBaseDialogForm
    {
        public LoginForm()
        {
            InitializeComponent();
            WebAddress = PublicVariables.ServerAddress;
            eosLogin1.UserName = PublicVariables.GetLocalSetting("UserLogin");
        }

        public override bool IsValid { get { return eosLogin1.IsValid; } }


        private void cancelButton_Click(object sender, EventArgs e)
        {
            //using (var r = new TrafficRepository())
            //{
            //    var x = r.context.Members.Where(q => q.Id > 2).ToList();

            //    ReportHelper.ShowReport(@"D:\stiRep\ReportA4.mrt", x,true);
            //}
            //EosParking.Core.Helpers.PlateDetector Pd = new PlateDetector(Handle);
            //Pd.Recognize_Buffer((Bitmap)Bitmap.FromFile(@"d:\qweqweasd.bmp"));
            Close();
        }

        private void okButton_Click(object sender, EventArgs e)
        {
            if (!IsValid)
            {
                MessageShowValidationError();
                return;
            }
            //using (var r = new TrafficRepository())
            //{
            //    //var x = r.DoExitDump(new EosParking.Data.EF.Entities.TrafficDumpEntity() { Id = 10, MemberId = 0, EnterDateTime = DateTime.Parse("2019-07-02 09:11:50", new System.Globalization.CultureInfo("en-US", false)), ExitDateTime = DateTime.Now });
            //    var x = r.GetOccupedHourlyPark(1,DateTime.Parse("2019-07-01", new System.Globalization.CultureInfo("en-US", false)),  DateTime.Now );
            //}
            Waiting(true);
            try
            {
                var d = new UserDto() { UserName = eosLogin1.UserName, UserPass = eosLogin1.Password.Encrypt(), UserPassEncrypted = true };

                DashboardForm frm = null;
                var result = PostJsonObjecToLinkAndWait<object>(ApiAddress.UserApi.Login, d, true, false);
                Application.DoEvents();
                if (result.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && (result.Values == null || ((result.Values as JObject).ToObject<UserDto>()).Id == 0))
                {
                    MessageShowError("کاربری با این مشخصات یافت نشد.");
                    return;
                }
                else if (result.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && result.Values != null)
                {
                    Hide();
                    eosLogin1.SavePassword();
                    PublicVariables.CurrentUser = ((result.Values as JObject).ToObject<UserDto>());
                    PublicVariables.SetLocalSetting("UserLogin", PublicVariables.CurrentUser.UserName);
                    WebHelper.UserToken = PublicVariables.CurrentUser.UserToken;
                    frm = new DashboardForm();
                    frm.RibbonVisibility = DevExpress.XtraBars.Ribbon.RibbonVisibility.Hidden;
                    frm.ShowDialog();
                }
                else if (result.HttpResponseType == System.Net.HttpStatusCode.ServiceUnavailable || result.HttpResponseType == System.Net.HttpStatusCode.BadGateway)
                {
                    MessageShowError("سرور در دسترس نیست.");
                    return;
                }
                else
                {
                    var message = !String.IsNullOrEmpty(result.Message) ? result.Message : result.RealMessage;

                    if (String.IsNullOrEmpty(message))
                        message = "هیچ پاسخی از سرور نظر دریافت نشد";

                    MessageShowError(message);
                    if (result.Values != null)
                    {
                        eosLogin1.SetCaptcha(GraphicsHelper.ImageFromBase64(result.Values.ToString()));
                    }
                    return;
                }

                if (frm != null && frm.DialogResult == DialogResult.Retry)
                {
                    Show();
                    this.Focus();
                    this.Activate();
                }
                else
                    Close();

            }
            catch (Exception ex)
            {
                MessageShowError(ex);
                Show();
                BringToFront();
            }
        }

        private void eosLogin1_OnLoginValidate(object sender, EventArgs e)
        {
            okButton_Click(sender, e);
        }
    }
}
