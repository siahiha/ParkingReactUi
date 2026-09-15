using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Printing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using QRCoder;
using System.Globalization;

namespace ReportDispenser
{
    public partial class print : Form
    {

        Bitmap bmpPrint;
        public print()
        {
            InitializeComponent();
        }
        MemoryStream strmPrint = new MemoryStream();
        private void PrintPage(object o, PrintPageEventArgs e)
        {
            //System.Drawing.Image img = System.Drawing.Image.FromFile("C:\\\\test\\\\form.bmp");
            System.Drawing.Image img = System.Drawing.Image.FromStream(strmPrint);
            
            Point loc = new Point(0, 0);
            e.Graphics.DrawImage(img, loc);
        }
        private void print_Load(object sender, EventArgs e)
        {

        }
        private void myPrintDocument2_PrintPage(System.Object sender, System.Drawing.Printing.PrintPageEventArgs e)
        {
            //Bitmap myBitmap1 = new Bitmap(myPicturebox.Width, myPicturebox.Height);
            //myPicturebox.DrawToBitmap(myBitmap1, new Rectangle(0, 0, myPicturebox.Width, myPicturebox.Height));
            e.Graphics.DrawImage(bmpPrint, 0, 0);
            //myBitmap1.Dispose();
        }
        public void doPrint(QrData qrData, string parkingName)
        {
            btnPrint.Visible = false;


            FillData(qrData);
            lblParkingName.Text = parkingName;
            this.Show();
            //Bitmap bmpPrint = new Bitmap(this.Width, this.Height);
            bmpPrint = new Bitmap(this.Width, this.Height);
            this.DrawToBitmap(bmpPrint, new Rectangle(Point.Empty, bmpPrint.Size));
            ////this.Hide();
            //strmPrint = new MemoryStream();
            bmpPrint.Save(strmPrint, ImageFormat.Bmp);

            //bmp.Save(@"C:\\test\\form.bmp", ImageFormat.Bmp);


            /*            PrintDocument pd = new PrintDocument();
                        pd.PrintPage += PrintPage;


                        //            float height = (((float)0.763 * printNumbers) + ((float)0.098 * (printNumbers - (float)1))) * 100;
                        PaperSize paperSize = new PaperSize("MY_PAGE_SIZE_NME", 100, 666);
                        paperSize.RawKind = 256;
                        pd.DefaultPageSettings.PaperSize = paperSize;


                        pd.Print();
            */





            PrinterSettings ps = new PrinterSettings();


            //IEnumerable<PaperSize> paperSizes = ps.PaperSizes.Cast<PaperSize>();
            //PaperSize sizeA4 = paperSizes.First<PaperSize>(size => size.Width == PaperKind.A4); // setting paper size to A4 size


            System.Drawing.Printing.PrintDocument myPrintDocument1 = new System.Drawing.Printing.PrintDocument();
            PrintDialog myPrinDialog1 = new PrintDialog();
            myPrintDocument1.PrintPage += new System.Drawing.Printing.PrintPageEventHandler(myPrintDocument2_PrintPage);
            myPrinDialog1.Document = myPrintDocument1;
            //            myPrintDocument1.DefaultPageSettings.PaperSize = sizeA4;
            myPrintDocument1.DefaultPageSettings.PaperSize = new PaperSize("210 x 297 mm", 284, 768);

            myPrintDocument1.Print();


        }

        private void FillData(QrData qrData)
        {
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(qrData.ToString(), QRCodeGenerator.ECCLevel.Q);
            QRCode qrCode = new QRCode(qrCodeData);
            Bitmap qrCodeImage = qrCode.GetGraphic(20);
            imgQrCode.Image = qrCodeImage;

            

            lblData_Time.Text = qrData.enteranceDate.ToString("HH:mm:ss");
            PersianCalendar pc = new PersianCalendar();
            lblData_Date.Text = string.Format("{0}/{1}/{2}", pc.GetYear(qrData.enteranceDate), pc.GetMonth(qrData.enteranceDate), pc.GetDayOfMonth(qrData.enteranceDate));


            if (qrData.faceID.Trim() == "0") { qrData.faceID = ""; }
            pnlFace.Visible = (!String.IsNullOrEmpty(qrData.faceID));
            lblFace.Text = qrData.faceID;


            if (qrData.cardID.Trim() == "0") { qrData.cardID = ""; }
            pnlCard.Visible = (!String.IsNullOrEmpty(qrData.cardID));
            lblCard.Text = qrData.cardID;

            try
            {
                lblPlate_1.Text = qrData.plate.Substring(0, 2);
                lblPlate_2.Text = qrData.plate.Substring(2, qrData.plate.Length - 7);
                lblPlate_3.Text = qrData.plate.Substring(qrData.plate.Length - 5, 3);
                lblPlate_4.Text = qrData.plate.Substring(qrData.plate.Length - 2, 2);
            }
            catch (Exception) {
                pnlPlate.Visible = false;
            }


        }

        private void btnPrint_Click(object sender, EventArgs e)
        {
        }

        private void pnlCard_Paint(object sender, PaintEventArgs e)
        {

        }
    }
}
