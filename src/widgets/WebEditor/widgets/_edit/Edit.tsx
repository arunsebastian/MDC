import {useEffect,useState} from "react";
import {CalcitePanel,CalciteTabs,CalciteTabNav,CalciteTabTitle,
	CalciteTab,CalciteButton
} from "@esri/calcite-components-react/dist/components";
import EditViewModel from "./EditViewModel";
import FeatureAttributeEditor from "./_components/FeatureAttributeEditor";
import FeatureVerticesEditor from "./_components/FeatureVerticesEditor";
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
	onFeatureUpdated?:(info:EditFeatureInfo)=>void;
	onCancelEditing?:()=>void;
	activated:boolean
}

const editMode="edit";
const captureMode="add";

const editViewModel = new EditViewModel({});
let featureUpdateHandle:any = null;
const Edit = (props:EditProps) => {
	const {view,editableFeaturesInfo,activated,
		onCancelEditing,
		onFeatureCreated,
		onFeatureUpdated} = props;
		
	useEffect(()=>{
		if(view){
			editViewModel.update(view);
		}
	},[view]);

	useEffect(()=>{
		if(activated && editableFeaturesInfo instanceof Array && editableFeaturesInfo.length>0){
			editViewModel.activateEdit(editableFeaturesInfo[0].layer,editableFeaturesInfo[0].features[0]);
			hideEditedGraphicsInLayer()
		}
	},[activated,editableFeaturesInfo]);

	useEffect(()=>{
		if(editViewModel){
			if(featureUpdateHandle){
				featureUpdateHandle.remove();
			}
			featureUpdateHandle = editViewModel.on("feature-updated",(graphic:__esri.Graphic)=>{
				editViewModel.set("dirty",true);
			});
		}
	},[editViewModel,editableFeaturesInfo]);

	const isFeaturesReadyToEdit = () =>{
		return editableFeaturesInfo && editableFeaturesInfo.some((item:EditFeatureInfo) => item.features.length > 0);
	}

	const getLayerToEdit = () =>{
		return (editableFeaturesInfo && editableFeaturesInfo[0]?.layer)?editableFeaturesInfo[0].layer:null; 
	}

	const getFeatureToEdit =() =>{
		return (editableFeaturesInfo &&  editableFeaturesInfo[0]?.features) ? editableFeaturesInfo[0].features[0]:null;
	}

	const refreshLayer = async(layer:__esri.FeatureLayer) =>{
		layer.definitionExpression= layer.get("_defaultDefinitionExpression")?layer.get("_defaultDefinitionExpression"):"1=1" ;
		layer.refresh();
		await whenTrueOnce(layer,"loaded");
		return layer.loaded
	}

	const cancelEditing = () =>{
		//check for dirty features
		editViewModel.deactivateEdit();
		editViewModel.set("dirty",false);
		if(editableFeaturesInfo[0]?.layer){
			showEditedFeaturesInLayer();
			if(onCancelEditing){
				onCancelEditing();
			}
		}
	}

	const hideEditedGraphicsInLayer = () =>{
		if(editableFeaturesInfo instanceof Array && editableFeaturesInfo.length > 0){
			editableFeaturesInfo.forEach((info:EditFeatureInfo)=>{
				if(info.mode === editMode){
					const objectId = info.features[0].attributes[info.layer.objectIdField];
					const defExpression = info.layer.definitionExpression?`${info.layer.definitionExpression} AND ${info.layer.objectIdField} <> ${objectId}`: `${info.layer.objectIdField} <> ${objectId}`;
					info.layer.definitionExpression= defExpression;
				}
			});
		}
	}

	const showEditedFeaturesInLayer = () =>{
		editableFeaturesInfo.forEach((info:EditFeatureInfo)=>{
			
			refreshLayer(info.layer)
		});
	}

	const saveFeature=() =>{
		const mode = editableFeaturesInfo[0].mode;
		const layer =  editableFeaturesInfo[0].layer;
		if(mode === captureMode){
			layer.applyEdits({
				addFeatures :editableFeaturesInfo[0].features
			}).then((result:any) => {
				editViewModel.set("dirty",false);
				if (result.addFeatureResults.length > 0) {
					const objectId = result.addFeatureResults[0].objectId;
					refreshLayer(layer);
					layer.queryFeatures({
						objectIds: [objectId],
						outFields: ["*"],
						returnGeometry: true
					}).then((results:any) => {
							if (results.features.length > 0) {
							const editFeature = results.features[0];
							const graphic = new Graphic({
								attributes:editFeature.attributes,
								geometry:editFeature.geometry.clone(),
								symbol:editableFeaturesInfo[0].features[0].symbol
							});
							editViewModel.deactivateEdit();
							onFeatureCreated({layer:layer,features:[graphic],mode:"edit"});
						}
					});
				}
			});
		}else if(mode === editMode){
			layer.applyEdits({
				updateFeatures :editableFeaturesInfo[0].features
			}).then((result:any) => {
				editViewModel.set("dirty",false);
				if (result.updateFeatureResults.length > 0) {
					editViewModel.deactivateEdit();
					showEditedFeaturesInLayer();
					if(onFeatureUpdated){
						onFeatureUpdated(editableFeaturesInfo[0]);
					}
				}
			});
		}
	}

	const deleteFeature =() =>{
		const mode = editableFeaturesInfo[0].mode;
		const layer =  editableFeaturesInfo[0].layer;
		editViewModel.deactivateEdit();
		if(mode === captureMode){
			editViewModel.deactivateEdit();
			onCancelEditing();
		}else if(mode === editMode){
			layer.applyEdits({
				deleteFeatures :editableFeaturesInfo[0].features
			}).then((result:any) => {
				editViewModel.set("dirty",false);
				onCancelEditing();
			});
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
					<CalciteTab  className="web-editor-tab" tab="vertices">
						<FeatureVerticesEditor layer={getLayerToEdit()} feature={getFeatureToEdit()}/>
					</CalciteTab>
				</CalciteTabs>
			</CalcitePanel>
			<CalcitePanel style={{display:isFeaturesReadyToEdit()?"":"none"}} >
				<CalciteButton width="auto" slot="footer" onClick={deleteFeature} appearance="outline">Delete</CalciteButton>
				<CalciteButton width="auto" slot="footer" onClick={cancelEditing} appearance="outline">Cancel</CalciteButton>
				<CalciteButton width="auto" slot="footer" onClick={saveFeature}>Save</CalciteButton>
			</CalcitePanel>
			<CalcitePanel style={{display:isFeaturesReadyToEdit()?"none":""}} className="web-editor-inactive w-100">
					Click on a feature in map to edit.
			</CalcitePanel>
		</CalcitePanel>
	)
}
export default Edit;