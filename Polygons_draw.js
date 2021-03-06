// function Upload() {
//     //Reference the FileUpload element.
//     var fileUpload = document.getElementById("fileUpload");
 
//     //Validate whether File is valid Excel file.
//     var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
//     if (regex.test(fileUpload.value.toLowerCase())) {
//         if (typeof (FileReader) != "undefined") {
//             var reader = new FileReader();
 
//                 //For Browsers other than IE.
//             if (reader.readAsBinaryString) {
//                 reader.onload = function (e) {
//                     ProcessExcel(e.target.result);
//                 };
//                 reader.readAsBinaryString(fileUpload.files[0]);
//             } else {
//                 //For IE Browser.
//                 reader.onload = function (e) {
//                     var data = "";
//                     var bytes = new Uint8Array(e.target.result);
//                     for (var i = 0; i < bytes.byteLength; i++) {
//                         data += String.fromCharCode(bytes[i]);
//                     }
//                     ProcessExcel(data);
//                 };

//                 reader.readAsArrayBuffer(fileUpload.files[0]);
//             }
//         } else {
//             alert("This browser does not support HTML5.");
//         }
//     } else {
//         alert("Please upload a valid Excel file.");
//     }
// };

// function ProcessExcel(data) {
//     //Read the Excel File data.
//     var workbook = XLSX.read(data, {
//         type: 'binary'
//     });
 
//     //Fetch the name of First Sheet.
//     var firstSheet = workbook.SheetNames[0];
 
//     //Read all rows from First Sheet into an JSON array.
//     var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

//     for (var i = 0; i < excelRows.length; i++) {
//         classArr.push(parseInt(excelRows[i].Class));
//         console.log(excelRows[i].Polygon);
//         polygonArr.push(JSON.parse(excelRows[i].Polygon));
//     }

//     console.log(classArr)
//     console.log(polygonArr)

// };


// NOT WORKING IN CHROME!
// function readTextFile(file) {
//     var rawFile = new XMLHttpRequest();
//     rawFile.open("GET", file, false);
//     rawFile.onreadystatechange = function () {
//         if(rawFile.readyState === 4) {
//             if(rawFile.status === 200 || rawFile.status == 0) {
//                 var allText = rawFile.responseText;
//                 alert(allText);
//             }
//         }
//     }
//     rawFile.send(null);
// }

// readTextFile("/home/artem/Main/YandexMapsProject/Polygons.txt")

var classArr   = []
var latArr     = []
var lonArr     = []
var polygonArr = []

var republicPolygonArr = []

