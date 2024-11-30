import fs from 'fs';
import path from 'path';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import svg2ttf from 'svg2ttf';
import ttf2eot from 'ttf2eot';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';

// const repoUrl = 'https://raw.githubusercontent.com/layui/layui/';
const repoUrl = 'https://gitee.com/layui/layui/raw/';
const font = 'woff'

const fontFormatMap = {
  ttf: 'truetype',
  woff: 'woff',
  woff2: 'woff2',
  svg: 'svg',
  eot: 'embedded-opentype',
};
const iconsInfo = [];

await fontWorker();
await jsWorker();
await cssWorker();

async function cssWorker() {
  let text = `
/* 动画 */
.layui-anim{-webkit-animation-duration: 0.3s; -webkit-animation-fill-mode: both; animation-duration: 0.3s; animation-fill-mode: both;}
.layui-anim.layui-icon{display: inline-block;}
.layui-anim-loop{-webkit-animation-iteration-count: infinite; animation-iteration-count: infinite;}

/* 循环旋转 */
@-webkit-keyframes layui-rotate{from{-webkit-transform: rotate(0deg);} to{-webkit-transform: rotate(360deg);}}
@keyframes layui-rotate{from{transform: rotate(0deg);} to{transform: rotate(360deg);}}
.layui-anim-rotate{-webkit-animation-name: layui-rotate; animation-name: layui-rotate; -webkit-animation-duration: 1s; animation-duration: 1s;  -webkit-animation-timing-function: linear; animation-timing-function: linear;}

/* 图标字体 */
@font-face {
  font-family: 'layui-icon';
  src: url(../font/iconfont.${font}) format('${fontFormatMap[font]}');
}
                    
.layui-icon{
  font-family:"layui-icon" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* layer-font-class */
`;
  iconsInfo.forEach((icon) => {
    text += `.layui-icon-${icon.name}:before{content:"\\${icon.unicode}"}\n`;
  })
  text += await fetchText(`${repoUrl}HEAD/src/css/modules/layer.css`);

  writeFile('./src/css/layer.css', text);
}

async function jsWorker() {
  let text = await fetchText(`${repoUrl}HEAD/src/modules/layer.js`);
  text = text
    .replace(';!function(window, undefined){', "import jQuery from 'jquery';\nimport './css/layer.css';")
    .replace('}(window);', '')
    .replace('var layer =', 'export var layer =')
    .replaceAll('window.jQuery', 'jQuery');
  
  writeFile('./src/layer.js', text);
}

async function fontWorker() {
  const icons = ['tips','success','error','question','lock','face-cry','face-smile','close','right','left','loading','loading-1','refresh','refresh-1','reduce-circle','add-circle','slider'];
  let svgText = await fetchText(`${repoUrl}HEAD/src/font/iconfont.svg`);
  const xmlDoc = new DOMParser().parseFromString(svgText, 'application/xml');
  const oFont = xmlDoc.getElementsByTagName('font')[0];
  const oGlyphs = oFont.getElementsByTagName('glyph');
  let index = oGlyphs.length;
  while(index--){
    const fontEle = oGlyphs[index];
    const name = fontEle.getAttribute('glyph-name');
    if (icons.includes(name)) {
      iconsInfo.push({
        name,
        unicode: fontEle.getAttribute('unicode').charCodeAt(0).toString(16),
      }); 
      fontEle.setAttribute('unicode', `&#${fontEle.getAttribute('unicode').charCodeAt(0)};`);     
    } else{
      fontEle.parentNode.removeChild(fontEle);
    }
  }

  svgText = new XMLSerializer()
    .serializeToString(xmlDoc)
    .replace(/(\n[\s\t]*\r*\n)/g, '\n')
    .replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '')
    .replace(/&amp;/g, '&');
  const ttfBuffer = Buffer.from(svg2ttf(svgText).buffer);

  writeFile('./src/font/iconfont.svg', svgText);
  writeFile('./src/font/iconfont.ttf', ttfBuffer);
  writeFile('./src/font/iconfont.woff', Buffer.from(ttf2woff(ttfBuffer)));
  writeFile('./src/font/iconfont.woff2', Buffer.from(ttf2woff2(ttfBuffer)));
  writeFile('./src/font/iconfont.eot', Buffer.from(ttf2eot(ttfBuffer)));
}

async function fetchText(url) {
  let text = await (await fetch(url)).text();
  return text;
}

function writeFile(filePath, content){
  const writePath = path.resolve(process.cwd(), filePath);
  fs.writeFileSync(writePath, content);
  console.log(writePath);
}
