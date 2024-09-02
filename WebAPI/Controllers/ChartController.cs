using ChartProject.Business.Abstract;
using ChartProject.Entities.Concrete.Dtos;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Helper;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChartController : ControllerBase
    {
        private readonly IDataSourceService _dataSourceService;

        public ChartController(IDataSourceService dataSourceService)
        {
            _dataSourceService = dataSourceService;
        }

        [HttpPost("list-functions-views")]
        public async Task<IActionResult> ListFunctionsAndViews([FromBody] DatabaseConnectionRequest connectionRequest)
        {
            try
            {
                var connectionString = $"Server={connectionRequest.Server};Database={connectionRequest.Database};User Id={connectionRequest.Username};Password={connectionRequest.Password};TrustServerCertificate=True;";

                var result = await _dataSourceService.GetFunctionsAndViewsAsync(connectionString);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("execute-query")]
        public async Task<IActionResult> ExecuteQuery([FromBody] QueryRequest request)
        {
            try
            {
                if (!request.IsValid())
                {
                    return BadRequest(new { message = "Geçersiz bağlantı dizesi veya sorgu." });
                }

                var result = await _dataSourceService.ExecuteQueryAsync(request.ConnectionString, request.Query);

                if (result == null || !result.Any())
                {
                    return Ok(new { labels = new List<string>(), datasets = new List<object>() });
                }

                var formattedData = ChartHelper.FormatDataForChart(result); 

                return Ok(formattedData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}