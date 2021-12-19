import Head from 'next/head'
import { useEffect, useState, useCallback, useRef } from "react";
import Slider from '@mui/material/Slider';
import debounce from 'lodash.debounce';

var ctx;
var canvas;
var sp = 26;
var canvasWidth;
var canvasHeight;

export default function Home() {
  const blendingModes = [
    "source-atop",
    "difference",
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

  const canvasRef = useRef(null)
  const fileUploadRef = useRef(null)
  const [blendingMode, setBlendingMode] = useState(blendingModes[0]);
  const [opacity, setOpacity] = useState(1);
  const [amountOfGlitches, setAmountOfGlitches] = useState(2);
  const [imgSrc, setImgSrc] = useState("https://picdit.files.wordpress.com/2016/04/erik-jones-art-7.png");

  useEffect(() => {
    onGenerateClick();
  }, [imgSrc, blendingMode, opacity, amountOfGlitches]);

  function Glitch(sourceX, sourceY, glitchWidth, glitchHeight, destinationX) {
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.glitchWidth = glitchWidth;
    this.glitchHeight = glitchHeight
    this.destinationX = destinationX;

    this.draw = () => {
      ctx.drawImage(
        canvas, 
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
    let glitchHeight = canvasHeight / amountOfGlitches

    for (let i = 0; i < amountOfGlitches; i++) {
      let sourceX = randomNum(0, 300);
      let glitchWidth = randomNum(20, canvasWidth);
      let destinationX = randomNum(0, canvasWidth / 1.25);

      let glitch = new Glitch(sourceX, sourceY, glitchWidth, glitchHeight, destinationX) 
      sourceY = sourceY + Number(glitchHeight);
      glitch.draw();
    } 
  }

  function onGenerateClick() {
    console.log("calling onGenerateClick()");
    canvas = canvasRef.current;
    
    let img = document.createElement("img");
    img.src = imgSrc;
    
    img.onload = () => {
      // canvas resizing from: https://github.com/constraint-systems/collapse/blob/master/pages/index.js
      let aspect = img.width / img.height;
      let window_aspect = (window.innerWidth - sp) / (window.innerHeight - sp * 8);
      let snapw, snaph;
      if (aspect < window_aspect) {
        let adj_height = Math.min(
          img.height,
          Math.floor(window.innerHeight - sp * 8)
        )
        snaph = Math.round(adj_height / sp) * sp
        let snapr = snaph / img.height
        snapw = Math.round((img.width * snapr) / sp) * sp
      } else {
        let adj_width = Math.min(
          img.width,
          Math.floor(window.innerWidth - sp) - sp / 2
        )
        snapw = Math.round(adj_width / sp) * sp
        let snapr = snapw / img.width
        snaph = Math.round((img.height * snapr) / sp) * sp
      }

      img.width = snapw
      img.height = snaph

      canvas.width = snapw;
      canvas.height = snaph;

      canvasWidth = snapw;
      canvasHeight = snaph;

      ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      ctx.globalAlpha = Number(opacity);
      ctx.globalCompositeOperation = blendingMode;
      setupGlitches();
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
    let input = fileUploadRef.current;
    
    function handleChange(e) {
      for (let item of this.files) {
        if (item.type.indexOf('image') < 0) {
          continue
        }
        let src = URL.createObjectURL(item)
        setImgSrc(src);
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
        <canvas ref={canvasRef}></canvas>
        <input
          ref={fileUploadRef}
          id="file-input"
          type="file"
          accept="image/*"
        />
        <div className="buttons-wrapper">
          <button className="generate-button" onClick={onGenerateClick}>
            generate
          </button>
          <button className="generate-button" onClick={onDownloadClick}>
            save as png
          </button>
          <button className="generate-button" onClick={loadImage}>
            load image
          </button>
        </div>
      </main>
    </div>
  )
}
