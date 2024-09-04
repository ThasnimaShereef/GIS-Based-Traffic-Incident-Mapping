var apiKey = "IYO9T9hS2cNsih5PWvM3tGfl6atUuBbD";
var coordinates;
var routeCoords;
var bufferedLine;
let size = 50;
var initialZoom = 10;
var markers = [];
var vehicles = [];
var eventMarker = [];
var repeatingTSubSystemMIDs = [];
var vmsDisplays = [];
var vehicleStates = {}; // Object to store the state of each vehicle
var vmsMarkers = {};
var vmsPopups = {};
var startIcon = new Image(70);
var endIcon = new Image(70);
var centerCoords = [85.964033, 20.456044];  //[77.3736, 28.6170]; //long,lat center coordinates
var startpoint = [77.154501, 28.737556]; //[85.79619, 20.276925]; // long,lat
var endpoint = [76.979246, 29.354911];  //[86.134453, 20.706856]; 
//var roundLatLng = Formatters.roundLatLng;
var darkLayer = document.getElementById('dark');
var basicLayer = document.getElementById('basic');
var satelliteLayer = document.getElementById('satellite');
var closeButton = document.querySelector('.close');
//var popupForm = document.getElementById('popup-form');
var markerForm = document.getElementById('marker-form');
var saveButton = document.getElementById('save-marker-button');
var addMarkerButton = document.getElementById('add-marker-button');
var latitudeField = document.createElement('div');
var longitudeField = document.createElement('div');
var flowCheckbox = document.getElementById('flow');
var incidentscheckbox = document.getElementById('incidents');
var map;

var state = {
    trafficVisible: false,
    trafficIncidentsVisible: false,
    mapStyle: '2/basic_street-light'
};
map = tt.map({
    key: apiKey,
    container: "map",
    center: startpoint,
    pitch: 0,//60,
    bearing: 0, //95,
    zoom: initialZoom,
    style: getCurrentStyleUrl(),
    stylesVisibility: {
        trafficFlow: true,
        trafficIncidents: true
    },
// style:`https://api.tomtom.com/style/1/style/22.2.1-*?map=2/basic_street-dark&poi=2/poi_dark`
    //style: `https://api.tomtom.com/style/1/style/*?map=2/basic_street-satellite&poi=2/poi_dynamic-satellite&key=${apiKey}`
    
});
map.on('style.load', function () {
    console.log("map loaded");
    createRoute();
    if (routeCreated) {
        setInterval(checkVTSlocation, 60000);
    }
    incidentscheckbox.addEventListener('change', function (event) {
        //state.trafficIncidentsVisible = event.target.checked;
        //console.log(state.trafficIncidentsVisible);
        map.setStyle(getCurrentStyleUrl());
    });
    flowCheckbox.addEventListener('change', function (event) {
        // state.trafficVisible = event.target.checked;
        // console.log(state.trafficVisible);
        map.setStyle(getCurrentStyleUrl());
    });
});
//Sidebar Folding
new Foldable('.js-foldable', 'top-right');
//Map Language
map.setLanguage("en-GB");

//Reset map
document.getElementById('home-btn').addEventListener('click', resetMap);
function resetMap() {
    map.flyTo({ 
        center: startpoint, 
        zoom: initialZoom,
        pitch: 0,
        bearing: 0
    });
}

//fullscreen
map.addControl(new tt.FullscreenControl({ container: document.querySelector('map') }));
////Map Styles
//satelliteLayer.addEventListener('click', function () {   
//    map.setStyle(`https://api.tomtom.com/style/1/style/*?map=2/basic_street-satellite&poi=2/poi_dynamic-satellite&key=${apiKey}`);
//});
//basicLayer.addEventListener('click', function () {
//   map.setStyle(`https://api.tomtom.com/style/1/style/22.2.1-*?map=2/basic_street-light&poi=2/poi_light`);
//});
//darkLayer.addEventListener('click', function () {
//    map.setStyle(`https://api.tomtom.com/style/1/style/22.2.1-*?map=2/basic_street-dark&poi=2/poi_dark`);
//});