function drawMap(input) {
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function() {
        var classLatLonPolygonAndRepublic = reader.result.split("|");

        var classLatLonPolygon      = classLatLonPolygonAndRepublic[0].split("\n");
        var republicPolygonsStrings = classLatLonPolygonAndRepublic[1].split("\n");

        //console.log(republicPolygonsStrings)

        for (var i = 0; i < republicPolygonsStrings.length - 1; i++) {
            republicPolygonArr.push(JSON.parse(republicPolygonsStrings[i]));

        }

        for (var i = 0; i < classLatLonPolygon.length - 1; i++) {
            var classAndLatAndLonAndPolygon = classLatLonPolygon[i].split(":");
            
            classArr.push(classAndLatAndLonAndPolygon[0]);
            latArr.push(parseFloat(classAndLatAndLonAndPolygon[1]));
            lonArr.push(parseFloat(classAndLatAndLonAndPolygon[2]));
            polygonArr.push(JSON.parse(classAndLatAndLonAndPolygon[3]));
        }

        // Debug print
        console.log("Processed arrays: republicPolygonArr, classArr, latArr, lonArr, polygonArr");
        console.log(republicPolygonArr);
        console.log(classArr);
        console.log(latArr);
        console.log(lonArr);
        console.log(polygonArr);


        // Min and max coordinates in area polygons
        var min_lat = republicPolygonArr[0][0][0][0][0]
        var max_lat = republicPolygonArr[0][0][0][0][0]
        var min_lon = republicPolygonArr[0][0][0][0][1]
        var max_lon = republicPolygonArr[0][0][0][0][1]

        // Paddings
        var lat_padding = 100
        var lon_padding = 100
        //var SCREEN_PROPERTY = 1920 / 1080

        // Get bounding box
        for (var n = 0; n < republicPolygonArr.length; n++) {
            var republicPolygonArr_n = republicPolygonArr[n];

            for (var k = 0; k < republicPolygonArr_n.length; k++) {
                var republicPolygonArr_n_k = republicPolygonArr_n[k];

                for (var i = 0; i < republicPolygonArr_n_k.length; i++) {
                    var republicPolygonArr_i = republicPolygonArr_n_k[i]

                    for (var j = 0; j < republicPolygonArr_i.length; j++) {
                        if (republicPolygonArr_i[j][0] < min_lat)
                            min_lat = republicPolygonArr_i[j][0]
                        else if (republicPolygonArr_i[j][0] > max_lat)
                            max_lat = republicPolygonArr_i[j][0]

                        if (republicPolygonArr_i[j][1] < min_lon)
                            min_lon = republicPolygonArr_i[j][1]
                        else if (republicPolygonArr_i[j][1] > max_lon)
                            max_lon = republicPolygonArr_i[j][1]
                    }
                }
            }
        }

        min_lat -= lat_padding
        max_lat += lat_padding
        min_lon -= lon_padding
        max_lon += lon_padding

        if (min_lat <= -90)
            min_lat = -89

        if (max_lat >= 90)
            max_lat = 89

        if (min_lon <= -180)
            min_lon = -179

        if (max_lon >= 180)
            max_lon = 179

        // Debug print
        console.log("Min, max lat and min, max lon");
        console.log(min_lat);
        console.log(max_lat);
        console.log(min_lon);
        console.log(max_lon);

        // Start Yandex Maps drawing part
        ymaps.ready(init);

        function init() {
            var map = new ymaps.Map('map', {
                center: [(max_lat + min_lat) / 2, (max_lon + min_lon) / 2],
                zoom: 1,
                //type: 'yandex#hybrid',
                controls: ['zoomControl']
            }, {
                // Let's limit the area of the map.
                restrictMapArea: [
                    [min_lat, min_lon],
                    [max_lat, max_lon]
                ]
            });
            map.controls.get('zoomControl').options.set({size: 'small'});

            // Load regions
            ymaps.borders.load('001', {
                lang: 'ru',
                quality: 2
            }).then(function (result) {
                // Create polygon which will hide all world, except future defined area
                var background = new ymaps.Polygon([
                    [
                        [min_lat, min_lon],
                        [min_lat, max_lon],
                        [max_lat, max_lon],
                        [max_lat, min_lon],
                        [min_lat, min_lon]
                    ]
                ], {}, {
                    fillColor: '#ffffff',
                    strokeWidth: 1,
                    strokeColor: '#000000',
                    // ?????? ???????? ?????????? ?????????????? ?????????????????????? ???? ???????? ??????, ?????? ?????????? ????????????????
                    // ???????????????? ?????????????????? ?????????????????? ?????????????????? ?? ???????????????????? ????????????????????.
                    coordRendering: 'straightPath'
                });
          

                // Add internal boundaries
                for (var n = 0; n < republicPolygonArr.length; n++) {
                    var republicPolygonArr_n = republicPolygonArr[n];

                    for (var k = 0; k < republicPolygonArr_n.length; k++) {
                        var republicPolygonArr_n_k = republicPolygonArr_n[k];

                        for (var i = 0; i < republicPolygonArr_n_k.length; i++) {
                            background.geometry.insert(i+1, republicPolygonArr_n_k[i]);
                        }
                    }
                }

                // Add polygon into the map
                map.geoObjects.add(background);
            });


            // Colors for classes
            colors = [
                "#e6817e", // 1
                "#e6817e", // 2
                "#e6aa7e", // 3
                "#e6d37e", // 4
                "#cfe67e", // 5
                "#a6e67e", // 6
                "#7ee680", // 7
                "#7ee6a9", // 8
                "#7ee6d2", // 9
                "#7ed0e6", // 10
                "#7ea7e6", // 11
                "#7f7ee6", // 12
                "#a87ee6", // 13
                "#d17ee6", // 14
                "#e67ea7", // 15
                "#b3b3b3",
                "#e6817e",
                "#e6aa7e",
                "#e6d37e",
                "#cfe67e",
                "#a6e67e",
                "#7ee680",
                "#7ee6a9",
                "#7ee6d2",
                "#7ed0e6",
                "#7ea7e6",
                "#7f7ee6",
                "#a87ee6",
                "#d17ee6",
                "#e67ed1",
                "#000000"
            ]

            // Add place marks
            for (var i = 0; i < latArr.length && i < lonArr.length && i < classArr.length; i++) {
                var dataDict = []

                var classes = classArr[i].split(',');

                for (var j = 0; j < classes.length; j++) {
                    var class_j = parseInt(classes[j]);

                    if (class_j >= 1 && class_j <= 15) {
                        dataDict.push({
                            weight: 1,
                            color: colors[class_j - 1]
                        });
                    }
                }

                var iconRadius = parseInt(document.getElementById("iconRadius").value);
                if (isNaN(iconRadius))
                    iconRadius = 10

                if (dataDict.length > 0) {
                    var myPlacemark = new ymaps.Placemark([latArr[i], lonArr[i]], {
                        data: dataDict,

                        iconContent: ''
                    }, {
                        iconLayout: 'default#pieChart',
                        iconPieChartCoreRadius: 0,
                        iconPieChartRadius: iconRadius
                    });

                    map.geoObjects.add(myPlacemark);

                    // Add places polygons
                    if (polygonArr[i].length > 0) {
                        var arrayOfPolygons = false

                        if (polygonArr[i][0].length > 0)
                            if (polygonArr[i][0][0].length > 0)
                                if (polygonArr[i][0][0][0].length == 2) // find point
                                    arrayOfPolygons = true

                        if (arrayOfPolygons) {
                            for (var j = 0; j < polygonArr[i].length; j++) {
                                var placePolygon = new ymaps.Polygon(polygonArr[i][j],
                                    {}, {
                                        fillColor: '#000000',
                                        fillOpacity: 0.05 * dataDict.length,
                                        strokeColor: '#696969',
                                        coordRendering: 'straightPath'
                                });

                                map.geoObjects.add(placePolygon);
                            }
                        } else {
                            var placePolygon = new ymaps.Polygon(polygonArr[i],
                                {}, {
                                    fillColor: '#000000',
                                    fillOpacity: 0.05 * dataDict.length,
                                    strokeColor: '#696969',
                                    coordRendering: 'straightPath'
                            });

                            map.geoObjects.add(placePolygon);
                        }
                    }
                }
            }
        }

    };


    reader.onerror = function() {
        console.log(reader.error);
    };
}