import { Injectable } from '@angular/core';
import { BasicVector } from './classes/basic-vector';
import { MouseVector } from './classes/mouse-vector';
import { AttractorOptions } from './interfaces/sticky-button-interfaces';
import { globalMouseVector } from './constants';
import gsap from 'gsap';
import { fromEvent } from 'rxjs';

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
	private area: number;

	protected xVector: number = 0;
	protected yVector: number = 0;
	public startOffsetVector: BasicVector;

	private bounceFriction: number = 0.85;
	private spring: number = 0.1;
	private easeSpeed: number = 0.3;
  private productTestIndex: number = 0;

	public get xCenter(): number {
		return window.innerWidth * 0.5;
	};

	public get yCenter(): number {
		return window.innerHeight * 0.5;
	};

  constructor() { }

  inititialiseOptions(options: AttractorOptions) {
    this.el = options.el;
    this.innerEl = options.innerEl;

		// defaults to 0.5, half the area.
		this.rangeOfAttraction = options.rangeOfAttraction ? options.rangeOfAttraction : 0.5;

		this.area = options.area ? options.area : parseInt(window.getComputedStyle(this.el, null).getPropertyValue("width"), 10);

    fromEvent(document, 'mousevector-move').subscribe((res) => this.onMouseMove(res as CustomEvent));

		setTimeout(() => this.renderQueCall(), 0);
  }

	public onMouseMove(event: CustomEvent) {
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
    let halfw: number = window.innerWidth * 0.5;
		let halfh: number = window.innerHeight * 0.5;

    // Not doing anything! There's nothing listening to this event.
		// document.dispatchEvent(new CustomEvent("circle-move", {
		// 	detail: {
		// 		percent: (this.x - this.xCenter) / window.innerWidth,
		// 		userInteracting: this.userInteracting,
		// 		canInteract: this.canInteract
		// 	}
		// }));

		// box shadow
		let xShadow: number = 5 + (this.limitTo == "y" ? 0 : ((halfw - this.x) / halfw) * 200);
		let yShadow: number = 5 + (this.limitTo == "x" ? 0 : ((halfh - this.y) / halfh) * 200);
		let blur: number = 50;
		let spread: number = 20;
    let box: string = xShadow + "px " + yShadow + "px " + blur + "px " + spread + "px rgb(158, 117, 177, 0.75)";


		gsap.set(this.innerEl, {
			boxShadow: box
		});

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

  // Logic pulled out of circle class
	public animateIn() {
		this.hasReachedPosition = false;
		this.x = this.xTarget = this.xCenter;
		this.y = this.yTarget = this.yCenter;

		this.onAnimatedCallback = this.onAnimatedIn;

    this.el.classList.remove("product-" + this.productTestIndex);
    this.productTestIndex++;
    this.productTestIndex %= 2;
    this.el.classList.add("product-" + this.productTestIndex);

    this.limitTo = "xy";

    this.el.classList.add("show");

    this.y = this.yTarget = this.area * -1;

    gsap.set(this.el, {
      force3D: true,
      x: this.xCenter,
      y: this.y
    });

    this.yTarget = this.yCenter;
	}

	public onAnimatedIn() {
		this.canInteract = true;
		this.onAnimatedCallback = null;
	}

  public animateOut(towards: string) {
    this.userInteracting = false;
    this.onAnimatedCallback = this.animateIn;

    if (towards == "left") {
      this.canInteract = false;
      this.xTarget = this.area * -0.55;
      this.el.classList.remove("show");
    } else if (towards == "right") {
      this.canInteract = false;
      this.xTarget = window.innerWidth + (this.area * 0.55);
      this.el.classList.remove("show");
    }

    this.yTarget = this.yCenter;

    this.hasReachedPosition = false;
  }
}
