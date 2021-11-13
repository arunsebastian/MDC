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
	onFeatureAdded?:(info:AddFeatureInfo)=>void
}

const Draw = (props:DrawProps) => {
		const drawRef = useRef<HTMLCalciteBlockElement>()
		const {view,layers,onFeatureAdded} = props;
		const [templatePicker,setTemplatePicker]  = useState<__esri.FeatureTemplates|null>(null)
		
		//the following doesnt need to be a  state param as its not a dependancy
		let selectedTemplateItem:__esri.TemplateItem | null= null;
		const drawViewModel = new DrawViewModel({view:null});
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
							if(!drawViewModel.isReady()){
								drawViewModel.update(view);
							}
							drawViewModel.activateDraw(templateInfo.template.drawingTool);
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
					if(onFeatureAdded){
						_gra.attributes = selectedTemplateItem.template.prototype.attributes;
						onFeatureAdded({features:[graphic],layer:selectedTemplateItem.layer})
					}
					clearSelectedTemplate(true);
				});
			}
		},[drawViewModel]);
		
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