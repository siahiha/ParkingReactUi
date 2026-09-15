
using AForge.Vision.Motion;
using EosParking.Core.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Forms;
using VidGrab;
using WebSocketSharp;
using Npgsql;
using EosParking.Core.Models;

namespace EosParkingTools.EosControls.Views
{
    public delegate void OnFrameBitmapHandler(object sender, Bitmap image);
    public class EosIpCamView : Panel
    {
        private VideoGrabber videoGrabber;
        private OnFrameBitmapHandler _onFrameBitmapRecived;
        private DevExpress.XtraEditors.SimpleButton fullButton;
        EosParking.Core.Helpers.PlateDetector Pd;
        private int retryConnect = 0;
        private EosLabel eosLabel1;
        
        public List<KeyValuePair<string, DateTime>> _plateDetectList = new List<KeyValuePair<string, DateTime>>();
        //private EosLabel eosLabel2;
        private string _plateDetectorError = "";
        private List<Bitmap> frames = new List<Bitmap>();
        private Bitmap _frameBuffer;

        private string _plate;
        private EventHandler _onNewPlateDetected;
        private EventHandler _onNewPlateDetectRepeated;
        Thread plateDetectorThread;
        private string _plateDetectorAddress = "http://192.168.10.138:8080";
        private int framesCount = 2;
        int framCaptuered = 0;
        int framProceces = 0;
        MotionDetector detector = new MotionDetector(
            new TwoFramesDifferenceDetector(),
            new MotionBorderHighlighting());
        float motionV = 0;

        public Rectangle DetectPlateRegion { get => _detectPlateRegion; set => _detectPlateRegion = value; }
        public Bitmap CurrentPlateBitmap { get => _currentPlateBitmap; set => _currentPlateBitmap = value; }

        public float MotionAlarmLevel { get => _motionAlarmLevel; /*set => _motionAlarmLevel = value; */}
        public string PlateDetectorAddress { get => _plateDetectorAddress; set => _plateDetectorAddress = value; }
        public DateTime LastPlateDateTime { get; set; } = DateTime.MinValue;
        public DateTime LastUnDetectedPlateDateTime { get; set; } = DateTime.MinValue;
        public string Plate { get => _plate; set => _plate = value; }
        public int Zoom { get => _zoom; set { _zoom = value; try { if (videoGrabber != null) videoGrabber.SetZoomCoeff(videoGrabber.GetZoomCoeff() + _zoom); } catch { } } }


        public Bitmap FrameBuffer { get { if (_frameBuffer != null) lock (_frameBuffer) return _frameBuffer; else return null; }/* set => _frameBuffer = value;*/ }

        public string IpCamUrl { get; set; }
        public int Port { get; set; } = 80;
        public string UserName { get; set; }
        public string Password { get; set; }
        public bool IsConnect { get; set; } = false;
        public bool ActivePlateDetector { get; set; } = false;
        public bool ActiveRegionSelector { get; set; } = false;
        public Size VideoSize { get; set; } = new Size(0, 0);
        public bool StretchVideo { get; set; }
        public bool WaiteForNextPlate { get; set; }
        public bool DontCheckPlateInCurrentList { get; set; }


        public void ClearFrames()
        {
            frames.Clear();
            _frameBuffer = null;
            _currentPlateBitmap = null;
        }

        public byte[] CompressedFrameBufferToByte(int width = 0, int height = 0, bool crop = false)
        {
            try
            {
                if (_frameBuffer == null && frames.Count > 0)
                    framproc();
                if (_frameBuffer == null)
                    return null;
                if ((height + width) > 0)
                {
                    if (crop)
                    {
                        if (width < _frameBuffer.Width - 1 && height < _frameBuffer.Height - 1)
                        {
                            using (var img = (Bitmap)_frameBuffer.Clone(new Rectangle((_frameBuffer.Width - width) / 2, (_frameBuffer.Height - height) / 2, width, height), _frameBuffer.PixelFormat))
                            {
                                return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                            }
                        }
                        else
                        {
                            using (var img = GraphicsHelper.ResizeImage(_frameBuffer, _frameBuffer.Width, _frameBuffer.Height))
                            {
                                return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                            }
                        }
                    }
                    else
                    {
                        using (var img = GraphicsHelper.ResizeImage(_frameBuffer, width, height))
                        {
                            return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                        }
                    }
                }
                //using (var img = GraphicsHelper.ResizeImage(_frameBuffer, VideoSize.Width, VideoSize.Height))
                //{
                //    //using (var c = (Bitmap)GraphicsHelper.GetCompressedImage(img, 50L))
                //    //{
                //    img.Save("d:\\xxx.jpg");
                //        return GraphicsHelper.BitmapToBytes(img, System.Drawing.Imaging.ImageFormat.Jpeg);
                //    //}
                //}
                return GraphicsHelper.GetCompressedBitmapToByte(_frameBuffer, 30);
            }
            catch { return null; }
        }
        public byte[] CompressedCurrentPlateBitmapToByte(int width = 0, int height = 0, bool crop = false)
        {
            try
            {

                if (_currentPlateBitmap == null)
                    return null;
                if ((height + width) > 0)
                {
                    if (crop)
                    {
                        if (width < _currentPlateBitmap.Width - 1 && height < _currentPlateBitmap.Height - 1)
                        {
                            using (var img = (Bitmap)_currentPlateBitmap.Clone(new Rectangle((_currentPlateBitmap.Width - width) / 2, (_currentPlateBitmap.Height - height) / 2, width, height), _currentPlateBitmap.PixelFormat))
                            {
                                return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                            }
                        }
                        else
                        {
                            using (var img = GraphicsHelper.ResizeImage(_currentPlateBitmap, _currentPlateBitmap.Width, _currentPlateBitmap.Height))
                            {
                                return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                            }
                        }
                    }
                    else
                    {
                        using (var img = GraphicsHelper.ResizeImage(_currentPlateBitmap, width, height))
                        {
                            return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                        }
                    }
                }
                return GraphicsHelper.GetCompressedBitmapToByte(_frameBuffer, 30);
            }
            catch { return null; }
        }
        public static byte[] CompressedCurrentPlateBitmapToByte(Bitmap _currentPlateBitmap, int width = 0, int height = 0, bool crop = false)
        {
            try
            {

                if (_currentPlateBitmap == null)
                    return null;
                if ((height + width) > 0)
                {
                    if (crop)
                    {
                        if (width < _currentPlateBitmap.Width - 1 && height < _currentPlateBitmap.Height - 1)
                        {
                            using (var img = (Bitmap)_currentPlateBitmap.Clone(new Rectangle((_currentPlateBitmap.Width - width) / 2, (_currentPlateBitmap.Height - height) / 2, width, height), _currentPlateBitmap.PixelFormat))
                            {
                                return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                            }
                        }
                        else
                        {
                            using (var img = GraphicsHelper.ResizeImage(_currentPlateBitmap, _currentPlateBitmap.Width, _currentPlateBitmap.Height))
                            {
                                return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                            }
                        }
                    }
                    else
                    {
                        using (var img = GraphicsHelper.ResizeImage(_currentPlateBitmap, width, height))
                        {
                            return GraphicsHelper.GetCompressedBitmapToByte(img, 30);
                        }
                    }
                }
                return GraphicsHelper.GetCompressedBitmapToByte(_currentPlateBitmap, 30);
            }
            catch { return null; }
        }
        public Bitmap CompressedFrameBufferImage()
        {
            if (_frameBuffer == null)
                return null;
            //using (var img = GraphicsHelper.ResizeImage(_frameBuffer, VideoSize.Width, VideoSize.Height))
            return (Bitmap)GraphicsHelper.GetCompressedImage(_frameBuffer, 30L);
        }

