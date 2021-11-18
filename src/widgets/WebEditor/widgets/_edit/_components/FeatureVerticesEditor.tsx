import {useEffect,useRef,useState} from "react";
import {CalcitePanel,CalciteModal,CalciteButton} from "@esri/calcite-components-react/dist/components";
import XYEditor from "./XYEditor"
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
import Point from "@arcgis/core/geometry/Point";
import * as esriLang from "@arcgis/core/core/lang";
import {topologicalSort} from "../../../../../utils/MapUtils";
import "./FeatureVerticesEditor.scss";


interface FeatureVerticesEditorProps{
	feature:__esri.Graphic,
	view:__esri.MapView,
	onVertexEdited:(feature:__esri.Graphic) => void;
}

const FeatureVerticesEditor = (props:FeatureVerticesEditorProps) => {
	const {feature,view,onVertexEdited} = props;
	const [vertices,setVertices] = useState<number[][]>([]);
	const [editedVertexIndex,setEditedVertexIndex]=useState<number>(-1);
	const vertexDeleteRef = useRef<HTMLCalciteModalElement>(null);

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
	
	const isDeleteAllowed = () =>{
		if(feature && feature.geometry.type.includes("polygon")){
			return vertices.length > 3 && vertices.every((vertex:number[])=>{ return  vertex[0] !==0 && typeof(vertex[0]) ==='number'   &&  vertex[1] !==0 && typeof(vertex[1]) ==='number' });
		}else if(feature && feature.geometry.type.includes("line")){
			return vertices.length > 2 && vertices.every((vertex:number[])=>{ return  vertex[0] !==0 && typeof(vertex[0]) ==='number'   &&  vertex[1] !==0 && typeof(vertex[1]) ==='number' });
		}else{
			return false;
		}
	}

	const proceedVertexRemove = ()=>{
		const index = editedVertexIndex;
		setEditedVertexIndex(-1);
		if(vertexDeleteRef.current){
			vertexDeleteRef.current.removeAttribute("active");
		}
		if(index > -1){
			let _vertices = esriLang.clone(vertices);
			if(feature && feature.geometry.type.includes("polygon")){
				_vertices.splice(index,1);
				_vertices.push(_vertices[0]);
				const polygon = new Polygon({
					rings: [_vertices],
					spatialReference: { wkid: feature.geometry.spatialReference.wkid }
				});
				if(onVertexEdited){
					onVertexEdited(new Graphic({attributes:feature.attributes,geometry:polygon,symbol:feature.symbol}));
				}
				
			}else if(feature && feature.geometry.type.includes("line")){
				_vertices.splice(index,1);
				const polyline = new Polyline({
					paths: [_vertices],
					spatialReference: { wkid: feature.geometry.spatialReference.wkid }
				});
				if(onVertexEdited){
					onVertexEdited(new Graphic({attributes:feature.attributes,geometry:polyline,symbol:feature.symbol}));
				}
			}
		}
		
	}

	const proceedWithVertexUpdate =(index:number,xy:number[]) =>{
		if(index > -1){
			let _vertices = esriLang.clone(vertices);
			if(feature && feature.geometry.type.includes("polygon")){
				_vertices.splice(index, 1, xy);
				_vertices.push(_vertices[0]);
				const polygon = new Polygon({
					rings: [_vertices],
					spatialReference: { wkid: feature.geometry.spatialReference.wkid }
				});
				if(onVertexEdited){
					onVertexEdited(new Graphic({attributes:feature.attributes,geometry:polygon,symbol:feature.symbol}));
				}
				
			}else if(feature && feature.geometry.type.includes("line")){
				_vertices.splice(index, 1, xy);
				const polyline = new Polyline({
					paths: [_vertices],
					spatialReference: { wkid: feature.geometry.spatialReference.wkid }
				});
				if(onVertexEdited){
					onVertexEdited(new Graphic({attributes:feature.attributes,geometry:polyline,symbol:feature.symbol}));
				}
			}else if(feature && feature.geometry.type.includes("point")){
				_vertices.splice(index, 1, xy);
				const point = new Point({
					x:xy[0],
					y:xy[1],
					spatialReference: { wkid: feature.geometry.spatialReference.wkid }
				});
				if(onVertexEdited){
					onVertexEdited(new Graphic({attributes:feature.attributes,geometry:point,symbol:feature.symbol}));
				}
			}
		}
	}

	const validateVertexUpdate =(index:number,xy:number[]) =>{
		if (view.map.basemap.baseLayers.length) {
			const updatedPt = new Point({x:xy[0],y:xy[1],spatialReference:{
				wkid:feature.geometry.spatialReference.wkid
			}});
			const validateExtent:__esri.Extent = view.map.basemap.baseLayers.getItemAt(0).fullExtent;
			if(validateExtent && validateExtent.contains(updatedPt)){
				proceedWithVertexUpdate(index,xy)
				setEditedVertexIndex(index);
			}
		}
	}

	const getXYEditors = () =>{
		return vertices.map((xySet:any,index:number)=>{
			return <XYEditor 
					x={xySet[0]}  
					y={xySet[1]}
					onVertexEdits={validateVertexUpdate}
					deleteAllowed={isDeleteAllowed()}  
					onDeleteClicked={confirmDeleteOfVertex} index={index} key={index}/>
		})
	}

	const confirmDeleteOfVertex = (index:number) =>{
		setEditedVertexIndex(index);
		if(vertexDeleteRef.current){
			vertexDeleteRef.current.setAttribute("active","true");
		}
	}

	const continueVertexEditing=()=>{
		setEditedVertexIndex(-1);
		if(vertexDeleteRef.current){
			vertexDeleteRef.current.removeAttribute("active");
		}
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

	
	return  (
		<CalcitePanel className="web-editor-vertices-editor">
			{getXYEditors()}
			<CalciteModal ref={vertexDeleteRef} scale="s" width="s">
				<div slot="header" >Confirm</div>
				<div slot="content">
					Are you sure you want to delete the vertex?
				</div>
				<CalciteButton slot="secondary" width="full" onClick={continueVertexEditing} appearance="outline">No</CalciteButton>
				<CalciteButton slot="primary" width="full" onClick={proceedVertexRemove}>Yes</CalciteButton>
			</CalciteModal>
		</CalcitePanel>
	)
}

export default FeatureVerticesEditor;