Ext.Loader.setConfig({
	disableCaching: false,
	enabled: true,
	paths: {
	    GeoExt:'lib/geoext',
		PGP: 'js/PGP'
	} 
});

var coords = [];
var draw;
var lat1,lat2,long1,long2;
var z = 0;
var startlink = 'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer/tile/';
var list = [];
var zoomto,zoomfrom;

Ext.define('PGP.views.TileDownloader', {
extend: 'Ext.panel.Panel',
alias: 'widget.TileDownloader',
title: 'GeoPortal Map Tile Downloader',
region: 'west',
width: '25%',
mapContainer: ' ',
collapsible: true,
	initComponent: function(){
			this.buttons = this.buildButtons();			
			this.items = this.buildItems();

			this.callParent();	
	 },	// InitComponent
		buildItems: function() {
		return[
		{
                            xtype: 'textfield',
                            anchor: '100%',
                            itemId: 'zoomfrom',
                            fieldLabel: 'Zoom from:',
                            labelAlign: 'left',
                            labelWidth: 70,
                            editable: true,
                            displayField: 'value',
                            valueField: 'id',
							border: '1',
							id: 'zoomfrom'
        },
        {
                            xtype: 'textfield',
                            anchor: '100%',
                            itemId: 'zoomto',
                            fieldLabel: 'Zoom to:',
                            labelAlign: 'left',
                            labelWidth: 70,
                            editable: true,
                            displayField: 'value',
                            valueField: 'id',
							border: '1',
							id: 'zoomto'
        }
		]		
		}, // builditems
		buildButtons: function(){
		return [
						{
							xtype: 'button',
							itemId: 'SelectButton',
							text: 'Select Area',
								handler: function () {
									//**************************
									// this code is to create a polygon.
									//**************************
									vectors = new OpenLayers.Layer.Vector("Box layers");		
									var me = this.up('panel');
									
										draw = new OpenLayers.Control.DrawFeature(
										vectors, OpenLayers.Handler.RegularPolygon, {
											handlerOptions: {
												sides: 4,
												irregular: true,
												snapAngle: 90
											}
										}
										);
										
										//checks if there is another loaded layer by the name of Box layers. if there is it will delete the previous one before adding a new layer named Box Layers.
										if  (me.mapContainer.map.getLayersByName('Box layers').length > 0) {				
											me.mapContainer.map.getLayersByName('Box layers')[0].destroy();					
										}	
											
										me.mapContainer.map.addLayers([vectors]);										
										me.mapContainer.map.addControl(draw);
										
										draw.activate();
									
										draw.layer.events.on({
											featureadded: me.mapContainer.PolygonAdded									
										}); 

										//**********************
										// this event will get the x and y coordinates and transform it to long lat coords after drawfeature is fired
										//**********************
										draw.events.register("featureadded", ' ' , controlFeatureHandler);

											
									//**************************
									// this code is to create a polygon. end of code.
									//**************************
									
									
									
									//me.mapContainer.map.zoomToMaxExtent();
									
								} // handler
						}, //SelectButton
						{
							xtype: 'button',
							itemId: 'DownloadButton',
							text: 'Download selected Area',
									handler: function () {
											
											var me = this.up('panel');
											zoomto = Ext.getCmp('zoomto').getValue();
											zoomfrom = Ext.getCmp('zoomfrom').getValue();
											
											z = zoomfrom;										
											
											coords = vectors.features[0].geometry.bounds;
											coords.transform('EPSG:900913','EPSG:4326');
											
											var map = MapPanel.map;
											
											
											map.layers[0].events.register("loadend", map.layers[0], Start);										
												//Gotest(z,function(e){
												//z++;
												//console.log(z);
												ZoomCall();

												//});
																			
									} // handler
						}, //DownloadButton
						{
							xtype: 'button',
							itemId: 'LocationButton',
							text: 'Check Location',
									handler: function () {
										var me = this.up('panel');			
									//**********************
									// on click event to determine lonlat coords
									//**********************
									// mouse click setup wherein users can set the trigger to be fire either on single click or double click
										OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
										defaultHandlerOptions: {
											'single': true,
											'double': false,
											'pixelTolerance': 0,
											'stopSingle': false,
											'stopDouble': false
										},
									// init
										initialize: function(options) {
											this.handlerOptions = OpenLayers.Util.extend(
												{}, this.defaultHandlerOptions
											);
											
											OpenLayers.Control.prototype.initialize.apply(
												this, arguments
											); 
											// click handler
											this.handler = new OpenLayers.Handler.Click(
												this, {
													'click': this.trigger
												}, this.handlerOptions
											);
										}, 

									// click function
									// note could be the place to put codes for determining png loaded.
										trigger: function(e) {
											// this will get the current coords
											//console.log(e);
											var lonlat = this.map.getLonLatFromPixel(e.xy);
											// this will get the current zoom level
											var zoomlevel = this.map.getZoom();															  
											var scale = this.map.getScale();
											var NewZoomLevel;
											var latTile;
											var lonTile;

											lonlat.transform('EPSG:900913','EPSG:4326');
											
											
											// this will alert the user the coords where his mouse click and at what zoom level
											console.log("You clicked near " + lonlat.lat + " N, " +
																	  + lonlat.lon + " E" + " at zoom level " + zoomlevel + " At Scale: " + scale);																		  
											
											console.log(getzoomlevel(scale));
											NewZoomLevel = getzoomlevel(scale); 											
											console.log("You clicked near Latitude Tile " + lat2tile(lonlat.lat, NewZoomLevel) + " and Longitude Tile  " +
																	  + long2tile(lonlat.lon, NewZoomLevel));
										
										} // trigger

										}); // openlayer control click
						
										var click = new OpenLayers.Control.Click();
										me.mapContainer.map.addControl(click);
										click.activate();
										
						
						
										//**********************
										// end of on click event to determine lonlat coords
										//**********************											
									} // handler
						}, // LocationButton
/* 						{
							xtype: 'button',
							text: 'Zoom In',
								handler: function() {
									MapPanel.map.zoomIn();
								}
						} */
		]; // buildButtons
		} // BuildButtons
} // define
) // define

