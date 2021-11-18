import {useEffect} from "react";
import {CalciteInput,CalciteButton,CalciteAction, CalciteActionMenu} from "@esri/calcite-components-react/dist/components";



interface XYEditorProps{
	x:number;
	y:number;
	index:number;
	deleteAllowed:boolean;
	onDeleteClicked:(index:number) => void;
}

const XYEditor = (props:XYEditorProps) => {
	const {x,y,index,deleteAllowed,onDeleteClicked} = props;

	const handleClick = () =>{
		onDeleteClicked(index);
	}

	useEffect(()=>{
		
	},[props]);

	
	return  (
		<div className="web-editor-vertices-inputs">
			<CalciteInput style={{"width":'45%'}} type="number" numberButtonType="none" value={x? x.toString():""}/>
			<CalciteInput style={{"width":'45%'}} type="number" numberButtonType="none" value={y? y.toString():""}/>
			{/* <CalciteActionMenu label="" scale="s">
				<CalciteAction text="Add" icon="plus"></CalciteAction>
  				<CalciteAction text="Save" icon="save"></CalciteAction>
			</CalciteActionMenu> */}
			<CalciteButton scale="s" hidden={!deleteAllowed} onClick={handleClick} alignment="center" appearance="outline" color="red" icon-start="minus"></CalciteButton>
		</div>
	)
}

XYEditor.defaultProps ={
	deleteAllowed:true
} as XYEditorProps;

export default XYEditor;