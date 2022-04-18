import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { BasicVector } from './classes/basic-vector';
import { MouseVector } from './classes/mouse-vector';
import { AttractorService } from './attractor.service';
import { globalMouseVector } from './constants';

@Component({
  selector: 'app-sticky-button',
  templateUrl: './sticky-button.component.html',
  styleUrls: ['./sticky-button.component.scss']
})
export class StickyButtonComponent implements AfterViewInit {
  @ViewChild('circle') circle: ElementRef;
  @ViewChild('innerEl') innerEl: ElementRef;

  constructor(private attractorService: AttractorService) {
  }
  ngAfterViewInit(): void {
    this.attractorService.inititialiseOptions({
      el: this.circle.nativeElement,
      innerEl: this.innerEl.nativeElement,
      rangeOfAttraction: 1,
      area: 300
    });

    this.attractorService.animateIn();
  }

  // Unused code - pull this out!
  // protected onAnimatedIn() {
  //   if (this.attractorService.y !== undefined) {

  //     if (Math.abs(this.attractorService.y - window.innerHeight * 0.5) < 0.1) {
  //       this.attractorService.onAnimatedIn();
  //     }
  //   }
  // }

  // Moved this into the AttractorService.
  // public animateOut(towards: string) {
  //   this.attractorService.userInteracting = false;
  //   this.attractorService.onAnimatedCallback = this.attractorService.animateIn;

  //   if (towards == "left") {
  //     this.attractorService.canInteract = false;
  //     this.attractorService.xTarget = this.attractorService.area * -0.55;
  //     this.circle.nativeElement.classList.remove("show");
  //   } else if (towards == "right") {
  //     this.attractorService.canInteract = false;
  //     this.attractorService.xTarget = window.innerWidth + (this.attractorService.area * 0.55);
  //     this.circle.nativeElement.classList.remove("show");
  //   }

  //   this.attractorService.yTarget = this.attractorService.yCenter;

  //   this.attractorService.hasReachedPosition = false;
  // }

  public onMouseDown() {
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
  public onMouseUp() {
    this.attractorService.userInteracting = false;

    if (this.attractorService.x < window.innerWidth * 0.4) {
      this.attractorService.animateOut("left");
    } else if (this.attractorService.x > window.innerWidth * 0.6) {
      this.attractorService.animateOut("right");
    } else {
      this.attractorService.xTarget = this.attractorService.xCenter;
    }

    this.attractorService.yTarget = this.attractorService.yCenter;

    // everytime position vector changes..
    this.attractorService.hasReachedPosition = false;
  }
}
