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
	editableFeaturesInfo:EditFeatureInfo[],
	activated:boolean
}

const editViewModel = new EditViewModel({view:null});
const Edit = (props:EditProps) => {
		const editRef = useRef<HTMLCalciteBlockElement>()
		const {view,editableFeaturesInfo,activated} = props;
		useEffect(()=>{
			if(view){
				editViewModel.update(view);
				console.log(editViewModel)
			}
		},[view]);

		useEffect(()=>{
			if(activated && editableFeaturesInfo){
				editViewModel.activateEdit(editableFeaturesInfo[0].features[0]);
			}
		},[activated,editableFeaturesInfo]);

		const isFeaturesReadyToEdit = () =>{
			return editableFeaturesInfo && editableFeaturesInfo.some((item:EditFeatureInfo) => item.features.length > 0);
		}
		
		return  (
			<CalcitePanel className="web-editor-edit">
				<CalcitePanel style={{display:isFeaturesReadyToEdit()?"":"none"}} className="web-editor-edit-view w-100">
						
				</CalcitePanel>
				<CalcitePanel style={{display:isFeaturesReadyToEdit()?"none":""}} className="web-editor-inactive w-100">
						Click on a feature in map to edit.
				</CalcitePanel>
				<CalciteActionPad 
					style={{display:isFeaturesReadyToEdit()?"":"none"}}
					expandDisabled={true} 
					layout="horizontal"
					className="web-editor-edit-actionpad w-100">
				</CalciteActionPad>
			</CalcitePanel>
  		)
}

export default Edit;