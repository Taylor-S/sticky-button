export interface BasicVectorOptions {
	x?: number;
	y?: number;
}

export interface MouseVectorOptions extends BasicVectorOptions {
	listener?: any;
}

export interface AttractorOptions {
	el: Element;
	innerEl: Element;
	rangeOfAttraction?: number;
  area?: number;
}