//dynamic marker icons
coordinates.forEach(function (coord) {
    var lnglat = [coord.longitude, coord.latitude];
    var iconSize;

    switch (coord.subSysID) {
        case 1:
            iconSize = 50;
            iconPath = '/image/MainVMS.png'; //'/VMS IMAGE/Img_02152024031524.bmp'; //
            break;
        case 3:
            iconSize = 30;
            iconPath = '/image/ecb blue.png';
            break;
        case 4:
            iconSize = 80;
            iconPath = '/image/met.png';
            break;
        case 6:
            iconSize = 70;
            iconPath = '/image/cctv.png';
            break;
        case 26:
            iconSize = 30;
            iconPath = '/image/atcc.png';
            break;
    }
    var customIcon = new Image(iconSize);
    customIcon.src = iconPath;

    var popupContent = `
        <div>
            <h4>${coord.details}</h4>
            <p>Latitude: ${coord.latitude}</p>
            <p>Longitude: ${coord.longitude}</p>
            <p>Details: ${coord.details}</p>
            <p>IPAddress: ${coord.ipAddress}</p>
            <p>SubSysID: ${coord.subSysID}</p>
            <p>Position: ${coord.positionValue}</p>  
            
        </div>
    `;
    var popup = new tt.Popup({ offset: 35 })
        .setHTML(popupContent);

    var marker = new tt.Marker({
        element: customIcon,
        draggable: true,
        clickable: true,
        anchor: 'bottom',
  }).setLngLat(lnglat)
        .addTo(map);
    markers.push(marker);

    marker.setPopup(popup);
    marker.getElement().addEventListener('mouseover', function () {
        popup.addTo(map);
    });
    marker.getElement().addEventListener('mouseout', function () {
        popup.remove();
    });


    //Maintenance Indication
    if (coord.maintenanceID === 1) {
        var maintenanceIcon = new Image(35);
        maintenanceIcon.src = '/image/maintenance1.png';
        var mPopup = new tt.Popup({ offset: 80 })
            .setHTML(` <b> Under Maintenance! </b>`);

        // Calculate offset to position the marker's top center at (0, 0) relative to its center
        var offset = new tt.Point(15, -80);

        var mIcon = new tt.Marker({
            element: maintenanceIcon,
            offset: offset,
            draggable: false,
            clickable: true,
            anchor: 'top',
            //   width:"50px"

        }).setLngLat(lnglat)
            .addTo(map);
        //markers.push(marker);

        mIcon.setPopup(mPopup);

        mIcon.getElement().addEventListener('mouseover', function () {
            mPopup.addTo(map);
        });
        mIcon.getElement().addEventListener('mouseout', function () {
            mPopup.remove();
        });
    }

    //Disabling icons on the map
    marker.getElement().addEventListener('contextmenu', function (event) {

        var confirmDelete = confirm("Are you sure you want to delete this icon?");

        if (confirmDelete) {
            var TSubSystemMID = coord.tSubSystemMID;

            // Send AJAX request to the server-side to delete the marker
            $.ajax({

                url: '/Home/Delete',
                method: 'POST',
                data: { TSubSystemMID: TSubSystemMID },
                success: function (response) {
                    alert('Icon removed successfully!');
                    marker.remove();
                },
                error: function (xhr, status, error) {
                    alert('Error occurred while removing icon: ' + error);
                    console.error(error);
                }
            });
        }
    });

    //Dragging markers to new position
    marker.on('dragend', function (event) {
        // Track the position changes in memory
        var newLatLng = marker.getLngLat();

        console.log('New Position:', newLatLng);

        latitudeField.value = newLatLng.lat.toFixed(6);
        longitudeField.value = newLatLng.lng.toFixed(6);

        var confirmSave = confirm("Do you want to save the changes?");

        if (confirmSave) {
            var TSubSystemMID = coord.tSubSystemMID;

            $.ajax({
                url: '/Home/Update',
                method: 'POST',
                data: {
                    TSubSystemMID: TSubSystemMID,
                    latitude: newLatLng.lat,
                    longitude: newLatLng.lng
                },
                success: function (response) {
                    alert('Changes saved successfully!');
                    marker.setLngLat(newLatLng);
                },
                error: function (xhr, status, error) {
                    alert('Error occurred while saving changes: ' + error);
                    marker.setLngLat(lnglat);
                }
            });
        } else {
            marker.setLngLat(lnglat);
        }
    });

});

