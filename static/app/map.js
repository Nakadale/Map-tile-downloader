Ext.Loader.setConfig({
	disableCaching: false,
	enabled: true,
	paths: {
	    GeoExt:'lib/geoext',
		PGP: 'js/PGP'
	} 
});

var MapPanel = Ext.create('PGP.views.MapPanel',{});
var TileDownloader = Ext.create('PGP.views.TileDownloader',{});

Ext.onReady(function() { 
	Ext.application({
		name: 'OL3EXT4',
		requires: ['PGP.views.Routing'],
		launch: function () {
			renderTo: Ext.getBody(),	
			Ext.create('Ext.container.Viewport', {
				layout: 'border',
				id: 'viewport',
				items: [{
					xtype: 'TileDownloader',
					collapsed: true,
					mapContainer: MapPanel
					},
					
					MapPanel
					
				] //items
			
			}); // viewport
		
		
		} // launch
		
	}); // application
}); // onready

/* {	
					xtype: 'Routing',
					collapsed: true,
					mapContainer: MapPanel
					}, */