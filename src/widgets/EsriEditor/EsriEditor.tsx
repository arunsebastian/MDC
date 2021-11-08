import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Editor from "@arcgis/core/widgets/Editor";
import EsriEditorViewModel from "./EsriEditorViewModel";

interface EsriEditorProperties extends __esri.EditorProperties {}

@subclass("EsriEditor")
export default class EsriEditor extends Editor{
    constructor(params:EsriEditorProperties){
        super(params);
        this.set(params);
        this.setViewModel();
    }
    setViewModel = () =>{
        const vm = new EsriEditorViewModel({
            view:this.view,
            snappingOptions:{
                enabled:true
            }
        });
        this.set("viewModel",vm);
    }
}