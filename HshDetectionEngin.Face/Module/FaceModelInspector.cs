using System.Collections.Concurrent;
using Microsoft.ML.OnnxRuntime;

namespace HshDetectionEngin.Face;

/// <summary>Reads the fixed detector input declared by a packaged Face model.</summary>
public static class FaceModelInspector
{
    private static readonly ConcurrentDictionary<string, Lazy<int?>> Cache = new(StringComparer.OrdinalIgnoreCase);

    public static int? TryGetSquareInputSize(string configuredName)
    {
        string name = Path.GetFileName(configuredName);
        if (string.IsNullOrWhiteSpace(name)) name = "face_yunet_2023mar.onnx";

        return Cache.GetOrAdd(
            name,
            static key => new Lazy<int?>(() => Inspect(key), LazyThreadSafetyMode.ExecutionAndPublication))
            .Value;
    }

    /// <summary>
    /// Returns the known catalog size without opening an ONNX session. YuNet
    /// models supported by this module use the fixed 640x640 detector input.
    /// </summary>
    public static int GetCatalogSquareInputSize(string configuredName)
    {
        string name = Path.GetFileName(configuredName);
        if (!string.IsNullOrWhiteSpace(name) &&
            Cache.TryGetValue(name, out Lazy<int?>? cached) && cached.IsValueCreated && cached.Value is int inspected && inspected > 0)
            return inspected;

        return 640;
    }

    private static int? Inspect(string name)
    {
        string? temporaryModel = null;
        try
        {
            string? resolvedPath = FaceModelPaths.Find(name);
            if (resolvedPath is null) return null;

            string modelPath = resolvedPath;
            if (resolvedPath.EndsWith(".hshmodel", StringComparison.OrdinalIgnoreCase))
            {
                temporaryModel = ProtectedModelPackage.Materialize(resolvedPath, "hsh-face-inspect");
                modelPath = temporaryModel;
            }

            using var session = new InferenceSession(modelPath);
            var input = session.InputMetadata.Values.FirstOrDefault();
            if (input is null || input.Dimensions.Length < 4) return null;

            int height = input.Dimensions[^2];
            int width = input.Dimensions[^1];
            return height > 0 && width > 0 && height == width ? height : null;
        }
        catch
        {
            return null;
        }
        finally
        {
            if (temporaryModel is not null)
            {
                try { File.Delete(temporaryModel); } catch { }
            }
        }
    }

}
