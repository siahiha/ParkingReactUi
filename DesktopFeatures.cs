using System.Drawing.Imaging;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Data.Sqlite;

namespace HshVisionLab;

/// <summary>
/// Local Windows-only event envelope. It deliberately does not depend on
/// HshDetectionService or its API contract.
/// </summary>
public sealed class DesktopEventRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public long Sequence { get; set; }
    public string CameraId { get; set; } = string.Empty;
    public string CameraName { get; set; } = string.Empty;
    public string RoiName { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Scenario { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? PlateText { get; set; }
    public string? Identity { get; set; }
    public float Confidence { get; set; }
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
    public string? CropPath { get; set; }
    public string? FullFramePath { get; set; }
    public string PayloadJson { get; set; } = "{}";
    public bool TriggerMatched { get; set; }
    public List<string> TriggerIds { get; set; } = [];
}

public sealed class DesktopTriggerDefinition
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = "Trigger";
    public bool Enabled { get; set; } = true;
    public string Scenario { get; set; } = "Plate";
    public List<string> CameraIds { get; set; } = [];
    public string? LabelEquals { get; set; }
    public string? PlateTextEquals { get; set; }
    public string? IdentityEquals { get; set; }
    public float? MinimumConfidence { get; set; }
    public int CooldownSeconds { get; set; }
    public List<DesktopTriggerActionDefinition> Actions { get; set; } = [];
}

public sealed class DesktopTriggerActionDefinition
{
    public string Type { get; set; } = "WindowsNotification";
    public string? Target { get; set; }
    public bool Enabled { get; set; } = true;
}

public sealed class DesktopInvocationDefinition
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = "Invocation";
    public bool Enabled { get; set; } = true;
    public string Type { get; set; } = "Web";
    public List<string> CameraIds { get; set; } = [];
    public List<string> EventTypes { get; set; } = [];
    public float? MinimumConfidence { get; set; }
    public int TimeoutSeconds { get; set; } = 15;
    public int MaxRetries { get; set; } = 2;
    public int RetryDelaySeconds { get; set; } = 5;
    public string Url { get; set; } = string.Empty;
    public string Method { get; set; } = "POST";
    public string? ApiKey { get; set; }
    public string SqlitePath { get; set; } = string.Empty;
    public string CommandText { get; set; } = string.Empty;
}

