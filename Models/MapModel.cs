using System.Collections.ObjectModel;

namespace ttmap.Models
{
    public class MapModel
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Details { get; set; }
        public string? IPAddress { get; set; }
        public int SubSysID { get; set; }
        public int TSubSystemMID { get; set; }
        public int MaintenanceID { get; set; }
        public double PositionValue { get; set; }
        public int Aid { get; set; }
        public string? EventName { get; set; }
        public string? Image { get; set; }
        public int Vid { get; set; }
        public string? Name { get; set; }
        public int Id { get; set; }



        public ObservableCollection<MapModel> TSubSystemMasterDetailsBECollection = null;

        public ObservableCollection<MapModel> VIDSAlertCollection = null;

        public ObservableCollection<MapModel> VTSLocationCollection = null;

        public ObservableCollection<MapModel> routeCollection = null;

        public ObservableCollection<MapModel> VMSDisplayCollection = null;

        public ObservableCollection<MapModel> demarkingCollection = null;


    }

    //public  class VIDSModel
    //{
    //    public string? IPAddress { get; set; }
    //    public int TSubSystemMID { get; set; }
    //    public int Aid { get; set; }
    //    public string? EventName { get; set; }
    //    public string? EventDetail { get; set; }
    //    public string? Image { get; set; }

    //    //public ObservableCollection<VIDSModel> VIDSAlertCollection = null;

    //}

}
