import {useEffect,useRef,useCallback} from "react";
import {CalcitePanel} from "@esri/calcite-components-react/dist/components";
import FeatureTemplates from "@arcgis/core/widgets/FeatureTemplates";

import "./Draw.scss";

interface DrawProps{
	view:__esri.MapView,
	layers:__esri.FeatureLayer[]
}
const Draw = (props:DrawProps) => {
		const drawRef = useRef<HTMLCalciteBlockElement>()
		const {view,layers} = props;
		const renderDrawWidget = useCallback(() =>{
			new FeatureTemplates({
				container: drawRef.current,
				layers: layers
			});
		},[layers])

		useEffect(()=>{
			if(view && layers.length >0){
				renderDrawWidget();
			}
		},[props,view,layers.length,renderDrawWidget]);
		return  (
			<CalcitePanel className="web-editor-draw">
				<CalcitePanel ref={drawRef} className="web-editor-draw-template w-100"/>
				{/* CalciteActionPad is provisioned for shape selectors -for sketching for future*/}
				{/* <CalciteActionPad 
					expandDisabled={true} 
					layout="horizontal"
					className="web-editor-draw-actionpad w-100">
				</CalciteActionPad> */}
			</CalcitePanel>
  		)
}

export default Draw;