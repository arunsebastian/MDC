import react,{useEffect,useLayoutEffect,useCallback,useRef,useState } from "react";
import { 
	CalciteBlock,
	CalciteTabs, CalciteTab, 
	CalciteTabNav, CalciteTabTitle,
} from "@esri/calcite-components-react/dist/components";
import {whenTrueOnce} from "@arcgis/core/core/watchUtils";
import Draw from "./widgets/_draw/Draw";

import "./Editor.scss";

interface EditorProps{
	view:__esri.MapView,
	startupAsDraw?:boolean
}
const Editor = (props:EditorProps) => {
		// const drawRef= useRef<HTMLCalciteTabElement>(null);
		// const editRef = useRef<HTMLCalciteTabElement>(null);
		const [drawActive,setDrawActive] = useState<boolean>(false);
		const [editableLayers,setEditableLayers]=useState<__esri.FeatureLayer[]>([])
		const {view} = props;

		const activateDraw = () =>{
			setDrawActive(true);
		}

		const activateEdit =() =>{
			setDrawActive(false);
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
			if(!props.startupAsDraw && drawActive){
				console.log("activating edit");
				setDrawActive(false);
			}
		},[props,drawActive,setDrawActive])
		
		

		return  (
			<CalciteBlock open={true} className="web-editor" collapsible={false} heading="Editor">
				<CalciteTabs bordered={false}>
					<CalciteTabNav slot="tab-nav">
						<CalciteTabTitle className= "web-editor-title-l1"  is-active={drawActive}> Draw Feature</CalciteTabTitle>
						<CalciteTabTitle className= "web-editor-title-l1"  is-active={!drawActive}>Edit Feature</CalciteTabTitle>
					</CalciteTabNav>
					<CalciteTab className="web-editor-tab" is-active={drawActive}>
						<Draw view={view} layers={editableLayers}></Draw>
					</CalciteTab>
					<CalciteTab className="web-editor-tab" is-active={!drawActive}></CalciteTab>
				</CalciteTabs>
			</CalciteBlock>
			
  		)
}
Editor.defaultProps ={
	startupAsDraw:true
} as EditorProps;

export default Editor;