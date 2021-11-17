import React,{useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useLocation } from 'react-router-dom';
import CoordinateSearch from "../../../widgets/CoordinateSearch/CoordinateSearch";
import EsriEditor from "../../../widgets/EsriEditor/EsriEditor";
import WebEditor from "../../../widgets/WebEditor/Editor";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import Map from "@arcgis/core/Map";
import esriConfig from "@arcgis/core/config";
import appConfig from "../../../config/config-interface";
import {whenTrueOnce} from "@arcgis/core/core/watchUtils";
import { waitForFeatureLayersLoad } from "../../../utils/MapUtils";
import "./MapComponent.scss";

const arcgisOnline:string = "https://www.arcgis.com";

function MapComponent() {
	const mapDiv = useRef(null);
	const [view, setView] = useState<__esri.MapView>();
	const [ready, setReady] = useState<boolean>(false);
	const searchString = useLocation().search;
	
	const isWebmapConfigured = () => {
		//check if webmap
		return (appConfig["webmapConfig"]?.webmapId || "").length > 0
	}

	const isNormalMapConfigured = () => {
		//check if basemaps
		return  appConfig["mapConfig"]?.basemaps instanceof Array && 
				appConfig["mapConfig"]?.basemaps.length > 0
	}

	const getConfiguredPortal = useCallback(() => {
		return appConfig["webmapConfig"]?.portal || arcgisOnline;
	},[]);

	const setEsriConfig = useCallback(() =>{
		esriConfig.portalUrl = getConfiguredPortal();
		esriConfig.request.timeout = 8000;
	},[getConfiguredPortal]);

	const renderCoordinateWidget = useCallback(() =>{
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
	},[view]);

	const renderEsriEditorWidget = useCallback(() =>{
		if(view){
			const editor = new EsriEditor({
				view: view
			});
			view.ui.add(editor, "bottom-right");
		}
	},[view]);

	const renderWebEditor = useCallback(()=>{
		if(view){
			const node = document.createElement("div");
			node.setAttribute("class","esri-widget");
			view.ui.add(node,"top-right");
			ReactDOM.render(<WebEditor view={view}/>,node)
		}
	},[view]);

	const getWebMapIdFromModule = () =>{
		let id = appConfig.webmapConfig.webmapId;
		if(appConfig.webmapConfig.urlModuleNameKey && searchString){
			const urlParams = new URLSearchParams(searchString);
			const moduleName = urlParams.get(appConfig.webmapConfig.urlModuleNameKey);
			if(moduleName && appConfig.webmapConfig[moduleName]){
				id = appConfig.webmapConfig[moduleName].webmapId;
			}
		}
		return id;
	}

	const applyDefinitionQueries = () =>{
		if(appConfig.webmapConfig.urlModuleNameKey && searchString){
			const urlParams = new URLSearchParams(searchString);
			const moduleName = urlParams.get(appConfig.webmapConfig.urlModuleNameKey);
			if(moduleName && appConfig.webmapConfig[moduleName]){
				const urlQueryParamKey = appConfig.webmapConfig.urlQueryParamKey;
				const queryField = appConfig.webmapConfig.queryField;
				const queryValue = urlParams.get(urlQueryParamKey);
				if(queryValue){
					let featureLayers =view.map.allLayers.filter((layer:__esri.Layer) => {
						return layer.type === 'feature'; 
					}).toArray()  as __esri.FeatureLayer[];
					featureLayers.forEach((layer:__esri.FeatureLayer)=>{
						if(layer.fields.findIndex((field:__esri.Field)=>{
							return field.name === queryField
						}) > -1){
							const defExpression = layer.definitionExpression?`${layer.definitionExpression} AND ${queryField} = ${queryValue}`: `${queryField} = ${queryValue}`;
							layer.definitionExpression=defExpression;
						}
					});
				}
			}
		}
	}

	const setOutFields =() =>{
		let featureLayers =view.map.allLayers.filter((layer:__esri.Layer) => {
			return layer.type === 'feature'; 
		}).toArray()  as __esri.FeatureLayer[];
		featureLayers.forEach((layer:__esri.FeatureLayer)=>{
			layer.set("outFields",["*"])
		});
	}

	//component did update
	useEffect(() => {
		if (mapDiv.current) {
			let map = new Map();
			setEsriConfig();
			if(isWebmapConfigured()){
				const webmapId = getWebMapIdFromModule();
				map = new WebMap({
					portalItem: {
						id: webmapId					
					}
				});
			}else{
				// add  error strings folder and use i18n;
				throw new Error("Invalid map configuration.Please review the config.")
			}
			setView((_view: __esri.MapView| undefined) => {
				const mapView = new MapView({
					container: mapDiv.current as any,
					map: map
				})
				return !_view ? mapView : _view;
			});
		}
	}, [setEsriConfig]);

	//callback for setView
	useEffect(()=>{
		if(view){
			whenTrueOnce(view,"ready",async()=>{
				waitForFeatureLayersLoad(view).then(()=>{
					setOutFields();
					applyDefinitionQueries();
					setReady(true);
				});
			});
		}
	},[view]);

	useEffect(()=>{
		renderCoordinateWidget();
		//renderEsriEditorWidget();
		renderWebEditor();
	},[ready])

	return <div className="mapDiv" ref={mapDiv}></div>;
}

export default MapComponent;
