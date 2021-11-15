import {useEffect} from "react";
import {CalcitePanel,CalciteTabs,CalciteTabNav,CalciteTabTitle,
	CalciteTab,CalciteButton
} from "@esri/calcite-components-react/dist/components";
import EditViewModel from "./EditViewModel";
import FeatureAttributeEditor from "./_components/FeatureAttributeEditor";
import { whenTrueOnce } from "@arcgis/core/core/watchUtils";
import Graphic from "@arcgis/core/Graphic";
import "./Edit.scss";


export interface EditFeatureInfo{
	layer:__esri.FeatureLayer,
	features:__esri.Graphic[],
	mode:string
} 

interface EditProps{
	view:__esri.MapView,
	editableFeaturesInfo:EditFeatureInfo[],
	onFeatureCreated:(info:EditFeatureInfo)=>void;
	activated:boolean
}

const editMode="edit";
const captureMode="add";

const editViewModel = new EditViewModel({view:null});
const Edit = (props:EditProps) => {
		const {view,editableFeaturesInfo,activated,onFeatureCreated} = props;
		useEffect(()=>{
			if(view){
				editViewModel.update(view);
			}
		},[view]);

		useEffect(()=>{
			if(activated && editableFeaturesInfo instanceof Array && editableFeaturesInfo.length>0){
				// i am here
				// add loader while save
				// Invetsigate the black fill
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

		const refreshLayer = (layer:__esri.FeatureLayer) =>{
			const promise = new Promise((resolve:Function)=>{
				whenTrueOnce(layer,"loaded",()=>{
					resolve()
				});
				layer.refresh();
			});
			return promise;
		}

		const saveFeature=() =>{
			const mode = editableFeaturesInfo[0].mode;
			const layer =  editableFeaturesInfo[0].layer;
			editViewModel.deactivateEdit();
			if(mode === captureMode){
				layer.applyEdits({
					addFeatures :editableFeaturesInfo[0].features
				}).then((result:any) => {
					// Get the objectId of the newly added feature.
					// Call selectFeature function to highlight the new feature.
					if (result.addFeatureResults.length > 0) {
						const objectId = result.addFeatureResults[0].objectId;
						refreshLayer(layer).then(()=>{
							layer.queryFeatures({
								objectIds: [objectId],
								outFields: ["*"],
								returnGeometry: true
							}).then((results:any) => {
								  if (results.features.length > 0) {
									const editFeature = results.features[0];
									const graphic = new Graphic({
										attributes:editFeature.attributes,
										geometry:editFeature.geometry.clone()
									});
									console.log(graphic);
									onFeatureCreated({layer:layer,features:[graphic],mode:"edit"});
								}
							});
						})
					}
				})
			}else if(mode === editMode){
				alert("edit mode")

			}
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
					<CalciteButton width="half" slot="footer-actions" appearance="outline">Cancel</CalciteButton>
        			<CalciteButton width="half" slot="footer-actions" onClick={saveFeature}>Save</CalciteButton>
				</CalcitePanel>
				<CalcitePanel style={{display:isFeaturesReadyToEdit()?"none":""}} className="web-editor-inactive w-100">
						Click on a feature in map to edit.
				</CalcitePanel>
			</CalcitePanel>
  		)
}

export default Edit;