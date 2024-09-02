
using ChartProject.Business.Abstract;
using ChartProject.Entities.Context;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartProject.Business.Concrete
{
    public class DataSourceManager : IDataSourceService
    {
        public async Task<IEnumerable<object>> GetFunctionsAndViewsAsync(string connectionString)
        {
            var query = @"
            SELECT 'FUNCTION' AS ObjectType, ROUTINE_NAME AS ObjectName 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_TYPE = 'FUNCTION'
            UNION ALL
            SELECT 'PROCEDURE' AS ObjectType, ROUTINE_NAME AS ObjectName 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_TYPE = 'PROCEDURE'
            UNION ALL
            SELECT 'VIEW' AS ObjectType, TABLE_NAME AS ObjectName 
            FROM INFORMATION_SCHEMA.VIEWS";

            return await ExecuteQueryAsync(connectionString, query);
        }

        public async Task<IEnumerable<object>> ExecuteQueryAsync(string connectionString, string query)
        {
            try
            {
                using (var context = new DynamicDbContext(connectionString))
                {
                    using (var command = context.Database.GetDbConnection().CreateCommand())
                    {
                        command.CommandText = query;
                        context.Database.OpenConnection();

                        using (var result = await command.ExecuteReaderAsync())
                        {
                            var resultList = new List<Dictionary<string, object>>();

                            while (await result.ReadAsync())
                            {
                                var row = new Dictionary<string, object>();

                                for (int i = 0; i < result.FieldCount; i++)
                                {
                                    row.Add(result.GetName(i), result.GetValue(i));
                                }

                                resultList.Add(row);
                            }

                            return resultList;
                        }
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                // SQL Hataları için daha açıklayıcı mesajlar ver
                throw new Exception($"SQL hatası oluştu: {sqlEx.Message}", sqlEx);
            }
            catch (Exception ex)
            {
                // Genel hatalar için mesaj
                throw new Exception("Veritabanı sorgusu çalıştırılırken bir hata oluştu.", ex);
            }
        }

        public async Task<IEnumerable<object>> ExecuteDynamicQueryAsync(string connectionString, string objectType, string objectName, List<object> parameters = null)
        {
            string query = "";

            if (objectType == "VIEW")
            {
                query = $"SELECT * FROM {objectName}";
            }
            else if (objectType == "FUNCTION")
            {
                string paramList = parameters != null ? string.Join(", ", parameters.Select(p => $"'{p}'")) : "";
                query = $"SELECT * FROM {objectName}({paramList})";
            }
            else if (objectType == "PROCEDURE")
            {
                string paramList = parameters != null ? string.Join(", ", parameters.Select(p => $"'{p}'")) : "";
                query = $"EXEC {objectName} {paramList}";
            }
            else
            {
                throw new Exception("Geçersiz obje türü.");
            }

            return await ExecuteQueryAsync(connectionString, query);
        }
    }

}