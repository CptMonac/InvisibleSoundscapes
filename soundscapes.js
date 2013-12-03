//Visualize invisible soundscapes of a city -- currently Pittsburgh
function initialize()
{
    //Load default locations
    var HciLab = [40.445522,-79.949147];        //HCI Institute 
    var PittDowntown = [40.440625,-79.995886];  //Pittsburgh Downtown
    
    //Style google maps
    var lunarMapStyle = [                       
    {
    	stylers: [
    		{hue: "#ff1a00"},
    		{invert_lightness: true},
    		{saturation:-100},
    		{lightness:33},
    		{gamma:0.5}
    	]
    },
    {
    	featureType: "water",
    	elementType:"geometry",
    	stylers: [
    		{color:"#2D333C"}
    	]
    }
    ];
    
    //Set map default controls
    window.MIN_ZOOM_LEVEL = 15;                 
    window.MAX_ZOOM_LEVEL = 21;                 
    var mapOptions = {
      center: new google.maps.LatLng(HciLab[0], HciLab[1]),
      styles: lunarMapStyle,
      zoom: 16,
      disableDefaultUI: true,
      minZoom: MIN_ZOOM_LEVEL,
      maxZoom: MAX_ZOOM_LEVEL,
    };

    //Create map and add event listeners
    window.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    window.route = [];                //Route from origin to destination
    window.noiseData = [];            //Recorded noise data for route
    google.maps.event.addListener(map, 'zoom_changed', function(evt)
    {
        scalePoints();
    });

    importData();                     //Import recorded noise data
}    


function plotPoint(inputCoordinate)
{
    var MAX_BAR_HEIGHT = 0.0010;
    var barWidth = 0.00003;
    var barHeight = Math.random() * MAX_BAR_HEIGHT;
    var zoomLevel = window.map.zoom;
    var barColor = '#FF0000';
    
    //Configure bar width based on zoom level
    if (zoomLevel == MIN_ZOOM_LEVEL)
        barWidth = 0.00003;
    else if (zoomLevel == MIN_ZOOM_LEVEL+1)
        barWidth = 0.00002;
    else if (zoomLevel == MIN_ZOOM_LEVEL+2)
        barWidth = 0.00001;
    else if (zoomLevel == MIN_ZOOM_LEVEL+3)
        barWidth = 0.000009;
    else if (zoomLevel >= MIN_ZOOM_LEVEL+4)
        barWidth = 0.000008;

    //Configure bar color based on magnitude of noise data
    if (barHeight <= 0.000333)
        barColor = '#E2C334';   //Color Yellow
    else if (barHeight <= 0.000666)
        barColor = '#C35226';   //Color Orange
    else
        barColor = '#C12938';   //Color Red

    //Construct bar graph
    var inputlatitude = inputCoordinate.ob;
    var inputLongitude = inputCoordinate.pb;
    var coordinates = [
        new google.maps.LatLng(inputlatitude, inputLongitude),
        new google.maps.LatLng(inputlatitude+barHeight, inputLongitude),
        new google.maps.LatLng(inputlatitude+barHeight, inputLongitude+barWidth),
        new google.maps.LatLng(inputlatitude,inputLongitude+barWidth),
        new google.maps.LatLng(inputlatitude,inputLongitude)
    ];

    //Configure bar options
    var verticalBar = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: barColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: barColor,
        fillOpacity: 0.4
      });
    verticalBar.setMap(window.map);
    window.noiseData.push(verticalBar);
}

function scalePoints()
{
    //Clear visible noise data
    for(var i = 0; i < noiseData.length; i++)
    {
        window.noiseData[i].setMap(null);
    }
    window.noiseData = [];

    //Plot data at new zoom level
    for (var i=0; i < route.length; i++)
    {
        plotPoint(route[i]);
    }

}

function animatePoints()
{
    if (pathCount == overview_path.length)
    {
        //clearInterval(timer);
        //return;
        pathCount = 0;
    }
    var coordinate = overview_path[pathCount];
    marker.setPosition(coordinate);
    map.panTo(coordinate);
    route.push(coordinate);
    plotPoint(coordinate);

    //Update time
    var mapTime = document.getElementById('collection-time');
    var date = new Date();
    var currTime = "Dec. 10 " +  date.getMinutes().toString() + ":" + date.getSeconds().toString();
    mapTime.innerHTML = currTime;
    pathCount = pathCount + 1;
}

function importData()
{
    //Load default locations
    var Cmu = [40.447423, -79.979867];
    var HciLab = [40.445522,-79.949147];
    //Create google lat,lon map objects
    var origin = new google.maps.LatLng(Cmu[0], Cmu[1]);
    var destination = new google.maps.LatLng(HciLab[0], HciLab[1]);  
    var mapBounds = new google.maps.LatLngBounds(origin, destination);      
    //Create google directions service -- to get locations of streets
    var service = new google.maps.DirectionsService();
    
    var coordinate;
    window.overview_path = null;
    
    //Display marker for new coordinates
    var cursorLocation = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        strokeColor: '#7F0000',
        fillColor: '#FF4C4C',
        fillOpacity: 0.5,
        strokeOpacity: 0.5
    }
    window.marker = new google.maps.Marker(
    {
        position: origin,
        map: window.map,
        icon: cursorLocation
    });
    //Resize map to contain origin and destination endpoints
    map.panToBounds(mapBounds);

    //Get route information and location of streets
    service.route({origin: origin, destination: destination, travelMode: google.maps.DirectionsTravelMode.DRIVING }, function(result, status)
    {
            if (status == google.maps.DirectionsStatus.OK)
            {
                window.overview_path = result.routes[0].overview_path;
                window.pathCount = 0;
                window.timer = setInterval(animatePoints, 100);
            }
            else
            {
                alert('Google directions request failed! Please refresh to try again');
                console.log('Route information request failed!');
            }
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