        public event OnFrameBitmapHandler OnFrameBitmapRecived { add => _onFrameBitmapRecived += value; remove => _onFrameBitmapRecived -= value; }
        public event EventHandler OnNewPlateDetected { add => _onNewPlateDetected += value; remove => _onNewPlateDetected -= value; }
        public event EventHandler OnNewPlateDetectRepeated { add => _onNewPlateDetectRepeated += value; remove => _onNewPlateDetectRepeated -= value; }
        public event EventHandler OnSelectNewDetectPlateRegion { add => _onSelectNewDetectPlateRegion += value; remove => _onSelectNewDetectPlateRegion -= value; }
        public EosIpCamView()
        {
            InitializeComponent();
            BackgroundImage = Properties.Resources.CarPlateDetection;
            BackgroundImageLayout = ImageLayout.Center;

        }

        public bool ResumePreview() { return videoGrabber.ResumePreview(); }
        public bool PausePreview() { return videoGrabber.PausePreview(); }
        bool CaptureFrameDo = false;
        private Rectangle _detectPlateRegion = new Rectangle(0, 0, 800, 600);
        private Rectangle _detectPlateRegionOld = new Rectangle();
        private int _cameraTimeout = 10;
        private int _zoom = 0;
        private Bitmap _currentPlateBitmap;
        private float _motionAlarmLevel = -1f;
        private EventHandler _onSelectNewDetectPlateRegion;

