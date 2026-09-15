using EosParking.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace EosParkingTools.Utils
{
    #region Enum
    [Flags]
    public enum WindowStylesEx : uint
    {
        /// <summary>Specifies a window that accepts drag-drop files.</summary>
        WS_EX_ACCEPTFILES = 0x00000010,

        /// <summary>Forces a top-level window onto the taskbar when the window is visible.</summary>
        WS_EX_APPWINDOW = 0x00040000,

        /// <summary>Specifies a window that has a border with a sunken edge.</summary>
        WS_EX_CLIENTEDGE = 0x00000200,

        /// <summary>
        /// Specifies a window that paints all descendants in bottom-to-top painting order using double-buffering.
        /// This cannot be used if the window has a class style of either CS_OWNDC or CS_CLASSDC. This style is not supported in Windows 2000.
        /// </summary>
        /// <remarks>
        /// With WS_EX_COMPOSITED set, all descendants of a window get bottom-to-top painting order using double-buffering.
        /// Bottom-to-top painting order allows a descendent window to have translucency (alpha) and transparency (color-key) effects,
        /// but only if the descendent window also has the WS_EX_TRANSPARENT bit set.
        /// Double-buffering allows the window and its descendents to be painted without flicker.
        /// </remarks>
        WS_EX_COMPOSITED = 0x02000000,

        /// <summary>
        /// Specifies a window that includes a question mark in the title bar. When the user clicks the question mark,
        /// the cursor changes to a question mark with a pointer. If the user then clicks a child window, the child receives a WM_HELP message.
        /// The child window should pass the message to the parent window procedure, which should call the WinHelp function using the HELP_WM_HELP command.
        /// The Help application displays a pop-up window that typically contains help for the child window.
        /// WS_EX_CONTEXTHELP cannot be used with the WS_MAXIMIZEBOX or WS_MINIMIZEBOX styles.
        /// </summary>
        WS_EX_CONTEXTHELP = 0x00000400,

        /// <summary>
        /// Specifies a window which contains child windows that should take part in dialog box navigation.
        /// If this style is specified, the dialog manager recurses into children of this window when performing navigation operations
        /// such as handling the TAB key, an arrow key, or a keyboard mnemonic.
        /// </summary>
        WS_EX_CONTROLPARENT = 0x00010000,

        /// <summary>Specifies a window that has a double border.</summary>
        WS_EX_DLGMODALFRAME = 0x00000001,

        /// <summary>
        /// Specifies a window that is a layered window.
        /// This cannot be used for child windows or if the window has a class style of either CS_OWNDC or CS_CLASSDC.
        /// </summary>
        WS_EX_LAYERED = 0x00080000,

        /// <summary>
        /// Specifies a window with the horizontal origin on the right edge. Increasing horizontal values advance to the left.
        /// The shell language must support reading-order alignment for this to take effect.
        /// </summary>
        WS_EX_LAYOUTRTL = 0x00400000,

        /// <summary>Specifies a window that has generic left-aligned properties. This is the default.</summary>
        WS_EX_LEFT = 0x00000000,

        /// <summary>
        /// Specifies a window with the vertical scroll bar (if present) to the left of the client area.
        /// The shell language must support reading-order alignment for this to take effect.
        /// </summary>
        WS_EX_LEFTSCROLLBAR = 0x00004000,

        /// <summary>
        /// Specifies a window that displays text using left-to-right reading-order properties. This is the default.
        /// </summary>
        WS_EX_LTRREADING = 0x00000000,

        /// <summary>
        /// Specifies a multiple-document interface (MDI) child window.
        /// </summary>
        WS_EX_MDICHILD = 0x00000040,

        /// <summary>
        /// Specifies a top-level window created with this style does not become the foreground window when the user clicks it.
        /// The system does not bring this window to the foreground when the user minimizes or closes the foreground window.
        /// The window does not appear on the taskbar by default. To force the window to appear on the taskbar, use the WS_EX_APPWINDOW style.
        /// To activate the window, use the SetActiveWindow or SetForegroundWindow function.
        /// </summary>
        WS_EX_NOACTIVATE = 0x08000000,

        /// <summary>
        /// Specifies a window which does not pass its window layout to its child windows.
        /// </summary>
        WS_EX_NOINHERITLAYOUT = 0x00100000,

        /// <summary>
        /// Specifies that a child window created with this style does not send the WM_PARENTNOTIFY message to its parent window when it is created or destroyed.
        /// </summary>
        WS_EX_NOPARENTNOTIFY = 0x00000004,

        /// <summary>Specifies an overlapped window.</summary>
        WS_EX_OVERLAPPEDWINDOW = WS_EX_WINDOWEDGE | WS_EX_CLIENTEDGE,

        /// <summary>Specifies a palette window, which is a modeless dialog box that presents an array of commands.</summary>
        WS_EX_PALETTEWINDOW = WS_EX_WINDOWEDGE | WS_EX_TOOLWINDOW | WS_EX_TOPMOST,

        /// <summary>
        /// Specifies a window that has generic "right-aligned" properties. This depends on the window class.
        /// The shell language must support reading-order alignment for this to take effect.
        /// Using the WS_EX_RIGHT style has the same effect as using the SS_RIGHT (static), ES_RIGHT (edit), and BS_RIGHT/BS_RIGHTBUTTON (button) control styles.
        /// </summary>
        WS_EX_RIGHT = 0x00001000,

        /// <summary>Specifies a window with the vertical scroll bar (if present) to the right of the client area. This is the default.</summary>
        WS_EX_RIGHTSCROLLBAR = 0x00000000,

        /// <summary>
        /// Specifies a window that displays text using right-to-left reading-order properties.
        /// The shell language must support reading-order alignment for this to take effect.
        /// </summary>
        WS_EX_RTLREADING = 0x00002000,

        /// <summary>Specifies a window with a three-dimensional border style intended to be used for items that do not accept user input.</summary>
        WS_EX_STATICEDGE = 0x00020000,

        /// <summary>
        /// Specifies a window that is intended to be used as a floating toolbar.
        /// A tool window has a title bar that is shorter than a normal title bar, and the window title is drawn using a smaller font.
        /// A tool window does not appear in the taskbar or in the dialog that appears when the user presses ALT+TAB.
        /// If a tool window has a system menu, its icon is not displayed on the title bar.
        /// However, you can display the system menu by right-clicking or by typing ALT+SPACE.
        /// </summary>
        WS_EX_TOOLWINDOW = 0x00000080,

        /// <summary>
        /// Specifies a window that should be placed above all non-topmost windows and should stay above them, even when the window is deactivated.
        /// To add or remove this style, use the SetWindowPos function.
        /// </summary>
        WS_EX_TOPMOST = 0x00000008,

        /// <summary>
        /// Specifies a window that should not be painted until siblings beneath the window (that were created by the same thread) have been painted.
        /// The window appears transparent because the bits of underlying sibling windows have already been painted.
        /// To achieve transparency without these restrictions, use the SetWindowRgn function.
        /// </summary>
        WS_EX_TRANSPARENT = 0x00000020,

        /// <summary>Specifies a window that has a border with a raised edge.</summary>
        WS_EX_WINDOWEDGE = 0x00000100
    }
    #endregion

    #region Struct
    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct BlendFunction
    {
        public byte Opration;
        public byte flags;
        public byte srcConstAlpha;
        public byte AlphaFormat;
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct Win32Size
    {
        public int x;
        public int y;
        public Win32Size(int _x, int _y)
        { x = _x; y = _y; }
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct PointW32
    {
        public int x;
        public int y;
        public PointW32(int _x, int _y)
        { x = _x; y = _y; }
    }
    #endregion


    public static class ReportsViewer
    {
        public static byte[] GetEmbeddedResource(string ns, string res)
        {
            byte[] rep;
            using (var reader = new StreamReader(Assembly.GetExecutingAssembly().GetManifestResourceStream(string.Format("{0}.{1}", ns, res))))
            {
                rep = new byte[reader.BaseStream.Length];
                reader.BaseStream.Read(rep, 0, rep.Length);
            }
            return rep;
        }

        public static void ShowReportResource<T>(string resourceReportName, List<T> items, List<KeyValuePair<string, object>> parameters = null, bool isDialog = true) where T : class
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                var asamblyName = System.Reflection.Assembly.GetExecutingAssembly().GetName().Name + ".EosControls.ReportDesign.";
                byte[] rep;
                using (Stream stream = assembly.GetManifestResourceStream(asamblyName + resourceReportName))
                {
                    rep = new byte[stream.Length];
                    stream.Read(rep, 0, rep.Length);
                }
                var dt = items.AsQueryable<T>();
                ReportHelper.ShowReport(rep, dt, parameters, isDialog);
            }
            catch { }
        }

        public static void ShowReportResource(string resourceReportName, DataTable items, List<KeyValuePair<string, object>> parameters = null, bool isDialog = true)
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                var asamblyName = System.Reflection.Assembly.GetExecutingAssembly().GetName().Name + ".EosControls.ReportDesign.";
                byte[] rep;
                using (Stream stream = assembly.GetManifestResourceStream(asamblyName + resourceReportName))
                {
                    rep = new byte[stream.Length];
                    stream.Read(rep, 0, rep.Length);
                }
                ReportHelper.ShowReport(rep, items, parameters, isDialog);
            }
            catch { }
        }

        public static void ShowReportResource(string resourceReportName, DataSet items, List<KeyValuePair<string, object>> parameters = null, bool isDialog = true)
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                var asamblyName = System.Reflection.Assembly.GetExecutingAssembly().GetName().Name + ".EosControls.ReportDesign.";
                byte[] rep;
                using (Stream stream = assembly.GetManifestResourceStream(asamblyName + resourceReportName))
                {
                    rep = new byte[stream.Length];
                    
                    stream.Read(rep, 0, rep.Length);
                }
                ReportHelper.ShowReport(rep, items, parameters, isDialog);
            }
            catch { }
        }

        public static void PrintReportResource<T>(string resourceReportName, List<T> items, bool showPrintDialog=false, bool showPrograss = false, List<KeyValuePair<string, object>> parameters = null) where T : class
        {
            var assembly = Assembly.GetExecutingAssembly();
            var asamblyName = System.Reflection.Assembly.GetExecutingAssembly().GetName().Name + ".EosControls.ReportDesign.";
            byte[] rep;
            using (Stream stream = assembly.GetManifestResourceStream(asamblyName + resourceReportName))
            {
                rep = new byte[stream.Length];
                stream.Read(rep, 0, rep.Length);
            }
            var dt = items.AsQueryable<T>();
            ReportHelper.PrintReport(rep, dt, showPrintDialog,showPrograss,parameters);
        }
        public static void PrintReportResourceSync<T>(string resourceReportName, List<T> items, bool showPrintDialog = false, bool showPrograss = false,List<KeyValuePair<string,object>> parameters=null) where T : class
        {
            try
            {
                Task.Factory.StartNew(() =>
                {
                    PrintReportResource<T>(resourceReportName, items, showPrintDialog, showPrograss, parameters);
                }).Wait(500);
            }
            catch { }
        }

    }
    internal static class Win32API
    {
        [DllImport("Gdi32.dll", EntryPoint = "CreateRoundRectRgn")]
        public static extern IntPtr CreateRoundRectRgn
        (
            int nLeftRect,     // x-coordinate of upper-left corner
            int nTopRect,      // y-coordinate of upper-left corner
            int nRightRect,    // x-coordinate of lower-right corner
            int nBottomRect,   // y-coordinate of lower-right corner
            int nWidthEllipse, // height of ellipse
            int nHeightEllipse // width of ellipse
        );

        [DllImport("User32.dll")]
        public extern static bool ReleaseCapture();
        [DllImport("User32.dll")]
        public extern static int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

        [DllImport("user32.dll")]
        public extern static IntPtr GetDC(IntPtr hwnd);

        [DllImport("user32.dll")]
        public static extern bool SetLayeredWindowAttributes(IntPtr hwnd, uint crKey, byte bAlpha, uint dwFlags);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern UInt32 GetWindowLong(IntPtr hWnd, int nIndex);

        [DllImport("user32.dll")]
        public static extern int SetWindowLong(IntPtr hWnd, int nIndex, IntPtr dwNewLong);

        public const int GWL_EXSTYLE = -20;
        //public const int WS_EX_LAYERED = 0x00080000;
        public const int LWA_ALPHA = 0x2;
        public const int LWA_COLORKEY = 0x1;

        [DllImport("user32.dll")]
        public extern static bool UpdateLayeredWindow(IntPtr hwnd, IntPtr hdc, ref PointW32 ppdst, ref Win32Size psize, IntPtr hdsstr
            , ref PointW32 pprsrc, int crkey, ref BlendFunction pblend, int dwflag);

        [DllImport("user32.dll")]
        public extern static IntPtr ReleaseDC(IntPtr hwnd, IntPtr dc);

        [DllImport("gdi32.dll")]
        public extern static IntPtr CreateCompatibleDC(IntPtr hdc);
        [DllImport("gdi32.dll")]
        public extern static bool DeleteDC(IntPtr hdc);
        [DllImport("gdi32.dll")]
        public extern static IntPtr SelectObject(IntPtr hdc, IntPtr hobj);
        [DllImport("gdi32.dll")]
        public extern static bool DeleteObject(IntPtr hobj);

        public static void ForceToMoveForm(System.Windows.Forms.Form frm)
        {
            Win32API.ReleaseCapture();
            Win32API.SendMessage(frm.Handle, 0xA1, 2, 0);
        }
    }
}
