using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;

namespace CRT571TESTDLL
{
    class DllClass
    {
        //打开串口
        [DllImport("CRT_571.dll")]
        public static extern UInt32 CommOpen(string port);
        //按指定的波特率打开串口
        [DllImport("CRT_571.dll")]
        public static extern long CommOpenWithBaut(string port, UInt32 Baudrate);
        //关闭串口
        [DllImport("CRT_571.dll")]
        public static extern int CommClose(UInt32 ComHandle);

        //int APIENTRY ExecuteCommand(HANDLE ComHandle,BYTE TxAddr,BYTE TxCmCode,BYTE TxPmCode,int TxDataLen,BYTE TxData[],BYTE *RxReplyType,BYTE *RxStCode0,BYTE *RxStCode1,BYTE *RxStCode2,int *RxDataLen,BYTE RxData[]);
        [DllImport("CRT_571.dll")]
        public static extern int ExecuteCommand(UInt32 ComHandle, byte TxAddr, byte TxCmCode, byte TxPmCode, UInt16 TxDataLen, byte[] TxData, ref byte RxReplyType, ref byte RxStCode0, ref byte RxStCode1, ref byte RxStCode2, ref UInt16 RxDataLen, byte[] RxData);

    }
}
