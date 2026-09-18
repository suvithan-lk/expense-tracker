namespace FinancialAdvisor.Api.Common;

public sealed record SortSpec(string Field, bool Descending);

public static class SortParser
{
    public static SortSpec Parse(string? sort, string defaultField, IReadOnlySet<string> allowedFields)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return new SortSpec(defaultField, true);
        }

        var parts = sort.Split('.', 2);
        var field = parts[0];
        var descending = parts.Length < 2 || string.Equals(parts[1], "desc", StringComparison.OrdinalIgnoreCase);

        if (!allowedFields.Contains(field))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["sort"] = [$"Sort field must be one of: {string.Join(", ", allowedFields)}."],
            });
        }

        return new SortSpec(field, descending);
    }
}

public static class Paging
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    public static (int Page, int PageSize) Normalize(int? page, int? pageSize)
    {
        var normalizedPage = page is > 0 ? page.Value : 1;
        var normalizedPageSize = pageSize switch
        {
            null or <= 0 => DefaultPageSize,
            > MaxPageSize => MaxPageSize,
            _ => pageSize.Value,
        };

        return (normalizedPage, normalizedPageSize);
    }
}
