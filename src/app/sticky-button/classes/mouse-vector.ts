import { BasicVector } from "./basic-vector";
import { MouseVectorOptions } from "./sticky-button-interfaces";

export class MouseVector extends BasicVector {

	private _xDirection: string = "";
	public get xDirection(): string { return this._xDirection };

	private _yDirection: string = "";
	public get yDirection(): string { return this._yDirection };

	constructor(options?: MouseVectorOptions){
		super(options);

		let listener: any = document;

		if (options){
			if (options.listener)
				listener = options.listener;
		}

		listener.addEventListener("mousemove", this.onMouseMove.bind(this), false);
		listener.addEventListener("touchmove", this.onMouseMove.bind(this), false);
	}

	private onMouseMove(event: MouseEvent){
		var oldx = this.x;
		var oldy = this.y;

		this._x = event.clientX;
		this._y = event.clientY;

		this._xDirection = this.x > oldx ? "right" : "left";
		this._yDirection = this.y > oldy ? "down" : "up";

		document.dispatchEvent(new CustomEvent("mousevector-move", { detail: this }));
	}
}