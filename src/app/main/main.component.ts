import { interval, takeWhile } from 'rxjs';
import { Time } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  template: `<canvas #myCanvas></canvas>`
})
export class MainComponent implements AfterViewInit {
  @ViewChild('canvas', {static:false}) canvas!: ElementRef;
  canvas2!:HTMLCanvasElement;
  context:any;
  audio= new window.Audio('assets/Tetris.mp3');
  isRunning: boolean=false;
  flag: boolean=false;
  BLOCK_SIZE = 15;
  BOARD_WIDTH= 14;
  BOARD_HEIGHT= 30;
  dropCounter = 0;
  TotalLineCounter=0;
  lineCounter= 0;
  score:number=0;
  time:number=0;
  timer:any;
  eventHolder:any;
  lastTime:number=0;
  deltaTime:any;
  rowsToRemove: number[] = [];
  board=this.createBoard(this.BOARD_WIDTH, this.BOARD_HEIGHT);

  createBoard(width:number,height:number) {
    return Array(height).fill(0).map(() => Array(width).fill(0))
  }

  piece = {
    position: {x:6, y:-1},
    shape: [
      [1,1],
      [1,1]

    ]
  }

  pieces = [
    [
      [1,1],
      [1,1]
    ],
    [
      [1,1,1,1],
    ],
    [
      [0,1,0],
      [1,1,1]
    ],
    [
      [0,1,1],
      [1,1,0]
    ],
    [
      [1,1,0],
      [0,1,1]
    ],
    [
      [1,0],
      [1,0],
      [1,1]
    ],
    [
      [0,1],
      [0,1],
      [1,1]
    ]    
  ]
  Level =
  {
    stage:0,
    dropTime:1000
  }

  constructor() { }

  ngAfterViewInit(): void {
    //Inicializando Canvas
    this.canvas2 = this.canvas.nativeElement;
    this.context = this.canvas2.getContext('2d');
    this.canvas2.width= this.BLOCK_SIZE * this.BOARD_WIDTH;
    this.canvas2.height= this.BLOCK_SIZE * this.BOARD_HEIGHT;
    this.context.scale(this.BLOCK_SIZE, this.BLOCK_SIZE)

    //this.update()
    
  }


  
 // update()
  //{
  //  this.draw()
  //  window.requestAnimationFrame(this.update)
  //}

  run(){
   this.isRunning=!this.isRunning;
    if (this.isRunning) {
        this.pieceFall()

        if(!this.flag)
        {
          this.gameCore()
          this.flag=!this.flag
        }

        this.audio.loop=true;
        this.audio.play();
    }
    else
    {
      this.audio.pause()
    }
    
  }

  pieceFall(){
    this.timer=interval(100).pipe(takeWhile(() => this.isRunning)).subscribe(x => {
      this.time+=100
      //console.log(this.time)
      this.update()
    });
  }

  gameCore(){
    
    
    this.eventHolder=document.addEventListener('keydown', Event =>
    {
        
      if (Event.key === 'ArrowLeft' && this.isRunning){
        
        this.piece.position.x--
        if(this.checkCollision())
        {
          this.piece.position.x++
        }
      }

      if (Event.key === 'ArrowRight' && this.isRunning){
        this.piece.position.x++
        if(this.checkCollision())
        {
          this.piece.position.x--
        }
      }

      if (Event.key === 'ArrowDown' && this.isRunning){
        this.piece.position.y++
        if(this.checkCollision())
        {
          this.piece.position.y--
          this.solidifyPiece()
          this.removeRows()
        }
      }

      if (Event.key === 'ArrowUp' && this.isRunning){
        const rotated=[]
        for (let index = 0; index < this.piece.shape[0].length; index++) {
          const row=[]
          for (let j = this.piece.shape.length - 1 ; j>=0; j--) {
            row.push(this.piece.shape[j][index])
            
          }
          rotated.push(row)
        }
        const previousShape= this.piece.shape
        this.piece.shape= rotated
        //mejorar
        if(this.checkCollision()){
            this.piece.shape=previousShape
        }
      }
      if(this.isRunning){
      this.update()
    }
    })


  
  }
  update()
  {
    
    this.deltaTime = this.time - this.lastTime;
    this.lastTime= this.time;

    this.dropCounter += this.deltaTime
    //console.log('DropCounter '+this.dropCounter)
    if (this.dropCounter === this.Level.dropTime){
     this.piece.position.y++
      this.dropCounter=0
      if(this.checkCollision())
      {
        this.piece.position.y--
        this.solidifyPiece()
        this.removeRows()
      }
    }
    this.draw()
    //window.requestAnimationFrame(this.update)    
  }

  draw()
  {
    this.context.fillStyle = '#000';
      this.context.fillRect(0,0,this.canvas2.width,this.canvas2.height);
      
      for (let index = 0; index < this.board.length; index++) 
      {
        for (let j = 0; j < this.board[index].length; j++) 
        {
          if (this.board[index][j] == 1)
          {
            this.context.fillStyle ='yellow';
            this.context.fillRect(j, index, 1 ,1)
          } 
          
        }     
      }

      for (let index = 0; index < this.piece.shape.length; index++) 
      {
        for (let j = 0; j < this.piece.shape[index].length; j++) 
        {
          if (this.piece.shape[index][j] == 1)
          {
            this.context.fillStyle ='red';
            
            this.context.fillRect(j + this.piece.position.x, index + this.piece.position.y, 1 ,1);
          } 
          
        }     
      }
  }

  checkCollision()
  {
    return this.piece.shape.find((row,y)=>
      {
        return row.find((value,x)=>
        {
          return (
          (
            value != 0 &&
            this.board[ y + this.piece.position.y]?.[ x + this.piece.position.x] != 0
          ))
        }
        
        )
      }
    )
  }

  solidifyPiece(){
    this.piece.shape.forEach((row, y)=>{
      row.forEach((value,x)=>{
        if( value===1 )
        {
          this.board[ y + this.piece.position.y][ x + this.piece.position.x] = 1
        }
      }

      )
    }
    
    )
    //random piece
    this.piece.shape= this.pieces[Math.floor(Math.random() * this.pieces.length)];
    //RESET POSITION
    this.piece.position.x= Math.floor(this.BOARD_WIDTH / 2 )
    this.piece.position.y= 0;

    if (this.checkCollision()) {
      window.alert('Game Over!!');
      this.board.forEach((row)=> row.fill(0))
      this.score=0;
    }
  }

  removeRows(){
    

    this.board.forEach((row,y)=>{
      if(row.every(value => value===1 )){
        this.rowsToRemove.push(y)
      }
    })
    
    this.rowsToRemove.forEach(y =>{
      this.board.splice(y,1)
      const newRow = Array(this.BOARD_WIDTH).fill(0);
      this.board.unshift(newRow)  
      this.score+=40;
      this.TotalLineCounter+=1;
      this.lineCounter+=1;
      if(this.lineCounter===10){
        this.Level.stage+=1;
        if(this.Level.dropTime>100)
        {
        this.Level.dropTime-=100;
        }
        this.lineCounter=0;
      }
    })
    this.rowsToRemove=[];
  }

}
