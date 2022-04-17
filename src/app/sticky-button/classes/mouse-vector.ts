import { Component, HostListener, Inject } from '@angular/core';
import { AttractorService } from '../attractor.service';
import { MouseVectorOptions } from "../interfaces/sticky-button-interfaces";

@Component({template: ''})
export class MouseVector {
  protected _x: number = 0;
	public get x(): number { return this._x };

	protected _y: number = 0;
	public get y(): number { return this._y };
	private _xDirection: string = "";
	public get xDirection(): string { return this._xDirection };

	private _yDirection: string = "";
	public get yDirection(): string { return this._yDirection };

	constructor(){
		// super(options);

		let listener: any = document;

		// if (options){
		// 	if (options.listener)
		// 		listener = options.listener;
		// }

		listener.addEventListener("mousemove", this.onMouseMove.bind(this), false);
		listener.addEventListener("touchmove", this.onMouseMove.bind(this), false);
	}

  // @HostListener('document:mousemove')
	private onMouseMove(event: MouseEvent){
    console.log('onMouseMove - MouseVector')
		var oldx = this.x;
		var oldy = this.y;

		this._x = event.clientX;
		this._y = event.clientY;

		this._xDirection = this.x > oldx ? "right" : "left";
		this._yDirection = this.y > oldy ? "down" : "up";

		document.dispatchEvent(new CustomEvent("mousevector-move", { detail: this }));
	}
}
