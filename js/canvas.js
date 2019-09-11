import EventEmitter from './eventemitter';

class Canvas extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.canvas.width = canvas.clientWidth;
    this.canvas.height = canvas.clientHeight;
    this.offset = canvas.getBoundingClientRect();
    this.ctx = this.canvas.getContext('2d');
    this.attachListeners();
    this.ctx.strokeStyle = this.ctx.fillStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    this.boundStroke = this.moveStroke.bind(this);
    this.boundErase = this.eraseStroke.bind(this);
    this.boundEnd = this.removePointer.bind(this);

    this.isPen = false;

    this.lineWidth = 1;
    this.strokeWidth = 1;
    this.eraseWidth = 20;

    this.strokePts = [];
    this.streamPts = [];
    this.erasePts = [];
  }

  attachListeners() {
    this.canvas.addEventListener('pointerdown', this.setPointer.bind(this), false);
    this.canvas.addEventListener('pointerup', this.removePointer.bind(this), false);
  }

  setPointer(e) {
    e.preventDefault();
    switch (e.pointerType) {
      case 'pen':
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.globalCompositeOperation = 'source-over';
        this.isPen = true;
        this.canvas.addEventListener('touchmove', this.boundStroke, false);
        let xCoord = e.layerX >> 0;
        let yCoord = e.layerY >> 0;
        this.strokePts = [{ x: xCoord, y: yCoord }];
        this.streamPts = [{ x: xCoord, y: yCoord }];
        this.ctx.beginPath();
        this.ctx.moveTo(xCoord, yCoord);
        this.ctx.lineTo(xCoord, yCoord);
        this.ctx.stroke();
        break;
      case 'touch':
        if (!this.isPen) {
          this.ctx.lineWidth = this.eraseWidth;
          this.ctx.globalCompositeOperation = 'destination-out';
          this.canvas.addEventListener('touchmove', this.boundErase, false);
          this.erasePts = [{ x: e.layerX >> 0, y: e.layerY >> 0 }];
          this.ctx.beginPath();
          this.ctx.moveTo(e.layerX >> 0, e.layerY >> 0);
          break;
        }
    }
  }

  removePointer(e) {
    switch (e.pointerType) {
      case 'pen':
        this.isPen = false;
        this.canvas.removeEventListener('touchmove', this.boundStroke, false);
        if (this.strokePts.length === 1) {
          this.ctx.moveTo(this.strokePts[0].x, this.strokePts[0].y);
          this.ctx.lineWidth = this.lineWidth * 2;
          this.ctx.lineTo(this.strokePts[0].x, this.strokePts[0].y);
          this.ctx.stroke();
          this.ctx.lineWidth = this.lineWidth;
        }
        this.emit('strokePoints', this.streamPts);
        this.strokePts = [];
        this.streamPts = [];
        break;
      case 'touch':
        this.canvas.removeEventListener('touchmove', this.boundErase, false);
        this.emit('erasePoints', this.erasePts);
        this.erasePts = [];
        break;
    }
    this.ctx.beginPath();
  }

  moveStroke(e) {
    let xCoord = e.targetTouches[0].clientX >> 0;
    let yCoord = (e.targetTouches[0].clientY >> 0) - this.offset.top;
    this.strokePts.push({ x: xCoord, y: yCoord });
    this.streamPts.push({ x: xCoord, y: yCoord });
    let p0 = this.strokePts[0];
    let p1 = this.strokePts[1];
    this.ctx.beginPath();
    this.ctx.moveTo(p0.x, p0.y);

    if (this.strokePts.length === 2) {
      this.ctx.lineTo(p1.x, p1.y);
      return this.ctx.stroke();
    }

    let mid = {};
    for (let i = 1, n = this.strokePts.length - 1; i < n; i++) {
      mid = {
        x: (p0.x + p1.x) / 2,
        y: (p0.y + p1.y) / 2
      };
      this.ctx.quadraticCurveTo(p0.x, p0.y, mid.x, mid.y);
      p0 = this.strokePts[i];
      p1 = this.strokePts[i + 1];
    }
    this.ctx.lineTo(mid.x, mid.y);
    this.ctx.stroke();

    if (this.strokePts.length > 100) {
      this.strokePts.splice(0, 1);
    }
  }

  eraseStroke(e) {
    let xCoord = e.targetTouches[0].clientX >> 0;
    let yCoord = (e.targetTouches[0].clientY >> 0) - this.offset.top;
    this.ctx.lineTo(xCoord, yCoord);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(xCoord, yCoord);
    this.erasePts.push({ x: xCoord, y: yCoord });
  }
}

export default Canvas;
