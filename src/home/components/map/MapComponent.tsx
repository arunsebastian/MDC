import React, {useState, useRef, useEffect, useCallback } from "react";
// import { useLocation } from 'react-router-dom';
import CoordinateSearch from "../../../widgets/CoordinateSearch/CoordinateSearch";
import EsriEditor from "../../../widgets/EsriEditor/EsriEditor";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import Map from "@arcgis/core/Map";
import esriConfig from "@arcgis/core/config";
import appConfig from "../../../config/config-interface";
import "./MapComponent.scss";

const arcgisOnline:string = "https://www.arcgis.com";

function MapComponent() {
	const mapDiv = useRef(null);
	const [view, setView] = useState<__esri.MapView>();
	//url params
	//const params = useLocation();
	//console.log("params >>>> ",params)

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

	const renderCoordinateWidget = ()=>{
		if(view){
			const coordinateSearch = new CoordinateSearch({
				view: view,
				visibleElements:{
					settingsButton:false,
					captureButton:true
				}
			});
			view.ui.add(coordinateSearch, "bottom-left");
		}
		
	} 

	const renderEsriEditorWidget =() =>{
		if(view){
			const editor = new EsriEditor({
				view: view
			});
			view.ui.add(editor, "top-right");
		}
	}

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
				// add  error strings folder and use i18n;
				throw new Error("Invalid map configuration.Please review the config.")
			}

			setView(new MapView({
				container: mapDiv.current,
				map: map
			}));
			renderCoordinateWidget();
			renderEsriEditorWidget();
		}
	}, [view,setEsriConfig]);
	return <div className="mapDiv" ref={mapDiv}></div>;
}

export default MapComponent;
