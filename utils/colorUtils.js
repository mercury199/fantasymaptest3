"use strict";
// FMG utils related to colors

// convert RGB color string to HEX without #
function toHEX(rgb) {
  if (rgb.charAt(0) === "#") return rgb;

  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return rgb && rgb.length === 4
    ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2)
    : "";
}

const C_12 = [
  "#dababf",
  "#fb8072",
  "#80b1d3",
  "#fdb462",
  "#b3de69",
  "#fccde5",
  "#c6b9c1",
  "#bc80bd",
  "#ccebc5",
  "#ffed6f",
  "#8dd3c7",
  "#eb8de7"
];
const scaleRainbow = d3.scaleSequential(d3.interpolateRainbow);

// return array of standard shuffled colors
function getColors(number) {
  const colors = d3.shuffle(
    d3.range(number).map(i => (i < 12 ? C_12[i] : d3.color(scaleRainbow((i - 12) / (number - 12))).hex()))
  );
  return colors;
}

function getRandomColor() {
  return d3.color(d3.scaleSequential(d3.interpolateRainbow)(Math.random())).hex();
}

function getRandomColorUnique(others) {
  retval = d3.color(d3.scaleSequential(d3.interpolateRainbow)(Math.random())).hex();
  if(typeof others !== "undefined"){
      if (others.length>0){
        for (let i = 0; i < others.length;i++){
          if (others[i].color == retval){
            retval = d3.color(d3.interpolate(c, getRandomColor())(mix)).brighter(bright).hex();
            console.log("Repeated");
            i = 0;
          }
        }
      }else{
        console.log("Others not have any");
      }
    }else{
      console.log("Others IS BROKEN");
    }
  return retval;
}

// mix a color with a random color
function getMixedColor(color, mix = 0.2, bright = 0.3) {
  const c = color && color[0] === "#" ? color : getRandomColor(); // if provided color is not hex (e.g. harching), generate random one
  return d3.color(d3.interpolate(c, getRandomColor())(mix)).brighter(bright).hex();
}


function getMixedColorUnique(color, mix = 0.2, bright = 0.3,provs) {
  const c = color && color[0] === "#" ? color : getRandomColor(); // if provided color is not hex (e.g. harching), generate random one
  var retval = d3.color(d3.interpolate(c, getRandomColor())(mix)).brighter(bright).hex();
  let i = 0;
  let repeated = 0;
  //console.log("RV1: " + retval);
  if(typeof provs !== "undefined"){
    if (provs.length>0){
      //while(provs.color.find(check_same_color(retval))){
      for (let i = 0; i < provs.length;i++){
        if (provs[i].color == retval){
        
          retval = d3.color(d3.interpolate(c, getRandomColor())(mix)).brighter(bright).hex();
          console.log("Repeated");
          console.log("Length of Provs: " + provs.length);
          repeated +=1;
          mix =( ( Math.random() * 0.5)+0.15);
          bright = (( Math.random() * 0.3)+0.2);
         //   i = 0;
        }
        if(repeated >(provs.length*0.5)){
          mix =( ( Math.random() * 0.1)+0.15);
          bright = (( Math.random() * 0.2)+0.1);
        }
        if(repeated>provs.length+2){
          //we have a problems
          i=provs.length+4;
          retval = d3.color(d3.interpolate(c, getRandomColor())(mix)).brighter(bright).hex();
          //just need to exit fam.
         // break;
        }
      }
    }else{
      console.log("Provinces not have any");
    }
  }/*else{
    console.log("PROVS IS BROKEN");
  }*/
  //console.log("Retval: " + retval);
  return retval;
}


function scaleColorHex(urban, rural, max) {
  //console.log( "Urban " + urban + " Rural " + rural);
  const u = Math.max(0, Number(urban));
  const r = Math.max(0, Number(rural));
  //const m = Math.max(0, Number(max) || 0);
  const m = Math.max(0, Number(max));
//  console.log("U:" + u);
//  console.log("R:" + r);
  const total = u + r;

  // 0..1 where 0 = all rural (blue), 1 = all urban (red)
  const ratio = total > 0 ? (u / total) : 0.5;

 // console.log("Ratio:" + ratio);
  // 0..1 where 0 = white, 1 = full saturation
  const intensity = m > 0 ? Math.min(1, total / m) : 0;
 
  const lerp = (a, b, t) => a + (b - a) * t;

  // Base mix between blue and red
  const baseR = lerp(0, 255, ratio);
  const baseG = 0;
  const baseB = lerp(255, 0, ratio);

  // Fade from white to the base color based on intensity
  const R = Math.round(lerp(255, baseR, intensity));
  const G = Math.round(lerp(255, baseG, intensity));
  const B = Math.round(lerp(255, baseB, intensity));

 if(u>0 || r>0){
 // console.log("U:" + u);
//  console.log("R:" + r);
 // console.log("Ratio:" + ratio);
 // console.log("Intensity:" + intensity);
//  console.log("R: " + R);
 // console.log("G"+G);
//  console.log("B"+B);
  }
  if(m>0){
  //console.log("M:" + m);
  }






  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}


function check_same_color(color1,color2){
  return color1 == color2;
}