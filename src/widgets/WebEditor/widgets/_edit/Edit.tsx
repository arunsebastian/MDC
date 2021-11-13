import {useEffect,useRef,useCallback, useState} from "react";
import {CalcitePanel,CalciteActionPad} from "@esri/calcite-components-react/dist/components";
import EditViewModel from "./EditViewModel";
import "./Edit.scss";

export interface EditFeatureInfo{
	layer:__esri.FeatureLayer,
	features:__esri.Graphic[]
} 

interface EditProps{
	view:__esri.MapView,
	editableFeaturesInfo:EditFeatureInfo[]
}


const Edit = (props:EditProps) => {
		const editRef = useRef<HTMLCalciteBlockElement>()
		const {view,editableFeaturesInfo} = props;
		
		return  (
			<CalcitePanel className="web-editor-edit">
				<CalcitePanel className="web-editor-edit-view w-100">
						
				</CalcitePanel>
				<CalciteActionPad 
					expandDisabled={true} 
					layout="horizontal"
					className="web-editor-edit-actionpad w-100">
				</CalciteActionPad>
			</CalcitePanel>
  		)
}

export default Edit;