// Function to update the alerts
function updateMarkers(data) {
    var jsonData = JSON.parse(data);
    var alerts = jsonData.VIDSAlertCollection;
    
    for (var i = 0; i < alerts.length; i++) {
        var alert = alerts[i];
        console.log(alert);
        switch (alert.Aid) {
            case 1:               
                iconPath = '/image/overspeeding.png';
                break;
            case 2:               
                iconPath = '/image/speed-drop.png';
                break;
            case 3:               
                iconPath = '/image/camera-tampering.png';
                break;
            case 4:               
                iconPath = '/image/congestionPNG.png';
                break;
            case 5:                
                iconPath = '/image/noparking.png';
                break;
            case 6:
                iconPath = '/image/tripwire.png';
                break;
            case 7:
                iconPath = '/image/wrong.png';
                break;
            case 8:
                iconPath = '/image/fog-detection.png';
                break;
        }
        var mapMarker = findMarkerBySubSystemMID(alert.TSubSystemMID); // Function to find marker by TSubSystemMID
        if (mapMarker) {
          
            var lnglat = [mapMarker.longitude, mapMarker.latitude];
            // <img src=${alert.Image} style="max-width: 100%;">
            // Update marker icon with the image
            var customIcon = new Image(70);
            customIcon.src = iconPath;

            var popupContent = `
        <div>
            <h6>${alert.EventName}</h6>           
            <p>IPAddress: ${alert.IPAddress}</p>   
          
        </div>
    `;
            var popup = new tt.Popup({ offset: [0, -45] })
                .setHTML(popupContent);
            var newMarker = new tt.Marker({
                element: customIcon,
                draggable: false,
                clickable: true,
                anchor: 'bottom',
            }).setLngLat(lnglat)
                .addTo(map);
            eventMarker.push(newMarker);

            newMarker.setPopup(popup).togglePopup();
        }
    }
}

// Function to find marker by TSubSystemMID
function findMarkerBySubSystemMID(TSubSystemMID) {
    
    for (var i = 0; i < coordinates.length; i++) {
        var mapMarker = coordinates[i];

        if (mapMarker.tSubSystemMID === TSubSystemMID) {
            eventmarker = mapMarker[i];            
            return mapMarker;
        }
    }
    return null;
}

