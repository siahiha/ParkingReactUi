using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace EosParkingTools.Interfaces
{
    public interface IFilterPanel
    {
        IEosSendRecivedForm ParentForm{ get; set; }
        bool GetValues();
        ICollection<object> GetValuesSync();
        void ClearPanel();
        void ShowReport();

    }
}
