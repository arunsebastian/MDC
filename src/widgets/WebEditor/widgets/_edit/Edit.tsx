import {useEffect,useState,useRef,useLayoutEffect} from "react";
import {CalcitePanel,CalciteTabs,CalciteTabNav,CalciteTabTitle,
	CalciteTab,CalciteButton,CalciteModal
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
	onFeatureCreated?:(info:EditFeatureInfo)=>void;
	onFeatureUpdated?:(info:EditFeatureInfo)=>void;
	onCancelEditing?:()=>void;
	activated:boolean
}

const editMode="edit";
const captureMode="add";

const editViewModel = new EditViewModel({});
let featureUpdateHandle:any = null;
const Edit = (props:EditProps) => {
	const deleteFeatureRef = useRef<HTMLCalciteModalElement>(null);
	const footerRef = useRef<HTMLCalcitePanelElement>(null);
	const [editedFeature,setEditedFeature] = useState<__esri.Graphic|null>(null);
	const[ attrActive,setAttrActive] = useState<boolean>(true);
	const {view,editableFeaturesInfo,activated,
		onCancelEditing,
		onFeatureCreated,
		onFeatureUpdated} = props;

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
	
	const activateAttributeEditingView = () =>{
		const attrTab = document.querySelector("calcite-tab-title[tab^='attr']");
		if(attrTab){
			const ev = new KeyboardEvent('keydown', { key: 'Enter',keyCode: 13});
			attrTab?.dispatchEvent(ev);
			setAttrActive(true);
		}
	}

	const activateVertexEditingView = () =>{
		const verticesTab = document.querySelector("calcite-tab-title[tab^='vertices']");
		if(verticesTab){
			const ev = new KeyboardEvent('keydown', { key: 'Enter',keyCode: 13});
			verticesTab?.dispatchEvent(ev);
			setAttrActive(false);
		}
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
			setEditedFeature(null);
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
					activateAttributeEditingView();
					if(onFeatureUpdated){
						onFeatureUpdated(editableFeaturesInfo[0]);
					}
					//-> for keeping editing commenting out the following
					//setEditedFeature(null);
					//cancelEditing()
				}
			});
		}
	}

	const confirmFeatureDelete = () =>{
		if(deleteFeatureRef.current){
			deleteFeatureRef.current.setAttribute("active","true");
		}
	}

	const proceedDelete =() =>{
		if(deleteFeatureRef.current){
			deleteFeatureRef.current.removeAttribute("active");
		}
		deleteFeature();
	}

	const cancelDelete =()=>{
		if(deleteFeatureRef.current){
			deleteFeatureRef.current.removeAttribute("active");
		}
	}

	const deleteFeature =() =>{
		const mode = editableFeaturesInfo[0].mode;
		const layer =  editableFeaturesInfo[0].layer;
		editViewModel.deactivateEdit();
		if(mode === captureMode){
			cancelEditing();
		}else if(mode === editMode){
			layer.applyEdits({
				deleteFeatures :editableFeaturesInfo[0].features
			}).then((result:any) => {
				cancelEditing();
			});
		}
	}

	const handleVertexEdits=(feature:__esri.Graphic) =>{
		editViewModel.set("dirty",true);
		editableFeaturesInfo[0].features[0] = feature;
		editViewModel.activateEdit(editableFeaturesInfo[0].layer,feature);
		setEditedFeature(feature)
	}

	const attachStyleHandleToFooter = () =>{
		if(footerRef.current){
			let footer = ((footerRef.current) as any).shadowRoot.querySelector("footer");
			if(footer){
				footer.setAttribute("part","edit-footer");
			}
		}
	}

	useEffect(()=>{
		if(view){
			editViewModel.update(view);
		}
	},[view]);

	useEffect(()=>{
		if(activated && editableFeaturesInfo instanceof Array && editableFeaturesInfo.length>0){
			setEditedFeature(editableFeaturesInfo[0].features[0]);
			editViewModel.activateEdit(editableFeaturesInfo[0].layer,editableFeaturesInfo[0].features[0]);
			hideEditedGraphicsInLayer();
			attachStyleHandleToFooter();
		}
	},[activated,editableFeaturesInfo]);

	useEffect(()=>{
		if(editViewModel){
			if(featureUpdateHandle){
				featureUpdateHandle.remove();
			}
			featureUpdateHandle = editViewModel.on("feature-updated",(graphic:__esri.Graphic)=>{
				editViewModel.set("dirty",true);
				setEditedFeature(graphic.clone());
				//to prevent the auto switching
				if(!attrActive){
					activateVertexEditingView()
				}
			});
		}
	},[editViewModel,editableFeaturesInfo]);

	useLayoutEffect(()=>{
		activateAttributeEditingView();
	},[]);
	
	return  (
		<CalcitePanel className="web-editor-edit">
			<CalcitePanel className="web-editor-edit-view w-100" style={{display:isFeaturesReadyToEdit()?"":"none"}}>
				{/* temporarily disabling the tab system for attr/vertex editor */}
				{/* <CalciteTabs bordered={false} className="web-editor-view-tabs">
					<CalciteTabNav slot="tab-nav">
						<CalciteTabTitle  onClick={()=>setAttrActive(true)} className= "web-editor-title-l1" tab="attr">Attributes</CalciteTabTitle>
						<CalciteTabTitle  onClick={()=>setAttrActive(false)} className= "web-editor-title-l1" tab="vertices">Vertices</CalciteTabTitle>
					</CalciteTabNav>
					<CalciteTab className="web-editor-tab" tab="attr">
						<FeatureAttributeEditor layer={getLayerToEdit()} feature={getFeatureToEdit()}/>
					</CalciteTab>
					<CalciteTab  className="web-editor-tab" tab="vertices">
						<FeatureVerticesEditor onVertexEdited={handleVertexEdits} feature={editedFeature}/>
					</CalciteTab>
				</CalciteTabs> */}
				<FeatureVerticesEditor view={view} onVertexEdited={handleVertexEdits} feature={editedFeature}/>
			</CalcitePanel>
			<CalcitePanel className="web-editor-edit-footer" ref={footerRef} style={{display:isFeaturesReadyToEdit()?"":"none"}} >
				<CalciteButton width="auto" slot="footer" onClick={confirmFeatureDelete} appearance="outline">Delete</CalciteButton>
				<CalciteButton width="auto" slot="footer" onClick={cancelEditing} appearance="outline">Cancel</CalciteButton>
				<CalciteButton width="auto" slot="footer" onClick={saveFeature}>Save</CalciteButton>
			</CalcitePanel>
			<CalcitePanel style={{display:isFeaturesReadyToEdit()?"none":""}} className="web-editor-inactive w-100">
					Click on a feature in map to edit.
			</CalcitePanel>
			<CalciteModal ref={deleteFeatureRef} scale="s" width="s">
				<div slot="header" >Confirm</div>
				<div slot="content">
					Are you sure you want to delete the feature?
				</div>
				<CalciteButton slot="secondary" width="full" onClick={cancelDelete} appearance="outline">No</CalciteButton>
				<CalciteButton slot="primary" width="full" onClick={proceedDelete}>Yes</CalciteButton>
			</CalciteModal>
		</CalcitePanel>
	)
}
export default Edit;