import { BasicVectorOptions } from '../interfaces/sticky-button-interfaces';

export class BasicVector {
	protected _x: number = 0;
	public get x(): number { return this._x };

	protected _y: number = 0;
	public get y(): number { return this._y };

	constructor(options?: BasicVectorOptions) {
		if (options) {
			if (options.x)
				this._x = options.x;
			if (options.y)
				this._y = options.y;
		}
	}
}
