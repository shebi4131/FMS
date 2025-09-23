namespace Fms.Api.Models;

    public class FileFilterDto
    {
        public string? PlotNo { get; set; }
        public string? StNo { get; set; }
        public string? Phase { get; set; }
        public string? From { get; set; }
        public string? Carrier { get; set; }
        public string? To { get; set; }
        public string? Purpose { get; set; }
        public DateTime? Date { get; set; }  
        public string? Status { get; set; }
        public string? Remarks { get; set; }

    // Pagination properties
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 25;

    // Sorting
    public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;
    }