// Function to check for updates in the database
function checkForAlertVIDS() {
  
    $.ajax({
        url: '/Home/VIDSAlert', 
        method: 'GET',
        dataType: 'json',
      
        success: function (response) {
 
           // console.log('VIDS Alert Collection:' , response);
            eventMarker.forEach((marker) => marker.remove());
            updateMarkers(response);   
        },     
        error: function (xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
}
checkForAlertVIDS();
//setInterval(checkForAlertVIDS, 60000); // 5000 milliseconds = 5 seconds  - calling the function frequently 
addMarkerButton.addEventListener('click', function () {
    // Display the marker form
    markerForm.style.display = 'block';

    // Add event listener to position input field
    document.getElementById('positionValue').addEventListener('input', function () {
        var positionValue = document.getElementById('positionValue').value;
        if (positionValue) {
            // Send AJAX request to fetch latitude and longitude based on the position
            $.ajax({
                url: '/Home/FetchLatLong',
                type: 'POST',
                data: { positionValue: positionValue },
                success: function (data) {
                    if (data) {
                        // If data is retrieved, populate latitude and longitude fields
                        document.getElementById('latitude').value = data.latitude;
                        document.getElementById('longitude').value = data.longitude;
                    } else {
                        // Handle case where position data not found
                        document.getElementById('latitude').value = '';
                        document.getElementById('longitude').value = '';
                    }
                },
                error: function () {
                    // Handle errors
                }
            });
        } else {
            // Clear latitude and longitude fields if position is empty
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
        }
    });
    //document.getElementById('latitude').addEventListener('input', function () {
    //    checkLatLong();
    //});

    //document.getElementById('longitude').addEventListener('input', function () {
    //    checkLatLong();
    //});

    //// Function to check if both latitude and longitude are entered
    //function checkLatLong() {
    //    var latitude = document.getElementById('latitude').value;
    //    var longitude = document.getElementById('longitude').value;
    //    if (latitude && longitude) {
    //        // Send AJAX request to fetch position based on latitude and longitude
    //        $.ajax({
    //            url: '/Home/FetchPosition',
    //            type: 'POST',
    //            data: { latitude: latitude, longitude: longitude },
    //            success: function (data) {
    //                if (data) {
    //                    // If data is retrieved, populate position field
    //                    document.getElementById('positionValue').value = data.positionValue;
    //                } else {
    //                    // Handle case where position data not found
    //                    document.getElementById('positionValue').value = '';
    //                }
    //            },
    //            error: function () {
    //                // Handle errors
    //            }
    //        });
    //    } else {
    //        // Clear position field if latitude or longitude is empty
    //        document.getElementById('positionValue').value = '';
    //    }
    //}
});

closeButton.addEventListener('click', function () {
    // Hide the marker form
    markerForm.style.display = 'none';
});
//function addMarker(latitude, longitude, details, ipAddress, subSysID) {
//    var iconSize;
//    var iconPath;
//    switch (subSysID) {

//        case 1:
//            iconSize = 50;
//            iconPath = '/image/MainVMS.png';
//            break;

//        case 3:
//            iconSize = 30;
//            iconPath = '/image/ecb blue.png';
//            break;

//        case 4:
//            iconSize = 50;
//            iconPath = '/image/met.png';
//            break;

//        case 6:
//            iconSize = 60;
//            iconPath = '/image/cctv.png';
//            break;

//        case 26:
//            iconSize = 30;
//            iconPath = '/image/atcc.png';
//            break;

//    }
//    var customIcon = new Image(iconSize);
//    customIcon.src = iconPath;

//    var marker = new tt.Marker({
//        element: customIcon,
//        anchor: 'bottom'
//    })
//        .setLngLat([longitude, latitude])
//        .addTo(map);

//}

saveButton.addEventListener('click', function () {
    //var latitude = parseFloat(document.getElementById('latitude').value);
    //var longitude = parseFloat(document.getElementById('longitude').value);
    //var details = document.getElementById('details').value;
    //var ipAddress = document.getElementById('ipAddress').value;
    //var subSysID = parseInt(document.getElementById('subSysID').value);
    //var position = parseFloat(document.getElementById('positionValue').value);

    //addMarker(latitude, longitude, details, ipAddress, subSysID, position);
    var formData = $("#insertForm").serialize(); // Serialize form data
    $.ajax({
        url: '/Home/Insert', // Action method to handle insertion
        type: 'POST',
        data: formData,
        success: function (result) {
            // Handle success
            alert('Item added successfully');
        },
        error: function (xhr, status, error) {
            // Handle error
            alert('Error adding item');
        }
    });
    markerForm.style.display = 'none';
});

//popup message on start and end point
startIcon.src = '/image/start.png';
var start = new tt.Marker({
    element: startIcon,
    anchor: 'bottom',
    clickable: true
})
    .setLngLat(startpoint)
    .addTo(map);

var startpopup = new tt.Popup({
    className: 'tt-popup',
    closeButton: false,
    offset: size / 2,
    anchor: 'bottom',

})
    .setHTML('Project Start');
start.setPopup(startpopup).togglePopup();

//end
endIcon.src = '/image/end.png';
var end = new tt.Marker({
    element: endIcon,
    anchor: 'bottom',
    clickable: true
})
    .setLngLat(endpoint)
    .addTo(map);
var endpopup = new tt.Popup({
    className: 'tt-popup',
    closeButton: false,
    offset: size / 2,
    anchor: 'bottom'
})
    .setHTML('Project end');
end.setPopup(endpopup).togglePopup();
   
// showing lat,long on map 
map.on('click', function (event) {
    var lngLat = new tt.LngLat(roundLatLng(event.lngLat.lng), roundLatLng(event.lngLat.lat));

    new tt.Popup({ className: 'tt-popup' })
        .setLngLat(lngLat)
        .setHTML(lngLat.toString())
        .addTo(map);
});

// static routing
//var displayRoute = function (geoJSON) {
//    routeLayer = map.addLayer({
//        'id': 'route',
//        'type': 'line',
//        'source': {
//            'type': 'geojson',
//            'data': geoJSON
//        },
//        'paint': {
//            'line-color': 'blue',
//            'line-width': 7
//        }
//    });
//};

//var combinedGeofence;
//var createGeofence = function (routeGeometry) {
//    // Buffer the route geometry to create the geofence
//    var geofence = turf.buffer(routeGeometry, 0.03, { units: 'kilometers', endCap: 'butt', side: 'right' }); // Adjust buffer size as needed
//    var geofenceLeft = turf.buffer(routeGeometry, 0.01, { units: 'kilometers', endCap: 'butt', side: 'left' });

//    // Buffer the route geometry to create the geofence on the right side with no buffer
//    var geofenceRight = turf.buffer(routeGeometry, 0.05, { units: 'kilometers', endCap: 'butt', side: 'right' });
//    // Clip the right buffer to remove the overlapping portion with the left buffer
//    var clippedGeofenceRight = turf.difference(geofenceRight, geofenceLeft);

//    // Combine the left and clipped right geofences
//    combinedGeofence = turf.union(geofenceLeft, clippedGeofenceRight);
   
//    // Display the geofence on the map
//    map.addLayer({
//        'id': 'geofence',
//        'type': 'fill',
//        'source': {
//            'type': 'geojson',
//            'data': combinedGeofence
//        },
//        'paint': {
//            'fill-color': 'purple',
//            "fill-opacity": 0.6,
//        }
//    });
//};

//routeCoords.forEach(function (routeCoord) {
//    var b = [routeCoord.longitude, routeCoord.latitude];
//    var marker = new tt.Marker({
//        anchor: 'bottom'
//    })
//        .setLngLat(b)
//        .addTo(map);
//});
//console.log('Route data:', routeCoords);
//route 

//map.on('load', function () {
var createLine = function (routeGeometry) {

    if (map.getSource('line')) {
        map.removeLayer('line');
        map.removeSource('line');
        console.log("route removed");
    }

    map.addLayer({         //
        'id': 'line',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': routeGeometry
        },

        'layout': {},
        'paint': {
            'line-color': 'blue',
            'line-width': 9
        }
    });

    console.log("route added");
    createGeofences(routeGeometry);
   
};
//Create a geofence
var createGeofences = function (routeGeometry) {
    if (map.getSource('geofence')) {
        map.removeLayer('geofence');
        map.removeSource('geofence');
        console.log("geofence removed");
    }
    var bufferInMeters = 40; // Adjust the buffer size as needed
    bufferedLine = turf.buffer(routeGeometry, bufferInMeters, { units: 'meters' });
 
    map.addLayer({
        'id': 'geofence',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': bufferedLine
        },
        'layout': {},
        'paint': {
            'fill-color': 'dark gray',
            'fill-outline-color': 'black',
            'fill-opacity': 0.6
        }
    });
    console.log("geofence added");
};
var routeCreated = false;
var createRoute = function () {
    // Define the route GeoJSON 
    var routeGeoJSON = {
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': routeCoords.map(function (point) {
                return [point.longitude, point.latitude];
            })
        }
    };
        // Extract route geometry
    var routeGeometry = routeGeoJSON.geometry;
        // Create a line and geofence around it
    createLine(routeGeometry);
    //               //////fetchTrafficData(routeGeometry);
    //fetchTrafficIncidents(routeGeometry);
        // Set routeCreated flag to true
    routeCreated = true;
    
};
//const fetchTrafficData = function (routeGeometry) {
//    const coordinates = routeGeometry.coordinates;
//    const start = coordinates[0];
//    const end = coordinates[coordinates.length - 1];
//    const url = `https://api.tomtom.com/traffic/services/5/flowSegmentData/absolute/10/json?point=${start[1]},${start[0]}&point=${end[1]},${end[0]}&key=${apiKey}`;

