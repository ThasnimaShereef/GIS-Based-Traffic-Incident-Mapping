using Npgsql;
using System.Collections.ObjectModel;
using System.Data;


namespace ttmap.Models
{
    public class retrieve
    {
        // Retrieveing data points from the database
        public ObservableCollection<MapModel> RetreiveDetails()
        {
            DataTable? dt = new DataTable();

            ObservableCollection<MapModel> icons = new ObservableCollection<MapModel>();
            try
            {
                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand("SELECT * FROM public.mupacoords()", connection))
                    {
                        using (var adapter = new NpgsqlDataAdapter(command))
                        {
                            // Fill the DataTable with the result of the function
                            adapter.Fill(dt);
                            icons = ConvertDataTableToCollection(dt);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
            finally { dt = null; }
            return icons;
        }

        public ObservableCollection<MapModel> ConvertDataTableToCollection(DataTable dt)
        {
            ObservableCollection<MapModel> mapIcon = new ObservableCollection<MapModel>();
            try
            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    MapModel mapIcons = new MapModel();

                    if (dt.Rows[i]["Latitude"] != DBNull.Value)
                        mapIcons.Latitude = Convert.ToDouble(dt.Rows[i]["Latitude"]);

                    if (dt.Rows[i]["Longitude"] != DBNull.Value)
                        mapIcons.Longitude = Convert.ToDouble(dt.Rows[i]["Longitude"]);

                    if (dt.Rows[i]["Details"] != DBNull.Value)
                        mapIcons.Details = dt.Rows[i]["Details"].ToString();

                    //if (dt.Rows[i]["IPAddress"] != DBNull.Value)
                    //    mapIcons.IPAddress = dt.Rows[i]["IPAddress"].ToString();

                    if (dt.Rows[i]["SubSysID"] != DBNull.Value)
                        mapIcons.SubSysID = Convert.ToInt32(dt.Rows[i]["SubSysID"].ToString());

                    if (dt.Rows[i]["TSubSystemMID"] != DBNull.Value)
                        mapIcons.TSubSystemMID = Convert.ToInt32(dt.Rows[i]["TSubSystemMID"].ToString());

                    if (dt.Rows[i]["MaintenanceID"] != DBNull.Value)
                        mapIcons.MaintenanceID = Convert.ToInt32(dt.Rows[i]["MaintenanceID"].ToString());

                    //if (dt.Rows[i]["PositionValue"] != DBNull.Value)
                    //    mapIcons.PositionValue = Convert.ToDouble(dt.Rows[i]["PositionValue"]);

                    mapIcon.Add(mapIcons);
                }
            }
            catch (Exception)
            {
            }
            return mapIcon;
        }

