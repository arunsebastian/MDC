import {whenTrueOnce} from "@arcgis/core/core/watchUtils"
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import { resolve } from "esri/core/promiseUtils";

const _waitLoad= async(layer:__esri.FeatureLayer)=>{
    return promiseUtils.create((resolve:Function,reject:Function)=>{
        whenTrueOnce(layer,"loaded",()=>{
            resolve(layer);
        });
    });
}
export const waitForFeatureLayersLoad = (view:__esri.MapView) =>{
  let featureLayers = view.map.allLayers.filter((layer:__esri.Layer) => {
    return layer.type === 'feature'; 
  }).toArray()  as __esri.FeatureLayer[];
  return promiseUtils.eachAlways(featureLayers.map((layer:__esri.FeatureLayer) => {
      return _waitLoad(layer);
  })).then(()=>{
      return featureLayers;
  })
}
