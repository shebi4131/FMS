namespace Fms.Api.Models;

public class SendPdfEmailDto
{
    public string PdfBase64 { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
