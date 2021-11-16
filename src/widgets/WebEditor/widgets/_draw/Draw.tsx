import {useEffect,useRef} from "react";
import {CalcitePanel} from "@esri/calcite-components-react/dist/components";
import FeatureTemplates from "@arcgis/core/widgets/FeatureTemplates";
import FeatureTemplatesViewModel from "@arcgis/core/widgets/FeatureTemplates/FeatureTemplatesViewModel";
import DrawViewModel from "./DrawViewModel";
import Graphic from "@arcgis/core/Graphic";
import "./Draw.scss";


export interface AddFeatureInfo{
	layer:__esri.FeatureLayer,
	features:__esri.Graphic[],
	mode:string
}

interface DrawProps{
	view:__esri.MapView,
	layers:__esri.FeatureLayer[],
	activated:boolean,
	templateFromHistory?:boolean
	onFeatureSketched?:(info:AddFeatureInfo)=>void
	onSketchTemplateSelected:(item:__esri.TemplateItem)=>void;
}

//the following doesnt need to be a  state param as its not a dependancy
const drawViewModel = new DrawViewModel({view:null});
const templatePicker = new FeatureTemplates({
	viewModel: new FeatureTemplatesViewModel({
		layers:[]
	})
});
let templatePickerSelectionHandle:any
let clickHandle:any;
let sketchFeatureHandle:any;
let selectedTemplateItem:__esri.TemplateItem | null= null;


const Draw = (props:DrawProps) => {
		const drawRef = useRef<HTMLCalciteBlockElement>();
		const {view,layers,activated,templateFromHistory,onFeatureSketched,onSketchTemplateSelected} = props;
		const clearSelectedTemplate = (keepHistory?:boolean) =>{
			const selectedNode = drawRef.current.querySelector("li.esri-item-list__list-item--selected");
			if(selectedNode){
				selectedNode.classList.add("un-selected");
			}
			if(!keepHistory){
				selectedTemplateItem = null;
				templatePicker.viewModel.set("selectedTemplateItem",null);
			}else{
				selectedTemplateItem.set("selected",false);
			}
			(document.activeElement as any).blur();
			(view.get("surface") as any).focus();
			drawViewModel.deactivateDraw();
		}
		const styleSelectedTemplate =() =>{
			const selectedNode = drawRef.current.querySelector("li.esri-item-list__list-item--selected");
			if(selectedNode){
				selectedNode.classList.remove("un-selected");
			}
		}
		useEffect(()=>{
			if(view && layers.length >0){
				drawViewModel.update(view);
			}
			if(templatePickerSelectionHandle){
				templatePickerSelectionHandle.remove();
			}
			templatePickerSelectionHandle =templatePicker.on("select",(templateInfo:any)=>{
				const clickedItem = templateInfo.item;
				if(!clickedItem){
					clearSelectedTemplate(templateInfo.keepHistory?true:false);
					onSketchTemplateSelected(null)
				}else{
					if(!selectedTemplateItem || !selectedTemplateItem.get("selected") ||
						clickedItem.layer.uid !== (selectedTemplateItem.layer as any).uid
					){
						selectedTemplateItem = clickedItem;
						selectedTemplateItem.set("selected",true);
						if(templateInfo?.template?.drawingTool && drawViewModel){
							styleSelectedTemplate();
							drawViewModel.activateDraw(selectedTemplateItem.layer,templateInfo.template.drawingTool);
							onSketchTemplateSelected(selectedTemplateItem)
						}
					}else{
						templatePicker.emit("select",{
							item: null,
							template:null
						});
					}
				}
			});
			templatePicker.viewModel.set("layers",layers?layers:[]);
			templatePicker.viewModel.refresh();
		},[view,layers.length,drawViewModel]);

		useEffect(()=>{
			if(drawRef.current && !templatePicker.get("container")){
				templatePicker.set("container",drawRef.current);
			}
		},[drawRef]);

		useEffect(()=>{
			if(drawViewModel){
				if(sketchFeatureHandle){
					sketchFeatureHandle.remove();
				}
				sketchFeatureHandle = drawViewModel.on("feature-added",(graphic:__esri.Graphic)=>{
					const _gra = graphic.clone();
					templatePicker.emit("select",{
						item: null,
						template:null,
						keepHistory:true
					});
					if(onFeatureSketched){
						_gra.attributes = selectedTemplateItem.template.prototype.attributes;
						onFeatureSketched({features:[_gra],layer:selectedTemplateItem.layer,mode:"add"});
					}
				});
			}
		},[drawViewModel]);

		useEffect(()=>{
			if(activated){
				if(clickHandle){
					clickHandle.remove();
					clickHandle = null;
				}
				if(view.popup){
					if(typeof(view.get("originalAutoOpenEnabled")) === 'boolean'){
						view.popup.autoOpenEnabled = view.get("originalAutoOpenEnabled");
					}else{
						view.set("originalAutoOpenEnabled",view.popup.autoOpenEnabled)
					}
				}
			}else{
				//attach map click
				if(clickHandle){
					clickHandle.remove();
				}
				if(view.popup){
					view.popup.autoOpenEnabled = false;
					if(!view.get("originalAutoOpenEnabled")){
						view.set("originalAutoOpenEnabled",view.popup.autoOpenEnabled)
					}
					view.popup.autoOpenEnabled = false;
				}
				clickHandle=view.on("click",(event:any)=>{
					view.hitTest(event).then((response:any) =>{
						let results = response.results;
						if (results.length > 0) {
							//TO expand to multi feature editing
							if(results[0].graphic){
								const layer = results[0].graphic.layer;
								let editGraphic = new Graphic({
									attributes:results[0].graphic.attributes,
									geometry:results[0].graphic.geometry.clone(),
									symbol:((layer.renderer) as any).symbol
								})
								onFeatureSketched({features:[editGraphic],layer:layer,mode:"edit"});
							}
						}
					});
				});
			}
		},[activated]);

		useEffect(()=>{
			if(templateFromHistory && selectedTemplateItem){
				templatePicker.viewModel.select(selectedTemplateItem);
			}

		},[templateFromHistory]);

		return  (
			<CalcitePanel className="web-editor-draw">
				<CalcitePanel ref={drawRef}  className="web-editor-draw-template w-100"/>
				{/* CalciteActionPad is provisioned for shape selectors -for sketching for future*/}
				{/* <CalciteActionPad 
					expandDisabled={true} 
					layout="horizontal"
					className="web-editor-draw-actionpad w-100">
				</CalciteActionPad> */}
			</CalcitePanel>
  		)
}

export default Draw;