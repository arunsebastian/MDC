import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Editor from "@arcgis/core/widgets/Editor";
import WebEditorViewModel from "./WebEditorViewModel";

interface WebEditorProperties extends __esri.EditorProperties {}

@subclass("WebEditor")
export default class WebEditor extends Editor{
    constructor(params:WebEditorProperties){
        super(params);
        this.set(params);
        this.setViewModel();
    }
    setViewModel = () =>{
        const vm = new WebEditorViewModel({
            view:this.view
        });
        this.set("viewModel",vm);
    }
}