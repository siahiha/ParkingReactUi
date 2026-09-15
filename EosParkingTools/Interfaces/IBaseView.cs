using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace EosParkingTools.Interfaces
{
    interface IBaseView
    {
        void FillView(object bindingData);
        void FillViewData(object bindingData);
    }
}
