import {useEffect} from "react";
import {CalciteInput,CalciteButton} from "@esri/calcite-components-react/dist/components";



interface XYEditorProps{
	x:number;
	y:number;
	index:number;
	deleteAllowed:boolean;
	onRemoved:(index:number) => void;
}

const XYEditor = (props:XYEditorProps) => {
	const {x,y,index,deleteAllowed,onRemoved} = props;

	const handleClick = () =>{
		onRemoved(index);
	}

	useEffect(()=>{
		
	},[props]);

	
	return  (
		<div className="web-editor-vertices-inputs">
			<CalciteButton hidden={!deleteAllowed} onClick={handleClick} alignment="center" appearance="outline" color="red" icon-start="minus"></CalciteButton>
			<CalciteInput style={{"width":'45%'}} type="number" numberButtonType="none" value={x? x.toString():""}/>
			<CalciteInput style={{"width":'45%'}} type="number" numberButtonType="none" value={y? y.toString():""}/>
		</div>
	)
}

XYEditor.defaultProps ={
	deleteAllowed:true
} as XYEditorProps;

export default XYEditor;