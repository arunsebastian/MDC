import react,{useEffect,useLayoutEffect,useCallback,useRef,useState } from "react";
import { 
	CalciteTabs, CalciteTab, 
	CalciteTabNav, CalciteTabTitle 
} from "@esri/calcite-components-react/dist/components";
import {whenTrueOnce} from "@arcgis/core/core/watchUtils";
import FeatureTemplates from "@arcgis/core/widgets/FeatureTemplates";

import "./Editor.scss";


interface EditorProps{
	view:__esri.MapView,
	startupAsDraw?:boolean
}
const Editor = (props:EditorProps) => {
		const drawRef= useRef<HTMLCalciteTabElement>(null);
		const editRef = useRef<HTMLCalciteTabElement>(null);
		const [drawActive,setDrawActive] = useState<boolean>(false);
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

		const _getFieldConfig=useCallback((layer:__esri.FeatureLayer)=>{
			if(layer?.popupTemplate){
				const popupTemplate = layer.popupTemplate;
				return popupTemplate.fieldInfos.map((info:__esri.FieldInfo)=>{
					return {name:info.fieldName,label:info.label}
				});
			}
			return null;
		},[])

		const getEditableLayerInfos = useCallback(async() =>{
			const featureLayers = await _waitForLayerLoad();
			const layerInfos = featureLayers.map((fLayer:any)=>{
				return {layer:fLayer,fieldConfig:_getFieldConfig(fLayer as __esri.FeatureLayer)}
			});
			return layerInfos;
		},[_waitForLayerLoad,_getFieldConfig])

		const renderDrawWidget = useCallback((layers:__esri.FeatureLayer[]) =>{
			// new FeatureTemplates({
			// 	container: "templatesDiv",
			// 	layers: layers
			// });
		},[])

		useEffect(()=>{
			if(view){
				whenTrueOnce(view,"ready",async()=>{
					const layerInfos:any = await getEditableLayerInfos();
					const layers = layerInfos.map((info:any)=>{return info.layer});
					renderDrawWidget(layers);
				});
			}
		},[props,view,getEditableLayerInfos,renderDrawWidget]);

		useLayoutEffect(()=>{
			if(!props.startupAsDraw && drawActive){
				console.log("activating edit");
				setDrawActive(false);
			}
		},[props,drawActive,setDrawActive])
		
		

		return  (
			<CalciteTabs className="web-editor" bordered={true}>
				<CalciteTabNav slot="tab-nav">
					<CalciteTabTitle className= "web-editor-title-l1" onClick={activateDraw} is-active={drawActive}> Draw Feature</CalciteTabTitle>
					<CalciteTabTitle className= "web-editor-title-l1" onClick={activateEdit} is-active={!drawActive}>Edit Feature</CalciteTabTitle>
				</CalciteTabNav>
				<CalciteTab is-active={drawActive}></CalciteTab>
				<CalciteTab is-active={!drawActive}></CalciteTab>
			</CalciteTabs>
  		)
}
Editor.defaultProps ={
	startupAsDraw:true
} as EditorProps;

export default Editor;