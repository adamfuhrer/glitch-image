import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState, useRef } from "react";
import Slider from '@mui/material/Slider';
import { createTheme, ThemeProvider } from '@mui/material';

var img;
var canvas;
var ctx;
var sp = 25;
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
  const [amountOfGlitches, setAmountOfGlitches] = useState(60);
  const [maxAmountOfGlitches, setMaxAmountOfGlitches] = useState(400);
  const [imgSrc, setImgSrc] = useState("/test-image.jpeg");
  const [imgHeight, setImgHeight] = useState(0);
  const { ref, isAboutVisible, setIsAboutVisible } = useAboutVisible(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    onGenerateClick(true);
  }, [imgSrc, amountOfGlitches]);

  useEffect(() => {
    onGenerateClick();
  }, [opacity, blendingMode]);

  class Glitch {
    constructor(sourceX, sourceY, glitchWidth, glitchHeight, destinationX) {
      this.ratio = window.devicePixelRatio || 1;
      this.sourceX = sourceX;
      this.sourceY = sourceY;
      this.glitchWidth = glitchWidth;
      this.glitchHeight = glitchHeight
      this.destinationX = destinationX;
    }

    draw = () => {
      ctx.drawImage(
        canvas,
        this.sourceX * this.ratio, // Scale up the source image by the devicePixelRatio
        this.sourceY * this.ratio,
        this.glitchWidth * this.ratio,
        this.glitchHeight * this.ratio,
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
    let glitchHeight = canvasHeight / amountOfGlitches;

    for (let i = 0; i < amountOfGlitches; i++) {
      let sourceX = randomNum(0, canvasWidth / 2);
      let glitchWidth = randomNum(canvasWidth * 0.3, canvasWidth);
      let destinationX = randomNum(0, canvasWidth / 1.75);

      glitches[i] = new Glitch(sourceX, sourceY, glitchWidth, glitchHeight, destinationX) 
      sourceY = sourceY + Number(glitchHeight);
    } 
  }

  function onGenerateClick(setup = false) {
    canvas = canvasRef.current;
    img = document.createElement("img");
    img.src = imgSrc;
    
    if (img.complete) {
      processImg()
    } else {
      img.onload = processImg;
    }

    function processImg() {
      setIsImageLoaded(true)
      const dimensions = resizeImg(img);
      canvasWidth = dimensions.width;
      canvasHeight = dimensions.height;
      img.width = canvasWidth;
      img.height = canvasHeight;

      if (setup) {
        setupGlitches();
      }
      setMaxAmountOfGlitches(Math.round(canvasHeight / 2))
      setImgHeight(canvasHeight);
      
      // Account for high HiDPI screens, otherwise images drawn on canvas will be slightly blurry
      let ratio = window.devicePixelRatio || 1;
      canvas = canvasRef.current;
      canvas.width = canvasWidth * ratio;
      canvas.height = canvasHeight * ratio;
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';

      ctx = canvas.getContext("2d");
      ctx.scale(ratio, ratio);
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      ctx.globalAlpha = Number(opacity);
      ctx.globalCompositeOperation = blendingMode;
      ctx.imageSmoothingEnabled = false;

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

  // Image resizing from: https://github.com/constraint-systems/collapse/blob/master/pages/index.js
  function resizeImg(img) {
    let aspect = img.width / img.height;
    let window_aspect = (window.innerWidth - sp) / (window.innerHeight - sp * 8);
    let width, height;
    if (aspect < window_aspect) {
      let adj_height = Math.min(
        img.height,
        Math.floor(window.innerHeight - sp * 8)
      )
      height = Math.round(adj_height / sp) * sp
      let snapr = height / img.height
      width = Math.round((img.width * snapr) / sp) * sp
    } else {
      let adj_width = Math.min(
        img.width,
        Math.floor(window.innerWidth - sp) - sp / 2
      )
      width = Math.round(adj_width / sp) * sp
      let snapr = width / img.width
      height = Math.round((img.height * snapr) / sp) * sp
    }
    return { width, height }
  }

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
                max={maxAmountOfGlitches}
                value={amountOfGlitches}
                color="primary"
                onChange={handleGlitchesAmountChange}
              />
              <input
                type="number"
                className="input number-input"
                min={0}
                max={maxAmountOfGlitches}
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
          <canvas ref={canvasRef} className={isImageLoaded ? 'loaded' : null}></canvas>
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
                another generative glitch tool: <a href="https://glitchart.io/" target="_blank">glitchart.io</a>
              </div>
              <div>
                project by <a href="https://adamfuhrer.com/" target="_blank">adam fuhrer</a>
              </div>
              <div>
                <a className="github-link" title="Github repo" href="https://github.com/adamfuhrer/glitch-image" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Capa_1" x="0" y="0" width="438.55"
                      height="438.55" viewBox="0 0 438.55 438.55" xmlSpace="preserve" fill="none"
                      enableBackground="new 0 0 438.549 438.549">
                      <path d="M409.13 114.57c-19.61-33.6-46.2-60.19-79.8-79.8C295.74 15.17 259.06 5.37 219.27 5.37c-39.78 0-76.47 9.8-110.06 29.41 -33.6 19.61-60.19 46.2-79.8 79.8C9.8 148.17 0 184.85 0 224.63c0 47.78 13.94 90.75 41.83 128.91 27.88 38.16 63.91 64.57 108.06 79.23 5.14 0.95 8.95 0.28 11.42-2 2.48-2.28 3.71-5.14 3.71-8.56 0-0.57-0.05-5.71-0.14-15.42 -0.1-9.71-0.14-18.18-0.14-25.41l-6.57 1.14c-4.19 0.77-9.47 1.09-15.85 1 -6.37-0.09-12.99-0.76-19.84-2 -6.85-1.23-13.23-4.09-19.13-8.56 -5.9-4.47-10.09-10.33-12.56-17.56l-2.85-6.57c-1.9-4.37-4.9-9.23-8.99-14.56 -4.09-5.33-8.23-8.94-12.42-10.85l-2-1.43c-1.33-0.95-2.57-2.1-3.71-3.43 -1.14-1.33-2-2.66-2.57-4 -0.57-1.33-0.1-2.43 1.43-3.29 1.53-0.86 4.28-1.28 8.28-1.28l5.71 0.85c3.81 0.76 8.52 3.04 14.13 6.85 5.61 3.81 10.23 8.75 13.85 14.84 4.38 7.81 9.66 13.75 15.85 17.85 6.18 4.09 12.42 6.14 18.7 6.14 6.28 0 11.7-0.48 16.27-1.42 4.57-0.95 8.85-2.38 12.85-4.28 1.71-12.76 6.38-22.56 13.99-29.41 -10.85-1.14-20.6-2.86-29.26-5.14 -8.66-2.29-17.6-6-26.83-11.14 -9.23-5.14-16.9-11.52-22.98-19.13 -6.09-7.61-11.09-17.61-14.99-29.98 -3.9-12.37-5.85-26.65-5.85-42.83 0-23.03 7.52-42.64 22.56-58.82 -7.04-17.32-6.38-36.73 2-58.24 5.52-1.71 13.71-0.43 24.55 3.85 10.85 4.28 18.79 7.95 23.84 10.99 5.05 3.04 9.09 5.62 12.14 7.71 17.7-4.95 35.98-7.42 54.82-7.42s37.12 2.47 54.82 7.42l10.85-6.85c7.42-4.57 16.18-8.76 26.26-12.56 10.09-3.8 17.8-4.85 23.13-3.14 8.56 21.51 9.32 40.92 2.28 58.24 15.04 16.18 22.56 35.79 22.56 58.82 0 16.18-1.96 30.5-5.85 42.97 -3.9 12.47-8.94 22.46-15.12 29.98 -6.19 7.52-13.9 13.85-23.13 18.99 -9.23 5.14-18.18 8.85-26.84 11.14 -8.66 2.29-18.41 4-29.26 5.15 9.89 8.56 14.84 22.08 14.84 40.54v60.24c0 3.42 1.19 6.28 3.57 8.56 2.38 2.28 6.14 2.95 11.28 2 44.16-14.65 80.19-41.06 108.07-79.23 27.88-38.16 41.83-81.13 41.83-128.91C438.54 184.85 428.73 148.17 409.13 114.57z" />
                  </svg>
                </a>
              </div> 
            </div>
          }
        </ThemeProvider>
      </main>
    </div>
  )
}
