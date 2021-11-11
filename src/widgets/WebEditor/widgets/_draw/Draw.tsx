import {useEffect,useRef,useCallback, useState} from "react";
import {CalcitePanel} from "@esri/calcite-components-react/dist/components";
import FeatureTemplates from "@arcgis/core/widgets/FeatureTemplates";
import FeatureTemplatesViewModel from "@arcgis/core/widgets/FeatureTemplates/FeatureTemplatesViewModel";
import DrawViewModel from "./DrawViewModel";
import "./Draw.scss";

interface DrawProps{
	view:__esri.MapView,
	layers:__esri.FeatureLayer[]
}
const Draw = (props:DrawProps) => {
		const drawRef = useRef<HTMLCalciteBlockElement>()
		const {view,layers} = props;
		
		//the following doesnt need to be a  state param as its not a dependancy
		let selectedTemplateItem:__esri.TemplateItem | null= null;
		const drawViewModel = new DrawViewModel({view:null});

		const clearSelectedTemplate = (templatePicker:any,keepHistory?:boolean) =>{
			const selectedNode = drawRef.current.querySelector("li.esri-item-list__list-item--selected");
			if(selectedNode){
				selectedNode.classList.add("un-selected");
				(document.activeElement as any).blur();
				(view as any).surface.focus();
			}
			if(!keepHistory){
				selectedTemplateItem = null;
			}
			templatePicker.viewModel.refresh();
			drawViewModel.deactivateDraw();
		}
		const styleSelectedTemplate =() =>{
			const selectedNode = drawRef.current.querySelector("li.esri-item-list__list-item--selected");
			if(selectedNode){
				selectedNode.classList.remove("un-selected");
			}
		}
		useEffect(()=>{
			if(view && layers.length >0 && drawRef.current){
				drawViewModel.update(view);
				if(drawRef.current){
					drawRef.current.replaceChildren();
				}
				const templatePicker = new FeatureTemplates({
					container: drawRef.current,
					viewModel: new FeatureTemplatesViewModel({
						layers:layers
					})
				});
				templatePicker.on("select",(templateInfo:any)=>{
					styleSelectedTemplate();
					const clickedItem = templateInfo.item;
					if(!selectedTemplateItem || (clickedItem.layer.uid !== (selectedTemplateItem.layer as any).uid)){
						selectedTemplateItem = clickedItem;
						if(templateInfo?.template.drawingTool && drawViewModel){
							drawViewModel.activateDraw(templateInfo.template.drawingTool);
						}
					}else{
						clearSelectedTemplate(templatePicker,false)
					}
				});
				drawViewModel.update(view);
			}
		},[view,layers.length]);

		useEffect(()=>{
			if(drawViewModel){
				drawViewModel.on("feature-added",(graphic)=>{
					console.log(graphic)
					//clearSelectedTemplate(true)
				});
				drawViewModel.on("feature-updated",(graphic)=>{
					console.log(graphic)
				})
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