        // inserting new icon on the map through a form
        public void insertData(double latitude, double longitude, string details, int subSysID)
        {
            try
            {
                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
                {
                    connection.Open();


                    string commandText = "public.insert_new_icon";
                    using (var command = new NpgsqlCommand(commandText, connection))

                    {

                        command.CommandType = CommandType.StoredProcedure;

                        command.Parameters.AddWithValue("latitude", (decimal)latitude);
                        command.Parameters.AddWithValue("longitude", (decimal)longitude);
                        command.Parameters.AddWithValue("details", details);
                  //      command.Parameters.AddWithValue("ipaddress", ipAddress);
                        command.Parameters.AddWithValue("subsysid", subSysID);
                  //      command.Parameters.AddWithValue("tsubsystemmid", tSubSystemMID);
                  //      command.Parameters.AddWithValue("positionvalue", (decimal)positionValue);

                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {

            }

        }

        // updating database values on changing icon position  
        public void UpdateData(double latitude, double longitude, int tSubSystemMID)
        {
            try
            {
                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))

                {
                    connection.Open();

                    using (var command = new NpgsqlCommand("SELECT public.update_lat_long(@p_tsubsystemmid, @p_latitude, @p_longitude)", connection))
                    {
                        command.CommandType = CommandType.Text;
                        command.Parameters.AddWithValue("p_tsubsystemmid", tSubSystemMID);
                        command.Parameters.AddWithValue("p_latitude", (decimal)latitude);
                        command.Parameters.AddWithValue("p_longitude", (decimal)longitude);

                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        //Disabling an icon from the map
        public void DeleteData(int tSubSystemMID)
        {
            try
            {
                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))

                {
                    connection.Open();

                    using (var command = new NpgsqlCommand("SELECT public.deleteicon(@p_tsubsystemmid)", connection))
                    {
                        command.CommandType = CommandType.Text;
                        command.Parameters.AddWithValue("p_tsubsystemmid", tSubSystemMID);

                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        public static (decimal?, decimal?) GetLatLongFromPosition(decimal positionValue)
        {
            decimal? latitude = null;
            decimal? longitude = null;

            try
            {

                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
                {
                    connection.Open();

                    using (NpgsqlCommand command = new NpgsqlCommand("SELECT latitude, longitude FROM public.get_position_data(@positionValue)", connection))
                    {
                        command.Parameters.AddWithValue("positionValue", positionValue);

                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                latitude = Convert.ToDecimal(reader["latitude"]);
                                longitude = Convert.ToDecimal(reader["longitude"]);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

                throw;
            }
            return (latitude, longitude);
        }
        //public static decimal? GetPositionFromLatLong(decimal latitude, decimal longitude)
        //{
        //    decimal? positionValue = null;
        //    try
        //    {

        //        using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
        //        {
        //            connection.Open();

        //            using (NpgsqlCommand command = new NpgsqlCommand("SELECT  public.get_position_from_lat_long(@latitude, @longitude)", connection))
        //            {
        //                command.Parameters.AddWithValue("latitude", latitude);
        //                command.Parameters.AddWithValue("longitude", longitude);

        //                using (var reader = command.ExecuteReader())
        //                {
        //                    if (reader.Read())
        //                    {
        //                        positionValue = Convert.ToDecimal(reader["positionvalue"]);
        //                    }
        //                }
        //            }
        //        }               
        //    }
        //    catch (Exception ex)
        //    {

        //        throw;
        //    }
        //    return positionValue;
        //}

        //VIDS Alert
        public ObservableCollection<MapModel> VIDSAlertDetails()
        {
            DataTable? dt = new DataTable();

            ObservableCollection<MapModel> icons = new ObservableCollection<MapModel>();
            try
            {
                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand("SELECT * FROM public.getalertdatavids()", connection))
                    {
                        using (var adapter = new NpgsqlDataAdapter(command))
                        {

                            adapter.Fill(dt);
                            icons = ConvertDataToCollection(dt);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
            finally { dt = null; }


            return icons;
        }

        public ObservableCollection<MapModel> ConvertDataToCollection(DataTable dt)
        {
            ObservableCollection<MapModel> alertIcon = new ObservableCollection<MapModel>();
            try
            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    MapModel vidsIcons = new MapModel();

                    if (dt.Rows[i]["IPAddress"] != DBNull.Value)
                        vidsIcons.IPAddress = dt.Rows[i]["IPAddress"].ToString();

                    if (dt.Rows[i]["TSubSystemMID"] != DBNull.Value)
                        vidsIcons.TSubSystemMID = Convert.ToInt32(dt.Rows[i]["TSubSystemMID"].ToString());

                    if (dt.Rows[i]["Aid"] != DBNull.Value)
                        vidsIcons.Aid = Convert.ToInt32(dt.Rows[i]["Aid"].ToString());

                    if (dt.Rows[i]["EventName"] != DBNull.Value)
                        vidsIcons.EventName = dt.Rows[i]["EventName"].ToString();

                    if (dt.Rows[i]["Image"] != DBNull.Value)
                        vidsIcons.Image = dt.Rows[i]["Image"].ToString();

                    alertIcon.Add(vidsIcons);
                }
            }
            catch (Exception)
            {
            }
            return alertIcon;
        }

        public ObservableCollection<MapModel> VTSLocationDetails()
        {
            DataTable? dt = new DataTable();

            ObservableCollection<MapModel> icons = new ObservableCollection<MapModel>();
            try
            {
                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand("SELECT * FROM public.get_latest_location()", connection))
                    {
                        using (var adapter = new NpgsqlDataAdapter(command))
                        {
                            adapter.Fill(dt);
                            icons = ConvertData(dt);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
            finally { dt = null; }

            return icons;
        }

        public ObservableCollection<MapModel> ConvertData(DataTable dt)
        {
            ObservableCollection<MapModel> vtsIcon = new ObservableCollection<MapModel>();
            try
            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    MapModel vtsIcons = new MapModel();

                    if (dt.Rows[i]["Vid"] != DBNull.Value)
                        vtsIcons.Vid = Convert.ToInt32(dt.Rows[i]["Vid"].ToString());

                    if (dt.Rows[i]["Name"] != DBNull.Value)
                        vtsIcons.Name = dt.Rows[i]["Name"].ToString();

                    if (dt.Rows[i]["Latitude"] != DBNull.Value)
                        vtsIcons.Latitude = Convert.ToDouble(dt.Rows[i]["Latitude"]);

                    if (dt.Rows[i]["Longitude"] != DBNull.Value)
                        vtsIcons.Longitude = Convert.ToDouble(dt.Rows[i]["Longitude"]);

                    vtsIcon.Add(vtsIcons);
                }
            }
            catch (Exception)
            {
            }
            return vtsIcon;
        }

        public ObservableCollection<MapModel> RouteDetails()
        {
            DataTable? dt = new DataTable();

            ObservableCollection<MapModel> icons = new ObservableCollection<MapModel>();
            try
            {
                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand("SELECT * FROM public.mupa()", connection))
                    {
                        using (var adapter = new NpgsqlDataAdapter(command))
                        {
                            // Fill the DataTable with the result of the function
                            adapter.Fill(dt);
                            icons = ConvertRouteCollection(dt);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
            finally { dt = null; }
            return icons;
        }

        public ObservableCollection<MapModel> ConvertRouteCollection(DataTable dt)
        {
            ObservableCollection<MapModel> position = new ObservableCollection<MapModel>();
            try
            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    MapModel routePosition = new MapModel();

                    if (dt.Rows[i]["Latitude"] != DBNull.Value)
                        routePosition.Latitude = Convert.ToDouble(dt.Rows[i]["Latitude"]);

                    if (dt.Rows[i]["Longitude"] != DBNull.Value)
                        routePosition.Longitude = Convert.ToDouble(dt.Rows[i]["Longitude"]);

                    position.Add(routePosition);
                }
            }
            catch (Exception)
            {
            }
            return position;
        }
    
        public ObservableCollection<MapModel> VMSMessageDetails()
        {
          DataTable? dt = new DataTable();

           ObservableCollection<MapModel> icons = new ObservableCollection<MapModel>();
          try
          {
            using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
            {
                connection.Open();
                using (var command = new NpgsqlCommand("SELECT * FROM public.vmsMessageDisplay()", connection))
                {
                    using (var adapter = new NpgsqlDataAdapter(command))
                    {

                        adapter.Fill(dt);
                        icons = vmsCollection(dt);
                    }
                }
            }
         }
         catch (Exception ex)
         {
         }
         finally { dt = null; }


         return icons;
        }

         public ObservableCollection<MapModel> vmsCollection(DataTable dt)
        {
          ObservableCollection<MapModel> vmsIcon = new ObservableCollection<MapModel>();
           try
           {
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                MapModel vmsMsg = new MapModel();

                if (dt.Rows[i]["Image"] != DBNull.Value)
                    vmsMsg.Image = dt.Rows[i]["Image"].ToString();

                if (dt.Rows[i]["TSubSystemMID"] != DBNull.Value)
                    vmsMsg.TSubSystemMID = Convert.ToInt32(dt.Rows[i]["TSubSystemMID"].ToString());

                    vmsIcon.Add(vmsMsg);
            }
          }
        catch (Exception)
        {
        }
        return vmsIcon;
    }
        public ObservableCollection<MapModel> demarkingDetails()
        {
            DataTable? dt = new DataTable();

            ObservableCollection<MapModel> icons = new ObservableCollection<MapModel>();
            try
            {
                using (var connection = new NpgsqlConnection(mapDbContext.ConnectionString()))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand("SELECT * FROM public.demarkingsigns()", connection))
                    {
                        using (var adapter = new NpgsqlDataAdapter(command))
                        {

                            adapter.Fill(dt);
                            icons = demarkingCollection(dt);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
            finally { dt = null; }


            return icons;
        }

        public ObservableCollection<MapModel> demarkingCollection(DataTable dt)
        {
            ObservableCollection<MapModel> warningIcon = new ObservableCollection<MapModel>();
            try
            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    MapModel warningSign = new MapModel();

                    if (dt.Rows[i]["Image"] != DBNull.Value)
                        warningSign.Image = dt.Rows[i]["Image"].ToString();

                    if (dt.Rows[i]["Id"] != DBNull.Value)
                        warningSign.Id = Convert.ToInt32(dt.Rows[i]["Id"].ToString());

                    if (dt.Rows[i]["Latitude"] != DBNull.Value)
                        warningSign.Latitude = Convert.ToDouble(dt.Rows[i]["Latitude"]);

                    if (dt.Rows[i]["Longitude"] != DBNull.Value)
                        warningSign.Longitude = Convert.ToDouble(dt.Rows[i]["Longitude"]);

                    if (dt.Rows[i]["Details"] != DBNull.Value)
                        warningSign.Details = dt.Rows[i]["Details"].ToString();

                    warningIcon.Add(warningSign);
                }
            }
            catch (Exception)
            {
            }
            return warningIcon;
        }


    }

}