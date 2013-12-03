//Visualize invisible soundscapes of a city -- currently Pittsburgh
function initialize()
{
    var HciLab = [40.445522,-79.949147];        //HCI Institute Location
    var PittDowntown = [40.440625,-79.995886];  //Pittsburgh Center Location
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

    window.MIN_ZOOM_LEVEL = 17;                 //Set min zoom level
    window.MAX_ZOOM_LEVEL = 21;                 //Set max zoom level
    var mapOptions = {
      center: new google.maps.LatLng(HciLab[0], HciLab[1]),
      styles: lunarMapStyle,
      zoom: 18,
      disableDefaultUI: true,
      minZoom: MIN_ZOOM_LEVEL,
      maxZoom: MAX_ZOOM_LEVEL,
    };
    window.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    window.path = [];
    window.visiblePoints = [];
    var service = new google.maps.DirectionsService();
    var coordinate;
    google.maps.event.addListener(map, 'click', function(evt)
    {
        //Display feedback on click position
        var cursorLocation = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            strokeColor: '#FF0000',
            fillColor: '#FF0000',
            fillOpacity: 0.5
        }
        var marker = new google.maps.Marker(
        {
            position: evt.latLng,
            map: window.map,
            icon: cursorLocation
        });
        marker.setAnimation(google.maps.Animation.BOUNCE);

        service.route({ origin: evt.latLng, destination: evt.latLng, travelMode: google.maps.DirectionsTravelMode.DRIVING }, function(result, status)
        {
            if (status == google.maps.DirectionsStatus.OK)
            {
                coordinate = result.routes[0].overview_path[0];
                path.push(coordinate);
                plotPoint(coordinate);
            }
            else
                console.log('direction not ok');
            marker.setAnimation(null);
            marker.setMap(null);
        });
    });

    google.maps.event.addListener(map, 'zoom_changed', function(evt)
    {
        scalePoints();
    });

}    


function plotPoint(inputCoordinate)
{
    var MAX_BAR_HEIGHT = 0.0010;
    var barWidth = 0.00003;
    var barHeight = Math.random() * MAX_BAR_HEIGHT;
    var zoomLevel = window.map.zoom;

    if (zoomLevel == MIN_ZOOM_LEVEL)
        barWidth = 0.00003;
    else if (zoomLevel == MIN_ZOOM_LEVEL+1)
        barWidth = 0.00002;
    else if (zoomLevel == MIN_ZOOM_LEVEL+2)
        barWidth = 0.00001;
    else if (zoomLevel == MIN_ZOOM_LEVEL+3)
        barWidth = 0.000009;
    else if (zoomLevel == MIN_ZOOM_LEVEL+4)
        barWidth = 0.000008;

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
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.4
      });
    verticalBar.setMap(window.map);
    window.visiblePoints.push(verticalBar);
}

function scalePoints()
{
    //Clear visible bars
    for(var i = 0; i < visiblePoints.length; i++)
    {
        window.visiblePoints[i].setMap(null);
    }
    window.visiblePoints = [];

    //Plot points at new zoom level
    for (var i=0; i < path.length; i++)
    {
        plotPoint(path[i]);
    }

}

google.maps.event.addDomListener(window, 'load', initialize);