//    fetch(url)
//        .then(response => response.json())
//        .then(data => {
//            const trafficData = data.flowSegmentData;
//            const currentSpeed = trafficData.currentSpeed;
//            const freeFlowSpeed = trafficData.freeFlowSpeed;
//            const color = currentSpeed < freeFlowSpeed * 0.5 ? 'red' : currentSpeed < freeFlowSpeed * 0.75 ? 'orange' : 'green';
//            map.removeLayer('line');
//            map.addLayer({
//                'id': 'line',
//                'type': 'line',
//                'source': {
//                    'type': 'geojson',
//                    'data': {
//                        'type': 'Feature',
//                        'geometry': {
//                            'type': 'LineString',
//                            'coordinates': coordinates
//                        }
//                    }
//                },
//                'layout': {},
//                'paint': {
//                    'line-color': color,
//                    'line-width': 9,
//                    'line-opacity': 0.8
//                }
//            });
//        })
//        .catch(error => console.error('Error fetching traffic data:', error));
//};
//const fetchTrafficIncidents = function (routeGeometry) {
//    const bbox = turf.bbox(routeGeometry);
//    const url = `https://api.tomtom.com/traffic/services/5/incidentDetails/s3/10/json?bbox=${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}&key=${apiKey}`;

//    fetch(url)
//        .then(response => response.json())
//        .then(data => {
//            const incidents = data.incidents;
//            incidents.forEach(incident => {
//                const marker = new tt.Marker({ color: 'red' })
//                    .setLngLat([incident.geometry.coordinates[0], incident.geometry.coordinates[1]])
//                    .addTo(map);
//            });
//        })
//        .catch(error => console.error('Error fetching traffic incidents:', error));
//};

