//the following object must be var and not let/const.
var EXTERNAL_CONFIG = {
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

	"tagPrefix":"compliance::",

	 // Module settings.

    // A web map should be set for each module with relevant editable layers

    // Map will be loaded based on the "urlModuleKeyName"

    // Editable layers in map will be enabled if they contain the field set in "queryField"
	"modules":[{
		"name":"rcmForeshores",
		"webmapId": "832d338bc9d4415dbf8dfdebf2763f1b",
		"zoomToLayer": "Editable Layer"
	}]
}
