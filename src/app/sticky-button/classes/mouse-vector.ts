import { fromEvent } from 'rxjs';

export class MouseVector {
  protected _x: number = 0;
	protected _y: number = 0;
	private _xDirection: string = "";
	private _yDirection: string = "";
	public get x(): number { return this._x };
	public get y(): number { return this._y };
	public get xDirection(): string { return this._xDirection };
	public get yDirection(): string { return this._yDirection };

	constructor(){
    fromEvent(document, 'mousemove').subscribe((res) => this.onMouseMove(res as MouseEvent));
    fromEvent(document, 'touchmove').subscribe((res) => this.onMouseMove(res as MouseEvent));
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
