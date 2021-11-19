//the following object must be var and not let/const.
var EXTERNAL_CONFIG = {
	webmapConfig: {
				
		// "portal":"https://gbs.maps.arcgis.com",
		// "webmapId":"12637023272b461182830a0ebaee26dd",
		// "urlModuleNameKey":"moduleName",
		// "urlQueryParamKey":"key",
		// "queryField":"ModuleKey",
		// "rcmForeshores":{
		// 	"webmapId":"61944ab229164dc3b825779bda1257e9",
		// 	"zoomToLayer":"Foreshores"
		// }

		 // portal URL

		 "portal": "https://gbs.maps.arcgis.com",

		 // default web map ID
 
		 "webmapId": "12637023272b461182830a0ebaee26dd",
 
		 // parameter to use for module name
 
		 "urlModuleNameKey": "moduleName",
 
		 // parameter to use as module key (maps to TableKey in most layers)
 
		 "urlQueryParamKey": "key",
 
		 // field in GIS layers that maps to module key
 
		 // app will detect editable layers contain this field, and enable editing
 
		 "queryField": "TableKey",
 
		 "rcmForeshores":{
 
			 "webmapId": "832d338bc9d4415dbf8dfdebf2763f1b",
 
			 "zoomToLayer": "Editable Layer"
 
		 }
	}
}