public sealed class DesktopInvocationLog
{
    public long Id { get; set; }
    public string InvocationId { get; set; } = string.Empty;
    public string InvocationName { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Attempt { get; set; }
    public DateTime StartedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
    public string? Response { get; set; }
    public string? Error { get; set; }
}

public sealed class DesktopAutomationSettings
{
    public List<DesktopTriggerDefinition> Triggers { get; set; } = [];
    public List<DesktopInvocationDefinition> Invocations { get; set; } = [];
    public int EventRetentionDays { get; set; } = 30;
    public int ArtifactRetentionDays { get; set; } = 30;
}

public sealed class DesktopEventStore
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };
    private readonly object _gate = new();
    private readonly string _recordsPath = Path.Combine(AppContext.BaseDirectory, "desktop-events.json");
    private readonly string _artifactDirectory = Path.Combine(AppContext.BaseDirectory, "desktop-event-artifacts");
    private List<DesktopEventRecord> _records;
    private long _nextSequence;

    public DesktopEventStore()
    {
        _records = LoadList(_recordsPath);
        _nextSequence = _records.Count == 0 ? 0 : _records.Max(item => item.Sequence);
        Directory.CreateDirectory(_artifactDirectory);
    }

    public IReadOnlyList<DesktopEventRecord> Query(string? search = null, string? scenario = null, int limit = 500)
    {
        lock (_gate)
        {
            string needle = search?.Trim() ?? string.Empty;
            return _records
                .Where(item => string.IsNullOrWhiteSpace(scenario) || scenario.Equals("All", StringComparison.OrdinalIgnoreCase) || item.Scenario.Equals(scenario, StringComparison.OrdinalIgnoreCase))
                .Where(item => string.IsNullOrWhiteSpace(needle) || string.Join(" ", item.CameraName, item.RoiName, item.EventType, item.Scenario, item.Label, item.PlateText, item.Identity).Contains(needle, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(item => item.Sequence)
                .Take(Math.Clamp(limit, 1, 5000))
                .Select(Clone)
                .ToArray();
        }
    }

    public DesktopEventRecord? Get(string id)
    {
        lock (_gate)
        {
            DesktopEventRecord? item = _records.FirstOrDefault(value => value.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
            return item is null ? null : Clone(item);
        }
    }

    public void Update(DesktopEventRecord record)
    {
        lock (_gate)
        {
            int index = _records.FindIndex(item => item.Id.Equals(record.Id, StringComparison.OrdinalIgnoreCase));
            if (index >= 0) { _records[index] = Clone(record); SaveRecords(); }
        }
    }

    public DesktopEventRecord Append(
        string cameraId,
        string cameraName,
        string roiName,
        string eventType,
        string scenario,
        string label,
        string? plateText,
        string? identity,
        float confidence,
        DateTime occurredAt,
        Bitmap? crop,
        Bitmap? fullFrame,
        object payload)
    {
        lock (_gate)
        {
            var item = new DesktopEventRecord
            {
                Sequence = ++_nextSequence,
                CameraId = cameraId,
                CameraName = cameraName,
                RoiName = roiName,
                EventType = eventType,
                Scenario = scenario,
                Label = label,
                PlateText = plateText,
                Identity = identity,
                Confidence = confidence,
                OccurredAtUtc = occurredAt.ToUniversalTime(),
                PayloadJson = JsonSerializer.Serialize(payload, JsonOptions)
            };

            string stem = $"{item.Sequence:000000}_{item.Id}";
            item.CropPath = SaveImage(crop, $"{stem}_crop.png");
            item.FullFramePath = SaveImage(fullFrame, $"{stem}_frame.png");
            _records.Insert(0, item);
            SaveRecords();
            return Clone(item);
        }
    }

    public DesktopEventRecord? TryCreatePlateFaceAssociation(DesktopEventRecord current, int maxWindowMs = 1500)
    {
        if (!current.Scenario.Equals("Plate", StringComparison.OrdinalIgnoreCase) && !current.Scenario.Equals("Face", StringComparison.OrdinalIgnoreCase)) return null;
        lock (_gate)
        {
            DesktopEventRecord? other = _records
                .Where(item => item.CameraId.Equals(current.CameraId, StringComparison.OrdinalIgnoreCase) && item.Id != current.Id)
                .Where(item => (item.Scenario.Equals("Plate", StringComparison.OrdinalIgnoreCase) || item.Scenario.Equals("Face", StringComparison.OrdinalIgnoreCase)) && !item.Scenario.Equals(current.Scenario, StringComparison.OrdinalIgnoreCase))
                .Where(item => Math.Abs((item.OccurredAtUtc - current.OccurredAtUtc).TotalMilliseconds) <= maxWindowMs)
                .OrderByDescending(item => Math.Abs((item.OccurredAtUtc - current.OccurredAtUtc).TotalMilliseconds))
                .FirstOrDefault();
            if (other is null) return null;
            if (_records.Any(item => item.Scenario.Equals("PlateFace", StringComparison.OrdinalIgnoreCase) && item.CameraId.Equals(current.CameraId, StringComparison.OrdinalIgnoreCase) && Math.Abs((item.OccurredAtUtc - current.OccurredAtUtc).TotalMilliseconds) <= maxWindowMs && item.Label.Contains(current.Label, StringComparison.OrdinalIgnoreCase))) return null;

            DesktopEventRecord plate = current.Scenario.Equals("Plate", StringComparison.OrdinalIgnoreCase) ? current : other;
            DesktopEventRecord face = current.Scenario.Equals("Face", StringComparison.OrdinalIgnoreCase) ? current : other;
            using Bitmap? crop = LoadImage(face.CropPath) ?? LoadImage(plate.CropPath);
            using Bitmap? frame = LoadImage(current.FullFramePath) ?? LoadImage(other.FullFramePath);
            return Append(current.CameraId, current.CameraName, current.RoiName, "PlateFaceAssociated", "PlateFace", $"{plate.Label} + {face.Label}", plate.PlateText ?? plate.Label, face.Identity ?? face.Label, Math.Min(plate.Confidence, face.Confidence), current.OccurredAtUtc > other.OccurredAtUtc ? current.OccurredAtUtc : other.OccurredAtUtc, crop, frame, new { plate = plate.PayloadJson, face = face.PayloadJson, associationWindowMs = maxWindowMs });
        }
    }

    public int Delete(DateTime? fromUtc = null, DateTime? toUtc = null)
    {
        lock (_gate)
        {
            DateTime? from = fromUtc?.ToUniversalTime();
            DateTime? to = toUtc?.ToUniversalTime();
            List<DesktopEventRecord> removed = _records.Where(item => (!from.HasValue || item.OccurredAtUtc >= from.Value) && (!to.HasValue || item.OccurredAtUtc <= to.Value)).ToList();
            foreach (DesktopEventRecord item in removed) DeleteArtifacts(item);
            _records = _records.Except(removed).ToList();
            SaveRecords();
            return removed.Count;
        }
    }

    public void Prune(int retentionDays, int artifactRetentionDays)
    {
        if (retentionDays <= 0 && artifactRetentionDays <= 0) return;
        DateTime now = DateTime.UtcNow;
        DateTime? eventCutoff = retentionDays > 0 ? now.AddDays(-retentionDays) : null;
        DateTime? artifactCutoff = artifactRetentionDays > 0 ? now.AddDays(-artifactRetentionDays) : null;
        lock (_gate)
        {
            if (eventCutoff.HasValue)
            {
                List<DesktopEventRecord> removed = _records.Where(item => item.OccurredAtUtc < eventCutoff.Value).ToList();
                foreach (DesktopEventRecord item in removed) DeleteArtifacts(item);
                _records = _records.Except(removed).ToList();
            }
            if (artifactCutoff.HasValue)
            {
                foreach (DesktopEventRecord item in _records.Where(item => item.OccurredAtUtc < artifactCutoff.Value))
                {
                    DeleteFile(item.CropPath);
                    DeleteFile(item.FullFramePath);
                    item.CropPath = null;
                    item.FullFramePath = null;
                }
            }
            SaveRecords();
        }
    }

    public static string ResolvePath(string? path) => string.IsNullOrWhiteSpace(path) ? string.Empty : Path.IsPathRooted(path) ? path : Path.Combine(AppContext.BaseDirectory, path);

    private string? SaveImage(Bitmap? image, string name)
    {
        if (image is null) return null;
        string path = Path.Combine(_artifactDirectory, name);
        image.Save(path, ImageFormat.Png);
        return Path.GetRelativePath(AppContext.BaseDirectory, path);
    }

    private static Bitmap? LoadImage(string? path)
    {
        string full = ResolvePath(path);
        if (!File.Exists(full)) return null;
        try { using var image = Image.FromFile(full); return new Bitmap(image); } catch { return null; }
    }

    private void DeleteArtifacts(DesktopEventRecord item)
    {
        DeleteFile(item.CropPath);
        DeleteFile(item.FullFramePath);
    }

    private static void DeleteFile(string? path)
    {
        if (string.IsNullOrWhiteSpace(path)) return;
        try { if (File.Exists(ResolvePath(path))) File.Delete(ResolvePath(path)); } catch { }
    }

    private void SaveRecords()
    {
        string temporary = _recordsPath + ".tmp";
        File.WriteAllText(temporary, JsonSerializer.Serialize(_records, JsonOptions));
        File.Move(temporary, _recordsPath, true);
    }

    private static List<DesktopEventRecord> LoadList(string path)
    {
        try { return File.Exists(path) ? JsonSerializer.Deserialize<List<DesktopEventRecord>>(File.ReadAllText(path), JsonOptions) ?? [] : []; }
        catch { return []; }
    }

    private static DesktopEventRecord Clone(DesktopEventRecord source) => JsonSerializer.Deserialize<DesktopEventRecord>(JsonSerializer.Serialize(source, JsonOptions), JsonOptions) ?? new DesktopEventRecord();
}

public sealed class DesktopAutomationStore
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };
    private readonly object _gate = new();
    private readonly string _settingsPath = Path.Combine(AppContext.BaseDirectory, "desktop-automation.json");
    private readonly string _logsPath = Path.Combine(AppContext.BaseDirectory, "desktop-invocation-logs.json");
    public DesktopAutomationSettings Settings { get; private set; }
    public List<DesktopInvocationLog> Logs { get; private set; }

    public DesktopAutomationStore()
    {
        Settings = Load<DesktopAutomationSettings>(_settingsPath) ?? new DesktopAutomationSettings();
        Settings.Triggers ??= [];
        Settings.Invocations ??= [];
        Logs = LoadLogs(_logsPath);
    }

    public void Save()
    {
        lock (_gate) Write(_settingsPath, Settings);
    }

    public void SaveLogs()
    {
        lock (_gate) Write(_logsPath, Logs.Take(1000).ToList());
    }

    public void AddLog(DesktopInvocationLog log)
    {
        lock (_gate)
        {
            log.Id = Logs.Count == 0 ? 1 : Logs.Max(item => item.Id) + 1;
            Logs.Insert(0, log);
            SaveLogs();
        }
    }

    private static T? Load<T>(string path) where T : class
    {
        try { return File.Exists(path) ? JsonSerializer.Deserialize<T>(File.ReadAllText(path), JsonOptions) : null; }
        catch { return null; }
    }

    private static List<DesktopInvocationLog> LoadLogs(string path) => Load<List<DesktopInvocationLog>>(path) ?? [];

    private static void Write<T>(string path, T value)
    {
        string temporary = path + ".tmp";
        File.WriteAllText(temporary, JsonSerializer.Serialize(value, JsonOptions));
        File.Move(temporary, path, true);
    }
}

