import {useEffect} from "react";
import {CalciteInput,CalciteButton} from "@esri/calcite-components-react/dist/components";



interface _EditorProps{
	x:number,
	y:number,
	index:number
	onRemoved:(index:number)=> void;
}

const _Editor = (props:_EditorProps) => {
	const {x,y,index,onRemoved} = props;

	const handleClick = () =>{
		onRemoved(index);
	}

	useEffect(()=>{
		
	},[props]);

	
	return  (
		<div className="web-editor-vertices-inputs">
			<CalciteButton onClick={handleClick} alignment="center" appearance="outline" color="red" icon-start="minus"></CalciteButton>
			<CalciteInput style={{"width":'45%'}} type="number" numberButtonType="none" value={x? x.toString():""}/>
			<CalciteInput style={{"width":'45%'}} type="number" numberButtonType="none" value={y? y.toString():""}/>
		</div>
	)
}

export default _Editor;