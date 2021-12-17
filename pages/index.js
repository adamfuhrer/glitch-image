import Head from 'next/head'
import { useEffect, useState, useCallback } from "react";
import Slider from '@mui/material/Slider';
import debounce from 'lodash.debounce';

var ctx;
var canvas;
var glitchesArray = [];

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
  const [amountOfGlitches, setAmountOfGlitches] = useState(40);
  const [imgSrc, setImgSrc] = useState("https://picdit.files.wordpress.com/2016/04/erik-jones-art-7.png");
  const [canvasWidth, setCanvasWidth] = useState();
  const [canvasHeight, setCanvasHeight] = useState();

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
      let destinationX = randomNum(0, canvasWidth / 1.5);

      glitchesArray[i] = new Glitch(img, sourceX, sourceY, glitchWidth, Number(glitchHeight), destinationX) 
      sourceY = sourceY + Number(glitchHeight);
    } 
  }

  function onGenerateClick() {
    console.log("calling generate")
    let img = document.createElement("img");
    img.src = imgSrc;
    
    img.onload = () => {
      canvas = document.getElementById("canvas");

      setCanvasWidth(img.width);
      setCanvasHeight(img.height);

      if (amountOfGlitches > canvasHeight) {
        setAmountOfGlitches(canvasHeight);
      }

      canvas.width = img.width;
      canvas.height = img.height;
  
      ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      ctx.globalAlpha = Number(opacity);
      ctx.globalCompositeOperation = blendingMode;
  
      setupGlitches();
      drawGlitches();
    }
  }

  function onDownloadClick() {
    let link = document.createElement('a')

    canvas.toBlob(function(blob) {
      link.setAttribute(
        'download',
        'glitch-image-' + Math.round(new Date().getTime() / 1000) + '.png'
      )
  
      link.setAttribute('href', URL.createObjectURL(blob))
      link.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      )
    })
  }

  function loadImage() {
    let input = document.querySelector('#file-input')
    
    function handleChange(e) {
      for (let item of this.files) {
        if (item.type.indexOf('image') < 0) {
          continue
        }
        let src = URL.createObjectURL(item)
        setImgSrc(src);
        onGenerateClick();
        this.removeEventListener('change', handleChange)
      }
    }

    input.addEventListener('change', handleChange)
    input.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    )
  }

  function drawGlitches() {
    glitchesArray.forEach((glitch) => {
      glitch.draw();
    });
  }

  function handleCompositeOperationChange(event) {
    setBlendingMode(event.target.value);
  }
  
  function handleOpacityChange(event) {
    if (event.target.value > 1) {
      setOpacity(1);
    } else {
      setOpacity(Number(event.target.value));
    }
  }

  function handleGlitchesAmountChange(event) {
    if (event.target.value > canvasHeight) {
      setAmountOfGlitches(Number(canvasHeight));
    } else {
      setAmountOfGlitches(Number(event.target.value))
    }
  }

  const debouncedhandleGlitchesAmountChange = useCallback(
    debounce(handleGlitchesAmountChange, 30)
  , []);
  
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
        <link href="https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap" rel="stylesheet"/>
      </Head>
      <main>
        <h1>glitch image generator</h1>
        <div className="controls">
          <div className="input-wrapper">
            <div className="label">mode</div> 
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
          </div>

          <div className="input-wrapper">
            <div className="label">amount</div>
            <Slider
              min={0}
              max={canvasHeight}
              value={amountOfGlitches}
              onChange={debouncedhandleGlitchesAmountChange}
            />
            <input
              type="number"
              className="input number-input"
              min={0}
              max={canvasHeight}
              value={amountOfGlitches}
              onChange={handleGlitchesAmountChange}/>
          </div>
          
          <div className="input-wrapper">
            <div className="label">opacity</div> 
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={opacity}
              onChange={handleOpacityChange}
            />
            <input
              type="number"
              className="input number-input"
              min={0}
              max={1}
              step={0.1}
              value={opacity}
              onChange={handleOpacityChange}/>
          </div>
        </div>

        <canvas id="canvas"></canvas>
        
        <input
          id="file-input"
          type="file"
          accept="image/*"
        />
        
        <div className="buttons-wrapper">
          <button className="generate-button" onClick={onGenerateClick}>
            generate
          </button>
          <button className="generate-button" onClick={onDownloadClick}>
            download
          </button>
          <button className="generate-button" onClick={loadImage}>
            upload
          </button>
        </div>
      </main>
    </div>
  )
}
