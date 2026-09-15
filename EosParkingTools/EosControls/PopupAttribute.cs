using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Text;

namespace EosParkingTools.EosControls
{
    [AttributeUsage(AttributeTargets.Class)]
    public sealed class PopupAttribute : Attribute
    {
        //
        // Summary:
        //     The default System.Windows.Forms.DockingAttribute for this control.
        public static readonly bool Default=false;

        //
        // Summary:
        //     Initializes a new instance of the System.Windows.Forms.DockingAttribute class.
        public PopupAttribute() { }
        //
        // Summary:
        //     Initializes a new instance of the System.Windows.Forms.DockingAttribute class
        //     with the given docking behavior.
        //
        // Parameters:
        //   dockingBehavior:
        //     A System.Windows.Forms.DockingBehavior value specifying the default behavior.
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public PopupAttribute(bool dropInDesign)
        {
            //Default = dropInDesign;
        }

        //
        // Summary:
        //     Gets the docking behavior supplied to this attribute.
        //
        // Returns:
        //     A System.Windows.Forms.DockingBehavior value.
        public bool DropInDesign { get=> Default; }

        ////
        //// Summary:
        ////     Compares an arbitrary object with the System.Windows.Forms.DockingAttribute object
        ////     for equality.
        ////
        //// Parameters:
        ////   obj:
        ////     The System.Object against which to compare this System.Windows.Forms.DockingAttribute.
        ////
        //// Returns:
        ////     true is obj is equal to this System.Windows.Forms.DockingAttribute; otherwise,
        ////     false.
        //public override bool Equals(object obj);
        ////
        //// Summary:
        ////     The hash code for this object.
        ////
        //// Returns:
        ////     An System.Int32 representing an in-memory hash of this object.
        //public override int GetHashCode();
        ////
        //// Summary:
        ////     Specifies whether this System.Windows.Forms.DockingAttribute is the default docking
        ////     attribute.
        ////
        //// Returns:
        ////     true is the current System.Windows.Forms.DockingAttribute is the default; otherwise,
        ////     false.
        //public override bool IsDefaultAttribute();
    }
}
