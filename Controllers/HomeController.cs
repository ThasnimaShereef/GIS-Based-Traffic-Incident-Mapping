using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;
using ttmap.Models;

namespace ttmap.Controllers
{
    public class HomeController : Controller
    { 
        MapModel stretchBE = new MapModel();
        retrieve stretch = new retrieve();
        MapModel viewModel = new MapModel();
        MapModel vts = new MapModel();
        MapModel vms = new MapModel();
        MapModel signs = new MapModel();
            
        //Retrieving datapoints from database
        [HttpGet]
        public IActionResult Index()
        {
            stretchBE.TSubSystemMasterDetailsBECollection = stretch.RetreiveDetails();
            stretchBE.routeCollection = stretch.RouteDetails();
            return View(stretchBE);
            
        }

        [HttpPost]
        //inserting new icons manually
        public IActionResult Insert(MapModel model)
        {
            var Latitude = model.Latitude;
            var Longitude = model.Longitude;
            var Details = model.Details;
          //  var IPAddress = model.IPAddress;
            var SubSysID = model.SubSysID;
            //  var TSubSystemID = model.TSubSystemMID;
            //  var Position = model.PositionValue;

            //   stretch.insertData(model.Latitude, model.Longitude, model.Details, model.IPAddress, model.SubSysID, model.TSubSystemMID, model.PositionValue) ;
            stretch.insertData(model.Latitude, model.Longitude, model.Details, model.SubSysID);
            return RedirectToAction("Index");

        }

        //Fetching LatLong from database for corresponding position value
        [HttpPost]
        public IActionResult FetchLatLong(string positionValue)
        {
           
            if (positionValue != null)
            {
                (decimal? latitude, decimal? longitude) = retrieve.GetLatLongFromPosition(decimal.Parse(positionValue));

                // If latitude and longitude values are found, return them
                if (latitude != null && longitude != null)
                {
                    return Json(new { latitude, longitude });
                }
            }
            // Return null values if position data is not found
            return Json(null);

        }

        //[HttpPost]
        //public IActionResult FetchPosition(string latitude, string longitude)
        //{
        //    if (!string.IsNullOrEmpty(latitude) && !string.IsNullOrEmpty(longitude))
        //    {

        //        decimal? positionvalue = retrieve.GetPositionFromLatLong(decimal.Parse(latitude), decimal.Parse(longitude));

        //        if (positionvalue != null)
        //        {
        //            return Json(new { positionvalue });
        //        }
        //    }
        //    return Json(null);
        //}

        //updating an icon to a new position
        [HttpPost]
        public IActionResult Update(MapModel model)
        {
            stretch.UpdateData(model.Latitude, model.Longitude, model.TSubSystemMID);
            return RedirectToAction("Index");

        }

        //Removing an icon
        [HttpPost]
        public IActionResult Delete(MapModel model)
        {
            stretch.DeleteData(model.TSubSystemMID);
            return RedirectToAction("Index");

        }

        public IActionResult VIDSAlert()
        {
            viewModel.VIDSAlertCollection = stretch.VIDSAlertDetails();
            var serializedData = JsonConvert.SerializeObject(viewModel);
            return Json(serializedData);
        }

        public IActionResult VTSLocation()
        {
            vts.VTSLocationCollection = stretch.VTSLocationDetails();
            var locationData = JsonConvert.SerializeObject(vts);
            return Json(locationData);
        }

        public IActionResult VMSMessageDisplay()
        {
            vms.VMSDisplayCollection = stretch.VMSMessageDetails();
            var vmsData = JsonConvert.SerializeObject(vms);
            return Json(vmsData);
        }
        public IActionResult demarkingHighway()
        {
            signs.demarkingCollection = stretch.demarkingDetails();
            var signData = JsonConvert.SerializeObject(signs);
            return Json(signData);
        }

        //[HttpPost]
        //public ActionResult CacheMapTile(int index, string data)
        //{
        //    try
        //    {
        //        // Convert base64 data to byte array
        //        byte[] bytes = Convert.FromBase64String(data.Substring("data:image/png;base64,".Length));

        //        // Specify the directory path in the D drive
        //        string directoryPath = @"D:\.net\ttmap\wwwroot\cache";

        //        // Create the directory if it doesn't exist
        //        if (!Directory.Exists(directoryPath))
        //        {
        //            Directory.CreateDirectory(directoryPath);
        //        }

        //        // Save PNG tile to the specified directory
        //        string fileName = $"tile_{index}.png";
        //        string filePath = Path.Combine(directoryPath, fileName);
        //        System.IO.File.WriteAllBytes(filePath, bytes);

        //        return Json(new { success = true });
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { success = false, error = ex.Message });
        //    }
        // }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
