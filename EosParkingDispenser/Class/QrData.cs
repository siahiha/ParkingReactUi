using System;
using System.Collections.Generic;

namespace ReportDispenser
{
    public class QrData
    {
        //public string crc { get; set; }
        public string plate { get; set; }
        public DateTime enteranceDate { get; set; }
        public int tarrifID { get; set; }
        public int paidAmount { get; set; }
        public int userID { get; set; }
        public int doorID { get; set; }
        public int cash { get; set; }
        public string rnn { get; set; }
        public string cardID { get; set; }
        public string faceID { get; set; }
        public override string ToString()
        {
            string ret = "";
            string charSep = "#";
            var plate2 = PlateToNum(plate);
            string sDTime = enteranceDate.ToString("yyyyMMddHHmmss");
            string plateCrc = "00";
            try
            {
                plateCrc = plate2.Substring(plate2.Length - 2, 2);
            }
            catch { }
            string crc = sDTime.Substring(0,3)+"6913"+ plateCrc;
            
            ret = crc + charSep +
                    plate2 + charSep +
                    sDTime + charSep +
                    tarrifID.ToString() + charSep +
                    paidAmount.ToString() + charSep +
                    userID.ToString() + charSep +
                    doorID.ToString() + charSep +
                    cash.ToString() + charSep +
                    rnn + charSep +
                    cardID + charSep +
                    faceID + charSep;
            return ret; // "Person: " + Name + " " + Age;


            /*
            String crc = currentDateandTime.substring(9, 12) + "6913" + pelak.substring(0, 2);
                    3_ragham_akhar_DateTime + "6913" + 2_ragham_aval_Pelak


            String content = crc + "#" + pelak.trim() + "#" + currentDateandTime + "#" + tarrifId + "#" + paidAmount + "#" + selectedUser.getId() + "#" + selectedDoor.getId() + "#" + ((cash) ? "0" : "1") + "#" + rrn;

             */

        }

        private string PlateToNum(string plate)
        {
            var myDict = new Dictionary<string, string>
        {
            { "الف", "01" },
            { "ب", "02" },
            { "پ", "03" },
            { "ت", "04" },
            { "ث", "05" },
            { "ج", "06" },
            { "د", "07" },
            { "ز", "08" },
            { "ژ", "09" },
            { "س", "10" },
            { "ش", "11" },
            { "ص", "12" },
            { "ط", "13" },
            { "ع", "14" },
            { "ف", "15" },
            { "ق", "16" },
            { "ک", "17" },
            { "گ", "18" },
            { "ل", "19" },
            { "م", "20" },
            { "ن", "21" },
            { "و", "22" },
            { "ﻫ", "23" },
            { "ی", "24" },
            { "S", "25" },
            { "D", "26" },
            { "♿", "27" }
        };

            foreach (string key in myDict.Keys)
            {
                plate = plate.Replace(key, myDict[key]);

            }


            return plate;

        }
    }
}


