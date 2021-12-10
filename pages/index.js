import Head from 'next/head'
import {useEffect} from "react";

var ctx;
var canvas;
var img;
var glitchesArray = [];
let canvasWidth;
let canvasHeight;

export default function Home() {
  useEffect(() => {
    onGenerateClick()
  });

  function Glitch(img, sourceX, sourceY, glitchWidth, glitchHeight, destinationX) {
    this.img = img;
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.glitchWidth = glitchWidth;
    this.glitchHeight = glitchHeight
    this.destinationX = destinationX;

    this.draw = () => {
      ctx.drawImage(
        this.img, 
        this.sourceX,
        this.sourceY,
        this.glitchWidth,
        this.glitchHeight,
        this.destinationX,
        this.sourceY,
        this.glitchWidth,
        this.glitchHeight
      )
    }
  }

  function setupGlitches() {
    let sourceY = 0;
    const glitchHeight = 10;
    const amountOfGlitches = canvasHeight / glitchHeight;

    for (let i = 0; i < amountOfGlitches; i++) {
      let img = document.createElement("img");
      img.src = 'https://images.genius.com/626ddf4c88de200d9487bb42449d1ae3.1000x1000x1.png';

      let sourceX = randomNum(0, 300);
      let glitchWidth = randomNum(100, canvasWidth);
      let destinationX = randomNum(0, canvasWidth / 2);

      glitchesArray[i] = new Glitch(img, sourceX, sourceY, glitchWidth, glitchHeight, destinationX) 
      sourceY = sourceY + glitchHeight;
    } 
  }

  function onGenerateClick() {
    img = document.createElement("img");
    img.src = 'https://images.genius.com/626ddf4c88de200d9487bb42449d1ae3.1000x1000x1.png';
    canvas = document.getElementById("canvas");

    canvasWidth = img.width
    canvasHeight = img.height;
    canvas.width = img.width;
    canvas.height = img.height;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    
    ctx.globalAlpha = randomNum(6, 10) * 0.1;
    ctx.globalCompositeOperation = "darken";

    setupGlitches();
    drawGlitches()
  }

  function drawGlitches() {
    glitchesArray.forEach((glitch) => {
      glitch.draw();
    });
  }

  function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  return (
    <div>
      <Head>
        <title>Glitch Image Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <canvas id="canvas"></canvas>
        <button className="generate-button" onClick={onGenerateClick}>
          GENERATE
        </button>
      </main>
    </div>
  )
}
