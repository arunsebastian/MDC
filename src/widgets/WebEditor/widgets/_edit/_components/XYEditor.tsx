import {useEffect,useRef} from "react";
import {CalciteInput,CalciteButton,CalciteAction, CalciteActionMenu} from "@esri/calcite-components-react/dist/components";
import * as promiseUtils from "@arcgis/core/core/promiseUtils"
interface XYEditorProps{
	x:number;
	y:number;
	index:number;
	deleteAllowed:boolean;
	onVertexEdits:(index:number,set:number[]) => void;
	onDeleteClicked:(index:number) => void;
}

const XYEditor = (props:XYEditorProps) => {
	const xRef = useRef<HTMLCalciteInputElement>();
	const yRef = useRef<HTMLCalciteInputElement>();
	const {x,y,index,deleteAllowed,onVertexEdits,onDeleteClicked} = props;

	const handleClick = () =>{
		onDeleteClicked(index);
	}

	const handleVertexEdits = promiseUtils.debounce(() =>{
		let _x = Number(xRef.current?.value);
		let _y = Number(yRef.current?.value);
	
		if( Math.abs(_x) > 0  && Math.abs(_y) > 0  && ((_x !== x) || (_y !==y))){
			if(onVertexEdits){
				onVertexEdits(index,[_x,_y])
			}
		}
	});

	useEffect(()=>{
		
	},[props]);

	
	return  (
		<div className="web-editor-vertices-inputs">
			<CalciteInput onKeyUp={handleVertexEdits} ref={xRef} required={true} style={{"width":'45%'}} type="number" numberButtonType="none" value={x? x.toString():""}/>
			<CalciteInput onKeyUp={handleVertexEdits} ref={yRef} required={true} style={{"width":'45%'}} type="number" numberButtonType="none" value={y? y.toString():""}/>
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