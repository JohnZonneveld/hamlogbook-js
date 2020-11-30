function loadMapScript() {
    try {
        if (google) {
            google = {}
        }
    } catch (e) {}
    mapSpace = document.getElementById("map")
    let mapScript = document.createElement("script");
    mapScript.type = "text/javascript";
    mapScript.src = gMapsScript;
    mapSpace.appendChild(mapScript);
}

// The Maidenhead Grid system is build up by squares of 10° latitude
// and 20° longitude and are indicated by the letters AA-RR. These squares
// contain sub-squares in a 10x10 grid of squares in size 1° in latitude 
// and 2° in longitude and are indicated by the numbers 00-99.
// These sub-squares again are divided into a 24x24 grid of 2.5" latitude  
// and 5" longitude and are indicated by the letters aa-xx and subsequently 
// divided again in a 10x10 grid measuring 15" latitude and 30" longitude
// indicated by numbers 00-99. 
// This will give a Maidenhead grid in the form AA00aa00.
// For example my location islocated in the Maidenhead gridsquare EL15fx62.
// To calculate the distance we need to determine the center of the square 
// indicated by the gridsquare. Because when we use the grid as supplied and 
// convert it to a latitide and longitude it will lead us to the left bottom 
// corner of the square. 
// The longer the given gridsquare, the more precise the calculated location is.
gridSquareToLatLon = function(grid){
    // set lat and lon to 0.0
    let lat=0.0,lon=0.0
    // determine the ASCII value of "a" and "A", aNum = 97 and numA = 65
    let aNum="a".charCodeAt(0),numA = "A".charCodeAt(0);
    // latitude is divided in 10°, because the equator is 0 we have to substract 90°
    function lat4(g){
        //  example my location EL15 = 25.5, -97
        //     10 * (ASCII value of "L" - 65) + integer value of "5") - 90 = 10 * (76-65) + 5 - 90 = 25
        return 10 * (g.charCodeAt(1) - numA) + parseInt(g.charAt(3)) - 90;
    }
    function lon4(g){
        // example my location EL15
        //     20 * (ASCII value of "E" - 65) + 2 * integer value of "1") -180 = 20 * (69 -65) + 2*1 - 180 = -98
        return 20 * (g.charCodeAt(0) - numA) + 2 * parseInt(g.charAt(2)) - 180;
    }
    // test to see if grid is a 4-digit square, if not the value will be false
    if (/^[A-R][A-R][0-9][0-9]$/.test(grid)) {
        // A 4-digit square is 1° latitude and 2° longitude to find the
        // center we add 0.5° to the latitude and 1° to the longitude
        // from example EL15 lat4 = 25 => lat = 25.5
        lat = lat4(grid)+0.5;
        // from example EL15 lon4 = -98 => lon = -97
        lon = lon4(grid)+1;
    } 
    // test to see if grid is a 6-digit square
    else if (/^[A-R][A-R][0-9][0-9][a-x][a-x]$/.test(grid)) {
        // example EL15fx = 25.97917, -97.54167
        //     25 + 1/24 * (ASCII value of "x" - 97 + 0.5) = 25 + 1/24 * (120 - 97 + 0.5 ) = 25.979167
        lat = lat4(grid)+(1/60)*2.5*(grid.charCodeAt(5)-aNum+0.5);
        //     -98 + 2/24 * (ASCII value of "f" -97 + 0.5) = -98 + 2/24 * (102 - 97 + 0.5 ) = -97.54167
        lon = lon4(grid)+(1/60)*5*(grid.charCodeAt(4)-aNum+0.5);
    } 
    // test to see if grid is a 8-digit square
    else if (/^[A-R][A-R][0-9][0-9][a-x][a-x][0-9][0-9]$/.test(grid)) {
        // example EL15fx62 is circa 25.96858, -97.52951 
        //  25 + 1/24 * (120-97) + 1/240 * (int(charAt(7)) = 2) = 2 + 0.5) = 25 + 23/24 + 2.5/240 = 25.96875
        lat = lat4(grid)+(1/60)*2.5*(grid.charCodeAt(5)-aNum)+(1/3600)*15*(parseInt(grid.charAt(7))+0.5);
        //  -98 + 2/24 * (102-97) + 2/240 * (int(charAt(6)) = 6 + 0.5) = -98 + 10/24 + 13/240 = -97.529166
        lon = lon4(grid)+(1/60)*5*(grid.charCodeAt(4)-aNum)+(1/3600)*30*(parseInt(grid.charAt(6))+0.5);
    }
    return [lat,lon];
};

function distance(myLatLon, remLatLon) {
    const radius = 3981.875              // in miles
    let degreeToRad = 0.017453292519943295;    //  π / 180° = 1 degree in radians
    let cos = Math.cos;
    let lat1=myLatLon.slice(",",2)[0]  // get the latitude part of myLatLon
    let lon1=myLatLon.slice(",",2)[1]  // get the longitude part of myLatLon
    let lat2=remLatLon.slice(",",2)[0] // get the latitude part of remLatLon
    let lon2=remLatLon.slice(",",2)[1] // get the longitude part of remLatLon
    var a = 0.5 - cos((lat2 - lat1) * degreeToRad)/2 + 
            cos(lat1 * degreeToRad) * cos(lat2 * degreeToRad) * 
            (1 - cos((lon2 - lon1) * degreeToRad))/2;
    if (a != 0) {
        return (2 * radius * Math.asin(Math.sqrt(a))).toFixed(0); // no decimals needed as location is not pinpointed.
    } else {
        return "Location info missing for calculation"
    }
}

// create the map instance
function initMap() {
    let bounds = new google.maps.LatLngBounds();
    let myLatLng=new google.maps.LatLng( myLatLon[0], myLatLon[1] );
    bounds.extend( myLatLng );
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 3,
        center: myLatLng,
        mapTypeId: "terrain",
        mapTypeControl: false,
        streetViewControl: false
    });
    remLatLng=new google.maps.LatLng( remLatLon[0], remLatLon[1] );
    bounds.extend( remLatLng );
    const pathCoordinates = [
        { lat: myLatLon[0], lng: myLatLon[1] },
        { lat: remLatLon[0], lng: remLatLon[1] },
    ];
    const shortPath = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });
    shortPath.setMap(map);
    map.fitBounds( bounds );
}