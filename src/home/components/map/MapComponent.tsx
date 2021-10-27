import React, { useRef, useEffect, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Expand from '@arcgis/core/widgets/Expand';
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import Map from "@arcgis/core/Map";
import esriConfig from "@arcgis/core/config"
import appConfig from "../../../config/config-interface"
import "./MapComponent.scss";

const arcgisOnline:string = "https://www.arcgis.com";

function MapComponent() {
	const mapDiv = useRef(null);
	const params = useLocation();
	console.log("params >>>> ",params)

	const isWebmapConfigured = () => {
		//check if webmap
		return (appConfig["webmapConfig"]?.id || "").length > 0
	}

	const isNormalMapConfigured = () => {
		//check if basemaps
		return  appConfig["mapConfig"]?.basemaps instanceof Array && 
				appConfig["mapConfig"]?.basemaps.length > 0
	}

	const getConfiguredPortal = useCallback(() => {
		return appConfig["webmapConfig"]?.portal || arcgisOnline;
	},[])

	const setEsriConfig = useCallback(() =>{
		esriConfig.portalUrl = getConfiguredPortal();
		esriConfig.request.timeout = 8000;
	},[getConfiguredPortal])

	useEffect(() => {
		if (mapDiv.current) {
			/**
			 * Initialize maps
			 */
			let map = new Map();
			setEsriConfig();
			if(isWebmapConfigured()){
				map = new WebMap({
					portalItem: {
						id: appConfig.webmapConfig.id					}
					}
				);
			}else if(isNormalMapConfigured()){
				//add create base map
				// add operational layers
			}else{
				// add error string;
				throw new Error("Invalid map configuration.Please review the config.")
			}


			

			// I AM HERE:::
			//test THE CONFIGS FOR WEBMAP/NORMAL Map AND WHICH TAKES PRECEDENCE
			//ADD A NEW FOLDER Strings


			// if (isWebmapConfigured()) {

			// } else if (isNormalMapConfigured()) {

			// } else {
			// 	throw ("Not configured")
			// }


			const view = new MapView({
				container: mapDiv.current,
				map: map
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
	}, [setEsriConfig]);

	return <div className="mapDiv" ref={mapDiv}></div>;
}

export default MapComponent;
