import {useEffect,useState} from "react";
import {CalcitePanel} from "@esri/calcite-components-react/dist/components";
import XYEditor from "./_Editor"


interface FeatureVerticesEditorProps{
	layer:__esri.FeatureLayer,
	feature:__esri.Graphic
}

const FeatureVerticesEditor = (props:FeatureVerticesEditorProps) => {
	const {layer,feature} = props;
	const [vertices,setVertices] = useState<[[]]>([[]]);
	
	useEffect(()=>{
		if(feature && feature.geometry.type.includes('polygon')){
			const rings =feature.geometry.toJSON()["rings"][0];
			setVertices((_vertices)=>{
				if(_vertices.length !== rings){
					return rings;
				}
			});
			
			//I AM HERE:: ARREST THE INFINITE RENDER
		}
	},[layer,feature, vertices]);

	const handleVertexRemove = ()=>{

	}

	const getXYEditors = () =>{
		return vertices.map((xySet:any,index:number)=>{
			return <XYEditor x={xySet[0]} onRemoved={handleVertexRemove} y={xySet[1]} index={index} key={index}/>
		})
	}

	
	return  (
		<CalcitePanel className="web-editor-vertices-editor">
			{getXYEditors()}
		</CalcitePanel>
	)
}

export default FeatureVerticesEditor;