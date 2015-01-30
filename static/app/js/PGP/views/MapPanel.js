Ext.define('PGP.views.MapPanel', {
extend: 'Ext.panel.Panel',
title: "Philippine Map",
layout: 'fit',
region: 'center',
split: true,
showHeader: false,
alias: 'widget.MapPanel',
mapContainer: '',
initComponent: function() {	

                this.on('afterrender', function () {
					
						var wh = this.ownerCt.getSize();
						Ext.applyIf(this, wh);

						
						var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
							'NAMRIA Basemap',
							'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
							{
								isBaseLayer: true
							}
						);
						
						var routing = new OpenLayers.Layer.Vector("Routing Layer",
						{
							isBaseLayer: false
						}
						);	

						
						this.map = new OpenLayers.Map(
							// render the map to the body of this panel
							this.body.dom.id,
							{ 
								controls: [
									new OpenLayers.Control.Navigation(),
									new OpenLayers.Control.LayerSwitcher(),
									new OpenLayers.Control.Zoom(),
									new OpenLayers.Control.MousePosition(),
									//new OpenLayers.Control.Graticule(),
									new OpenLayers.Control.PanZoomBar(),
									new OpenLayers.Control.ScaleLine()
								],
								fallThrough: true,
								projection: 'EPSG:900913',
								buffer:1
							}
						);
				
						
						var point = new OpenLayers.Geometry.Point(121.03108334509719,14.754557846733427).transform('EPSG:4326','EPSG:900913'); //home
						routing.addFeatures([new OpenLayers.Feature.Vector(point)]);
						this.map.addLayers([pgp_basemap_cache,routing]);
						
						this.map.setCenter(new OpenLayers.LonLat(121.03108334509719,14.754557846733427),0);
						
				}); // afterrender		
				
				this.on('resize', function () {
						var size = [document.getElementById(this.id + "-body").offsetWidth, document.getElementById(this.id + "-body").offsetHeight];
						this.map.updateSize(size);
/* 						alert(this.map.size);
						alert("left:" + this.map.calculateBounds().transform('EPSG:900913','EPSG:4326').left 
						+ "bottom: " + this.map.calculateBounds().transform('EPSG:900913','EPSG:4326').bottom
						+ "right: " + this.map.calculateBounds().transform('EPSG:900913','EPSG:4326').right
						+ "top: " + this.map.calculateBounds().transform('EPSG:900913','EPSG:4326').top
						); */
				});	// resize				
						
		this.callParent(arguments);
		
	},	// InitComponent


} // define
) // define