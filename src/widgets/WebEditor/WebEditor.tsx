// @ts-nocheck
/** @jsxRuntime classic */
/** @jsx tsx */

/* ref: https://community.esri.com/t5/arcgis-api-for-javascript-questions/custom-widget-with-esm-app/td-p/1018025*/

import { subclass,property } from "@arcgis/core/core/accessorSupport/decorators";
import Widget from "@arcgis/core/widgets/Widget";
import { tsx } from "@arcgis/core/widgets/support/widget";
import * as watchUtils from "@arcgis/core/core/watchUtils";
import "@esri/calcite-components";
import "./WebEditor.scss"


@subclass("WebEditor")
export default class WebEditor extends Widget {
	drawRef:HTMLCalciteTabElement = null;
	editRef:HTMLCalciteTabElement= null;
	ready:Boolean = false;
	constructor(params?: any) {
		super(params);
		this.set(params);
	}

	postInitialize= () =>{
		// console.log("this.editRef",this.editRef)
		// this.watch("ready",()=>{
		// 	console.log("I am here")
		// });

		// I AM HERE:: Investigate why on/watch etc are not working here
		// i think this widget should be a proper react widget

		//console.log(this.watch)
		this.own(this.on("renderFinished",()=>{
			alert.log("render finisjed")
		}));
		// whenTrueOnce(this,"ready",()=>{
		// 	this._renderDraw();
		// 	this._renderEdit();
	}

	

	render(){
		return  (
			<div class="web-editor esri-widget">		
				<calcite-tabs>
					<calcite-tab-nav slot="tab-nav">
						<calcite-tab-title isActive>Add Feature</calcite-tab-title>
						<calcite-tab-title>Edit Feature</calcite-tab-title>
					</calcite-tab-nav>
					<calcite-tab  afterUpdate={this._setReady} afterCreate={(node:HTMLCalciteTabElement) =>{this.set("drawRef",node)}}  bind={this} data-node-ref="drawRef" isActive>ddd</calcite-tab>
					<calcite-tab  afterUpdate={this._setReady} afterCreate={(node:HTMLCalciteTabElement) =>{this.set("editRef",node)}}  bind={this} data-node-ref="editRef">sss</calcite-tab>
				</calcite-tabs>
			</div>
  		)
	}

	private _setReady =()=>{
		if(!this.get("ready") && this.get("drawRef") && this.get("editRef")){
			this.set("ready",true);
			this.emit("renderFinisshed")
		}
	}

	private _renderDraw =() =>{
		console.log(this.get("drawRef"))
	}

	private _renderEdit = () =>{
		console.log(this.get("editRef"))
	}
}
// afterCreate={(node:HTMLCalciteTabElement) =>{this.set("drawRef",node)}}
// afterCreate= {(node:HTMLCalciteTabElement) =>{this.set("editRef",node)}}