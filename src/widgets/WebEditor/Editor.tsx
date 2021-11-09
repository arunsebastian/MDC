import react,{useEffect, useState } from "react";
import { 
	CalciteTabs, CalciteTab, 
	CalciteTabNav, CalciteTabTitle 
} from "@esri/calcite-components-react/dist/components";


import "./Editor.scss";

interface EditorProps{
	view?:__esri.MapView,
	startupAsDraw?:boolean
}
const Editor = (props:EditorProps) => {
		const [drawActive,setDrawActive] = useState<boolean>(true);

		const activateDraw = () =>{
			setDrawActive(true);
		}

		const activateEdit =() =>{
			setDrawActive(false);
		}

		useEffect(()=>{
			if(!props.startupAsDraw){
				activateEdit();
			}
		},[props])

		return  (
			<CalciteTabs className="web-editor" bordered={true}>
				<CalciteTabNav slot="tab-nav">
					<CalciteTabTitle className= "web-editor-title-l1" onClick={activateDraw} is-active={drawActive}> Draw Feature</CalciteTabTitle>
					<CalciteTabTitle className= "web-editor-title-l1" onClick={activateEdit} is-active={!drawActive}>Edit Feature</CalciteTabTitle>
				</CalciteTabNav>
				<CalciteTab is-active={drawActive}>Hello worldy</CalciteTab>
				<CalciteTab is-active={!drawActive}>Hello worldy1</CalciteTab>
			</CalciteTabs>
  		)
}
Editor.defaultProps ={
	startupAsDraw:true
} as EditorProps;

export default Editor;