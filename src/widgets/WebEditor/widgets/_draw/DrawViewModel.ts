import Accessor from "@arcgis/core/core/Accessor";
import {EventedMixin} from "../../EventedMixin";

import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";

import { subclass} from "@arcgis/core/core/accessorSupport/decorators";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { whenDefinedOnce } from "@arcgis/core/core/watchUtils";

interface DrawViewModelProperties{
	view?:__esri.MapView;
	sketch?:__esri.SketchViewModel
}


@subclass("DrawViewModel")
export default class DrawViewModel extends EventedMixin(Accessor){
	view:__esri.MapView=undefined;
	sketch:__esri.SketchViewModel=undefined;
	sketchLayerTitle:string="sketch";
	layer:__esri.GraphicsLayer = new GraphicsLayer({title:this.sketchLayerTitle})
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
			},
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
		this.sketch.on("create", (info:any)=> {
			if(info.state === 'complete' && info.graphic){
				this.sketch.update(info.graphic);
				this.emit("feature-added",info.graphic);
			}
		});
		this.sketch.on("update", (info:any)=> {
			if(info.toolEventInfo?.type.includes("stop") && info.graphic){
				this.emit("feature-updated",info.graphic);
			}
		});
	}
	update = (view:__esri.MapView) =>{
		this.set("view",view);
		this.start();
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
	activateDraw = (geometryString:any)=>{
		this._clearLayer();
		this.sketch.create(geometryString);
	}
	deactivateDraw = () =>{
		this.sketch.cancel();
		this._clearLayer();
	}

	destroy = () =>{
		this._clearLayer();
		this._removeLayer();
		this.sketch.destroy();
	}
}