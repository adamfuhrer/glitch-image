import Head from 'next/head'
import {useEffect} from "react";

export default function Home() {
  useEffect(() => {
    onGenerateClick()
  });

  function onGenerateClick() {
    var img = document.createElement("img");
    img.src = 'https://images.genius.com/626ddf4c88de200d9487bb42449d1ae3.1000x1000x1.png';
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");

    let glitchHeight = 10;
    let glitchStepCounter = 0;
    const amountOfGlitches = window.innerHeight / glitchHeight;
    
    img.addEventListener('load', function() {
      ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
      
      for (let i = 0; i < amountOfGlitches; i++) {
        let img = document.createElement("img");
        img.src = 'https://images.genius.com/626ddf4c88de200d9487bb42449d1ae3.1000x1000x1.png';

        let imgWidth = randomNum(100, window.innerWidth);
  
        ctx.drawImage(
          img, 
          randomNum(0, 300), // source x
          glitchStepCounter, // source y
          imgWidth, // image width
          glitchHeight, // image height
          randomNum(0, 300), // dest x
          glitchStepCounter, // dest y
          imgWidth, // dest width
          glitchHeight // dest height
        )
  
        ctx.globalAlpha = randomNum(6, 10) * 0.1;
        glitchStepCounter = glitchStepCounter + glitchHeight;
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

      <main >
        <canvas id="canvas"></canvas>
        <button className="generate-button" onClick={onGenerateClick}>
          GENERATE
        </button>
      </main>
    </div>
  )
}
