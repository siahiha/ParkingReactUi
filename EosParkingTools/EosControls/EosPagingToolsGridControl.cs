using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace EosParkingTools.EosControls
{
    public partial class EosPagingToolsGridControl : UserControl
    {
        private int pageNumber = 1;
        //private int totalPage=1;
        private EventHandler changePageNumberEvent;
        private EventHandler firstPageEvent;
        private EventHandler latestPageEvent;
        private int _totalRecordCount = 100;
        private int _pageRecordCount = 50;
        private EventHandler _changePageRecordCount;

        public int PageRecordCount { get => _pageRecordCount; set { _pageRecordCount = value; onChangePageNumber(); } }
        public int TotalRecordCount { get => _totalRecordCount; set { _totalRecordCount = value; onChangePageNumber(); } }
        public int PageNumber { get { return pageNumber; } set { pageNumber = Math.Max(Math.Min(value, TotalPage), 1); onChangePageNumber(); } }
        [Browsable(false)]
        public int TotalPage { get { return (TotalRecordCount / _pageRecordCount) +(TotalRecordCount % _pageRecordCount>0?1:0); }  /*set { totalPage =(int)Math.Max(value,pageNumber); onChangePageNumber(); }*/ }

        public event EventHandler OnChangePageNumber { add { changePageNumberEvent += value; } remove { changePageNumberEvent -= value; } }
        public event EventHandler OnChangePageRecordCount { add { _changePageRecordCount += value; } remove { _changePageRecordCount -= value; } }

        public event EventHandler OnFirstPage { add { firstPageEvent += value; } remove { firstPageEvent -= value; } }
        public event EventHandler OnLatestPage { add { latestPageEvent += value; } remove { latestPageEvent -= value; } }

        private void onChangePageNumber()
        {
            pageNomberLabel.Text = "صفحه " + pageNumber.ToString() + " از " + TotalPage.ToString();
        }

        public EosPagingToolsGridControl()
        {
            InitializeComponent();
        }

        private void PagingToolsGridControl_Load(object sender, EventArgs e)
        {

        }

        private void previousButton_Click(object sender, EventArgs e)
        {
            if (pageNumber > 1)
            {
                PageNumber--;
                if (changePageNumberEvent != null)
                    changePageNumberEvent(sender, e);
            }
            else
            {
                if (firstPageEvent != null)
                    firstPageEvent(sender, e);
            }
        }

        private void nextButton_Click(object sender, EventArgs e)
        {
            if (pageNumber < TotalPage)
            {
                PageNumber++;
                if (changePageNumberEvent != null)
                    changePageNumberEvent(sender, e);
            }
            else
            {
                if (latestPageEvent != null)
                    latestPageEvent(sender, e);
            }
        }

        private void pageCountComboBox_Validated(object sender, EventArgs e)
        {
            //(pageCountComboBox.SelectedIndex < pageCountComboBox.Properties.Items.Count - 1 ? int.Parse(pageCountComboBox.Text) : int.MaxValue);
            PageRecordCount = int.Parse(pageCountComboBox.Text);
            if (_changePageRecordCount != null)
                _changePageRecordCount(sender, e);
        }

        private void lastPageButton_Click(object sender, EventArgs e)
        {
            PageNumber = TotalPage;
            if (changePageNumberEvent != null)
                changePageNumberEvent(sender, e);
            if (latestPageEvent != null)
                latestPageEvent(sender, e);
        }

        private void firstPageButton_Click(object sender, EventArgs e)
        {
            pageNumber = 1;
            if (changePageNumberEvent != null)
                changePageNumberEvent(sender, e);
            if (latestPageEvent != null)
                latestPageEvent(sender, e);
        }
    }
}
