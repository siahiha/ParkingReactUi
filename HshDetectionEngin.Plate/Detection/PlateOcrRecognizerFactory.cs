namespace HshDetectionEngin.Plate;

internal static class PlateOcrRecognizerFactory
{
    public static IPlateTextRecognizer Create(string modelPath, string catalogPath, int threads, float confidence)
    {
        if (!PlateOcrModelCatalog.TryDescribe(catalogPath, out PlateOcrModelDescriptor descriptor))
            throw new InvalidOperationException(
                $"The selected OCR model is not registered as a supported plate OCR model: {Path.GetFileName(catalogPath)}");

        return descriptor.Decoder.ToLowerInvariant() switch
        {
            "crnn_ctc" => new CrnnPlateRecognizer(modelPath, threads, catalogPath),
            "cnn_glyph" => new CnnPlateRecognizer(modelPath, threads, catalogPath),
            "yolo_character" => new Yolo26PlateRecognizer(modelPath, threads, confidence, catalogPath),
            _ => throw new InvalidOperationException($"Unsupported plate OCR decoder: {descriptor.Decoder}")
        };
    }
}