public sealed class DesktopAutomationEngine : IDisposable
{
    private readonly DesktopAutomationStore _store;
    private readonly DesktopEventStore _events;
    private readonly HttpClient _http = new();
    private readonly object _cooldownGate = new();
    private readonly Dictionary<string, DateTime> _triggerTimes = new(StringComparer.OrdinalIgnoreCase);
    private bool _disposed;

    public event Action<string, bool>? StatusChanged;
    public DesktopAutomationStore Store => _store;

    public DesktopAutomationEngine(DesktopEventStore events, DesktopAutomationStore store)
    {
        _events = events;
        _store = store;
        _http.Timeout = TimeSpan.FromSeconds(15);
    }

    public void Process(DesktopEventRecord record)
    {
        if (_disposed) return;
        DesktopTriggerDefinition[] matched = _store.Settings.Triggers
            .Where(trigger => Matches(trigger, record))
            .Where(trigger => IsOutsideCooldown(trigger, record))
            .ToArray();
        record.TriggerIds.AddRange(matched.Select(item => item.Id));
        record.TriggerMatched = matched.Length > 0;
        _events.Update(record);

        foreach (DesktopTriggerDefinition trigger in matched)
        {
            foreach (DesktopTriggerActionDefinition action in trigger.Actions.Where(item => item.Enabled))
                _ = ExecuteActionAsync(action, trigger, record);
        }

        foreach (DesktopInvocationDefinition invocation in _store.Settings.Invocations.Where(item => item.Enabled && Matches(item, record)))
            _ = ExecuteInvocationAsync(invocation, record);
    }

