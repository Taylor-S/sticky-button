import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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
  @Input() title: string;

  constructor(private attractorService: AttractorService) {
  }
  ngAfterViewInit(): void {
    this.attractorService.inititialiseOptions({
      el: this.circle.nativeElement,
      innerEl: this.innerEl.nativeElement,
      rangeOfAttraction: 1,
      area: 300 //overwriting
    });

    this.attractorService.animateIn();
  }

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

  clickHandler() {
    const randomColor = Math.floor(Math.random()*16777215).toString(16);

    this.innerEl.nativeElement.setAttribute('style', `background: #${randomColor}`);
  }
}
