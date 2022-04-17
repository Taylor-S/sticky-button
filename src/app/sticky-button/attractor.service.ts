import { HostListener, Injectable } from '@angular/core';
import { BasicVector } from './classes/basic-vector';
import { MouseVector } from './classes/mouse-vector';
import { AttractorOptions } from './interfaces/sticky-button-interfaces';
import { globalMouseVector } from './sticky-button.component';
import gsap from 'gsap';

@Injectable({
  providedIn: 'root'
})
export class AttractorService {
  public onAnimatedCallback: any;
	public hasReachedPosition: boolean = false;
	public canInteract: boolean = false;
	public userInteracting: boolean;
	protected el: Element;
  protected innerEl: Element;

	protected rangeOfAttraction: number = 1;
	public limitTo: string = "xy";
	public x: number;
	public y: number;
	public xTarget: number;
	public yTarget: number;
	public area: number;

	protected xVector: number = 0;
	protected yVector: number = 0;
	public startOffsetVector: BasicVector;

	private bounceFriction: number = 0.85;
	private spring: number = 0.1;
	private easeSpeed: number = 0.3;

	public get xCenter(): number {
		return window.innerWidth * 0.5;
	};

	public get yCenter(): number {
		return window.innerHeight * 0.5;
	};

  constructor() { }

  init(options: AttractorOptions) {
    this.el = options.el;
    this.innerEl = options.innerEl;
    console.log(this.innerEl);

		// defaults to 0.5, half the area.
		this.rangeOfAttraction = options.rangeOfAttraction ? options.rangeOfAttraction : 0.5;

		this.area = parseInt(window.getComputedStyle(this.el, null).getPropertyValue("width"), 10);

		// document.addEventListener("mousevector-move", this.onMouseMove.bind(this), false);

		setTimeout(() => this.renderQueCall(), 0);
  }

  @HostListener('document:mousevector-move', ['$event'])
	private onMouseMove(event: CustomEvent) {
		console.log('docuemnt custom event called from attractor.');
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
    /////////////////////////////////////////////
    let halfw: number = window.innerWidth * 0.5;
		let halfh: number = window.innerHeight * 0.5;
		// let x: number = this.x - this.xCenter;

		document.dispatchEvent(new CustomEvent("circle-move", {
			detail: {
				percent: (this.x - this.xCenter) / window.innerWidth,
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

    
		const boxShadow = gsap.set(this.innerEl, {
			boxShadow: box
		});
    console.log(boxShadow);

		if (this.userInteracting) {
			// ex. dragging..
			let mouseVector: MouseVector = globalMouseVector;

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

		requestAnimationFrame(() => this.renderQueCall());
	}

	protected setPosition(x: number, y: number) {
		if (this.limitTo == "xy" && this.el) {
			gsap.set(this.el, {
				force3D: true,
				x: x,
				y: y
			});
		} else if (this.limitTo == "x" && this.el) {
			gsap.set(this.el, {
				force3D: true,
				x: x
			});
		} else if (this.limitTo == "y" && this.el) {
			gsap.set(this.el, {
				force3D: true,
				y: y
			});
		}
	}

	public animateIn() {
		this.hasReachedPosition = false;
		this.x = this.xTarget = this.xCenter;
		this.y = this.yTarget = this.yCenter;

		this.onAnimatedCallback = this.onAnimatedIn;
	}

	public onAnimatedIn() {
		this.canInteract = true;
		this.onAnimatedCallback = null;
	}
}
