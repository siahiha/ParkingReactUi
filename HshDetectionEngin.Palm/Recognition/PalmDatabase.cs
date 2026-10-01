using HshDetectionEngin.Identity;

namespace HshDetectionEngin.Palm;

public sealed class PalmSample
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string PersonId { get; set; } = string.Empty;
    public int PersonNumber { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public int SampleNumber { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public float DetectionConfidence { get; set; }
    public byte[] PalmImage { get; set; } = [];
    public float[] Embedding { get; set; } = [];
}

public sealed class PalmIdentity
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public bool IsUnknown { get; set; }
    public int PersonNumber { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public List<PalmSample> Samples { get; set; } = [];
}

public sealed record PalmMatch(string Id, string Name, float Similarity, int PersonNumber,
    string? MatchedSampleId, bool IsUnknown = false);
public sealed record PalmSimilarityPair(PalmSample Left, PalmSample Right, float Similarity);

/// <summary>Compatibility adapter over the shared identity database.</summary>
public sealed class PalmDatabase : IDisposable
{
    public const int MaxSamplesPerPerson = IdentityDatabase.MaxSamplesPerPerson;
    private readonly IdentityDatabase _store;
    private readonly bool _ownsStore;

    private PalmDatabase(IdentityDatabase store, bool ownsStore) { _store = store ?? throw new ArgumentNullException(nameof(store)); _ownsStore = ownsStore; }
    public string DatabasePath => _store.DatabasePath;
    public static PalmDatabase Load(string path) => new(IdentityDatabase.Load(path), true);
    public static PalmDatabase FromStore(IdentityDatabase store) => new(store, false);
    public IReadOnlyList<PalmIdentity> Identities => _store.GetPeople().Select(MapPerson).ToArray();
    public IReadOnlyList<PalmSample> GetSamples() => _store.GetPalmSamples().Select(MapSample).ToArray();
    public byte[] GetPalmImage(string sampleId) => _store.GetPalmImage(sampleId);
    public PalmSample RegisterSample(string name, IReadOnlyList<float> embedding, byte[] palmImage, string originalFileName,
        string? personId = null, float detectionConfidence = 0) =>
        MapSample(_store.RegisterPalmSample(name, embedding, palmImage, originalFileName, personId, detectionConfidence));
    public PalmMatch? Identify(IReadOnlyList<float> embedding, float minimumSimilarity) => MapMatch(_store.IdentifyPalm(embedding, minimumSimilarity));
    public PalmMatch? IdentifyKnown(IReadOnlyList<float> embedding, float minimumSimilarity) => MapMatch(_store.IdentifyKnownPalm(embedding, minimumSimilarity));
    public PalmMatch IdentifyOrCreateUnknown(IReadOnlyList<float> embedding, float minimumSimilarity, float unknownSimilarity,
        byte[]? palmImage = null, string originalFileName = "runtime-palm.jpg", float detectionConfidence = 0) =>
        MapMatch(_store.IdentifyOrCreateUnknownPalm(embedding, minimumSimilarity, unknownSimilarity, palmImage, originalFileName, detectionConfidence))!;
    public IReadOnlyList<PalmSimilarityPair> FindSimilar(float minimumSimilarity = 0.40f, bool onlyDifferentPeople = false)
    {
        PalmSample[] samples = GetSamples().ToArray();
        var result = new List<PalmSimilarityPair>();
        for (int i = 0; i < samples.Length; i++)
        for (int j = i + 1; j < samples.Length; j++)
        {
            if (onlyDifferentPeople && samples[i].PersonId == samples[j].PersonId) continue;
            float score = Cosine(samples[i].Embedding, samples[j].Embedding);
            if (score >= minimumSimilarity) result.Add(new PalmSimilarityPair(samples[i], samples[j], score));
        }
        return result.OrderByDescending(item => item.Similarity).ToArray();
    }
    public PalmMatch RegisterUnknownObservation(byte[] palmImage, string originalFileName, float detectionConfidence, string? personId = null) =>
        MapMatch(_store.RegisterUnknownPalmObservation(palmImage, originalFileName, detectionConfidence, personId))!;
    public bool MoveSample(string sampleId, string targetPersonId) => _store.MovePalmSample(sampleId, targetPersonId);
    public bool RemoveSample(string sampleId) => _store.RemovePalmSample(sampleId);
    public bool MergePeople(string targetPersonId, string sourcePersonId) => _store.MergePeople(targetPersonId, sourcePersonId);

    private PalmIdentity MapPerson(IdentityPersonRecord person) => new()
    {
        Id = person.Id, Name = person.Name, IsUnknown = person.IsUnknown, PersonNumber = person.PersonNumber, CreatedAtUtc = person.CreatedAtUtc, UpdatedAtUtc = person.UpdatedAtUtc,
        Samples = _store.GetPalmSamples(person.Id).Select(MapSample).ToList()
    };
    private static PalmSample MapSample(IdentityPalmSampleRecord sample) => new()
    {
        Id = sample.Id, PersonId = sample.PersonId, PersonNumber = sample.PersonNumber, PersonName = sample.PersonName,
        SampleNumber = sample.SampleNumber, OriginalFileName = sample.OriginalFileName, CreatedAtUtc = sample.CreatedAtUtc,
        DetectionConfidence = sample.DetectionConfidence, PalmImage = sample.PalmImage.ToArray(), Embedding = sample.Embedding.ToArray()
    };
    private static PalmMatch? MapMatch(IdentityMatch? match) => match is null ? null : new PalmMatch(match.PersonId, match.Name, match.Similarity, match.PersonNumber, match.MatchedSampleId, match.IsUnknown);
    private static float Cosine(IReadOnlyList<float> a, IReadOnlyList<float> b)
    {
        if (a.Count != b.Count || a.Count == 0) return 0;
        double dot = 0, aa = 0, bb = 0;
        for (int i = 0; i < a.Count; i++) { dot += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
        return aa <= 0 || bb <= 0 ? 0 : (float)(dot / Math.Sqrt(aa * bb));
    }
    public void Dispose() { if (_ownsStore) _store.Dispose(); GC.SuppressFinalize(this); }
}
