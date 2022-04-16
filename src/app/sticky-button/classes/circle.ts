import { AttractorOptions } from "../interfaces/sticky-button-interfaces";
import { Attractor } from "./attractor";
import { BasicVector } from "./basic-vector";
import { MouseVector } from "./mouse-vector";

export class Circle extends Attractor {
	private productTestIndex: number = 0;
	private innerEl: Element;

	constructor(options: AttractorOptions) {
		super(options);

		this.innerEl = this.el.getElementsByTagName("inner")[0];

		this.el.addEventListener("mousedown", this.onMouseDown.bind(this), false);
		this.el.addEventListener("mouseup", this.onMouseUp.bind(this), false);
		document.addEventListener("mouseup", this.onMouseUp.bind(this), false);

		this.area = 300; //overwritting

		this.animateIn();
	}

	protected animateIn() {
		super.animateIn();

		this.el.classList.remove("product-"+this.productTestIndex);
		this.productTestIndex++
		this.productTestIndex %= 2
		this.el.classList.add("product-"+this.productTestIndex);

		this.limitTo = "xy";

		this.el.classList.add("show");

		this.y = this.yTarget = this.area * -1

		TweenMax.set(this.el, {
			force3D: true,
			x: this.xCenter,
			y: this.y
		});

		this.yTarget = this.yCenter;
	}

	public renderQueCall() {
		super.renderQueCall();

		let halfw: number = window.innerWidth * 0.5;
		let halfh: number = window.innerHeight * 0.5;
		let x: number = this.x - this.xCenter;

		document.dispatchEvent(new CustomEvent("circle-move", {
			detail: {
				percent: x / window.innerWidth,
				userInteracting: this.userInteracting,
				canInteract: this.canInteract
			}
		}));

		// box shadow
		let xShadow: number = 5 + (this.limitTo == "y" ? 0 : ((halfw - this.x) / halfw) * 200);
		let yShadow: number = 5 + (this.limitTo == "x" ? 0 : ((halfh - this.y) / halfh) * 200);
		let blur: number = 50;
		let spread: number = 20;
    let box: string = xShadow + "px " + yShadow + "px " + blur + "px " + spread + "px rgb(158, 117, 177, 0.75)";

		TweenMax.set(this.innerEl, {
			boxShadow: box
		});
	}

	protected onAnimatedIn() {
		if (this.y !== undefined){
			// this.hasReachedPosition = false;

			if (Math.abs(this.y - (window.innerHeight * 0.5)) < 0.1) {
				//this.limitTo = "x";
				super.onAnimatedIn();
			}
		}
	}

	private onAnimatedOut(){
		this.animateIn();
	}

	private onMouseDown(event: MouseVector){
		if (this.canInteract && !this.onAnimatedCallback) {

			this.userInteracting = true;

			let mouseVector: MouseVector = window.mouseVector;

			this.startOffsetVector = new BasicVector({
				x: mouseVector.x - this.x,
				y: mouseVector.y - this.y
			});
		}
	}

	private onMouseUp(event: MouseVector) {
		this.userInteracting = false;

		if (this.x < window.innerWidth * 0.4) {
			this.animateOut("left");
		} else if (this.x > window.innerWidth * 0.6) {
			this.animateOut("right");
		}else{
			this.xTarget = this.xCenter;
		}

		this.yTarget = this.yCenter;

		// everytime position vector changes..
		this.hasReachedPosition = false;
	}

	public animateOut(towards: string){
		this.userInteracting = false;

		if(towards == "left"){
			this.canInteract = false;
			this.onAnimatedCallback = this.onAnimatedOut;
			this.xTarget = this.area * -0.55;
			this.el.classList.remove("show");
		}else if(towards == "right"){
			this.canInteract = false;
			this.onAnimatedCallback = this.onAnimatedOut;
			this.xTarget = window.innerWidth + (this.area * 0.55);
			this.el.classList.remove("show");
		}

		this.yTarget = this.yCenter;

		this.hasReachedPosition = false;
	}
}
