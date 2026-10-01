namespace HshDetectionEngin.Plate;

/// <summary>Loads signed/encrypted model packages for the current Engine process.</summary>
internal static class SecureModelLoader
{
    internal static string Materialize(string packagePath) =>
        ProtectedModelPackage.Materialize(packagePath, "hsh-plate");
}
