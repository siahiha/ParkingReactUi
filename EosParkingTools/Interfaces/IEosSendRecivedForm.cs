using EosParking.Controllers;
using EosParking.Data.EF.PagingModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace EosParkingTools.Interfaces
{
    public interface IEosSendRecivedForm
    {
        ResponseResultWeb<T> PostJsonObjecToLink<T>(string apiAdress, object sendValue);
        ResponseResultWeb<T> PostJsonObjecToLinkAndWait<T>(string apiAdress, object sendValue, bool allowCancel,bool lockParent=true);
        ResponseResultWeb<T> GetJsonObjecToLinkAndWait<T>(string apiAdress, object sendValue = null, bool allowCancel = true,bool lockParent=true);
        ResponseResultWeb<T> GetJsonObjecToLink<T>(string apiAdress, object sendValue = null, bool allowCancel = true);
        //ResponseResultWeb<T> GetJsonObjecToLink<T>(string apiAdress, object sendValue = null, bool allowCancel = true) where T : class;
    }
}
