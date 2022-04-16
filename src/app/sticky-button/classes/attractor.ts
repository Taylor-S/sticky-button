import { BasicVector } from "./basic-vector";
import { MouseVector } from "./mouse-vector";
import { AttractorOptions } from "../interfaces/sticky-button-interfaces";

export class Attractor {
	protected onAnimatedCallback: any;
	protected hasReachedPosition: boolean = false;
	protected canInteract: boolean = false;
	protected userInteracting: boolean;
	protected el: Element;

	protected rangeOfAttraction: number;
	protected limitTo: string = "xy";
	protected x: number;
	protected y: number;
	protected xTarget: number;
	protected yTarget: number;
	protected area: number;

	protected xVector: number = 0;
	protected yVector: number = 0;
	protected startOffsetVector: BasicVector;

	private bounceFriction: number = 0.85;
	private spring: number = 0.1;
	private easeSpeed: number = 0.3;

	public get xCenter(): number {
		return window.innerWidth * 0.5;
	};

	public get yCenter(): number {
		return window.innerHeight * 0.5;
	};

  constructor(options: AttractorOptions) {
		this.el = options.el;

		// defaults to 0.5, half the area.
		this.rangeOfAttraction = options.rangeOfAttraction ? options.rangeOfAttraction : 0.5;

		this.area = parseInt(window.getComputedStyle(this.el, null).getPropertyValue("width"), 10);

		document.addEventListener("mousevector-move", this.onMouseMove.bind(this), false);
  
    setTimeout(() => this.renderQueCall(), 0);
	}

  private onMouseMove(event: CustomEvent) {
		if (this.canInteract && !this.onAnimatedCallback) {
			let vector: MouseVector = event.detail;

			let x: number = this.xCenter - vector.x;
			let y: number = this.yCenter - vector.y;


			this.xTarget = x / this.area;
			this.yTarget = y / this.area;

			this.xTarget *= this.area * -1;
			this.yTarget *= this.area * -1;

			let range: number = this.area * this.rangeOfAttraction;

			if (this.xTarget > range || this.xTarget < -range || this.yTarget > range || this.yTarget < -range) {
				// not within area of attraction, so center.
				this.xTarget = this.xCenter;
				this.yTarget = this.yCenter;
			} else {
				// limit the range of attraction
				this.xTarget *= 0.5
				this.yTarget *= 0.5

				// center to starting point
				this.xTarget += this.xCenter;
				this.yTarget += this.yCenter;
			}

			// everytime position vector changes..
			this.hasReachedPosition = false;
		}
	}
  
  public renderQueCall() {
		if (this.userInteracting) {
			// ex. dragging..
			let mouseVector: MouseVector = window.mouseVector;

			this.xTarget = mouseVector.x - this.startOffsetVector.x;
			this.yTarget = mouseVector.y - this.startOffsetVector.y;

			this.x += (this.xTarget - this.x) * this.easeSpeed;
			this.y += (this.yTarget - this.y) * this.easeSpeed;
		} else {
			this.xVector += (this.xTarget - this.x) * this.spring;
			this.yVector += (this.yTarget - this.y) * this.spring;

			this.x += (this.xVector *= this.bounceFriction);
			this.y += (this.yVector *= this.bounceFriction);
		}

		if (Math.abs(this.x - this.xTarget) < 0.1 && Math.abs(this.y - this.yTarget) < 0.1 && !this.hasReachedPosition) {
			this.hasReachedPosition = true;

			if (!this.canInteract && this.onAnimatedCallback) {
				this.onAnimatedCallback();
			}
		}

		let x: number = this.x - this.xCenter;
		let y: number = this.y - this.yCenter;

		this.setPosition(x, y);

		requestAnimationFrame(()=>this.renderQueCall());
	}

  protected setPosition(x: number, y: number) {
		if (this.limitTo == "xy") {
			TweenMax.set(this.el, {
				force3D: true,
				x: x,
				y: y
			});
		} else if (this.limitTo == "x") {
			TweenMax.set(this.el, {
				force3D: true,
				x: x
			});
		} else if (this.limitTo == "y") {
			TweenMax.set(this.el, {
				force3D: true,
				y: y
			});
		}
	}

  protected animateIn() {
		this.hasReachedPosition = false;
		this.x = this.xTarget = this.xCenter;
		this.y = this.yTarget = this.yCenter;

		this.onAnimatedCallback = this.onAnimatedIn;
	}

	protected onAnimatedIn() {
		this.canInteract = true;
		this.onAnimatedCallback = null;
	}
}