    private async Task ExecuteActionAsync(DesktopTriggerActionDefinition action, DesktopTriggerDefinition trigger, DesktopEventRecord record)
    {
        try
        {
            if (action.Type.Equals("Webhook", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(action.Target))
            {
                using var content = JsonContent.Create(record);
                using HttpResponseMessage response = await _http.PostAsync(action.Target, content).ConfigureAwait(false);
                StatusChanged?.Invoke($"Trigger '{trigger.Name}': {(int)response.StatusCode}", !response.IsSuccessStatusCode);
            }
            else
            {
                StatusChanged?.Invoke($"Trigger '{trigger.Name}' matched: {record.Label}", false);
            }
        }
        catch (Exception ex) { StatusChanged?.Invoke($"Trigger '{trigger.Name}' failed: {ex.Message}", true); }
    }

    private async Task ExecuteInvocationAsync(DesktopInvocationDefinition definition, DesktopEventRecord record)
    {
        int attempts = Math.Max(0, definition.MaxRetries) + 1;
        for (int attempt = 1; attempt <= attempts; attempt++)
        {
            DateTime started = DateTime.UtcNow;
            try
            {
                string responseText;
                string method;
                string target;
                if (definition.Type.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrWhiteSpace(definition.SqlitePath)) throw new InvalidOperationException("SQLite database path is empty.");
                    if (string.IsNullOrWhiteSpace(definition.CommandText)) throw new InvalidOperationException("SQLite command text is empty.");
                    string databasePath = DesktopEventStore.ResolvePath(definition.SqlitePath);
                    var builder = new SqliteConnectionStringBuilder { DataSource = databasePath };
                    await using var connection = new SqliteConnection(builder.ConnectionString);
                    await connection.OpenAsync().ConfigureAwait(false);
                    await using SqliteCommand command = connection.CreateCommand();
                    command.CommandText = definition.CommandText;
                    command.Parameters.AddWithValue("$eventId", record.Id);
                    command.Parameters.AddWithValue("$cameraId", record.CameraId);
                    command.Parameters.AddWithValue("$cameraName", record.CameraName);
                    command.Parameters.AddWithValue("$eventType", record.EventType);
                    command.Parameters.AddWithValue("$scenario", record.Scenario);
                    command.Parameters.AddWithValue("$label", record.Label);
                    command.Parameters.AddWithValue("$plateText", (object?)record.PlateText ?? DBNull.Value);
                    command.Parameters.AddWithValue("$identity", (object?)record.Identity ?? DBNull.Value);
                    command.Parameters.AddWithValue("$confidence", record.Confidence);
                    command.Parameters.AddWithValue("$occurredAtUtc", record.OccurredAtUtc.ToString("O"));
                    command.Parameters.AddWithValue("$payloadJson", record.PayloadJson);
                    int affected = await command.ExecuteNonQueryAsync().ConfigureAwait(false);
                    responseText = $"Rows affected: {affected}";
                    method = "SQLITE";
                    target = databasePath;
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(definition.Url)) throw new InvalidOperationException("Invocation URL is empty.");
                    using var request = new HttpRequestMessage(new HttpMethod(string.IsNullOrWhiteSpace(definition.Method) ? "POST" : definition.Method), definition.Url);
                    request.Content = JsonContent.Create(record);
                    if (!string.IsNullOrWhiteSpace(definition.ApiKey)) request.Headers.TryAddWithoutValidation("X-Hsh-Api-Key", definition.ApiKey);
                    using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(Math.Clamp(definition.TimeoutSeconds, 1, 300)));
                    using HttpResponseMessage response = await _http.SendAsync(request, timeout.Token).ConfigureAwait(false);
                    responseText = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    if (!response.IsSuccessStatusCode) throw new HttpRequestException($"HTTP {(int)response.StatusCode}: {response.ReasonPhrase}");
                    method = definition.Method;
                    target = definition.Url;
                }
                _store.AddLog(new DesktopInvocationLog { InvocationId = definition.Id, InvocationName = definition.Name, EventId = record.Id, Status = "Succeeded", Attempt = attempt, StartedAtUtc = started, CompletedAtUtc = DateTime.UtcNow, Method = method, Target = target, Response = responseText });
                StatusChanged?.Invoke($"Invocation '{definition.Name}' succeeded", false);
                return;
            }
            catch (Exception ex)
            {
                _store.AddLog(new DesktopInvocationLog { InvocationId = definition.Id, InvocationName = definition.Name, EventId = record.Id, Status = attempt == attempts ? "Failed" : "Retrying", Attempt = attempt, StartedAtUtc = started, CompletedAtUtc = DateTime.UtcNow, Method = definition.Method, Target = definition.Type.Equals("Sqlite", StringComparison.OrdinalIgnoreCase) ? definition.SqlitePath : definition.Url, Error = ex.Message });
                if (attempt < attempts) await Task.Delay(TimeSpan.FromSeconds(Math.Max(1, definition.RetryDelaySeconds))).ConfigureAwait(false);
                else StatusChanged?.Invoke($"Invocation '{definition.Name}' failed: {ex.Message}", true);
            }
        }
    }

    private bool IsOutsideCooldown(DesktopTriggerDefinition trigger, DesktopEventRecord record)
    {
        if (trigger.CooldownSeconds <= 0) return true;
        string key = $"{trigger.Id}:{record.CameraId}:{record.Label}:{record.Identity}";
        lock (_cooldownGate)
        {
            if (_triggerTimes.TryGetValue(key, out DateTime previous) && record.OccurredAtUtc - previous < TimeSpan.FromSeconds(trigger.CooldownSeconds)) return false;
            _triggerTimes[key] = record.OccurredAtUtc;
            return true;
        }
    }

    private static bool Matches(DesktopTriggerDefinition trigger, DesktopEventRecord record)
    {
        if (!trigger.Enabled || (trigger.CameraIds.Count > 0 && !trigger.CameraIds.Contains(record.CameraId, StringComparer.OrdinalIgnoreCase))) return false;
        if (!trigger.Scenario.Equals("Any", StringComparison.OrdinalIgnoreCase) && !record.Scenario.Equals(trigger.Scenario, StringComparison.OrdinalIgnoreCase)) return false;
        if (!string.IsNullOrWhiteSpace(trigger.LabelEquals) && !trigger.LabelEquals.Equals(record.Label, StringComparison.OrdinalIgnoreCase)) return false;
        if (!string.IsNullOrWhiteSpace(trigger.PlateTextEquals) && !trigger.PlateTextEquals.Equals(record.PlateText, StringComparison.OrdinalIgnoreCase)) return false;
        if (!string.IsNullOrWhiteSpace(trigger.IdentityEquals) && !trigger.IdentityEquals.Equals(record.Identity, StringComparison.OrdinalIgnoreCase)) return false;
        return !trigger.MinimumConfidence.HasValue || record.Confidence >= trigger.MinimumConfidence.Value;
    }

    private static bool Matches(DesktopInvocationDefinition invocation, DesktopEventRecord record)
    {
        if (invocation.CameraIds.Count > 0 && !invocation.CameraIds.Contains(record.CameraId, StringComparer.OrdinalIgnoreCase)) return false;
        if (invocation.EventTypes.Count > 0 && !invocation.EventTypes.Contains(record.EventType, StringComparer.OrdinalIgnoreCase) && !invocation.EventTypes.Contains(record.Scenario, StringComparer.OrdinalIgnoreCase)) return false;
        return !invocation.MinimumConfidence.HasValue || record.Confidence >= invocation.MinimumConfidence.Value;
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _http.Dispose();
    }
}
