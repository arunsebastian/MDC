import Accessor from "@arcgis/core/core/Accessor";
import {EventedMixin} from "../../EventedMixin";

import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";

import { subclass} from "@arcgis/core/core/accessorSupport/decorators";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

interface EditViewModelProperties{
	view?:__esri.MapView;
}


@subclass("EditViewModel")
export default class EditViewModel extends EventedMixin(Accessor){
	view:__esri.MapView=undefined;
	sketch:__esri.SketchViewModel=undefined;
	sketchLayerTitle:string="sketch";
	layer:__esri.GraphicsLayer = new GraphicsLayer({title:this.sketchLayerTitle});
	handles:{}={}
    constructor(params:EditViewModelProperties) {
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
			defaultUpdateOptions:{
				tool:'reshape',
				enableScaling: true,
				preserveAspectRatio: true,
				toggleToolOnClick:true,
				reshapeOptions:{
					vertexOperation:"move-xy"
				}
			}
		}));
		this.handles ={
			"update":this.sketch.on("update", (info:any)=> {
				if(info.toolEventInfo?.type.includes("stop")){
					this.emit("feature-updated",info.graphics[0]);
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
	activateEdit = (layer:__esri.FeatureLayer,feature:__esri.Graphic)=>{
		this._clearLayer();
		this.layer.graphics.add(feature);
		const geometryString = feature.geometry.type;
		if(layer){
			let key = "polygonSymbol"
			if(geometryString.includes("line")){
				key = "polylineSymbol";
			}else if(geometryString.includes("point")){
				key = "pointSymbol";
			}
			this.sketch.set(key,((layer.renderer) as any).symbol)
		}
		this.sketch.update(feature);
	}
	deactivateEdit= () =>{
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