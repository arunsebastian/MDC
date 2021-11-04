import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import CoordinateConversion from "@arcgis/core/widgets/CoordinateConversion";
import CoordinateSearchViewModel from "./CoordinateSearchViewModel";

interface CoordinateSearchProperties extends __esri.CoordinateConversionProperties {}

@subclass("CoordinateSearch")
export default class CoordinateSearch extends CoordinateConversion{
    constructor(params:CoordinateSearchProperties){
        super(params);
        this.set(params);
        this.setViewModel();
    }
    setViewModel = () =>{
        const vm = new CoordinateSearchViewModel({
            view:this.view
        });
        this.set("viewModel",vm);
    }
}