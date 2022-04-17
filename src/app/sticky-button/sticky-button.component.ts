import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
// import { Attractor } from './classes/attractor';
import { BasicVector } from './classes/basic-vector';
import { MouseVector } from './classes/mouse-vector';
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { AttractorService } from './attractor.service';

@Component({
  selector: 'app-sticky-button',
  templateUrl: './sticky-button.component.html',
  styleUrls: ['./sticky-button.component.scss']
})
export class StickyButtonComponent implements OnInit, AfterViewInit {
  private productTestIndex: number = 0;
  @ViewChild('circle') circle: ElementRef;
  @ViewChild('innerEl') innerEl: ElementRef;

  // public attractor: Attractor;

  constructor(private attractorService: AttractorService) {
    gsap.registerPlugin(Draggable);
  }
  ngAfterViewInit(): void {
    console.log(this.circle);
    console.log(this.innerEl);
    this.attractorService.init({
      el: this.circle.nativeElement,
      innerEl: this.innerEl.nativeElement,
      rangeOfAttraction: 1
    });

    this.attractorService.area = 300 //overwriting

    this.animateIn();

    // this.renderQueCall();
  }

  ngOnInit(): void {
  }

  public onMouseDown(event: MouseVector | any) {
    console.log('mousedown');
    console.log(event);
    if (this.attractorService.canInteract && !this.attractorService.onAnimatedCallback) {

      this.attractorService.userInteracting = true;

      let mouseVector: MouseVector = globalMouseVector;

      this.attractorService.startOffsetVector = new BasicVector({
        x: mouseVector.x - this.attractorService.x,
        y: mouseVector.y - this.attractorService.y
      });
    }
  }

  @HostListener('document:mouseup', ['$event'])
  public onMouseUp(event: MouseVector | any) {
    console.log('mouseup');
    console.log(event);
    this.attractorService.userInteracting = false;

    if (this.attractorService.x < window.innerWidth * 0.4) {
      this.animateOut("left");
    } else if (this.attractorService.x > window.innerWidth * 0.6) {
      this.animateOut("right");
    } else {
      this.attractorService.xTarget = this.attractorService.xCenter;
    }

    this.attractorService.yTarget = this.attractorService.yCenter;

    // everytime position vector changes..
    this.attractorService.hasReachedPosition = false;
  }

  protected animateIn() {
    this.attractorService.animateIn();

    this.circle.nativeElement.classList.remove("product-" + this.productTestIndex);
    this.productTestIndex++;
    this.productTestIndex %= 2;
    this.circle.nativeElement.classList.add("product-" + this.productTestIndex);

    this.attractorService.limitTo = "xy";

    this.circle.nativeElement.classList.add("show");

    this.attractorService.y = this.attractorService.yTarget = this.attractorService.area * -1;

    gsap.set(this.circle.nativeElement, {
      force3D: true,
      x: this.attractorService.xCenter,
      y: this.attractorService.y
    });

    this.attractorService.yTarget = this.attractorService.yCenter;
  }

  public renderQueCall() {
    console.log('renderQueCall - sticky-button');
		this.attractorService.renderQueCall();

		let halfw: number = window.innerWidth * 0.5;
		let halfh: number = window.innerHeight * 0.5;
		let x: number = this.attractorService.x - this.attractorService.xCenter;

		document.dispatchEvent(new CustomEvent("circle-move", {
			detail: {
				percent: x / window.innerWidth,
				userInteracting: this.attractorService.userInteracting,
				canInteract: this.attractorService.canInteract
			}
		}));

		// box shadow
		let xShadow: number = 5 + (this.attractorService.limitTo == "y" ? 0 : ((halfw - this.attractorService.x) / halfw) * 200);
		let yShadow: number = 5 + (this.attractorService.limitTo == "x" ? 0 : ((halfh - this.attractorService.y) / halfh) * 200);
		let blur: number = 50;
		let spread: number = 20;
    let box: string = xShadow + "px " + yShadow + "px " + blur + "px " + spread + "px rgb(158, 117, 177, 0.75)";


		gsap.set(this.innerEl, {
			boxShadow: box
		});
	}

  public animateOut(towards: string) {
    this.attractorService.userInteracting = false;

    if (towards == "left") {
      this.attractorService.canInteract = false;
      this.attractorService.onAnimatedCallback = this.onAnimatedOut;
      this.attractorService.xTarget = this.attractorService.area * -0.55;
      this.circle.nativeElement.classList.remove("show");
    } else if (towards == "right") {
      this.attractorService.canInteract = false;
      this.attractorService.onAnimatedCallback = this.onAnimatedOut;
      this.attractorService.xTarget = window.innerWidth + (this.attractorService.area * 0.55);
      this.circle.nativeElement.classList.remove("show");
    }

    this.attractorService.yTarget = this.attractorService.yCenter;

    this.attractorService.hasReachedPosition = false;
  }

  private onAnimatedOut() {
    this.attractorService.animateIn();
  }

}


// https://stackoverflow.com/questions/46389002/how-to-listen-for-mousemove-event-on-document-object-in-angular


export const globalMouseVector: MouseVector = new MouseVector();
