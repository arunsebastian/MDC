import {useEffect,useState} from "react";
import {CalcitePanel} from "@esri/calcite-components-react/dist/components";
import XYEditor from "./XYEditor"
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
import Point from "@arcgis/core/geometry/Point";
import * as esriLang from "@arcgis/core/core/lang";


interface FeatureVerticesEditorProps{
	feature:__esri.Graphic,
	onVertexEdited:(feature:__esri.Graphic) => void;
}

const FeatureVerticesEditor = (props:FeatureVerticesEditorProps) => {
	const {feature,onVertexEdited} = props;
	const [vertices,setVertices] = useState<[]>([]);

	const getVertices = (feature:__esri.Graphic) =>{
		let vertices = [];
		const geomAsJson = feature.geometry.toJSON();
		if(feature.geometry.type.includes("polygon")){
			vertices = geomAsJson["rings"][0];
			vertices.splice(-1);
		}else if(feature.geometry.type.includes("line")){
			vertices = geomAsJson["paths"][0];
		}else{
			//points
			vertices= [[geomAsJson.x,geomAsJson.y]];
		}
		return vertices;
	}
	
	useEffect(()=>{
		if(feature){
			const verticesOfFeature:any = getVertices(feature);
			setVertices((_vertices)=>{
				if(JSON.stringify(_vertices) !== JSON.stringify(verticesOfFeature)){
					return verticesOfFeature;
				}
				return _vertices;
			});
		}else{
			setVertices([])
		}
	},[feature]);

	const isDeleteAllowed = () =>{
		if(feature && feature.geometry.type.includes("polygon")){
			return vertices.length > 3;
		}else if(feature && feature.geometry.type.includes("line")){
			return vertices.length > 2;
		}else{
			return false;
		}
	}

	const handleVertexRemove = (index:number)=>{
		const _vertices = esriLang.clone(vertices);
		if(feature && feature.geometry.type.includes("polygon")){
			_vertices.splice(index,1);
			_vertices.push(vertices[0]);
			const polygon = new Polygon({
				rings: [_vertices],
				spatialReference: { wkid: feature.geometry.spatialReference.wkid }
			});
			if(onVertexEdited){
				onVertexEdited(new Graphic({attributes:feature.attributes,geometry:polygon,symbol:feature.symbol}));
			}
			
		}else if(feature && feature.geometry.type.includes("line")){
			vertices.splice(index,1);
			const polyline = new Polyline({
				paths: [_vertices],
				spatialReference: { wkid: feature.geometry.spatialReference.wkid }
			});
			if(onVertexEdited){
				onVertexEdited(new Graphic({attributes:feature.attributes,geometry:polyline,symbol:feature.symbol}));
			}
		}
	}

	const getXYEditors = () =>{
		return vertices.map((xySet:any,index:number)=>{
			return <XYEditor deleteAllowed={isDeleteAllowed()} x={xySet[0]}  y={xySet[1]} onRemoved={handleVertexRemove} index={index} key={index}/>
		})
	}

	
	return  (
		<CalcitePanel className="web-editor-vertices-editor">
			{getXYEditors()}
		</CalcitePanel>
	)
}

export default FeatureVerticesEditor;