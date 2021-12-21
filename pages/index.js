import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState, useCallback, useRef } from "react";
import debounce from 'lodash.debounce';
import Slider from '@mui/material/Slider';
import { createTheme, ThemeProvider } from '@mui/material';

var ctx;
var img;
var canvas;
var sp = 24;
var canvasWidth;
var canvasHeight;
var glitches = [];

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF3ED4",
    },
  },
});

function useAboutVisible(initialIsVisible) {
  const [isAboutVisible, setIsAboutVisible] = useState(initialIsVisible);
  const ref = useRef(null);

  const handleHide = (event) => {
    if (event.key === "Escape") {
      setIsAboutVisible(false);
    }
  };

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsAboutVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleHide, true);
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("keydown", handleHide, true);
      document.removeEventListener("click", handleClickOutside, true);
    };
  });

  return { ref, isAboutVisible, setIsAboutVisible };
}

export default function Home() {
  const blendingModes = [
    // "source-in",
    // "source-out",
    "difference",
    "source-atop",
    // "destination-over",
    // "destination-in",
    "destination-out",
    // "destination-atop",
    "lighter",
    // "copy",
    // "xor",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "exclusion",
    "hue",
    "color",
    "luminosity"
  ];

  const canvasRef = useRef(null)
  const fileUploadRef = useRef(null)
  const [blendingMode, setBlendingMode] = useState("difference");
  const [opacity, setOpacity] = useState(1);
  const [amountOfGlitches, setAmountOfGlitches] = useState(80);
  const [imgSrc, setImgSrc] = useState("test-image.jpeg");
  const [imgHeight, setImgHeight] = useState(0);
  const { ref, isAboutVisible, setIsAboutVisible } = useAboutVisible(false);

  useEffect(() => {
    onGenerateClick(true);
  }, [imgSrc, amountOfGlitches]);

  useEffect(() => {
    onGenerateClick();
  }, [opacity, blendingMode]);

  class Glitch {
    constructor(sourceX, sourceY, glitchWidth, glitchHeight, destinationX) {
      this.sourceX = sourceX;
      this.sourceY = sourceY;
      this.glitchWidth = glitchWidth;
      this.glitchHeight = glitchHeight
      this.destinationX = destinationX;
    }

    draw = () => {
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
    glitches = [];
    let sourceY = 0;
    let glitchHeight = canvasHeight / amountOfGlitches

    for (let i = 0; i < amountOfGlitches; i++) {
      let sourceX = randomNum(0, canvasWidth / 2);
      let glitchWidth = randomNum(20, canvasWidth);
      let destinationX = randomNum(0, canvasWidth / 1.75);

      glitches[i] = new Glitch(sourceX, sourceY, glitchWidth, glitchHeight, destinationX) 
      sourceY = sourceY + Number(glitchHeight);
    } 
  }

  function onGenerateClick(setup = false) {
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

      img.width = snapw;
      img.height = snaph;
      canvas.width = snapw;
      canvas.height = snaph;
      canvasWidth = snapw;
      canvasHeight = snaph;

      setImgHeight(canvasHeight);
      
      if (setup) {
        setupGlitches();
      }

      canvas = canvasRef.current;
      ctx = canvas.getContext("2d");
      ctx.clearRect( 0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      ctx.globalAlpha = Number(opacity);
      ctx.globalCompositeOperation = blendingMode;
  
      // Draw glitches on the canvas
      glitches.forEach(glitch => {
        glitch.draw();
      });
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

  const debouncedHandleGlitchesAmountChange = useCallback(
    debounce(handleGlitchesAmountChange, 20)
  , []);

  const debouncedHandleOpacityChange = useCallback(
    debounce(handleOpacityChange, 20)
  , []);
  
  function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  return (
    <div>
      <Head>
        <meta charSet="utf-8"/>
        <base href="/"></base>
        <title>Glitch Image Generator</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🖼️</text></svg>"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap" rel="stylesheet"/>

        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="description" content="Generate and save unique glitchy images"/>
        <meta name="keywords" content="art, design, generator, artwork, color, glitch, generative, generate"/>

        <meta property="og:url" content="https://www.glitchyimage.com"/>
        <meta property="og:title" content="Glitch Image Generator"/>
        <meta property="og:description" content="Generate and save unique glitchy images"/>

        <meta property="og:image" content="https://www.glitchyimage.com/glitch-vintage.jpeg"/>
        <meta property="og:site_name" content="Glitch Image Generator"/>
        <meta name="twitter:card" content="summary_large_image"/>
      </Head>
      <main>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K6GJQFZRFP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', 'G-K6GJQFZRFP');
          `}
        </Script>
        <ThemeProvider theme={theme}>
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
                color="primary"
                onChange={debouncedHandleGlitchesAmountChange}
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
                color="primary"
                onChange={debouncedHandleOpacityChange}
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

          <button className="about-button" onClick={() => setIsAboutVisible(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-help-circle">
              <circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
          {isAboutVisible &&
            <div ref={ref} className="about-section">
              <div>
                a generative tool which allows you to create and save unique glitchy images
              </div>
              <div>
                another generative glitch tool: <a href="https://glitchart.io/" target="_blank" rel="noreferrer">glitchart.io</a>
              </div>
              <div>
                project by <a href="https://adamfuhrer.com/" target="_blank" rel="noreferrer">adam fuhrer</a>
              </div>
            </div>
          }
        </ThemeProvider>
      </main>
    </div>
  )
}
