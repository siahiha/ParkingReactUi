using EosParking.Data.External.Models;
using Microsoft.AspNet.SignalR.Client;
using System;
using System.Threading.Tasks;

namespace EosParkingProfessional.Models
{
    public sealed class AnprSignalRClient : IDisposable
    {
        private HubConnection _connection;
        private IHubProxy _hub;
        private bool _isEosAnpr;
        private bool _disposed;

        public event EventHandler<AnprWithPics> RecordReceived;
        public event Action<Exception> ConnectionError;

        public async Task ConnectAsync(string address, string userToken, bool isEosAnpr)
        {
            if (_disposed)
                throw new ObjectDisposedException(nameof(AnprSignalRClient));

            Disconnect();
            _isEosAnpr = isEosAnpr;

            _connection = new HubConnection(
                address.TrimEnd('/'),
                "UserToken=" + Uri.EscapeDataString(userToken ?? string.Empty));
            _connection.Error += exception => ConnectionError?.Invoke(exception);
            _connection.Reconnected += async () =>
            {
                try
                {
                    await SubscribeAsync(_isEosAnpr).ConfigureAwait(false);
                }
                catch (Exception exception)
                {
                    ConnectionError?.Invoke(exception);
                }
            };

            _hub = _connection.CreateHubProxy("anprHub");
            _hub.On<AnprWithPics>("anprDetected", record => RecordReceived?.Invoke(this, record));

            await _connection.Start().ConfigureAwait(false);
            await SubscribeAsync(isEosAnpr).ConfigureAwait(false);
        }

        public Task SubscribeAsync(bool isEosAnpr)
        {
            if (_hub == null)
            {
                _isEosAnpr = isEosAnpr;
                return Task.FromResult(0);
            }

            var previousSource = _isEosAnpr;
            _isEosAnpr = isEosAnpr;
            return ChangeSubscriptionAsync(previousSource, isEosAnpr);
        }

        private async Task ChangeSubscriptionAsync(bool previousSource, bool nextSource)
        {
            if (previousSource != nextSource)
                await _hub.Invoke("unsubscribe", previousSource).ConfigureAwait(false);

            await _hub.Invoke("subscribe", nextSource).ConfigureAwait(false);
        }

        public void Disconnect()
        {
            try { _connection?.Stop(); }
            catch { }
            try { _connection?.Dispose(); }
            catch { }
            _connection = null;
            _hub = null;
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;
            Disconnect();
        }
    }
}
