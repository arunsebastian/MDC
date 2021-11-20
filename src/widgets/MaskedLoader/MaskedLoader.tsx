import { CalciteLoader,CalcitePanel} from "@esri/calcite-components-react/dist/components";


import "./MaskedLoader.scss";

interface MaskedLoaderProps{
	active:boolean
}
const MaskedLoader = (props:MaskedLoaderProps) => {
		const {active} = props;
		return  (
			<CalcitePanel 
				style={{"display":active?"block":"none"}} 
				className="masked-loader">
				<CalciteLoader  className="calci-loader" scale="s"  label="apploader" active></CalciteLoader>
			</CalcitePanel>
  		)
}
MaskedLoader.defaultProps ={
	active:false
} as MaskedLoaderProps;

export default MaskedLoader;