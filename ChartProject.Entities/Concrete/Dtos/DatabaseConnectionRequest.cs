using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChartProject.Entities.Concrete.Dtos
{
	public class DatabaseConnectionRequest 
	{
		public string Server { get; set; } 
		public string Database { get; set; } 
		public string Username { get; set; } 
		public string Password { get; set; } 
	}
}
