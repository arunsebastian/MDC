import {useEffect,useState, useLayoutEffect } from "react";
import { 
	CalciteBlock,
	CalciteTabs, CalciteTab, 
	CalciteTabNav, CalciteTabTitle,
} from "@esri/calcite-components-react/dist/components";
import {whenTrueOnce} from "@arcgis/core/core/watchUtils";
import Draw ,{AddFeatureInfo} from "./widgets/_draw/Draw";
import Edit,{EditFeatureInfo} from "./widgets/_edit/Edit";
import { waitForFeatureLayersLoad } from "../../utils/MapUtils";

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
		const [templateFromHistory,setTemplateFromHistory]= useState<boolean>(false);

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

		const initializeEditWorkflow = (info:AddFeatureInfo|EditFeatureInfo)=>{
			setEditableFeaturesInfo([info]);
			if(drawActive){
				activateEditView();
			}
		}

		const initializeDrawWorkflow = () =>{
			setEditableFeaturesInfo([]);
			if(!drawActive){
				activateDrawView();
			}
			setTemplateFromHistory(true);
		}

		const handleSketchTemplateSelection = (item:__esri.TemplateItem) =>{
			//clear edits
			setEditableFeaturesInfo([]);
		}

		const prepareForEditing = (layers:__esri.FeatureLayer[]) =>{
			layers.forEach((layer:__esri.FeatureLayer)=>{
				layer.set("_defaultDefinitionExpression",(layer as __esri.FeatureLayer).definitionExpression);
			});
		}


		useEffect(()=>{
			whenTrueOnce(view,"ready",async()=>{
				waitForFeatureLayersLoad(view).then((layers:__esri.FeatureLayer[])=>{
					prepareForEditing(layers);
					setEditableLayers(layers);
				});
			});
		},[props,view]);

		

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
						<Draw activated={drawActive} view={view} templateFromHistory={templateFromHistory} onSketchTemplateSelected={handleSketchTemplateSelection} onFeatureSketched={initializeEditWorkflow} layers={editableLayers}></Draw>
					</CalciteTab>
					<CalciteTab  className="web-editor-tab" tab="edit">
						<Edit activated={!drawActive} view={view} editableFeaturesInfo ={editableFeaturesInfo} onFeatureCreated={initializeEditWorkflow} onCancelEditing={initializeDrawWorkflow} ></Edit>
					</CalciteTab>
				</CalciteTabs>
			</CalciteBlock>
			
  		)
}
Editor.defaultProps ={
	startupAsDraw:true
} as EditorProps;

export default Editor;