/* this will get the zoom level depending on the scale of the map */
function getzoomlevel(scale)
{
/* 72 represents the dots per inch. can be changed to 90 or 120 depending on the DPS of the map  */
/* Math.cos(0(this is the latitude.must be 0 in order to get correct zoom level)*0.017453) */
/* 156543.04 earth width in metres(i think) */
return (Math.log(Math.cos(0*0.017453))+Math.log(72)+Math.log(39.37)+Math.log(156543.04)-Math.log(scale))/Math.log(2)
}

function long2tile(lon,zoom1) { 
tt = Number(lon);
return (Math.floor((tt+180)/360*Math.pow(2,zoom1)));
}

function lat2tile(lat,zoom2)  { 
return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom2))); 
}


 function controlFeatureHandler()
	{	
		draw.deactivate();
	};
	
function Gotest(zoom,callback)
{
	var scale = MapPanel.map.getScale();
	var zoomlevel = MapPanel.map.getZoom();
	console.log(zoomlevel +" GoTest");
	NewZoomLevel = getzoomlevel(scale); 
	lat1 = lat2tile(coords.top, NewZoomLevel);
	lat2 = lat2tile(coords.bottom, NewZoomLevel);
	
	long1 = long2tile(coords.left, NewZoomLevel);
	long2 = long2tile(coords.right, NewZoomLevel);
											
	for (var x= lat1; x<=lat2; x++)
	{
		for (var y= long1; y<=long2; y++)
		{
			list = list + startlink + zoomlevel + '/' + x + '/' + y + '<br>';
		} //y for
	} //x for
	callback(list);
}

function ZoomCall()
{
	MapPanel.map.zoomTo(z,MapPanel.map.layers[2].features[0].geometry.bounds.getCenterLonLat().transform('EPSG:900913','EPSG:4326'));
	console.log(z);
	if (z==	0)
	{
	Start();
	}
	else
	{
	console.log("dito pumasok");
	}
	
}


function Start()
{
	Gotest(z, function(e){
	
		if (z<zoomto)
		{
			z++;
			ZoomCall();
			console.log(z);			
		}
		else if (z = zoomto)
		{
			//console.log("unregistering loadend");
			if (!windowres)
			{
			var windowres =	Ext.create('Ext.window.Window',{
				title: 'Results',
				height: 400,
				width: 800,
				layout: 'fit',
				autoScroll: true,
				html: list,
				}).show();
				
			EvtUnreg();
			}
			z = 0;
			list = "";
		}
	});
}

function EvtUnreg()
{
MapPanel.map.layers[0].events.unregister("loadend", MapPanel.map.layers[0], Start);
}

