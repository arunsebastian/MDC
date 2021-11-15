import {useEffect,useCallback,useState, useLayoutEffect } from "react";
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
		const {view} = props;
		const [editableLayers,setEditableLayers]=useState<__esri.FeatureLayer[]>([]);
		const [editableFeaturesInfo,setEditableFeaturesInfo]=useState<EditFeatureInfo[]>([]);
		const [drawActive,setDrawActive] = useState<boolean>(true);

		const activateDrawView = () =>{
			const drawTab = document.querySelector("calcite-tab-title[tab^='draw']");
			if(drawTab){
				const ev = new KeyboardEvent('keydown', { key: 'Enter',keyCode: 13});
				drawTab?.dispatchEvent(ev);
				setDrawActive(true);
			}
		}

		const activateEditView =() =>{
			const editTab = document.querySelector("calcite-tab-title[tab^='edit']");
			if(editTab){
				const ev = new KeyboardEvent('keydown', { key: 'Enter',keyCode: 13});
				editTab?.dispatchEvent(ev);
				setDrawActive(false);
			}
		}

		const prepareFeaturesForEdit = (info:AddFeatureInfo|EditFeatureInfo)=>{
			setEditableFeaturesInfo([info]);
			if(drawActive){
				activateEditView();
			}
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
		},[_isLayerLoaded,view.map.allLayers]);

		const handleSketchTemplateSelection = (item:__esri.TemplateItem) =>{
			//clear edits
			setEditableFeaturesInfo(null);
		}

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
			if(!props.startupAsDraw){
				activateEditView();
			}
		},[]);

		return  (
			<CalciteBlock open={true} className="web-editor" collapsible={true} heading="Editor">
				<CalciteTabs bordered={false}>
					<CalciteTabNav slot="tab-nav">
						<CalciteTabTitle onClick={()=>setDrawActive(true)} className= "web-editor-title-l1" tab="draw"> Draw Feature</CalciteTabTitle>
						<CalciteTabTitle onClick={()=>setDrawActive(false)} className= "web-editor-title-l1"   tab="edit">Edit Feature</CalciteTabTitle>
					</CalciteTabNav>
					<CalciteTab className="web-editor-tab" tab="draw">
						<Draw activated={drawActive} view={view} onSketchTemplateSelected={handleSketchTemplateSelection} onFeatureSketched={prepareFeaturesForEdit} layers={editableLayers}></Draw>
					</CalciteTab>
					<CalciteTab  className="web-editor-tab" tab="edit">
						<Edit activated={!drawActive} view={view} editableFeaturesInfo ={editableFeaturesInfo} onFeatureCreated={prepareFeaturesForEdit}></Edit>
					</CalciteTab>
				</CalciteTabs>
			</CalciteBlock>
			
  		)
}
Editor.defaultProps ={
	startupAsDraw:true
} as EditorProps;

export default Editor;