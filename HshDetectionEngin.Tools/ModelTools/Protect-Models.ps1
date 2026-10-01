param(
    [Parameter(Mandatory = $true)][string]$OutputDirectory,
    [Parameter(Mandatory = $true)][hashtable]$Models
)

$ErrorActionPreference = 'Stop'
$developmentLicense = 'HSH-DETECTION-DEVELOPMENT-LICENSE-V1'
$license = if ($env:HSH_DETECTION_LICENSE) { $env:HSH_DETECTION_LICENSE } else { $developmentLicense }
$sha = [Security.Cryptography.SHA256]::Create()
$key = $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($license))
[void](New-Item -ItemType Directory -Force -Path $OutputDirectory)

try {
    foreach ($entry in $Models.GetEnumerator()) {
        $sourcePath = [IO.Path]::GetFullPath($entry.Key)
        $targetPath = Join-Path $OutputDirectory $entry.Value
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
            throw "Raw model source was not found: $sourcePath"
        }

        $aes = [Security.Cryptography.Aes]::Create()
        try {
            $aes.Key = $key
            $aes.GenerateIV()
            $plain = [IO.File]::ReadAllBytes($sourcePath)
            $cipher = $aes.CreateEncryptor().TransformFinalBlock($plain, 0, $plain.Length)
            $package = [byte[]]::new(24 + $cipher.Length)
            [Text.Encoding]::ASCII.GetBytes('HSHM0001').CopyTo($package, 0)
            $aes.IV.CopyTo($package, 8)
            $cipher.CopyTo($package, 24)
            [IO.File]::WriteAllBytes($targetPath, $package)
            [Security.Cryptography.CryptographicOperations]::ZeroMemory($plain)
            [Security.Cryptography.CryptographicOperations]::ZeroMemory($cipher)
        }
        finally {
            $aes.Dispose()
        }
    }
}
finally {
    $sha.Dispose()
}