//setInterval(checkVTSlocation, 60000);
//var createRoute = function(){
//    var routeOptions = {
//        key: apiKey,
//        locations: routeCoords,
//        routeType: 'fastest',
//       // avoid: 'unpavedRoads;ferries',
//        maxAlternatives:1,
//      /// locations: a,
//        //travelMode: 'pedestrian'
//        //travelMode: 'truck'
//    }
//    tt.services.calculateRoute(routeOptions).go().then(
//        function (routeData) {
//            console.log(routeData)
//            var geo = routeData.toGeoJson();
//            displayRoute(geo);
//            // Extract route geometry
//            var routeGeometry = geo.features[0].geometry;
//            // Create geofence along the route
//            createGeofence(routeGeometry);

//        }).catch(function (error) {
//            console.error('Error fetching route data:', error);
//        });

//};


//Geofence notification
function updateLocation(vtsdata) {
    var jsonData = JSON.parse(vtsdata);
    var vts = jsonData.VTSLocationCollection;
    
    for (var i = 0; i < vts.length; i++) {
        var vtslocation = vts[i];
        console.log(vtslocation);
        var vehicleId = vtslocation.Vid;
        var iconSize = 70;
        var vtslnglat = [vtslocation.Longitude, vtslocation.Latitude];
        var vname = vtslocation.Name;

        switch (vtslocation.Vid) {
            case 1:
                iconPath = '/image/gasstation.png';
                break;
            case 2:
                iconPath = '/image/blindspot.png';
                break;
            case 3:
                iconPath = '/image/hospital.png';
                break;
            case 4:
                iconPath = '/image/busbay.png';
                break;
            case 5:
                iconPath = '/image/tollplaza.png';
                break;
            case 6:
                iconPath = '/image/route-patrolling.png';
                break;
            case 7:
                iconPath = '/image/ambulance.png';
                break;
            case 8:
                iconPath = '/image/firebrigade.png';
                break;
            case 9:
                iconPath = '/image/crane.png';
                break;
        }
        var existingMarker = vehicles.find(marker => marker.vehicleId === vehicleId);
        if (existingMarker) {
            existingMarker.setLngLat(vtslnglat);
        }
        else {
            var customVehicle = new Image(iconSize);
            customVehicle.src = iconPath;

            var popupContent = `
        <div>
            <h6>${vtslocation.Name}</h6>           
            <p>Latitude: ${vtslocation.Latitude}</p>  
            <p>Longitude: ${vtslocation.Longitude}</p>         
        </div>
    `;
            var popup = new tt.Popup({ offset: [0, -45] })
                .setHTML(popupContent);
            var vtsMarker = new tt.Marker({
                element: customVehicle,
                draggable: true,
                clickable: true,
                anchor: 'bottom',
            }).setLngLat(vtslnglat)
                .addTo(map);
          
            vtsMarker.vehicleId = vehicleId;
            vehicles.push(vtsMarker);
            vtsMarker.setPopup(popup).togglePopup();
        }
        // Check if the vehicle position is outside the geofence
        var isInside = turf.booleanPointInPolygon(turf.point(vtslnglat), bufferedLine);
        handleNotification(isInside, vehicleId, vname);
    }
}
 //Function to handle notifications
