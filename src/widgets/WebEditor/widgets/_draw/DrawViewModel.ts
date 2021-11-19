import Accessor from "@arcgis/core/core/Accessor";
import {EventedMixin} from "../../EventedMixin";

import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";

import { subclass} from "@arcgis/core/core/accessorSupport/decorators";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

interface DrawViewModelProperties{
	view?:__esri.MapView;
	sketch?:__esri.SketchViewModel
}


@subclass("DrawViewModel")
export default class DrawViewModel extends EventedMixin(Accessor){
	view:__esri.MapView=undefined;
	sketch:__esri.SketchViewModel=undefined;
	sketchLayerTitle:string="sketch";
	layer:__esri.GraphicsLayer = new GraphicsLayer({title:this.sketchLayerTitle});
	handles:{}={}
    constructor(params:DrawViewModelProperties) {
		super(params);
        this.set(params);
		if(this.get("view")){
			this.start();
		}
	}
	start = () =>{
		this._addLayer();
		if(this.get("sketch")){
			this.destroy();
		}
		this.set("sketch",new SketchViewModel({
			view:this.view,
			layer: this.layer,
			defaultCreateOptions: {
				mode:"click"
			}
		}));
		this.handles ={
			"create":this.sketch.on("create", (info:any)=> {
				if(info.state === 'complete' && info.graphic){
					this.emit("feature-added",info.graphic);
				}
			})
		};
	}
	update = (view:__esri.MapView) =>{
		this.set("view",view);
		this.start();
	}
	isReady=()=>{
		return this.get("view") && this.get("sketch");
	}
	_addLayer =() =>{
		const layer = this.view.map.allLayers.find((layer:__esri.Layer)=> layer.title === this.sketchLayerTitle)
		if(!layer){
			this.view.map.add(this.layer)
		}
	}
	_removeLayer =() =>{
		const layer = this.view.map.allLayers.find((layer:__esri.Layer)=> layer.title === this.sketchLayerTitle)
		if(layer){
			this.view.map.remove(layer)
		}
	}
	_clearLayer = () =>{
		const layer = this.view.map.allLayers.find((layer:__esri.Layer)=> layer.title === this.sketchLayerTitle) as __esri.GraphicsLayer;
		if(layer){
			layer.removeAll();
		}
	}
	_removeEventHandles = () =>{
		for(let key in this.handles){
			this.handles[key].remove();
		}
	}
	_getInternalDrawSymbology =(layer:__esri.FeatureLayer) =>{
		const geometryString = layer.geometryType;
		let symbol = null;
		if(geometryString){
			if(geometryString.includes("polygon")){
				symbol = this.sketch.get("polygonSymbol") || this.sketch.get("updatePolygonSymbol");
			}else if(geometryString.includes("line")){
				symbol = this.sketch.get("polylineSymbol") || this.sketch.get("updatePolylineSymbol");
			}else if(geometryString.includes("point")){
				symbol = this.sketch.get("pointSymbol") || this.sketch.get("updatePointSymbol");
			}
		}
		return symbol;
	}

	activateDraw = (templateItem:__esri.TemplateItem)=>{
		this._clearLayer();
		const templateLayer = templateItem.layer;
		let symbol = ((templateLayer.renderer) as any).symbol;
		let key = "polygonSymbol"
		const geometryString = templateLayer.geometryType as any;
		if(geometryString.includes("line")){
			key = "polylineSymbol";
		}else if(geometryString.includes("point")){
			key = "pointSymbol";
		}
		if(!symbol){
			if(templateLayer.typeIdField){
				const typeValue = templateItem.template.prototype.attributes[templateLayer.typeIdField];
				const renderer = templateLayer.renderer as any;
				let rendererInfos = renderer.uniqueValueInfos|| renderer.classBreakInfos;
				if(rendererInfos.length >0){
					const rInfo = rendererInfos.find((info:any)=>{
						return info.value == typeValue;
					});
					symbol =  rInfo?.symbol;
				}else{
					symbol = this._getInternalDrawSymbology(templateLayer)
				}
			}else{
				symbol = this._getInternalDrawSymbology(templateLayer)
			}
			if(!symbol){
				symbol = this._getInternalDrawSymbology(templateLayer)
			}
		}
		this.sketch.set(key,symbol);
		this.sketch.create(geometryString);
	}
	deactivateDraw = () =>{
		this.sketch.cancel();
		this._clearLayer();
	}

	destroy = () =>{
		this._clearLayer();
		this._removeLayer();
		this._removeEventHandles();
		this.sketch.destroy();
	}
}