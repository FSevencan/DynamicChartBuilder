
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartProject.Business.Abstract
{
    public interface IDataSourceService
    {
        // Veritabanındaki fonksiyonları, prosedürleri ve view'ları almak için tanımlanan metod
        Task<IEnumerable<object>> GetFunctionsAndViewsAsync(string connectionString);

        // Kullanıcı tarafından gönderilen herhangi bir sorguyu çalıştırmak için tanımlanan metod
        Task<IEnumerable<object>> ExecuteQueryAsync(string connectionString, string query);

        // Dinamik olarak oluşturulan sorguları çalıştırmak için tanımlanan metod
        Task<IEnumerable<object>> ExecuteDynamicQueryAsync(string connectionString, string objectType, string objectName, List<object> parameters = null);
    }
}