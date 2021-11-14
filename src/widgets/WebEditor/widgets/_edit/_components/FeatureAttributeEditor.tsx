import {useEffect,useState,useRef} from "react";
import FeatureForm from "@arcgis/core/widgets/FeatureForm";
import {CalcitePanel} from "@esri/calcite-components-react/dist/components";



interface FeatureAttributeEditorProps{
	layer:__esri.FeatureLayer,
	feature:__esri.Graphic
}
const featureForm = new FeatureForm();
const FeatureAttributeEditor = (props:FeatureAttributeEditorProps) => {
	const {layer,feature} = props;
	const attrRef = useRef<HTMLCalcitePanelElement>(null);
	
	useEffect(()=>{
		if(layer && feature){
			featureForm.set({
				layer,feature
			})
		}
	},[layer,feature]);

	useEffect(()=>{
		if(attrRef.current){
			featureForm.set("container",attrRef.current);
		}
	},[attrRef])

	return  (
		<CalcitePanel ref={attrRef} className="web-editor-attr-editor"></CalcitePanel>
	)
}

export default FeatureAttributeEditor;