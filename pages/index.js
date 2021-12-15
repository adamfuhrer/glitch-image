import Head from 'next/head'
import { useEffect, useState } from "react";
import Slider from '@mui/material/Slider';

var ctx;
var canvas;
var img;
var glitchesArray = [];
var canvasWidth;
var canvasHeight;

export default function Home() {
  const blendingModes = [
    "difference",
    "source-atop",
    "source-over",
    "destination-out",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "exclusion",
    "hue",
    "saturation",
    "luminosity"
  ];

  const [blendingMode, setBlendingMode] = useState(blendingModes[0]);
  const [opacity, setOpacity] = useState(0.8);
  const [amountOfGlitches, setGlitchesAmount] = useState(40);

  const imgSrc = "https://picdit.files.wordpress.com/2016/04/erik-jones-art-7.png"

  useEffect(() => {
    onGenerateClick();
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
    glitchesArray = [];
    let sourceY = 0;
    let glitchHeight = canvasHeight / amountOfGlitches

    for (let i = 0; i < amountOfGlitches; i++) {
      let img = document.createElement("img");
      img.src = imgSrc;

      let sourceX = randomNum(0, 300);
      let glitchWidth = randomNum(20, canvasWidth);
      let destinationX = randomNum(0, canvasWidth / 2);

      glitchesArray[i] = new Glitch(img, sourceX, sourceY, glitchWidth, Number(glitchHeight), destinationX) 
      sourceY = sourceY + Number(glitchHeight);
    } 
  }

  function onGenerateClick() {
    console.log("calling generate")
    img = document.createElement("img");
    img.src = imgSrc;
    
    img.onload = () => {
      canvas = document.getElementById("canvas");
      canvasWidth = img.width
      canvasHeight = img.height;
      canvas.width = img.width;
      canvas.height = img.height;
  
      ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      ctx.globalAlpha = Number(opacity);
      ctx.globalCompositeOperation = blendingMode;
  
      setupGlitches();
      drawGlitches()
    }
  }

  // function onDownloadClick() {
  //   let link = document.createElement('a')
  //   canvas.setAttribute("crossOrigin",  "anonymous")

  //   canvas.toBlob(function(blob) {
  //     link.setAttribute(
  //       'download',
  //       'tri-' + Math.round(new Date().getTime() / 1000) + '.png'
  //     )
  
  //     link.setAttribute('href', URL.createObjectURL(blob))
  //     link.dispatchEvent(
  //       new MouseEvent('click', {
  //         bubbles: true,
  //         cancelable: true,
  //         view: window,
  //       })
  //     )
  //   })
  // }

  function drawGlitches() {
    glitchesArray.forEach((glitch) => {
      glitch.draw();
    });
  }

  function handleCompositeOperationChange(event) {
    setBlendingMode(event.target.value);
  }
  
  function handleOpacityChange(event) {
    setOpacity(event.target.value);
  }

  function handleGlitchesAmountChange(event) {
    setGlitchesAmount(event.target.value);
  }
  
  function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  return (
    <div>
      <Head>
        <title>Glitch Image Generator</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet"/>
      </Head>
      <main>
        <canvas id="canvas"></canvas>
        <div className="controls">
          <h1>glitchy image generator</h1>
          <div className="label">blending mode</div> 
          <select
            className="blending-input input"
            value={blendingMode}
            name="blending-mode"
            onChange={handleCompositeOperationChange}
          >
            {blendingModes.map((mode) => {
              return <option value={mode} key={mode}>{mode}</option>
            })}
          </select>
          <div className="label">amount of glitches</div> 
          <Slider
            onChange={handleGlitchesAmountChange}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            defaultValue={30}
          />
          <div className="label">glitch opacity</div> 
          <Slider
            onChange={handleOpacityChange}
            min={0}
            max={1}
            step={0.1}
            placeholder="Between 0 and 1"
            valueLabelDisplay="auto"
            defaultValue={0.4}
          />
          <div className="buttons-wrapper"></div>
          <button className="generate-button" onClick={onGenerateClick}>
            generate
          </button>
          {/* <button className="generate-button" onClick={onDownloadClick}>
            download
          </button> */}
        </div>
      </main>
    </div>
  )
}