        bool framproc()
        {
            if (IsDisposed || !IsConnect)
                return false;

            Bitmap frame = frames.FirstOrDefault();
            if (frame == null)
            {
                Thread.Sleep(500);
                if (CaptureFrameDo)
                {
                    if (frames.Count == 0)
                        CaptureFrameDo = false;
                    return false;
                }
                try
                {
                    if (ActivePlateDetector && !string.IsNullOrEmpty(_plateDetectorAddress) && (!IsDisposed || IsConnect))
                    {
                        if (videoGrabber.InvokeRequired)
                            videoGrabber.Invoke(new MethodInvoker(() => { videoGrabber.CaptureFrameSyncTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty); }));
                        else
                            videoGrabber.CaptureFrameSyncTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty);
                    }
                    CaptureFrameDo = true;
                }
                catch
                {
                }
                return false;
            }
            Thread.Sleep(250);
            framProceces++;
            framProceces = framProceces % 10000;
            frames.RemoveAt(0);
            try
            {
                //using (var frame = (Bitmap)Bitmap.FromHbitmap(val).Clone())
                //{
                if (true || _frameBuffer == null || _frameBuffer.Height != frame.Height || _frameBuffer.Width != frame.Width)
                {
                    if (_frameBuffer != null)
                        _frameBuffer.Dispose();
                    _frameBuffer = new Bitmap(frame.Width, frame.Height);
                }
                lock (_frameBuffer)
                {
                    using (Graphics g = Graphics.FromImage(_frameBuffer))
                    {
                        g.DrawImage(frame, 0, 0);//,new Rectangle(50,50,frame.Width, frame.Height),GraphicsUnit.Pixel);
                    }
                    //_frameBuffer =(Bitmap) GraphicsHelper.GetCompressedImage(_frameBuffer, 70);
                }
                if (_onFrameBitmapRecived != null) _onFrameBitmapRecived(this, _frameBuffer);

                frame.Dispose();
                if (frames.Count > 0)
                    return true;
            }
            catch { }
            try
            {
                Thread.Sleep(500);
                if (ActivePlateDetector && !string.IsNullOrEmpty(_plateDetectorAddress) && (!IsDisposed || IsConnect))
                {
                    if (videoGrabber.InvokeRequired)
                        videoGrabber.Invoke(new MethodInvoker(() => { videoGrabber.CaptureFrameSyncTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty); }));
                    else
                        videoGrabber.CaptureFrameSyncTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty);
                }
            }
            catch
            {
                try
                {
                    _frameBuffer.Dispose();
                    _frameBuffer = null;
                }
                catch { }
            }
            frame.Dispose();
            return true;
        }

        void InitCamera()
        {
            try
            {
                if (InvokeRequired)
                {
                    Invoke(new MethodInvoker(() => { InitCamera(); }));
                    return;
                }
                if (videoGrabber == null || videoGrabber.IsDisposed)
                {


                    videoGrabber = new VideoGrabber();

                    videoGrabber.Hide();
                    videoGrabber.Name = "vg" + this.Name;
                    Controls.Add(videoGrabber);
                    videoGrabber.Dock = DockStyle.Fill;
                    //videoGrabber.VideoProcessing_FlipHorizontal = true;
                    if ((VideoSize.Width + VideoSize.Height) > 0)
                        videoGrabber.UseNearestVideoSize(VideoSize.Width, VideoSize.Height, StretchVideo);
                    //videoGrabber.MotionDetector_Enabled = true;
                    // videoGrabber.OnThreadSync += new OnThreadSyncEventHandler((object sender, TOnThreadSyncEventArgs e) => { videoGrabber.CaptureFrameSyncTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty); });
                    //videoGrabber.OnFrameBitmap += new OnFrameBitmapEventHandler((object sender, TOnFrameBitmapEventArgs e) => { try { var frame = Bitmap.FromHbitmap(e.Bitma); } catch { } });
                    videoGrabber.OnFrameCaptureCompleted += new OnFrameCaptureCompletedEventHandler(
                                                    (object sender, TOnFrameCaptureCompletedEventArgs e) =>
                                                    {
                                                        try
                                                        {
                                                            var frame = Bitmap.FromHbitmap(e.frameBitmapHandle);
                                                            //Task.Factory.StartNew(() =>
                                                            //{
                                                            //    framproc((Bitmap)frame.Clone());
                                                            //}).Wait(100);
                                                            if (frames.Count >= framesCount)
                                                                frames.RemoveAt(framesCount - 1);
                                                            frames.Add((Bitmap)frame.Clone());
                                                            frame.Dispose();
                                                            framCaptuered++;
                                                            framCaptuered = framCaptuered % 10000;
                                                            CaptureFrameDo = false;

                                                        }
                                                        catch { }
                                                        // CapturBitmapToDetect(false);
                                                        //videoGrabber.CaptureFrameSyncTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty);
                                                    });
                    videoGrabber.OnFrameBitmapEventSynchrone = true;

                    videoGrabber.SetZoomCoeff(videoGrabber.GetZoomCoeff() + _zoom);

                    videoGrabber.OnClick += new EventHandler((object sender, EventArgs e) => { /*videoGrabber.Refresh(); return;*/videoGrabber.SetZoomCoeff(videoGrabber.GetZoomCoeff() + _zoom); });
                    videoGrabber.OnDblClick += new EventHandler((object sender, EventArgs e) => { /*videoGrabber.Refresh(); return;*/  videoGrabber.Display_FullScreen = !videoGrabber.Display_FullScreen; });
                    //videoGrabber.OnThreadSync += new OnThreadSyncEventHandler((object sender, TOnThreadSyncEventArgs e) => { videoGrabber.CaptureFrameSyncTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty); });
                    videoGrabber.OnDeviceLost += new EventHandler((object sender, EventArgs e) =>
                    {
                        IsConnect = false; retryConnect++;
                        if (retryConnect < 50) StartSync(IpCamUrl, UserName, Password, Port);
                    });

                    videoGrabber.OnMouseDown += new OnMouseDownEventHandler((object sendeer, TOnVideoMouseUpDownEventArgs e) =>
                    {

                        if (ActiveRegionSelector && e.button == TMouseButton.mbRight)
                        {
                            _detectPlateRegionOld.X = e.x;
                            _detectPlateRegionOld.Y = e.y;
                        }
                    });
                    videoGrabber.OnMouseUp += new OnMouseUpEventHandler((object sendeer, TOnVideoMouseUpDownEventArgs e) =>
                    {
                        if (ActiveRegionSelector && e.button == TMouseButton.mbRight)
                        {
                            if (_detectPlateRegionOld.X > e.x)
                            {
                                var temp = _detectPlateRegionOld.X;
                                _detectPlateRegionOld.X = e.x;
                                e.x = temp;
                            }
                            if (_detectPlateRegionOld.Y > e.y)
                            {
                                var temp = _detectPlateRegionOld.Y;
                                _detectPlateRegionOld.Y = e.y;
                                e.y = temp;
                            }
                            _detectPlateRegionOld.Width = -_detectPlateRegionOld.X + e.x;
                            _detectPlateRegionOld.Height = -_detectPlateRegionOld.Y + e.y;
                            if (_detectPlateRegionOld.Width > 25 && _detectPlateRegionOld.Height > 25)
                            {
                                _detectPlateRegion = _detectPlateRegionOld;
                                _onSelectNewDetectPlateRegion?.Invoke(this, new EventArgs());
                            }
                            _detectPlateRegionOld = new Rectangle();
                        }
                    });
                    videoGrabber.OnMouseMove += new OnMouseMoveEventHandler((object sendeer, TOnVideoMouseMoveEventArgs e) =>
                    {
                        if (ActiveRegionSelector && (_detectPlateRegionOld.X > 0 || _detectPlateRegionOld.Y > 0))
                        {
                            //if(_detectPlateRegionOld.X>e.x)
                            //{
                            //    var temp = _detectPlateRegionOld.X;
                            //    _detectPlateRegionOld.X = e.x;
                            //    e.x = temp;
                            //}
                            //if(_detectPlateRegionOld.Y>e.y)
                            //{
                            //    var temp = _detectPlateRegionOld.Y;
                            //    _detectPlateRegionOld.Y = e.y;
                            //    e.y = temp;
                            //}
                            _detectPlateRegionOld.Width = -_detectPlateRegionOld.X + e.x;
                            _detectPlateRegionOld.Height = -_detectPlateRegionOld.Y + e.y;

                            //_detectPlateRegion = _detectPlateRegionOld;
                            //_detectPlateRegionOld = new Rectangle();
                        }
                    });

                    videoGrabber.OnClientConnection += new OnClientConnectionEventHandler((object sender, TOnClientConnectionEventArgs e) => { this.eosLabel1.Text = "ارتباط برقرار نیست"; });
                    videoGrabber.OnMotionDetected += new OnMotionDetectedEventHandler(OnMotionDetectedEventHandler);
                }
                //videoGrabber.ASFNetworkPort = Port;
                videoGrabber.VideoSource = TVideoSource.vs_IPCamera;
                videoGrabber.SetAuthentication(VidGrab.TAuthenticationType.at_IPCamera, UserName, Password);
                videoGrabber.IPCameraURL = IpCamUrl;// "http://192.168.10.183/video4.mjpg";//root:123@
                                                    //videoGrabber.IPCameraURL = txtURL.Text;
                                                    //videoGrabber.SetAuthentication(TAuthenticationType.at_IPCamera, txtUser.Text, txtPassword.Text);
                var b = videoGrabber.SetIPCameraSetting(TIPCameraSetting.ips_ConnectionTimeout, _cameraTimeout);
                //videoGrabber.sens
                //videoGrabber.

                videoGrabber.OnFrameOverlayUsingDC += new OnFrameOverlayUsingDCEventHandler((object sender, TOnFrameOverlayUsingDCEventArgs e) =>
                {
                    try
                    {
                        using (Graphics g = Graphics.FromHdc(e.dc))
                        {
                            //g.DrawString("sdfsdfsdfsdfsdf", this.Font, Brushes.Black, 10, 100);
                            //videoGrabber.SetZoomXCenter((_detectPlateRegion.X + _detectPlateRegion.Width) / 2);
                            //videoGrabber.SetZoomYCenter((_detectPlateRegion.Y + _detectPlateRegion.Height) / 2);
                            g.ResetTransform();
                            g.FillRectangle(new Pen(Color.FromArgb(200, 100, 10, 10), 2).Brush, new Rectangle(0, 5, 270, 20));

                            g.TranslateTransform(1, 1);
                            var txt = framProceces.ToString() + "/" + framCaptuered.ToString() + "                      " + motionV.ToString("0.000");
                            //g.FillRectangle(new Pen(Color.FromArgb(255, 255, 255, 255), 2).Brush, 0, 0, g.MeasureString(txt, new Font(this.Font.FontFamily, 12, FontStyle.Bold)).Width + 5, g.MeasureString(_plateDetectorError, new Font(this.Font.FontFamily, 12, FontStyle.Bold)).Height + 5);
                            g.DrawString(txt, new Font(this.Font.FontFamily, 16, FontStyle.Bold), new Pen(Color.FromArgb(255, 250, 250, 250), 2).Brush, 0, 0);


                            var margin = 5;
                            var p = new Pen(Color.FromArgb(255, 0, 255, 0), 5);
                            g.ResetTransform();
                            int len = 23;
                            g.ResetTransform();
                            g.TranslateTransform(_detectPlateRegion.X - margin, _detectPlateRegion.Y - margin);
                            g.DrawLine(p, 0, 0, 0, len);
                            g.DrawLine(p, 0, 0, len, 0);
                            g.ResetTransform();
                            g.TranslateTransform(_detectPlateRegion.X - margin, _detectPlateRegion.Y + _detectPlateRegion.Height + margin);
                            g.DrawLine(p, 0, 0, 0, -len);
                            g.DrawLine(p, 0, 0, len, 0);
                            g.ResetTransform();
                            g.TranslateTransform(_detectPlateRegion.X + _detectPlateRegion.Width + margin, _detectPlateRegion.Y - margin);
                            g.DrawLine(p, 0, 0, 0, len);
                            g.DrawLine(p, 0, 0, -len, 0);
                            g.ResetTransform();
                            g.TranslateTransform(_detectPlateRegion.X + _detectPlateRegion.Width + margin, _detectPlateRegion.Y + _detectPlateRegion.Height + margin);
                            g.DrawLine(p, 0, 0, 0, -len);
                            g.DrawLine(p, 0, 0, -len, 0);
                            g.ResetTransform();
                            if (!string.IsNullOrEmpty(_plateDetectorError))
                            {
                                g.TranslateTransform(200, 10);
                                p = new Pen(Color.FromArgb(255, 255, 0, 0), 2);
                                g.FillEllipse(p.Brush, 0 - p.Width, 0 - p.Width, margin * 4, margin * 4);
                                g.DrawEllipse(new Pen(Color.FromArgb(255, 255, 255, 255), 2), 0 - p.Width, 0 - p.Width, margin * 4, margin * 4);
                                //var txt= framProceces.ToString() + "/" + framCaptuered.ToString();
                                //g.FillRectangle(p.Brush, 0, 0, g.MeasureString(_plateDetectorError, new Font(this.Font.FontFamily, 12, FontStyle.Bold)).Width + 5, g.MeasureString(_plateDetectorError, new Font(this.Font.FontFamily, 12, FontStyle.Bold)).Height + 5);
                                //p = new Pen(Color.FromArgb(255, 255, 0, 0), 2);
                                //g.DrawString(_plateDetectorError, new Font(this.Font.FontFamily, 12, FontStyle.Bold), p.Brush, 10, 10);
                            }

                            if (_detectPlateRegionOld.Width != 0 && _detectPlateRegionOld.Height != 0)
                            {
                                g.ResetTransform();
                                g.FillRectangle(new Pen(Color.FromArgb(128, 10, 10, 10), 2).Brush, _detectPlateRegionOld);

                            }
                            ////p.Width = 2;
                            ////640
                            ////480
                            //len = 18;
                            //g.ResetTransform();
                            //g.TranslateTransform(_detectPlateRegion.X - margin, _detectPlateRegion.Y - margin);
                            //g.FillEllipse(p.Brush, 0-p.Width, 0 - p.Width, margin*3, margin*3);
                            //g.ResetTransform();
                            //g.TranslateTransform(_detectPlateRegion.X - margin, _detectPlateRegion.Y + _detectPlateRegion.Height + margin);
                            //g.FillEllipse(p.Brush, 0 - p.Width, 0 - p.Width, margin * 3, margin * 3);
                            //g.ResetTransform();
                            //g.TranslateTransform(_detectPlateRegion.X + _detectPlateRegion.Width + margin, _detectPlateRegion.Y - margin);
                            //g.FillEllipse(p.Brush, 0 - p.Width, 0 - p.Width, margin * 3, margin * 3);
                            //g.ResetTransform();
                            //g.TranslateTransform(_detectPlateRegion.X + _detectPlateRegion.Width + margin, _detectPlateRegion.Y + _detectPlateRegion.Height + margin);
                            //g.FillEllipse(p.Brush, 0 - p.Width, 0 - p.Width, margin * 3, margin * 3);

                            //g.DrawRectangle(p, _detectPlateRegion);
                        }
                    }
                    catch (Exception)
                    {
                        // ignored
                    }
                });
            }
            catch (Exception)
            {
                // ignored
            }
        }


        public void OnMotionDetectedEventHandler(object sender, TOnMotionDetectedEventArgs e)
        {
            if (e.frameBitmap == IntPtr.Zero)
                return;
            var frame = Bitmap.FromHbitmap(e.frameBitmap);
            //Task.Factory.StartNew(() =>
            //{
            //    framproc((Bitmap)frame.Clone());
            //}).Wait(100);
            if (frames.Count >= framesCount)
                frames.RemoveAt(framesCount - 1);
            frames.Add((Bitmap)frame.Clone());
            frame.Dispose();
            framCaptuered++;
            framCaptuered = framCaptuered % 10000;
            CaptureFrameDo = false;
        }
        private void DetectPlateThread(/*Bitmap frameBuffer*/)
        {
            try
            {

                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "start image thread 4 #1");
                var imageProcessSleep = 500;
                int.TryParse(ConfigurationManager.AppSettings["PlateDetectorImageProcessSleep"] ?? "", out imageProcessSleep);
                float.TryParse(ConfigurationManager.AppSettings["RecognitionPlateAccuracyDegree"] ?? "", out float recognitionPlateAccuracyDegree);
                bool.TryParse(ConfigurationManager.AppSettings["IsSavedPlateImage"] ?? "", out bool isSavedPlateImage);

                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "start image thread #2");

                if (_plateDetectorAddress.StartsWith("db://")) // use Postgresql
                {
                    LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread db://");

                    string serverName = LocalFuncPlateDetectorAddressParse("ip");
                    string port = LocalFuncPlateDetectorAddressParse("port");
                    string userId = LocalFuncPlateDetectorAddressParse("user");
                    string password = LocalFuncPlateDetectorAddressParse("password");
                    string cameraId = LocalFuncPlateDetectorAddressParse("cameraid");
                    string imagePort = LocalFuncPlateDetectorAddressParse("imageport");
                    var skipPlate = true;

                    int.TryParse(ConfigurationManager.AppSettings["InitialDbReviewMinute"] ?? "1", out int InitialDbReviewMinute);



                    DateTime CheckingDateTime = DateTime.Now.Subtract(new TimeSpan(0, Math.Abs(InitialDbReviewMinute), 0));



                    DbPlateExtract plateExtract =
                        new DbPlateExtract(new DbPlateInfo()
                        {
                            ServerName = serverName,
                            Port = port,
                            Catalog = "",
                            UserId = userId,
                            Password = password,
                            CameraId = cameraId,
                            RecognitionPlateAccuracyDegree = recognitionPlateAccuracyDegree == 0 ? 0.85f : recognitionPlateAccuracyDegree,
                        });


                    while (!IsDisposed)
                    {
                        try
                        {

                            if (WaiteForNextPlate)
                            {
                                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread WaiteForNextPlate");
                                Thread.Sleep(50);
                                continue;
                            }
                            //injaaa 
                            //if (this.LastPlateDateTime > CheckingDateTime)
                            //{
                            //    CheckingDateTime = this.LastPlateDateTime;
                            //}

                            DbPlateResult rawPlate = null;


                            if (ActivePlateDetector)
                            {
                                rawPlate = plateExtract.GetPlate(CheckingDateTime, LockOprator.ModuleType);
                            }
                            else
                            {
                                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread PlateDetector manualy disabled!");
                            }


                            if (rawPlate == null)
                            {
                                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread rawPlate NULL");

                                Thread.Sleep(500);
                                continue;
                            }
                            else
                            {
                                //var aa2 = 111;
                            
                            }

                            CheckingDateTime = PersianDateHelper.ConvertEpochMsToDateTime(rawPlate.TimeEpochMs);



                            var finalPlate = EosParking.Core.Models.PlateText.GetAbsolutePlate(rawPlate.Plate);
                            EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Information, ">>>> DetectPlateThread " + " Plate:" + rawPlate.Plate + " FinePlate: " + finalPlate);
                            
                            var bCheckPlateInList = _plateDetectList.Any(q => q.Key == finalPlate && (DateTime.Now - q.Value).TotalSeconds < 90);
                            if (bCheckPlateInList)
                            {
                                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread FoundInListAndIgnored(90s): " + rawPlate.Plate);
                                if (this.InvokeRequired)
                                    this.Invoke(new MethodInvoker(() =>
                                    {
                                        _onNewPlateDetectRepeated(this, new EventArgs());
                                    }));
                                else
                                    _onNewPlateDetectRepeated(this, new EventArgs());
                            }
                            if (DontCheckPlateInCurrentList && bCheckPlateInList)
                            {
                                bCheckPlateInList = false;
                                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread DontCheckPlateInCurrentList : " + rawPlate.Plate);

                            }

                            if (!string.IsNullOrEmpty(finalPlate) && !bCheckPlateInList)
                            {
                                skipPlate = true;
                                _plate = finalPlate;
                                _plateDetectList.Add(new KeyValuePair<string, DateTime>(_plate, CheckingDateTime));

                                if (_onNewPlateDetected != null)
                                {

                                    try
                                    {
                                        if (isSavedPlateImage)
                                        {

                                            string imageUrl = "http://" + serverName + ":" + imagePort + "/get_plate_image?cam_id=" + cameraId + "&epoch=" + rawPlate.TimeEpochMs + "&plate_id=" + rawPlate.PlateId + "&file_name=car.jpg";
                                            //string url = _plateDetectorAddress.ToLower().Replace("/data?", "/get_plate_image?") + "&epoch=" + bestPlate.first_time + "&plate_id=" + bestPlate.id + "&file_name=car.jpg";
                                            var plateImage = WebHelper.WebSocketGetImage(imageUrl);
                                            if (plateImage != null)
                                            {
                                                //lock (_currentPlateBitmap)
                                                //{
                                                if (_currentPlateBitmap != null)
                                                    _currentPlateBitmap.Dispose();

                                                _currentPlateBitmap = (Bitmap)plateImage.Clone();
                                                //}
                                            }
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        LogHelper.Log(System.Diagnostics.TraceEventType.Error, " plateImage :" + ex.ToString());


                                    }

                                    if (this.InvokeRequired)
                                        this.Invoke(new MethodInvoker(() =>
                                        {

                                            _onNewPlateDetected(this, new EventArgs());
                                        }));
                                    else
                                        _onNewPlateDetected(this, new EventArgs());

                                    //Thread.Sleep(500);
                                }

                            }
                            else
                            {
                                skipPlate = false;
                            }

                            if (skipPlate)
                            {
                                LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread SkipPlate: " + finalPlate);
                            }

                            Thread.Sleep(300);
                        }
                        catch (Exception ex)
                        {
                            LogHelper.Log(System.Diagnostics.TraceEventType.Error, " DetectPlate :" + ex.ToString());
                        }
                    }
                }
                else if (_plateDetectorAddress.StartsWith("ws://")) // WebSocket
                {
                    LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread elseIF");

                    //ws://ip=192.168.5.22;port=9003;imageport=9002;cameraid=1
                    var serverIp = _plateDetectorAddress.Remove(0, 5).Split(';').FirstOrDefault(q => q.ToLower().StartsWith("ip"))?.Remove(0, 3);
                    var wsPort = _plateDetectorAddress.Remove(0, 5).Split(';').FirstOrDefault(q => q.ToLower().StartsWith("port"))?.Remove(0, 5);
                    var imagePort = _plateDetectorAddress.Remove(0, 5).Split(';').FirstOrDefault(q => q.ToLower().StartsWith("imageport"))?.Remove(0, 10);
                    var cameraId = _plateDetectorAddress.Remove(0, 5).Split(';').FirstOrDefault(q => q.ToLower().StartsWith("cameraid"))?.Remove(0, 9);
                    var skipPlate = false;


                    while (!this.IsDisposed)
                    {
                        try
                        {
                            if (skipPlate)
                            {
                                Thread.Sleep(500);
                                continue;
                            }
                            using (var ws = new WebSocket("ws://" + serverIp + ":" + wsPort + "/data?cam_id=" + cameraId))
                            {
                                ws.WaitTime = new TimeSpan(0, 0, 5);
                                //ws.OnClose += (sender, e) => { };
                                ws.OnMessage += (sender, e) =>
                            {
                                string json = (string)JsonConvert.DeserializeObject(e.Data);
                                EosParking.Core.Models.total_plate_packet detectedPlate = JsonConvert.DeserializeObject<EosParking.Core.Models.total_plate_packet>(json);

                                //for (int i = 0; i < j.Plates.Length; i++)
                                //{
                                var bestPlate = detectedPlate.GetBestPlate();
                                if (bestPlate == null)
                                    return;
                                var plate = EosParking.Core.Models.PlateText.GetAbsolutePlate(bestPlate.plate.plate);
                                if (!string.IsNullOrEmpty(plate) && !_plateDetectList.Any(q => q.Key == plate && (DateTime.Now - q.Value).TotalSeconds < 90))
                                {
                                    skipPlate = true;
                                    _plate = plate;
                                    _plateDetectList.Add(new KeyValuePair<string, DateTime>(_plate, DateTime.Now));
                                    if (_onNewPlateDetected != null)
                                    {
                                        //lock (_currentPlateBitmap)
                                        //{
                                        try
                                        {
                                            string imageUrl = "http://" + serverIp + ":" + imagePort + "/get_plate_image?cam_id=" + cameraId + "&epoch=" + bestPlate.first_time + "&plate_id=" + bestPlate.id + "&file_name=car.jpg";
                                            //string url = _plateDetectorAddress.ToLower().Replace("/data?", "/get_plate_image?") + "&epoch=" + bestPlate.first_time + "&plate_id=" + bestPlate.id + "&file_name=car.jpg";
                                            var plateImage = WebHelper.WebSocketGetImage(imageUrl);
                                            if (plateImage != null)
                                            {
                                                if (_currentPlateBitmap != null)
                                                    _currentPlateBitmap.Dispose();

                                                _currentPlateBitmap = (Bitmap)plateImage.Clone();
                                                //}
                                            }
                                        }
                                        catch { }

                                        if (this.InvokeRequired)
                                            this.Invoke(new MethodInvoker(() =>
                                                {

                                                    _onNewPlateDetected(this, new EventArgs());
                                                }));
                                        else
                                            _onNewPlateDetected(this, new EventArgs());

                                        //Thread.Sleep(500);
                                    }

                                }
                                //// low quality plate
                                //save_image(j.data[i].image, "plate.jpg");

                                //// get high quality plate and car images
                                //string result = get_vehicle_image(j.camera_id, j.data[i], "plate.jpg");
                                ////Console.WriteLine(result);
                                //JObject obj = JObject.Parse(result);
                                //string base64 = obj["base64"].ToString();
                                //save_image(base64, "plate.jpg");

                                //result = get_vehicle_image(j.camera_id, j.data[i], "car.jpg");
                                //obj = JObject.Parse(result);
                                //base64 = obj["base64"].ToString();
                                //save_image(base64, "car.jpg");
                                //}
                                skipPlate = false;
                                (sender as WebSocket).Close();
                            };

                                ws.Connect();
                                //for(int i=0; i<100;i++)
                                //{
                                //    Thread.Sleep(50);
                                //    if (ws == null || !ws.IsAlive)
                                //        break;
                                //}
                                while (this.IsDisposed == false && !(ws == null || ws.ReadyState == WebSocketState.Closing || ws.ReadyState == WebSocketState.Closed))
                                {
                                    Thread.Sleep(100);
                                }
                                skipPlate = false;
                                if (ws != null)
                                    ws.CloseAsync();
                            }
                        }
                        catch
                        {
                            // retry to connect
                            skipPlate = false;
                        }

                        Thread.Sleep(100);

                    }
                }
                else /*(ConfigurationManager.AppSettings["UseDetectionSdk"] ?? "0") == "1"*/
                {
                    LogHelper.Log(System.Diagnostics.TraceEventType.Information, "DetectPlateThread else");

                    while (/*ActivePlateDetector && */!IsDisposed)
                    {

                        try
                        {
                            //this.Invoke(new MethodInvoker(() => { this.eosLabel2.Text = framProceces.ToString() + "/" + framCaptuered.ToString(); }));
                            if (!ActivePlateDetector || !framproc())
                            {
                                Thread.Sleep(500);
                                continue;
                            }
                            if (_frameBuffer == null && ActivePlateDetector)
                            {
                                try
                                {
                                    if (ActivePlateDetector && !string.IsNullOrEmpty(_plateDetectorAddress) && (!IsDisposed || IsConnect))
                                    {
                                        if (videoGrabber.InvokeRequired)
                                            videoGrabber.Invoke(new MethodInvoker(() =>
                                            {
                                                videoGrabber.BorderStyle = BorderStyle.Fixed3D;
                                                if (!videoGrabber.CaptureFrameTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty))
                                                {
                                                    LogHelper.Log(System.Diagnostics.TraceEventType.Information, "capture to image1");
                                                    //Stop();
                                                    //StartSync(IpCamUrl,UserName,Password,Port,false);
                                                }
                                            }));
                                        else
                                            if (!videoGrabber.CaptureFrameTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty))
                                        {
                                            LogHelper.Log(System.Diagnostics.TraceEventType.Information, "capture to image");
                                            videoGrabber.BorderStyle = BorderStyle.Fixed3D;
                                            //Stop();
                                            //StartSync(IpCamUrl, UserName, Password, Port, false);
                                        }
                                    }
                                }
                                catch
                                {
                                    try
                                    {
                                        _frameBuffer.Dispose();
                                        _frameBuffer = null;
                                    }
                                    catch { }
                                }
                                Thread.Sleep(1000);
                                continue;
                            }

                            //if (!File.Exists(Application.StartupPath + "\\SETPA.cfg"))
                            //    return;
                            if (!string.IsNullOrEmpty(_plate) && ((DateTime.Now - LastPlateDateTime).TotalMinutes > 5 || (LastPlateDateTime - LastUnDetectedPlateDateTime).TotalSeconds > 90))
                                _plate = "";
                            //Invoke(new MethodInvoker(() =>
                            //{
                            //    if (Pd == null)
                            //        Pd = new PlateDetector(Handle);
                            //}));

                            //Pd.Recognize_Buffer((Bitmap)_frameBuffer.Clone(),true);

                            if (!float.TryParse(ConfigurationManager.AppSettings["MotionAlarmLevel"] ?? "-1", out _motionAlarmLevel))
                                float.TryParse((ConfigurationManager.AppSettings["MotionAlarmLevel"] ?? "-1").Replace('.', '/'), out _motionAlarmLevel);
                            Bitmap bmp;
                            lock (_frameBuffer)
                            {
                                bmp = (Bitmap)_frameBuffer.Clone();
                            }
                            try
                            {
                                motionV = detector.ProcessFrame((Bitmap)bmp.Clone());
                                if (motionV >= _motionAlarmLevel)
                                {
                                    var plate = GetOnlinePlate(bmp.Clone(_detectPlateRegion, bmp.PixelFormat));

                                    if (!string.IsNullOrEmpty(plate) && /*plate.Length > 5 && plate != _plate &&*/ !_plateDetectList.Any(q => q.Key == plate && (DateTime.Now - q.Value).TotalSeconds < 90))
                                    {
                                        _plate = plate;
                                        _plateDetectList.Add(new KeyValuePair<string, DateTime>(_plate, DateTime.Now));
                                        if (_onNewPlateDetected != null)
                                        {
                                            //lock (_currentPlateBitmap)
                                            //{
                                            try
                                            {
                                                if (_currentPlateBitmap != null)
                                                    _currentPlateBitmap.Dispose();
                                            }
                                            catch { }
                                            _currentPlateBitmap = (Bitmap)bmp.Clone();
                                            //}

                                            if (this.InvokeRequired)
                                                this.Invoke(new MethodInvoker(() =>
                                                {

                                                    _onNewPlateDetected(this, new EventArgs());
                                                }));
                                            else
                                                _onNewPlateDetected(this, new EventArgs());

                                            Thread.Sleep(1000);
                                        }
                                    }
                                }
                            }
                            finally { bmp?.Dispose(); }

                            Thread.Sleep(imageProcessSleep);
                        }
                        catch (Exception ex)
                        {
                            LogHelper.Log(System.Diagnostics.TraceEventType.Error, " DetectPlate :" + ex.ToString());
                        }
                    }
                }

                string LocalFuncPlateDetectorAddressParse(string key)
                {
                    return _plateDetectorAddress.Remove(0, 5).Split(';').FirstOrDefault(q => q.ToLower().StartsWith(key))?.Remove(0, key.Length + 1);
                }
            }
            catch (Exception ex)
            {
                LogHelper.Log(System.Diagnostics.TraceEventType.Error, "DetectPlateThread error: " + ex.Message);
            }
        }

        public string GetOnlinePlate(/*object sender,*/ Bitmap image)
        {
            try
            {
                //if (string.IsNullOrEmpty(Pd.Plate) || Pd.Plate.Length<6)
                //    return "";
                if (string.IsNullOrEmpty(_plateDetectorAddress))
                {
                    return "";
                }
                //var bytes = GraphicsHelper.BitmapToBytes(image, System.Drawing.Imaging.ImageFormat.Jpeg);
                int compression = 50;
                int.TryParse(ConfigurationManager.AppSettings["CameraImageCompression"] ?? "50", out compression);
                var bytes = GraphicsHelper.GetCompressedBitmapToByte(image, compression);
                int PlateDetectorRequestTimeOut = 3000;
                int.TryParse(ConfigurationManager.AppSettings["PlateDetectorRequestTimeOut"] ?? "", out PlateDetectorRequestTimeOut);
                // return "";
                var s = "";
                try
                {
                    if (!string.IsNullOrEmpty(ConfigurationManager.AppSettings["PlateImageSaveDir"]))
                        image.Save(ConfigurationManager.AppSettings["PlateImageSaveDir"] + "detectPlate-" + videoGrabber.Name + ".jpg");
                }
                catch { }
                if (_plateDetectorAddress.StartsWith("http"))
                    s = WebHelper.UploadImage(bytes, _plateDetectorAddress, PlateDetectorRequestTimeOut, true);
                else
                    s = WebHelper.UploadImageTCP(bytes, _plateDetectorAddress.Split(':')[0], int.Parse(_plateDetectorAddress.Split(':')[1]), PlateDetectorRequestTimeOut);
                _plateDetectorError = "";
                //if (plateDetectedButton2.InvokeRequired)
                //{
                //    plateDetectedButton2.Invoke(new MethodInvoker(() => { GetOnlinePlate(sender, image); }));
                //    return;
                //}
                s = s.Replace("\n", "");
                //File.WriteAllBytes("d:\\zzzzzzmdetectPlate.jpg", bytes);
                if (s.ToLower() == "not_detected" || string.IsNullOrEmpty(s))
                {
                    _plateDetectList = _plateDetectList.Where(q => (DateTime.Now - q.Value).TotalSeconds < 30).Select(q => q).ToList();
                    LastUnDetectedPlateDateTime = DateTime.Now;
                    return "";
                }
                //image.Save("d:\\1\\detectPlate-"+videoGrabber.Name+".jpg");
                LogHelper.Log(System.Diagnostics.TraceEventType.Information, " *DetectedPlate :" + SmsHelper.PlateFormat(SmsHelper.ConvertPersianNumberToEnglish(s)));
                //if (SmsHelper.PlateFormat(SmsHelper.ConvertPersianNumberToEnglish(s)) != _plate)
                //{
                LastPlateDateTime = DateTime.Now;
                LastUnDetectedPlateDateTime = LastPlateDateTime;
                //}
                return SmsHelper.PlateFormat(SmsHelper.ConvertPersianNumberToEnglish(s));
            }
            catch (HttpException)
            {

                //Thread.Sleep(1000);
                _plateDetectorError = "تشخیص پلاک در دسترس نیست";
                return "";
            }
            catch (Exception ex) { LogHelper.Log(System.Diagnostics.TraceEventType.Error, " GetOnlinePlate :" + ex.ToString()); _plateDetectorError = "تشخیص پلاک در دسترس نیست"; return ""; }
        }

        public void Start(bool withoutPreview = false)
        {
            IsConnect = false;
            InitCamera();

            //videoGrabber.OnFrameCaptureCompleted += new VidGrab.OnFrameCaptureCompletedEventHandler((object sender2, VidGrab.TOnFrameCaptureCompletedEventArgs e2) => { });
            //videoGrabber.OnFrameBitmap += new VidGrab.OnFrameBitmapEventHandler((object sender2, VidGrab.TOnFrameBitmapEventArgs e2) => { Bitmap.FromHbitmap(e2.bitmapInfo); });

            var connecting = true;// videoGrabber.SendIPCameraCommand(videoGrabber.IPCameraURL);
            if (connecting)
            {
                IsConnect = true;
                if (videoGrabber.InvokeRequired)
                {
                    videoGrabber.Invoke(new MethodInvoker(() =>
                    {
                        StartPreviewLocal();
                    }));
                    return;
                }
                else
                {
                    StartPreviewLocal();
                }
                Application.DoEvents();

                void StartPreviewLocal()
                {
                    try
                    {
                        this.eosLabel1.Text = "";
                        videoGrabber.Show();
                        videoGrabber.Display_AspectRatio = VidGrab.TAspectRatio.ar_Stretch;
                        videoGrabber.VideoSource = VidGrab.TVideoSource.vs_IPCamera;
                        if (/*ActivePlateDetector && */(plateDetectorThread == null || !plateDetectorThread.IsAlive)/* && File.Exists(Application.StartupPath + "\\SETPA.cfg")*/)
                        {
                            // DetectPlate(frame);
                            plateDetectorThread = new Thread(new ThreadStart(DetectPlateThread));
                            plateDetectorThread.Name = "License Plate Detection";
                            plateDetectorThread.Start();
                        }
                        if (!withoutPreview)
                        {
                            videoGrabber.StartPreview();
                            IsConnect = videoGrabber.CaptureFrameTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty);
                        }
                        if (ActivePlateDetector)
                        {
                            IsConnect = videoGrabber.CaptureFrameTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty);
                        }
                    }
                    catch (Exception ex)
                    {
                        EosParking.Core.Helpers.LogHelper.Log(System.Diagnostics.TraceEventType.Error, " StartPreviewLocal " + ex.Message);
                    }
                }
            }
        }
        public void StartPreview()
        {
            videoGrabber.StartPreview();
        }
        public void Start(string url, string userName, string password, int port = 80, bool withoutPreview = false)
        {
            IpCamUrl = url;
            UserName = userName;
            Password = password;
            Port = port;
            Start(withoutPreview);
        }
        public void StartSync(string url, string userName, string password, int port = 80, bool withoutPreview = false)
        {
            Task.Factory.StartNew(() =>
            {
                IpCamUrl = url;
                UserName = userName;
                Password = password;
                Port = port;
                //while (!IsConnect)
                //{
                Start(withoutPreview);
                Thread.Sleep(2000);
                if (videoGrabber.InvokeRequired)
                {
                    videoGrabber.Invoke(new MethodInvoker(() =>
                    {
                        if (ActivePlateDetector && IsConnect && videoGrabber.Visible)
                        {
                            videoGrabber.CaptureFrameTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty);
                        }
                    }));
                }
                //}
            }).Wait(100);
        }

        public void CapturBitmap(bool clearBuffer)
        {
            if (clearBuffer && _frameBuffer != null)
            {
                _frameBuffer.Dispose();
                _frameBuffer = null;
            }
            videoGrabber.CaptureFrameTo(VidGrab.TFrameCaptureDest.fc_TBitmap, String.Empty);
        }

        public void CapturBitmapToDetect(bool clearBuffer)
        {
            //Task.Factory.StartNew(() => {
            //if (clearBuffer && _frameBuffer != null)
            //{
            //    _frameBuffer.Dispose();
            //    _frameBuffer = null;
            //}

            //    var b = videoGrabber.CaptureFrameTo(TFrameCaptureDest.fc_BmpFile, String.Empty);
            //    Thread.Sleep(250);
            //   // CapturBitmapToDetect(false);
            //});
        }

        public void Stop()
        {
            if (videoGrabber == null)
                return;
            videoGrabber.StopPreview();
            videoGrabber.Hide();
            videoGrabber.Dispose();
            IsConnect = false;
        }
        public void StopPreview()
        {
            if (videoGrabber == null)
                return;
            videoGrabber.StopPreview();
            //videoGrabber.Hide();
            //IsConnect = false;
        }

        protected override void Dispose(bool disposing)
        {
            Stop();
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(EosIpCamView));
            this.fullButton = new DevExpress.XtraEditors.SimpleButton();
            this.eosLabel1 = new EosParkingTools.EosControls.EosLabel();
            this.SuspendLayout();
            // 
            // fullButton
            // 
            this.fullButton.ButtonStyle = DevExpress.XtraEditors.Controls.BorderStyles.NoBorder;
            this.fullButton.ImageOptions.Image = ((System.Drawing.Image)(resources.GetObject("fullButton.ImageOptions.Image")));
            this.fullButton.ImageOptions.Location = DevExpress.XtraEditors.ImageLocation.MiddleCenter;
            this.fullButton.ImageOptions.SvgImageSize = new System.Drawing.Size(20, 20);
            this.fullButton.Location = new System.Drawing.Point(0, 0);
            this.fullButton.Name = "fullButton";
            this.fullButton.Size = new System.Drawing.Size(26, 26);
            this.fullButton.TabIndex = 0;
            this.fullButton.ToolTip = "تمام صفحه";
            this.fullButton.Visible = false;
            this.fullButton.Click += new System.EventHandler(this.fullButton_Click);
            // 
            // eosLabel1
            // 
            this.eosLabel1.AutoSize = true;
            this.eosLabel1.BorderColor = System.Drawing.Color.Black;
            this.eosLabel1.BorderSide = System.Windows.Forms.Border3DSide.Bottom;
            this.eosLabel1.BorderWidth = 1;
            this.eosLabel1.Cursor = System.Windows.Forms.Cursors.Hand;
            this.eosLabel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.eosLabel1.ForeColor = System.Drawing.Color.Red;
            this.eosLabel1.Location = new System.Drawing.Point(0, 0);
            this.eosLabel1.Name = "eosLabel1";
            this.eosLabel1.Size = new System.Drawing.Size(93, 13);
            this.eosLabel1.TabIndex = 0;
            this.eosLabel1.Text = "ارتباط برقرار نیست";
            this.eosLabel1.Click += new System.EventHandler(this.eosLabel1_Click);
            // 
            // EosIpCamView
            // 
            this.BackgroundImage = global::EosParkingTools.Properties.Resources.CarPlateDetection;
            this.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Zoom;
            this.Controls.Add(this.fullButton);
            this.Controls.Add(this.eosLabel1);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        private void fullButton_Click(object sender, EventArgs e)
        {
            videoGrabber.Display_FullScreen = true;

        }

        private void eosLabel1_Click(object sender, EventArgs e)
        {
            if (videoGrabber != null)
            {
                Start(true);
            }
        }
    }

    //private class ImageProvider : IImageProvider<EventArgs>
    //{
    //    public event EventHandler<GenericEventArgs<EventArgs>> ImageReady;
    //}
}
