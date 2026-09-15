using CRT571TESTDLL;
using EosClocks;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace EosParkingDispenser
{
    public class CardDispenser
    {
        public class EquipmentEntity
        {
            public string Ip { get; set; }
            public int Port { get; set; } = 1001;
            public int ComPort { get; set; } = 3;
            public byte DeviceAddr { get; set; } = 0;
        }
        public class CardDespenserResult
        {
            public bool dispenserConnected { get; set; }
            public bool g4Connected { get; set; }
            public string CardID { get; set; }
            public string CardType { get; set; }
            public string CardStatus { get; set; }

            public string MessageText { get; set; }
            public int MessageID { get; set; } // if is 1 succesfull
            public double RestTimeRemain { get; set; } 
            
            public bool Successfull {
                get
                {
                    return this.MessageID==1;
                }
            }

        }


        private string _ip = "";
        private bool _faceDemo = false;
        private int _port = 1001;
        private int _comport = 3;
        private byte _deviceAddr = 00;
        UInt32 Hdle = 0;
        GateControler _gate = null;
        private int _restTimeSec = 20;
        private DateTime lastRunTime;

        //public event CardDespenserResult NotifyCardOut;
        public delegate void OnCardOut(CardDespenserResult cardResult);
        public static event OnCardOut onCardOut;
        public string logFilePath = "";
        
        public CardDispenser(EquipmentEntity equipment, int restTimeSec = 20, bool faceDemo = false)
        {
            try
            {
                _ip = equipment.Ip;
                _port = equipment.Port;
                _comport = equipment.ComPort;
                _deviceAddr = equipment.DeviceAddr;
                _restTimeSec = restTimeSec;
                _faceDemo = faceDemo;

                AddLog("          **********          START");
                AddLog($"CardDispenser --> IP:{_ip} Port:{_port} ComPort:{_comport} RestTimeSec:{_restTimeSec} FaceDemo:{faceDemo}");
            }
            catch (Exception ex)
            {
                AddLog($"CardDispenser ERROR--> {ex.Message}");
            }
        }
        public CardDespenserResult OpenCardDespenser()
        {
            AddLog($"OpenCardDespenser --> Hdle:{Hdle}");
            CardDespenserResult res = new CardDespenserResult();
            res.MessageID = 0;
            res.MessageText = "";
            bool bDespenserOpened = false;
            bool bG4Opened = false;
            //open despenser

            try
            {
                if (Hdle == 0)
                {
                    Hdle = DllClass.CommOpen("COM" + _comport.ToString());
                    AddLog($"OpenCardDespenser CommOpen--> Hdle:{Hdle} COM{_comport}");
                }
                if (Hdle != 0)
                {
                    res.MessageText += "openComPort,";

                    if (Hdle != 0)
                    {
                        byte Addr;
                        byte Cm, Pm;
                        UInt16 TxDataLen, RxDataLen;
                        byte[] TxData = new byte[1024];
                        byte[] RxData = new byte[1024];
                        byte ReType = 0;
                        byte St0, St1, St2;

                        Cm = 0x30;
                        Pm = 0x30;
                        St0 = St1 = St2 = 0;
                        TxDataLen = 0;
                        RxDataLen = 0;

                        //Addr = (byte)(byte.Parse(AddrComb.Text.Substring(0, 2), NumberStyles.Number));
                        Addr = _deviceAddr;
                        int i = DllClass.ExecuteCommand(Hdle, Addr, Cm, Pm, TxDataLen, TxData, ref ReType, ref St0, ref St1, ref St2, ref RxDataLen, RxData);
                        if (i == 0)
                        {
                            if (ReType == 0x50)
                            {
                                res.MessageText += "INITIALIZE Successed,";
                                bDespenserOpened = true;
                                AddLog($"OpenCardDespenser CommOpen--> Hdle:{Hdle} COM{_comport} Port is Opened");

                            }
                            else
                            {
                                res.MessageText += $"INITIALIZE ERRORCode({(char)St1}{(char)St2}),";
                            }

                        }
                        else
                        {
                            res.MessageText += "Communication Error for INITIALIZE,";
                        }
                    }
                    else
                    {
                        res.MessageText += "Comm. port is not Opened,";
                    }


                    if (!bDespenserOpened)
                    {
                        if (Hdle != 0)
                        {
                            int i = DllClass.CommClose(Hdle);
                            Hdle = 0;
                            res.MessageText += "closeComPort,";
                        }
                    }
                }
                else
                {
                    res.MessageText += "Open Comm. Port Error";
                    AddLog($"OpenCardDespenser CommOpen--> Hdle:{Hdle} COM{_comport} Port Error");
                }
            }
            catch (Exception ex)
            {
                res.MessageText += "Open Comm. Exception! " + ex.Message;
                AddLog($"OpenCardDespenser CommOpen--> Hdle:{Hdle} COM{_comport} Port Exception:{ex.Message}");
            }

            //open g4
            try
            {
                AddLog($"connecting G4--> {_ip}");

                if (_gate == null)
                {
                    _gate = new GateControler(_ip, _port);
                    _gate.NotifyProcessPressedButtonEvent += ProcessPressButton;
                }
                var isReady = _gate.PrepareBoard();
                if (isReady)
                {
                    bG4Opened = true;
                    res.MessageText += " , G4 is ready. " + _gate?.GetBoardStatus();
                }
                else
                {
                    _gate = null;
                    res.MessageText += "G4 not ready. ";
                }
                AddLog($"OpenCardDespenser G4-->IP:{_ip} Port:{_port} {res.MessageText}");
            }
            catch (Exception ex)
            {
                res.MessageText += "G4. Exception! " + ex.Message;
                AddLog($"OpenCardDespenser G4-->IP:{_ip} Port:{_port} Exception:{ex.Message}");
            }
            res.dispenserConnected = bDespenserOpened;
            res.g4Connected = bG4Opened;
            if (bDespenserOpened && bG4Opened)
            {
                res.MessageID = 1000;
            }

            AddLog($"OpenCardDespenser Response MessageID-->{res.MessageID}");
            return res;
        }


        public CardDespenserResult CloseCardDespenser()
        {
            CardDespenserResult res = new CardDespenserResult();
            res.MessageID = 0;
            res.MessageText = "";
            bool bDespenserOpened = false;
            bool bG4Opened = false;
            //close despenser

            try
            {
                if (Hdle != 0)
                {
                    int i = DllClass.CommClose(Hdle);
                    Hdle = 0;
                    res.MessageText +="Comm. Port is Closed";
                }
            }
            catch (Exception ex)
            {
                res.MessageText += "Close Comm. Exception! " + ex.Message;

            }

            //open g4
            try
            {
                if (_gate != null)
                {
                    _gate.NotifyProcessPressedButtonEvent -= ProcessPressButton;
                    _gate?.Disconnect();
                    _gate = null;
                    res.MessageText += ", G4 disconnected";
                }
                else
                {
                    res.MessageText += ", G4 connection not found";
                }
            }
            catch (Exception ex)
            {
                res.MessageText += ", G4 close exception! " + ex.Message;
            }

            if (bDespenserOpened && bG4Opened)
            {
                res.MessageID = 1;
            }
            AddLog($"CloseCardDespenser --> {res.MessageText}");
            return res;
        }

        public CardDespenserResult CardOut()
        {
            CardDespenserResult cardDespenserResult = new CardDespenserResult();
            cardDespenserResult.MessageID = 0;
            cardDespenserResult.MessageText = "";
            cardDespenserResult.CardID = "";

            /*
            Card Status:
            000: storage Empty
            020: in storage
            220: the RF card operation
            120: front,hold
            */
            string cardStatus = GetCardStatus();
            cardDespenserResult.CardStatus = cardStatus;
            AddLog($"CardOut --> Status:{cardStatus}");
            //if ((cardStatus != "020") && (cardStatus != "010"))
            if (cardStatus == "000")
            {
                cardDespenserResult.MessageText = "Card status error! " + cardStatus;
                cardDespenserResult.MessageID = 200;
                cardDespenserResult.CardStatus = cardStatus;
                AddLog($"CardOut StatusError --> Status:{cardStatus}");

                return cardDespenserResult;
            }



            if (Hdle != 0)
            {
                byte Addr;
                byte Cm, Pm;
                UInt16 TxDataLen, RxDataLen;
                byte[] TxData = new byte[1024];
                byte[] RxData = new byte[1024];
                byte ReType = 0;
                byte St0, St1, St2;

                Cm = 0x32;
                Pm = 0x32;
                St0 = St1 = St2 = 0;
                TxDataLen = 0;
                RxDataLen = 0;

                //Addr = (byte)(byte.Parse(AddrComb.Text.Substring(0, 2), NumberStyles.Number));
                //Addr = (byte)(byte.Parse("00", NumberStyles.Number));
                Addr = _deviceAddr;
                int i = DllClass.ExecuteCommand(Hdle, Addr, Cm, Pm, TxDataLen, TxData, ref ReType, ref St0, ref St1, ref St2, ref RxDataLen, RxData);
                if (i == 0)
                {
                    cardDespenserResult.MessageText += $"< ReType:[{ReType}], St0:[{St0}], St1:[{St1}] , St2:[{St2}], RxDataLen:[{RxDataLen}]  >";
                    if (ReType == 0x50)
                    {
                        cardDespenserResult.MessageText += "Move Card Successed , Status Code : " + (char)St0 + (char)St1 + (char)St2 + Environment.NewLine;
                    }
                    else
                    {
                        cardDespenserResult.MessageText += "Move Card ERROR , Error Code:  " + (char)St1 + (char)St2 + Environment.NewLine;
                        cardDespenserResult.MessageID = 101;

                        if (ReType != 80)
                        {
                            AddLog("clossing dispenser");
                            CloseCardDespenser();

                            OpenCardDespenser();
                            AddLog("openning dispenser");
                            cardDespenserResult.MessageText += "--RECONNECTING" + Environment.NewLine;
                        }
                        return cardDespenserResult;
                    }

                }
                else
                {
                    cardDespenserResult.MessageText += "Communication Error" + Environment.NewLine;
                    cardDespenserResult.MessageID = 102;
                    return cardDespenserResult;
                }
            }

            AddLog($"CardOut --> msgID:{cardDespenserResult.MessageID}   Msg:{cardDespenserResult.MessageText}");

            ////Get UID
            string CardUID = "";


            if (Hdle != 0)
            {
                byte Addr;
                byte Cm, Pm;
                UInt16 TxDataLen, RxDataLen;
                byte[] TxData = new byte[1024];
                byte[] RxData = new byte[1024];
                byte ReType = 0;
                byte St0, St1, St2;

                Cm = 0x60;
                Pm = 0x30;
                St0 = St1 = St2 = 0;
                TxDataLen = 2;
                RxDataLen = 0;

                TxData[0] = 0x41;
                TxData[1] = 0x42;
                //Addr = (byte)(byte.Parse(AddrComb.Text.Substring(0, 2), NumberStyles.Number));
                //Addr = (byte)(byte.Parse("00", NumberStyles.Number));
                Addr = _deviceAddr;

                int i = DllClass.ExecuteCommand(Hdle, Addr, Cm, Pm, TxDataLen, TxData, ref ReType, ref St0, ref St1, ref St2, ref RxDataLen, RxData);
                if (i == 0)
                {
                    if (ReType == 0x50)
                    {
                        int n;
                        switch (RxData[0])
                        {
                            case 0x4d:  //mifare one Card
                                {
                                    for (n = 0; n < RxData[3]; n++)
                                    {
                                        CardUID += RxData[n + 4].ToString("X2");
                                    }
                                    //MiUidtextBox.Text = CardUID;
                                    //EosParkingDispenser.Class.Helper.DispenserHexToCardID(s);
                                    cardDespenserResult.CardID = EosParkingDispenser.Class.Helper.DispenserHexToCardID(CardUID);

                                    switch (RxData[2])
                                    {
                                        case 68: //Mifare one UL card
                                            {
                                                cardDespenserResult.CardType = "Mifare one UL card";
                                                break;
                                            }
                                        case 4: //Mifare one S50 card
                                            {
                                                cardDespenserResult.CardType = "Mifare one S50 card";
                                                break;
                                            }
                                        case 2: //Mifare one S70 card
                                            {
                                                cardDespenserResult.CardType = "Mifare one S70 card";
                                                break;
                                            }
                                    }
                                    //MessageBox.Show("Mifare one Card Activate Successed\nCardUID: " + CardUID, "Activate RF Card");
                                    break;
                                }
                            case 0x41:   //type A card
                                {
                                    cardDespenserResult.CardType = "type A card";

                                    break;
                                }
                            case 0x42:   //type B card
                                {
                                    cardDespenserResult.CardType = "type B card";
                                    break;
                                }
                        }
                    }
                    else if ((ReType == 0x4e))
                    {
                        cardDespenserResult.CardType = "type RF card";
                        cardDespenserResult.MessageID = 103;
                        cardDespenserResult.MessageText += "Activate RF Card ERROR. code: " + (char)St1 + (char)St2;
                        return cardDespenserResult;
                    }
                    else
                    {
                        cardDespenserResult.MessageID = 104;
                        cardDespenserResult.MessageText += "Communication Error";
                        return cardDespenserResult;
                    }
                    AddLog($"CardOut --> CardType:{cardDespenserResult.CardType} CardID:{cardDespenserResult.CardID} msgID:{cardDespenserResult.MessageID}   Msg:{cardDespenserResult.MessageText}");
                }
                else
                {
                    cardDespenserResult.MessageID = 105;
                    cardDespenserResult.MessageText += "Communication Error";
                    AddLog($"CardOut --> msgID:{cardDespenserResult.MessageID}   Msg:{cardDespenserResult.MessageText}");
                    return cardDespenserResult;
                }
            }
            else
            {
                cardDespenserResult.MessageID = 106;
                cardDespenserResult.MessageText += "Communication Error";
                AddLog($"CardOut --> msgID:{cardDespenserResult.MessageID}   Msg:{cardDespenserResult.MessageText}");
                return cardDespenserResult;
            }



            // GoOut Card

            //bool MoveOutSuccessfull = false;


            if (Hdle != 0)
            {
                byte Addr;
                byte Cm, Pm;
                UInt16 TxDataLen, RxDataLen;
                byte[] TxData = new byte[1024];
                byte[] RxData = new byte[1024];
                byte ReType = 0;
                byte St0, St1, St2;

                Cm = 0x32;
                Pm = 0x30;
                St0 = St1 = St2 = 0;
                TxDataLen = 0;
                RxDataLen = 0;

                //Addr = (byte)(byte.Parse("00", NumberStyles.Number));
                Addr = _deviceAddr;

                int i = DllClass.ExecuteCommand(Hdle, Addr, Cm, Pm, TxDataLen, TxData, ref ReType, ref St0, ref St1, ref St2, ref RxDataLen, RxData);
                if (i == 0)
                {
                    if (ReType == 0x50)
                    {
                        //MoveOutSuccessfull = true;
                        cardDespenserResult.MessageID = 1;
                        cardDespenserResult.MessageText += "Move Card Successed. Status Code : " + (char)St0 + (char)St1 + (char)St2;
                        lastRunTime = DateTime.Now;
                    }
                    else
                    {
                        cardDespenserResult.MessageID = 107;
                        cardDespenserResult.MessageText += "Move Card ERROR. Error Code : " + (char)St1 + (char)St2;
                    }

                    AddLog($"CardOut --> msgID:{cardDespenserResult.MessageID}   Msg:{cardDespenserResult.MessageText}   lastRunTime:{lastRunTime}");
                }
                else
                {
                    cardDespenserResult.MessageID = 108;
                    cardDespenserResult.MessageText += "Communication Error";
                    AddLog($"CardOut --> msgID:{cardDespenserResult.MessageID}   Msg:{cardDespenserResult.MessageText} ");
                }
            }
            else
            {
                cardDespenserResult.MessageID = 109;
                cardDespenserResult.MessageText += "Comm. port is not Opened";
                AddLog($"CardOut --> msgID:{cardDespenserResult.MessageID}   Msg:{cardDespenserResult.MessageText} ");
            }

            return cardDespenserResult;

            //if (MoveOutSuccessfull)
            //{
            //    //MessageBox.Show($"Card Out-->{CardUID}", "");
            //}
        }

        public string GetCardStatus()
        {
            string sResult = "";
            if (Hdle != 0)
            {
                byte Addr;
                byte Cm, Pm;
                UInt16 TxDataLen, RxDataLen;
                byte[] TxData = new byte[1024];
                byte[] RxData = new byte[1024];
                byte ReType = 0;
                byte St0, St1, St2;

                Cm = 0x31;
                Pm = 0x30;
                St0 = St1 = St2 = 0;
                TxDataLen = 0;
                RxDataLen = 0;

                //Addr = (byte)(byte.Parse("00", NumberStyles.Number));
                Addr = _deviceAddr;

                int i = DllClass.ExecuteCommand(Hdle, Addr, Cm, Pm, TxDataLen, TxData, ref ReType, ref St0, ref St1, ref St2, ref RxDataLen, RxData);
                if (i == 0)
                {
                    if (ReType == 0x50)
                    {
                        sResult = "" + (char)St0 + (char)St1 + (char)St2;
                    }
                    else
                    {
                        sResult = "" + (char)St1 + (char)St2;
                    }

                }
                else
                {
                    AddLog($"GetCardStatus ERROR--> Communication Error");
                }
            }
            else
            {
                AddLog($"GetCardStatus ERROR--> Comm. port is not Opened");
            }
            AddLog($"GetCardStatus --> Status:{sResult}");


            return sResult;
        }


        public bool MoveCardBin()
        {
            bool bRet = false;
            if (Hdle != 0)
            {
                byte Addr;
                byte Cm, Pm;
                UInt16 TxDataLen, RxDataLen;
                byte[] TxData = new byte[1024];
                byte[] RxData = new byte[1024];
                byte ReType = 0;
                byte St0, St1, St2;

                Cm = 0x32;
                Pm = 0x33;
                St0 = St1 = St2 = 0;
                TxDataLen = 0;
                RxDataLen = 0;

                //Addr = (byte)(byte.Parse("00", NumberStyles.Number));
                Addr = _deviceAddr;

                int i = DllClass.ExecuteCommand(Hdle, Addr, Cm, Pm, TxDataLen, TxData, ref ReType, ref St0, ref St1, ref St2, ref RxDataLen, RxData);
                if (i == 0)
                {
                    if (ReType == 0x50)
                    {
                        bRet = true;
                        AddLog($"MoveCardBin Successed--> "+ "Status Code : " + (char)St0 + (char)St1 + (char)St2);
                    }
                    else
                    {
                        AddLog($"MoveCardBin ERROR--> " + "Error Code : " + (char)St1 + (char)St2);
                    }

                }
                else
                {
                    AddLog($"MoveCardBin ERROR--> Communication Error");
                }
            }
            else
            {
                AddLog($"MoveCardBin ERROR--> Comm. port is not Opened");
            }
            return bRet;

        }


        public bool ShootOut()
        {
            bool bRet = false;

            if (Hdle != 0)
            {
                byte Addr;
                byte Cm, Pm;
                UInt16 TxDataLen, RxDataLen;
                byte[] TxData = new byte[1024];
                byte[] RxData = new byte[1024];
                byte ReType = 0;
                byte St0, St1, St2;

                Cm = 0x32;
                Pm = 0x39;
                St0 = St1 = St2 = 0;
                TxDataLen = 0;
                RxDataLen = 0;

                //Addr = (byte)(byte.Parse("00", NumberStyles.Number));
                Addr = _deviceAddr;

                int i = DllClass.ExecuteCommand(Hdle, Addr, Cm, Pm, TxDataLen, TxData, ref ReType, ref St0, ref St1, ref St2, ref RxDataLen, RxData);
                if (i == 0)
                {
                    if (ReType == 0x50)
                    {
                        bRet = true;
                        AddLog($"ShootOut Move Successed--> Status Code: " + (char)St0 + (char)St1 + (char)St2);
                    }
                    else
                    {
                        AddLog($"ShootOut Move ERROR--> Error Code: " + (char)St1 + (char)St2);
                    }
                }
                else
                {
                    AddLog($"ShootOut ERROR--> Communication Error");
                }
            }
            else
            {
                AddLog($"ShootOut ERROR--> Comm. port is not Opened");
            }

            return bRet;

        }
        private  void ProcessPressButton()
        {
            CardDespenserResult res = new CardDespenserResult();

            if (!_faceDemo)
            {


                var diffInSeconds = (DateTime.Now - lastRunTime).TotalSeconds;
                if (diffInSeconds >= _restTimeSec)
                {
                    res = CardOut();
                    AddLog($"ShootOut --> CardOut");
                }
                else
                {
                    res.MessageText = $"in resting time. [{_restTimeSec - diffInSeconds} remains]";
                    res.MessageID = 11; //in rest time
                    res.RestTimeRemain = (_restTimeSec - diffInSeconds);
                    AddLog($"ShootOut --> ignore, " + res.MessageText);
                }
            }
            else
            {
                AddLog($"ShootOut --> ignore, FaceDemo mode");
                res.MessageText = $"ignore FaceDemo mode";
                res.MessageID = 1071; //in rest time
            }


            onCardOut(res);





        }

        public void AddLog(string msg)
        {
            try
            {
                if (System.IO.File.Exists(logFilePath))
                {
                    System.IO.File.AppendAllText(logFilePath, DateTime.Now.ToString("yyyyMMdd HH:mm:ss") + "   " + msg + Environment.NewLine);
                }
            }
            catch { }


        }
    }


}
