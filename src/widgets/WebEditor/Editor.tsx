import {useEffect,useRef,useCallback,useState, useLayoutEffect } from "react";
import { 
	CalciteBlock,
	CalciteTabs, CalciteTab, 
	CalciteTabNav, CalciteTabTitle,
} from "@esri/calcite-components-react/dist/components";
import {whenTrueOnce} from "@arcgis/core/core/watchUtils";
import Draw ,{AddFeatureInfo} from "./widgets/_draw/Draw";
import Edit,{EditFeatureInfo} from "./widgets/_edit/Edit";

import "./Editor.scss";

interface EditorProps{
	view:__esri.MapView,
	startupAsDraw?:boolean
}
const Editor = (props:EditorProps) => {
		const editorRef = useRef<HTMLCalciteBlockElement>(null)
		const [editableLayers,setEditableLayers]=useState<__esri.FeatureLayer[]>([]);
		const [editableFeaturesInfo,setEditableFeaturesInfo]=useState<EditFeatureInfo[]>([]);
		const {view} = props;

		const activateDraw = () =>{
			const drawTab = document.querySelector("calcite-tab-title[tab^='draw']");
			if(drawTab){
				const ev = new KeyboardEvent('keydown', { key: 'Enter',keyCode: 13});
				drawTab?.dispatchEvent(ev);
			}
		}

		const activateEdit =() =>{
			const editTab = document.querySelector("calcite-tab-title[tab^='edit']");
			if(editTab){
				const ev = new KeyboardEvent('keydown', { key: 'Enter',keyCode: 13});
				editTab?.dispatchEvent(ev);
			}
		}

		const prepareFeaturesForEdit = (info:AddFeatureInfo)=>{
			setEditableFeaturesInfo([info as EditFeatureInfo]);
			activateEdit();
		}

		const _isLayerLoaded= useCallback(async(layer:__esri.FeatureLayer)=>{
			await whenTrueOnce(layer,"loaded");
		},[])

		const _waitForLayerLoad= useCallback(async()=>{
			const featureLayers = view.map.allLayers.filter((layer:__esri.Layer) => {
				return layer.type === 'feature'; 
			}).toArray()  as __esri.FeatureLayer[];
			featureLayers.forEach(async(layer:__esri.Layer)=>{
				await _isLayerLoaded(layer as __esri.FeatureLayer);
			});
			return featureLayers;
		},[_isLayerLoaded,view.map.allLayers])

		//Guess the below commented workflow of getting layer infos has to
		// go to edit widget
		// const layerInfos = featureLayers.map((fLayer:any)=>{
		// 	return {layer:fLayer,fieldConfig:_getFieldConfig(fLayer as __esri.FeatureLayer)}
		// });
		// const _getFieldConfig=useCallback((layer:__esri.FeatureLayer)=>{
		// 	if(layer?.popupTemplate){
		// 		const popupTemplate = layer.popupTemplate;
		// 		return popupTemplate.fieldInfos.map((info:__esri.FieldInfo)=>{
		// 			return {name:info.fieldName,label:info.label}
		// 		});
		// 	}
		// 	return null;
		// },[])

		useEffect(()=>{
			whenTrueOnce(view,"ready",async()=>{
				const layers:any = await _waitForLayerLoad();
				setEditableLayers(layers);
			});
		},[props,view,_waitForLayerLoad]);

		useLayoutEffect(()=>{
			if(!props.startupAsDraw && editorRef.current){
				activateEdit();
			}
		},[])
		
		

		return  (
			<CalciteBlock ref = {editorRef} open={true} className="web-editor" collapsible={true} heading="Editor">
				<CalciteTabs bordered={false}>
					<CalciteTabNav slot="tab-nav">
						<CalciteTabTitle className= "web-editor-title-l1" tab="draw"> Draw Feature</CalciteTabTitle>
						<CalciteTabTitle className= "web-editor-title-l1"   tab="edit">Edit Feature</CalciteTabTitle>
					</CalciteTabNav>
					<CalciteTab className="web-editor-tab" tab="draw">
						<Draw view={view} onFeatureAdded={prepareFeaturesForEdit} layers={editableLayers}></Draw>
					</CalciteTab>
					<CalciteTab  className="web-editor-tab" tab="edit">
						<Edit view={view} editableFeaturesInfo ={editableFeaturesInfo}></Edit>
					</CalciteTab>
				</CalciteTabs>
			</CalciteBlock>
			
  		)
}
Editor.defaultProps ={
	startupAsDraw:true
} as EditorProps;

export default Editor;