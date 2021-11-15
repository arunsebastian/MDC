import {useEffect,useState,useRef} from "react";
import FeatureForm from "@arcgis/core/widgets/FeatureForm";
import {CalcitePanel} from "@esri/calcite-components-react/dist/components";



interface FeatureAttributeEditorProps{
	layer:__esri.FeatureLayer,
	feature:__esri.Graphic
}
const featureForm = new FeatureForm();
let featureFormChangeHandle:any;
const FeatureAttributeEditor = (props:FeatureAttributeEditorProps) => {
	const {layer,feature} = props;
	const attrRef = useRef<HTMLCalcitePanelElement>(null);
	
	useEffect(()=>{
		if(featureFormChangeHandle){
			featureFormChangeHandle.remove();
		}
		featureFormChangeHandle = featureForm.on("value-change",(info:any)=>{
			if(info.valid){
				feature.attributes[info.fieldName] =info.value;
			}
		});
		featureForm.set({
			layer,feature
		});
	},[layer,feature]);

	useEffect(()=>{
		if(attrRef.current && !featureForm.get("container")){
			featureForm.set("container",attrRef.current);
		}
	},[attrRef]);

	return  (
		<CalcitePanel ref={attrRef} className="web-editor-attr-editor"></CalcitePanel>
	)
}

export default FeatureAttributeEditor;