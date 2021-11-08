import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import EditorViewModel from "@arcgis/core/widgets/Editor/EditorViewModel"
import {whenTrueOnce} from "@arcgis/core/core/watchUtils";


interface EsriEditorViewModelProperties extends  __esri.EditorViewModelProperties{}

@subclass("EsriEditorViewModel")
export default class EsriEditorViewModel extends EditorViewModel{
	constructor(params:EsriEditorViewModelProperties) {
		super(params);
		this.set(params);
		whenTrueOnce(this.view, "ready").then(() => {
			const featureLayers = this.view.map.allLayers.filter((layer:__esri.Layer) => {
				return layer.type === 'feature'; 
			});
			this._waitForLayerLoad().then(()=>{
				const layerInfos = featureLayers.map((fLayer:any)=>{
					return {layer:fLayer,fieldConfig:this._getFieldConfig(fLayer as __esri.FeatureLayer)}
				}).toArray();
				this.set("layerInfos",layerInfos);
			});
		});
	}
	 _waitForLayerLoad= ()=>{
		const featureLayers = this.view.map.allLayers.filter((layer:__esri.Layer) => {
			return layer.type === 'feature'; 
		});
		const loadPromises = featureLayers.map((layer:__esri.Layer)=>{
			return this._isLayerLoaded(layer as __esri.FeatureLayer)
		});
		return Promise.all(loadPromises);
	}
	_isLayerLoaded=(layer:__esri.FeatureLayer)=>{
		return new Promise((resolve:Function,reject:Function)=>{
			whenTrueOnce(layer,"loaded",()=>{
				resolve(true);
			});
		});
	}
	_getFieldConfig=(layer:__esri.FeatureLayer)=>{
		if(layer?.popupTemplate){
			const popupTemplate = layer.popupTemplate;
			return popupTemplate.fieldInfos.map((info:__esri.FieldInfo)=>{
				return {name:info.fieldName,label:info.label}
			});
		}
		return null;
	}
}