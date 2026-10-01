using System.Security.Cryptography;
using System.Text;

namespace HshDetectionEngin;

/// <summary>
/// Reads the protected model package used by every detection module.
/// The decrypted graph only exists in a temporary file while ONNX Runtime
/// creates its session; it is never copied to the application output.
/// </summary>
public static class ProtectedModelPackage
{
    private const string Header = "HSHM0001";
    private const string DevelopmentLicense = "HSH-DETECTION-DEVELOPMENT-LICENSE-V1";

    public static string Materialize(string packagePath, string prefix = "hsh-model")
    {
        byte[] package = File.ReadAllBytes(packagePath);
        if (package.Length <= 24 || Encoding.ASCII.GetString(package, 0, 8) != Header)
            throw new InvalidDataException("Invalid protected model package.");

        byte[] key = SHA256.HashData(Encoding.UTF8.GetBytes(
            Environment.GetEnvironmentVariable("HSH_DETECTION_LICENSE") ?? DevelopmentLicense));
        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = package[8..24];
        byte[] model = aes.CreateDecryptor().TransformFinalBlock(package, 24, package.Length - 24);
        string path = Path.Combine(Path.GetTempPath(), $"{prefix}-{Guid.NewGuid():N}.onnx");
        File.WriteAllBytes(path, model);
        CryptographicOperations.ZeroMemory(model);
        return path;
    }
}
