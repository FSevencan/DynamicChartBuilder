using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartProject.Entities.Concrete.Dtos
{
    public class QueryRequest
    {
        // Veritabanına bağlanmak için kullanılan bağlantı dizesi
        public string ConnectionString { get; set; }

        // Veritabanında çalıştırılacak sorgu
        public string Query { get; set; }

        // Opsiyonel: Sorgu türü (VIEW, FUNCTION, PROCEDURE)
        public string? QueryType { get; set; }

        // Opsiyonel: Kullanıcıdan ek bilgileri almak için kullanılabilir
        public Dictionary<string, object>? Parameters { get; set; }

        // Sorgunun formatının kontrol edilmesini sağlar
        public bool IsValid()
        {
            // Basit kontrol: Bağlantı dizesi ve sorgu boş olmamalıdır
            return !string.IsNullOrEmpty(ConnectionString) && !string.IsNullOrEmpty(Query);
        }
    }
}