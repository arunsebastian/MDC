import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import EditorViewModel from "@arcgis/core/widgets/Editor/EditorViewModel"
import {whenTrueOnce} from "@arcgis/core/core/watchUtils";

interface WebEditorViewModelProperties extends  __esri.EditorViewModelProperties{}

@subclass("WebEditorViewModel")
export default class WebEditorViewModel extends EditorViewModel{
	constructor(params:WebEditorViewModelProperties) {
		super(params);
		this.set(params);
		whenTrueOnce(this.view, "ready").then(() => {});
	}
}