function handleNotification(isInside, vehicleId, vname) {
    
    clearNotification(vehicleId);
    // Update vehicle state
    if (vehicleStates[vehicleId] === undefined)
    {
       vehicleStates[vehicleId] = !isInside;
    }
    // vehicle enters the geofence area
    if (isInside && !vehicleStates[vehicleId]) {   //true false
        console.log("calling 1", vehicleId, isInside, vehicleStates[vehicleId]);
        clearNotification(vehicleId);
        showNotification(`${vname} has entered the geofence area!`, 'success', vehicleId);
        vehicleStates[vehicleId] = true;
        // Set a timeout to remove the notification after 5 seconds
        setTimeout(function () {
            clearNotification(vehicleId);
        }, 5000);
    }
    // vehicle leaves the geofence area
    else if (!isInside && vehicleStates[vehicleId]) {    //false true 
        console.log("calling 3", vehicleId, isInside, vehicleStates[vehicleId]);
        clearNotification(vehicleId);
        showNotificationRepeatedly(`${vname} has left the geofence area!`, 'error', vehicleId);
        vehicleStates[vehicleId] = false;
    }
}
function showNotification(message, type, vehicleId) {
    clearNotification(vehicleId);
    var notification = createNotificationElement(message, type);

    document.getElementById('notification-container').appendChild(notification);
    // Automatically remove after 5 seconds
    var timeoutId = setTimeout(function () {
        notification.remove();
    }, 5000);
}
function showNotificationRepeatedly(message, type, vehicleId) {
    clearNotification(vehicleId);
    var notification = createNotificationElement(message, type);
    document.getElementById('notification-container').appendChild(notification);
    var timeoutId = setTimeout(function () {
        notification.remove();
        setTimeout(function () {
            // Show the notification again if the vehicle is still outside the geofence area
            if (!vehicleStates[vehicleId]) {
                showNotificationRepeatedly(message, type, vehicleId);
            }
        }, 1000);
    }, 5000);
}

// Function to create a notification element
function createNotificationElement(message, type) {
    var notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');
    notification.style.backgroundColor = (type === 'success') ? '#5cb85c' : '#d9534f'; // Green for success, red for error
    return notification;
}

// Function to clear the notification for a specific vehicle
function clearNotification(vehicleId) {
    var notifications = document.querySelectorAll('.notification');
    notifications.forEach(function (notification) {
        if (notification.dataset.vehicleId === vehicleId) {
            notification.remove();
        }
    });
}
function checkVTSlocation() {

    $.ajax({
        url: '/Home/VTSLocation',
        method: 'GET',
        dataType: 'json',
        success: function (response) {

           // console.log('VTS Collection:', response);
            updateLocation(response);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
}
var updateMapWithTrafficData = function () {
    // Call show/hide traffic methods based on checkboxes
    if (flowCheckbox.checked) {
        map.showTrafficFlow();
    } else {
        map.hideTrafficFlow();
    }
    if (incidentscheckbox.checked) {
        map.showTrafficIncidents();
    } else {
        map.hideTrafficIncidents();
    }
    
};

map.addControl(new tt.NavigationControl({
    showPitch: true,
    showExtendedRotationControls: true,
    showExtendedPitchControls: true
}));

// Create plugin instance

var geolocateControl = new tt.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: false
    }
});

map.addControl(geolocateControl);

// Create a custom button element with a road icon
var button = document.createElement('button');
button.className = 'road-button';
button.innerHTML = '<i class="fa fa-road"></i>';

// Get the options container
var optionsContainer = document.getElementById('options-container');

// Handle button click event
button.addEventListener('click', function (event) {

    // Toggle options container visibility
    if (optionsContainer.style.display === 'block') {
        optionsContainer.style.display = 'none';
    } else {
        optionsContainer.style.display = 'block';
    }

});
// Add the button to the map container
map.getContainer().appendChild(button);

