using Microsoft.EntityFrameworkCore;

namespace ttmap.Models
{
    public class mapDbContext : DbContext
    {

        public static string ConnectionString()
        {
            string connectstr = "";
            try
            {
                
                connectstr = "Host=localhost;Username=postgres;Password=TrafikSol@123;Database=postgres";

                
            }
            catch (Exception e)
            {
                

            }
            return connectstr;

        }

    }
}
