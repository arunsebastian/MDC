import React, { useRef, useEffect } from "react";
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Expand from '@arcgis/core/widgets/Expand';
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import configData from "../config/config-interface"
import "./Map.scss";


function Map() {
	const mapDiv = useRef(null);

	const isWebmapConfigured = () => {
		//check if webmap
		return configData.hasOwnProperty("webmapConfig") && String(configData["webmapConfig"].id || "").length > 0;
	}

	const isNormalMapConfigured = () => {
		//check if basemaps
		return configData.hasOwnProperty("mapConfig") && configData["mapConfig"].basemaps instanceof Array && configData["mapConfig"].basemaps.length > 0;
	}

	useEffect(() => {
		if (mapDiv.current) {
			/**
			 * Initialize maps
			 */
			const webmap = new WebMap({
				portalItem: {
					id: "aa1d3f80270146208328cf66d022e09c"
				}
			});

			// I AM HERE:::
			//test THE CONFIGS FOR WEBMAP/NORMAL Map AND WHICH TAKES PRECEDENCE
			//ADD A NEW FOLDER Strings


			if (isWebmapConfigured()) {

			} else if (isNormalMapConfigured()) {

			} else {
				throw ("Not configured")
			}


			const view = new MapView({
				container: mapDiv.current,
				map: webmap
			});

			const bookmarks = new Bookmarks({
				view,
				// allows bookmarks to be added, edited, or deleted
				editingEnabled: true
			});

			const bkExpand = new Expand({
				view,
				content: bookmarks,
				expanded: true
			});

			// Add the widget to the top-right corner of the view
			view.ui.add(bkExpand, "top-right");

			// bonus - how many bookmarks in the webmap?
			// webmap.when(() => {
			// 	if (webmap.bookmarks && webmap.bookmarks.length) {
			// 		console.log("Bookmarks: ", webmap.bookmarks.length);
			// 	} else {
			// 		console.log("No bookmarks in this webmap.");
			// 	}
			// });
		}
	}, []);

	return <div className="mapDiv" ref={mapDiv}></div>;
}

export default Map;