//// Function to check for message display in the database
function VMSDisplayAlerts() {
    $.ajax({
        url: '/Home/VMSMessageDisplay',
        method: 'GET',
        dataType: 'json',
        success: function (response) {
          //  console.log('Vms Alert Collection:', response);
            var jsonData = JSON.parse(response);
            var vmsData = jsonData.VMSDisplayCollection;
            vmsDisplays.forEach((marker) => marker.remove());
            updateDisplay(vmsData);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
}
//setInterval(VMSDisplayAlerts, 60000);
VMSDisplayAlerts();

//// Function to update display with markers and popups
function updateDisplay(vmsData) {
    var index = 0;
   // var currentPopup = null;
    function updateMarker() {
        var vms = vmsData[index];
        var mapMarker = findMarkerBySubSystemMID(vms.TSubSystemMID);

            if (mapMarker) {
                var lnglat = [mapMarker.longitude, mapMarker.latitude];
                var popupContent = `
            <div>
                <img src="${vms.Image}" style="max-width: 100%;" >
            </div>  
        `;
                var vmsIcon = new Image(28);
                vmsIcon.src = vms.Image;
                var vmsPopup = vmsPopups[vms.TSubSystemMID];
                var vmsMarker;
                var offset = new tt.Point(-1, -51);
                vmsMarker = new tt.Marker({
                    element: vmsIcon,
                    offset: offset,
                    draggable: false,
                    clickable: true,
                    anchor: 'top',
                })
                    .setLngLat(lnglat)
                    .addTo(map);
                vmsMarker.setPopup(vmsPopup);
                vmsDisplays.push(vmsMarker);
                if (!vmsPopup) {
                    vmsPopup = new tt.Popup({ offset: 80 }).setHTML(popupContent);
                    vmsPopups[vms.TSubSystemMID] = vmsPopup;
                    vmsMarker.setPopup(vmsPopup);
                } else {
                    // Update popup content
                    vmsPopup.setHTML(popupContent);
                }
                // Store marker for the TSubSystemMID
                if (!vmsMarkers[vms.TSubSystemMID]) {
                    vmsMarkers[vms.TSubSystemMID] = [];
                }
                vmsMarkers[vms.TSubSystemMID].push(vmsMarker);

                // If the TSubSystemMID is repeating, add it to the array
                if (repeatingTSubSystemMIDs.indexOf(vms.TSubSystemMID) === -1) {
                    repeatingTSubSystemMIDs.push(vms.TSubSystemMID);
                }

                index = (index + 1) % vmsData.length; // Increment index cyclically
            }

            // Call updateMarker again after a certain delay (e.g., 5000 milliseconds)
            setTimeout(updateMarker, 5000); // Change the delay as needed
        }
    updateMarker(); // Start the process
}
function checkForDemarking() {
    $.ajax({
        url: '/Home/demarkingHighway',
        method: 'GET',
        dataType: 'json',
        success: function (response) {
             console.log('demarking Collection:', response);
            demarkingHighway(response);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
}
checkForDemarking();
function demarkingHighway(signs) {
    var jsonData = JSON.parse(signs);
    var demarkingData = jsonData.demarkingCollection;

    demarkingData.forEach(function (demarkingBoard) {
        var lnglat = [demarkingBoard.Longitude, demarkingBoard.Latitude];
        var customIcon = new Image(50);
        customIcon.src = demarkingBoard.Image;

        var popupContent = `
        <div>
            <h4>${demarkingBoard.Details}</h4>
        </div>
    `;
        var highwayPopup = new tt.Popup({ offset: 35 })
            .setHTML(popupContent);

        var highwayMarker = new tt.Marker({
            element: customIcon,
            draggable: false,
            clickable: true,
            anchor: 'bottom',
        }).setLngLat(lnglat)
            .addTo(map);
       // markers.push(marker);

        highwayMarker.setPopup(highwayPopup);
        highwayMarker.getElement().addEventListener('mouseover', function () {
            highwayPopup.addTo(map);
        });
        highwayMarker.getElement().addEventListener('mouseout', function () {
            highwayPopup.remove();
        });

    })
}

basicLayer.addEventListener('click', function () {
    state.mapStyle = '2/basic_street-light';
    map.setStyle(getCurrentStyleUrl());
});

satelliteLayer.addEventListener('click', function () {
    state.mapStyle = '2/basic_street-satellite';
    map.setStyle(getCurrentStyleUrl());
});

darkLayer.addEventListener('click', function () {
    state.mapStyle = '2/basic_street-dark';
    map.setStyle(getCurrentStyleUrl());
});
//var baseStyle = 'https://api.tomtom.com/style/1/style/22.2.1-*?map=2/basic_street-sattellite' + '&traffic_incidents=2/incidents_light&traffic_flow=' + '2/flow_relative-light' + `&poi=2/poi_light&key=${apiKey}`;

function getCurrentStyleUrl() {
    var trafficFlowStyle='';
    var trafficIncidentsStyle='';
    //state.trafficVisible = flowCheckbox.checked;
    // state.trafficIncidentsVisible = incidentscheckbox.checked;
    if (flowCheckbox.checked) {
        trafficFlowStyle = '2/flow_relative-light';
        console.log("trafficflowstyle:" + trafficFlowStyle);
    }
    if (incidentscheckbox.checked) { 
     trafficIncidentsStyle = '2/incidents_light' ;
}
    var baseStyle = 'https://api.tomtom.com/style/1/style/22.2.1-*?map=' + state.mapStyle
        + `&traffic_incidents=${trafficIncidentsStyle}&traffic_flow=`
        + trafficFlowStyle + `&poi=2/poi_light&key=${apiKey}`;
 
    return baseStyle;
}
//function updateStylesVisibility() {
//    map.setOptions({
//        stylesVisibility: {
//            trafficFlow: state.trafficVisible,
//            trafficIncidents: state.trafficIncidentsVisible
//        }
//    })
//}