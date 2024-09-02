namespace WebAPI.Helper
{
    public static class ChartHelper
    {
        /**
         * Chart.js için uygun formatta verileri düzenler.
         * @param {IEnumerable<object>} result - Sorgu sonuçları.
         * @returns {object} - Chart.js formatına uygun hale getirilmiş veri.
         */
        public static object FormatDataForChart(IEnumerable<object> result)
        {
            if (result == null || !result.Any())
            {
                return new { labels = new List<string>(), datasets = new List<object>() };
            }

            var labels = new List<string>();
            var datasets = new List<object>();

            var firstRow = result.First() as IDictionary<string, object>;

            if (firstRow == null)
            {
                return new { labels = new List<string>(), datasets = new List<object>() };
            }

            string labelColumn = firstRow.Keys.First();
            labels = result.Select(row => (row as IDictionary<string, object>)[labelColumn].ToString()).ToList();

            var keys = firstRow.Keys.Where(k => k != labelColumn).ToList();
            foreach (var key in keys)
            {
                var dataValues = result.Select(row =>
                {
                    var dataRow = row as IDictionary<string, object>;
                    return double.TryParse(dataRow[key]?.ToString(), out double parsedValue) ? parsedValue : 0.0;
                }).ToList();

                datasets.Add(new { label = key, data = dataValues });
            }

            return new { labels, datasets };
        }
    }
}
