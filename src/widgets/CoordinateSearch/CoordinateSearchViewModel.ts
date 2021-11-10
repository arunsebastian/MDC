import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import CoordinateConversionViewModel from "@arcgis/core/widgets/CoordinateConversion/CoordinateConversionViewModel"
import Format from "@arcgis/core/widgets/CoordinateConversion/support/Format";
import Conversion from "@arcgis/core/widgets/CoordinateConversion/support/Conversion";

import Point from "@arcgis/core/geometry/Point";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
// import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import * as projection from "@arcgis/core/geometry/projection";

import {whenOnce,whenTrueOnce} from "@arcgis/core/core/watchUtils";



interface CoordinateSearchViewModelProperties extends  __esri.CoordinateConversionViewModelProperties{}

@subclass("CoordinateSearchViewModel")
export default class CoordinateSearchViewModel extends CoordinateConversionViewModel{
    constructor(params:CoordinateSearchViewModelProperties) {
		super(params);
        this.set(params);
        whenTrueOnce(this.view, "ready").then(() => {
            projection.load().then(()=>{
                this.updateFormatsAndConversions();
            });
		});
	}
    // updating formats/conversions
    updateFormatsAndConversions =() =>{
        if(this.formats.length === 0){
            whenOnce(this, "formats.length", () => {
                this._update();
            });
        }else{
            this._update();
        }
    }

    private _update =() =>{
        const wgs84Format = this._getWgsFormat();
        const wgs84Conversion = new Conversion({
            format:wgs84Format
        });
        const nztmFormat = this._getNZTMFormat();
        const nztmConversion = new Conversion({
            format:nztmFormat
        });
        this.formats.splice(0,this.formats.length,wgs84Format,nztmFormat);
        this.conversions.splice(0,this.conversions.length,wgs84Conversion,nztmConversion);
    }
    
    private _getWgsFormat = () =>{
        const sourceSR = new SpatialReference({ wkid: this.view.spatialReference.wkid } as any);
        const targetSR = new SpatialReference({ wkid: 4326 } as any);
        const numberSearchPattern:any = /-?\d+[\.]?\d*/;
        const conversionInfo:any = this._getConversionInfo(sourceSR,targetSR);
        const props:__esri.FormatProperties = {
            name: "WGS84",
            conversionInfo:conversionInfo,
            // Define each segment of the coordinate
            coordinateSegments: [
              {
                alias: "Longitude",
                description: "longitude",
                searchPattern: numberSearchPattern
              },
              {
                alias: "Latitude",
                description: "latitude",
                searchPattern: numberSearchPattern
              },
              
            ],
            defaultPattern: "Longitude°, Latitude°"
          };
        return new Format(props);
    }
    
    private _getNZTMFormat = () =>{
        const sourceSR = new SpatialReference({ wkid: this.view.spatialReference.wkid } as any);
        const targetSR = new SpatialReference({ wkid: 2193 } as any);
        const numberSearchPattern:any = /-?\d+[\.]?\d*/;
        const conversionInfo:any = this._getConversionInfo(sourceSR,targetSR);
        const props:__esri.FormatProperties = {
            name: "NZTM",
            conversionInfo:conversionInfo,
            // Define each segment of the coordinate
            coordinateSegments: [
              {
                alias: "X",
                description: "easting",
                searchPattern: numberSearchPattern
              },
              {
                alias: "Y",
                description: "northing",
                searchPattern: numberSearchPattern
              },
              
            ],
            defaultPattern: "X, Y"
          };
        return new Format(props);
    }
    private _getConversionInfo = (sourceSR:SpatialReference,targetSR:SpatialReference)=>{
        return {
            spatialReference: targetSR,
            convert: (point:Point) => {
                const returnPoint = (point.spatialReference.wkid === targetSR.wkid
                  ? point
                  : projection.project(point,targetSR))as Point;
                const x = returnPoint.x.toFixed(4);
                const y = returnPoint.y.toFixed(4);
                return {
                  location: returnPoint,
                  coordinate: `${x}, ${y}`
                };
            },
            reverseConvert: (convString:string) =>{
                const parts = convString.split(",");
                const pt=  new Point({
                    x: parseFloat(parts[0]),
                    y: parseFloat(parts[1]),
                    z: parseFloat(parts[2]),
                    spatialReference: targetSR
                });
                return projection.project(pt,sourceSR);
            }
        }
    }
}