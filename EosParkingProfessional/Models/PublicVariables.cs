using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using EosParking.Controllers;
using EosParking.Core.Enums;
using EosParking.Core.Helpers;
using EosParking.Data.Dto;
using EosParking.Data.EF.Dto;
using EosParking.Data.EF.Entities;
using EosParking.Devices;
using Newtonsoft.Json.Linq;

namespace EosParkingProfessional.Models
{
    public static class PublicVariables
    {
        public static ActiveDeviceList ActiveDevices = new ActiveDeviceList();

        private static string serverAddress;
        public static UserDto CurrentUser { get; set; }

        public static List<CarModelEntity> CarModels { get; set; }
        public static List<CarColorEntity> CarColors { get; set; }
        public static int MessageDialogTimeoutSecond { get; set; }

        // public int MessageTimOut { get; set; }

        public static string ServerAddress {
            get
            {
                serverAddress= serverAddress.EndsWith("/") ? serverAddress : (serverAddress + "/");
                return serverAddress;
            }
            set { serverAddress = value.EndsWith("/")?value:(value+"/"); } }
        public static bool EncryptConfig { get; set; } = false;
        public static bool PrintAutomatic { get; set; }

        public static bool RefreshVlaues()
        {
            try
            {
                EncryptConfig = bool.Parse(ConfigurationManager.AppSettings["EncryptConfig"]?.ToLower());
                serverAddress = ConfigurationManager.AppSettings["ServerAddress"];
                PrintAutomatic = bool.Parse(ConfigurationManager.AppSettings["PrintAutomatic"]?.ToLower());
                if (EncryptConfig) Decrypt(ref serverAddress);

                MessageDialogTimeoutSecond = int.Parse(ConfigurationManager.AppSettings["MessageDialogTimeoutSecond"]?.ToLower()??"0");
                
                return true;
            }
            catch(Exception e) {
                MessageBox.Show(e.ToString());
                return false; }
        }

        public static void GetParkingTitles(int waitMinliSecForResult=0)
        {
            var t=Task.Factory.StartNew(() =>
            {
                try
                {
                    var respons = WebHelper.GetFromLink_Class<ParkingTitlesDto>(serverAddress + ApiAddress.ParkingApi.GetCarModelsAndColors);
                    if (respons != null && respons.HttpResponseType == System.Net.HttpStatusCode.OK && respons.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok)
                    {
                        CarColors = respons.Values.CarColors;
                        CarModels = respons.Values.CarModels;
                    }

                }
                catch { }
            });
            if (waitMinliSecForResult > 0)
                t.Wait(waitMinliSecForResult);
            
        }

        public static void RefreshLogin()
        {
            UserDto d = new UserDto() { UserName = CurrentUser.UserName, UserPass = CurrentUser.UserPass };

            //DashboardForm frm = null;
            var result = WebHelper.PostJsonObjecToLink<object>(serverAddress+ApiAddress.UserApi.Login, d);
            Application.DoEvents();
            if (result.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && (result.Values == null || ((result.Values as JObject).ToObject<UserDto>()).Id == 0))
            {
                //MessageShowError("کاربری با این مشخصات یافت نشد.");
                return;
            }
            else if (result.ResponseResultType == EosParking.Core.Enums.ResponseResultTypes.Ok && result.Values != null)
            {
                //Hide();
                //eosLogin1.SavePassword();
                PublicVariables.CurrentUser = ((result.Values as JObject).ToObject<UserDto>());
                WebHelper.UserToken = PublicVariables.CurrentUser.UserToken;
                //frm = new DashboardForm();
                //frm.RibbonVisibility = DevExpress.XtraBars.Ribbon.RibbonVisibility.Hidden;
                //frm.ShowDialog();
            }
            else if (result.HttpResponseType == System.Net.HttpStatusCode.ServiceUnavailable || result.HttpResponseType == System.Net.HttpStatusCode.BadGateway)
            {
                //MessageShowError("سرور در دسترس نیست.");
                return;
            }
            else
            {
                //MessageShowError(result.Message);
                if (result.Values != null)
                {
                    //eosLogin1.SetCaptcha(GraphicsHelper.ImageFromBase64(result.Values.ToString()));
                }
                return;
            }
        }

        static void Decrypt(ref string value)
        {
            try
            {
                value = value.Decrypt();
            }
            catch
            {

            }
        }

        public static bool CheckUserAccess(AccessItemTypes accessItemTypes)
        {
            if (CurrentUser == null)
                return false;
            return (CurrentUser.AccessPermissionValuePart1 & (long)accessItemTypes) == (long)accessItemTypes;
        }

        public static string[] GetAllLocalSetting()
        {
            var path = Application.StartupPath + "\\localsetting.dat";
            try
            {
                if (File.Exists(path))
                {
                    return File.ReadAllLines(path);
                }
            }
            catch { }
            return new string[0];
        }

        public static string GetLocalSetting(string keyName)
        {
            return GetAllLocalSetting().Where(q => q.StartsWith(keyName + ":")).Select(q=>q.Replace(keyName + ":", "")).FirstOrDefault();
        }
        public static bool SetLocalSetting(string keyName,string value)
        {
            try
            {
                var lines = GetAllLocalSetting();
                //   var line= lines.FirstOrDefault(q => q.StartsWith(keyName + ":"));
                bool set = false;
                for (int i = 0; i < lines.Length; i++)
                {
                    if (lines[i].StartsWith(keyName + ":"))
                    {
                        lines[i] = keyName + ":" + value;
                        set = true;
                    }
                }
                if(!set)
                {
                    var li = lines.ToList();
                    li.Add(keyName + ":" + value);
                    lines = li.ToArray();
                }
                var path = Application.StartupPath + "\\localsetting.dat";
                File.WriteAllLines(path, lines);
                return true;
            }
            catch { }
            return false;
        }

    }
}
