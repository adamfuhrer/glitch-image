import Head from 'next/head'
import {useEffect} from "react";

var ctx;
var canvas;
var img;
var glitchesArray = [];

export default function Home() {
  useEffect(() => {
    img = document.createElement("img");
    img.src = 'https://images.genius.com/626ddf4c88de200d9487bb42449d1ae3.1000x1000x1.png';
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");

    setupGlitches();
    onGenerateClick()
  });

  function Glitch(img, sourceX, sourceY, imgWidth, glitchHeight, destinationX) {
    this.img = img;
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.imgWidth = imgWidth;
    this.glitchHeight = glitchHeight
    this.startX = randomNum(0, 1) ? 0 : imgWidth; // Animate glitch in from both left and right
    this.destinationX = destinationX;

    this.animate = () => {
      ctx.drawImage(
        this.img, 
        this.sourceX,
        this.sourceY,
        this.imgWidth,
        this.glitchHeight,
        this.startX, // incrementor
        this.sourceY,
        this.imgWidth,
        this.glitchHeight
      )

      if (this.startX < this.destinationX) {
        this.startX++;
      } else {
        this.startX--;
      }
    }
  }

  function setupGlitches() {
    let sourceY = 0;
    const glitchHeight = 20;
    const amountOfGlitches = window.innerHeight / glitchHeight;

    for (let i = 0; i < amountOfGlitches; i++) {
      let img = document.createElement("img");
      img.src = 'https://images.genius.com/626ddf4c88de200d9487bb42449d1ae3.1000x1000x1.png';

      let imgWidth = randomNum(100, window.innerWidth);
      let destinationX = randomNum(0, 300);
      let sourceX = randomNum(0, 300);

      glitchesArray[i] = new Glitch(img, sourceX, sourceY, imgWidth, glitchHeight, destinationX) 
      
      sourceY = sourceY + glitchHeight;
    } 
  }

  function onGenerateClick() {
    setupGlitches();
    img = document.createElement("img");
    img.src = 'https://images.genius.com/626ddf4c88de200d9487bb42449d1ae3.1000x1000x1.png';
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
    // ctx.globalAlpha = randomNum(6, 10) * 0.1;
    // ctx.globalCompositeOperation = "difference";
    animateGlitches()
  }

  function animateGlitches() {
    requestAnimationFrame(animateGlitches);

    glitchesArray.forEach((glitch) => {
      // One the startX and destinationX meet the glitch will stop animating
      if (glitch.startX !== glitch.destinationX) {
        glitch.animate();
      }
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
