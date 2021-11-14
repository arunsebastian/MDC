import {useEffect} from "react";
import {CalcitePanel,CalciteActionPad,
	CalciteTabs,CalciteTabNav,CalciteTabTitle,
	CalciteTab
} from "@esri/calcite-components-react/dist/components";
import EditViewModel from "./EditViewModel";
import FeatureAttributeEditor from "./_components/FeatureAttributeEditor";
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
		const {view,editableFeaturesInfo,activated} = props;
		useEffect(()=>{
			if(view){
				editViewModel.update(view);
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

		const getLayerToEdit = () =>{
			return (editableFeaturesInfo && editableFeaturesInfo[0]?.layer)?editableFeaturesInfo[0].layer:null; 
		}

		const getFeatureToEdit =() =>{
			return (editableFeaturesInfo &&  editableFeaturesInfo[0]?.features) ? editableFeaturesInfo[0].features[0]:null;
		}
		
		return  (
			<CalcitePanel className="web-editor-edit">
				<CalcitePanel style={{display:isFeaturesReadyToEdit()?"":"none"}} className="web-editor-edit-view w-100">
					<CalciteTabs bordered={false} className="web-editor-view-tabs">
						<CalciteTabNav slot="tab-nav">
							<CalciteTabTitle className= "web-editor-title-l1" tab="attr" active>Attributes</CalciteTabTitle>
							<CalciteTabTitle className= "web-editor-title-l1" tab="vertices">Vertices</CalciteTabTitle>
						</CalciteTabNav>
						<CalciteTab className="web-editor-tab" tab="attr" active>
							<FeatureAttributeEditor layer={getLayerToEdit()} feature={getFeatureToEdit()}/>
						</CalciteTab>
						<CalciteTab  className="web-editor-tab" tab="vertices"></CalciteTab>
					</CalciteTabs>
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