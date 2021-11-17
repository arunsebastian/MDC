import {whenTrueOnce} from "@arcgis/core/core/watchUtils"
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import Point from "@arcgis/core/geometry/Point";

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

export const topologicalSort = (points:any,wkid?:number) => {
    // A custom sort function that sorts p1 and p2 based on their slope
    // that is formed from the upper most point from the array of points.
    // Find the upper most point. In case of a tie, get the left most point.
    let asGeometry = true;
    if(points instanceof Array){
        if(points[0] instanceof Array){
            asGeometry = false;
            points = points.map((pt:any)=>{
                return new Point({x:pt[0],y:pt[1],spatialReference:{wkid:wkid?wkid:2193}});
            });
        }
    }

    const _upperLeft = (points:__esri.Point[])=> {
        let top = points[0];
        for (let i = 1; i < points.length; i++) {
            let temp = points[i];
            if (temp.y > top.y || (temp.y == top.y && temp.x < top.x)) {
                top = temp;
            }
        }
        return top;
    }
    const _slope = (pt1:__esri.Point, pt2:__esri.Point) => {
        let dX = pt2.x - pt1.x;
        let dY = pt2.y - pt1.y;
        return dY / dX;
    }
    const _distance =  (pt1:__esri.Point, pt2:__esri.Point) => {
        let dX = pt2.x - pt1.x;
        let dY = pt2.y - pt1.y;
        return Math.sqrt((dX * dX) + (dY * dY));
    }
    const _pointSort = (p1:__esri.Point, p2:__esri.Point) => {
        // Exclude the 'upper' point from the sort (which should come first).
        if (p1 == upper) return -1;
        if (p2 == upper) return 1;

        // Find the slopes of 'p1' and 'p2' when a line is 
        // drawn from those points through the 'upper' point.
        let m1 = _slope(upper, p1);
        let m2 = _slope(upper, p2);

        // 'p1' and 'p2' are on the same line towards 'upper'.
        if (m1 == m2) {
            // The point closest to 'upper' will come first.
            return _distance(p1, upper) < _distance(p2, upper) ? -1 : 1;
        }

        // If 'p1' is to the right of 'upper' and 'p2' is the the left.
        if (m1 <= 0 && m2 > 0) return -1;

        // If 'p1' is to the left of 'upper' and 'p2' is the the right.
        if (m1 > 0 && m2 <= 0) return 1;

        // It seems that both slopes are either positive, or negative.
        return m1 > m2 ? -1 : 1;

    }
    let upper = _upperLeft(points);
    points.sort(_pointSort);
    if(!asGeometry){
        points = points.map((pt:__esri.Point)=>{
            return [pt.x,pt.y]
        });
    }
    return points;
}
