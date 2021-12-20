import Head from 'next/head'
import { useEffect, useState, useCallback, useRef } from "react";
import Slider from '@mui/material/Slider';
import debounce from 'lodash.debounce';

var ctx;
var img;
var canvas;
var sp = 24;
var canvasWidth;
var canvasHeight;

export default function Home() {
  const blendingModes = [
    // "source-in",
    // "source-out",
    "source-atop",
    // "destination-over",
    // "destination-in",
    "destination-out",
    // "destination-atop",
    "lighter",
    // "copy",
    "xor",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "color",
    "luminosity"
  ];

  const canvasRef = useRef(null)
  const fileUploadRef = useRef(null)
  const [blendingMode, setBlendingMode] = useState(blendingModes[0]);
  const [opacity, setOpacity] = useState(1);
  const [amountOfGlitches, setAmountOfGlitches] = useState(80);
  const [imgSrc, setImgSrc] = useState("test-image.jpeg");
  const [imgHeight, setImgHeight] = useState(0);

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
      let destinationX = randomNum(0, canvasWidth / 1.5);

      let glitch = new Glitch(sourceX, sourceY, glitchWidth, glitchHeight, destinationX) 
      glitch.draw();
      sourceY = sourceY + Number(glitchHeight);
    } 
  }

  function onGenerateClick() {
    console.log("calling onGenerateClick()");
    canvas = canvasRef.current;
    
    img = document.createElement("img");
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

      setImgHeight(canvasHeight)

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
            <a className="info-button" href={"https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation"} target="_blank"  rel="noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-info">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </a>
          </div>

          <div className="input-wrapper glitches-amount">
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
          <button className="main-button" onClick={onGenerateClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-refresh-cw">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>generate</span>
          </button>
          <button className="main-button" onClick={loadImage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-upload">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>load image</span>
          </button>
          <button className="main-button" onClick={onDownloadClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-download">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>save as png</span>
          </button>
        </div>
      </main>
    </div>
  )
}
