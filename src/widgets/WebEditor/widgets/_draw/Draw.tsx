import {useEffect,useRef,useCallback, useState} from "react";
import {CalcitePanel} from "@esri/calcite-components-react/dist/components";
import FeatureTemplates from "@arcgis/core/widgets/FeatureTemplates";
import FeatureTemplatesViewModel from "@arcgis/core/widgets/FeatureTemplates/FeatureTemplatesViewModel";
import DrawViewModel from "./DrawViewModel";
import "./Draw.scss";

export interface AddFeatureInfo{
	layer:__esri.FeatureLayer,
	features:__esri.Graphic[]
}

interface DrawProps{
	view:__esri.MapView,
	layers:__esri.FeatureLayer[],
	activated:boolean,
	onFeatureAdded?:(info:AddFeatureInfo)=>void
	onDrawTemplateSelected:(item:__esri.TemplateItem)=>void;
}

//the following doesnt need to be a  state param as its not a dependancy
const drawViewModel = new DrawViewModel({view:null});
let selectedTemplateItem:__esri.TemplateItem | null= null;
let clickHandle:any;

const Draw = (props:DrawProps) => {
		const drawRef = useRef<HTMLCalciteBlockElement>()
		const {view,layers,activated,onFeatureAdded,onDrawTemplateSelected} = props;
		const [templatePicker,setTemplatePicker]  = useState<__esri.FeatureTemplates|null>(null)
		const clearSelectedTemplate = (keepHistory?:boolean) =>{
			const selectedNode = drawRef.current.querySelector("li.esri-item-list__list-item--selected");
			if(selectedNode){
				selectedNode.classList.add("un-selected");
			}
			if(!keepHistory){
				selectedTemplateItem = null;
			}
			drawViewModel.deactivateDraw();
		}
		const styleSelectedTemplate =() =>{
			const selectedNode = drawRef.current.querySelector("li.esri-item-list__list-item--selected");
			if(selectedNode){
				selectedNode.classList.remove("un-selected");
			}
		}
		const renderTemplatePicker =()=>{
			if(!templatePicker){
				const tpl =new FeatureTemplates({
					container: drawRef.current,
					viewModel: new FeatureTemplatesViewModel({
						layers:layers?layers:[]
					})
				});
				tpl.on("select",(templateInfo:any)=>{
					styleSelectedTemplate();
					const clickedItem = templateInfo.item;
					if(!selectedTemplateItem || (clickedItem.layer.uid !== (selectedTemplateItem.layer as any).uid)){
						selectedTemplateItem = clickedItem;
						if(templateInfo?.template.drawingTool && drawViewModel){
							drawViewModel.activateDraw(templateInfo.template.drawingTool);
							onDrawTemplateSelected(selectedTemplateItem)
						}
					}else{
						clearSelectedTemplate(false)
					}
				});
				setTemplatePicker(tpl)
			}else{
				templatePicker.viewModel.set("layers",layers?layers:[]);
			}
			
		}
		
		useEffect(()=>{
			if(view && layers.length >0){
				drawViewModel.update(view);
				renderTemplatePicker();
			}
		},[view,layers.length,drawViewModel,renderTemplatePicker]);

		useEffect(()=>{
			if(drawViewModel){
				drawViewModel.on("feature-added",(graphic:__esri.Graphic)=>{
					const _gra = graphic.clone();
					clearSelectedTemplate(true);
					if(onFeatureAdded){
						_gra.attributes = selectedTemplateItem.template.prototype.attributes;
						onFeatureAdded({features:[graphic],layer:selectedTemplateItem.layer})
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
				
				//detach map click
			}else{
				console.log("draw deactivated")
				//attach map click
				if(clickHandle){
					clickHandle.remove();
				}
				clickHandle=view.on("click",()=>{
					console.log("Click to edit")
					//query features on click, to edit
				});
			}
		},[activated])
		
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