"use strict";

function drawPopulationHeightmap() {
  console.log("in pop heightmap)");
  TIME && console.time("drawPopulationHeightmap");

  const ocean = terrs.select("#oceanHeights");
  const land = terrs.select("#landHeights");

  ocean.selectAll("*").remove();
  land.selectAll("*").remove();

  const paths = new Array(101);
  const {cells, vertices} = grid;
  const used = new Uint8Array(cells.i.length);
  //repalce the cells.h with a total pop calculator. 
  let cell_pops=[];
   let max_tot = 0;
  for(const ind1 in pack.cells.i ){
    let rur = pack.cells.pop[ind1];
    let urb = 0;
    if(pack.cells.burg[ind1]!=0){
      urb = pack.burgs[pack.cells.burg[ind1]].population;
    }
    if(rur+urb>max_tot){
      max_tot=rur+urb;
    }
    cell_pops[ind1]={
      i: ind1,
      rural: rur,
      urban: urb,
      tot: rur+urb,
      color: null
    }
  }
  //  max_tot = Math.max(cell_pops.tot);
console.log(max_tot);
for (let c_i in cell_pops){
  cell_pops[c_i].color=scaleColorHex(cell_pops[c_i].urb,cell_pops[c_i].rur,max_tot);
}
console.log(cell_pops);
/*
   let c_rural = [];
  let c_urban = [];
 let c_total = [];

 console.log(pack.area);
 
  for(let z = 0; z < pack.cells.b.length;z++){
    c_rural[z]=pack.cells.pop[z];
    c_urban[z]=0;
   if(pack.cells.burg[z]!=0){
    c_urban[z] = pack.burgs[pack.cells.burg[z]].population;
   }
   c_total[z] = c_rural[z] + c_urban[z];

  }
    max_tot = Math.max(c_total);

    const bodyPaths = new Array(pack.cells.b.length - 1);
    console.log("BodyPaths:" + bodyPaths);
    const isolines = getIsolines(pack, cellId => (scaleColorHex(c_urban[cellId],c_rural[cellId],max_tot)), {fill: true, waterGap: true});

    c_color = [];
    for(let c_i =0; c_i < c_total.length; c_i++){
      c_color[c_i]= scaleColorHex(c_urban[c_i],c_rural[c_u=i],max_tot);
    }

*/

  const heights = Array.from(cells.i).sort((a, b) => cells.h[a] - cells.h[b]);
//const heightspop = Array.from(cells.i).sort((a, b) => cell_pops[a].color - cell_pops[b].color);
//console.log(heightspop);
console.log("Now Heights");
console.log(heights);
//const 
  // ocean cells
  const renderOceanCells = Boolean(+ocean.attr("data-render"));
  if (renderOceanCells) {
    const skip = +ocean.attr("skip") + 1 || 1;
    const relax = +ocean.attr("relax") || 0;
    lineGen.curve(d3[ocean.attr("curve") || "curveBasisClosed"]);

    let currentLayer = 0;
    for (const i of cell_pops) {
      const h = cell_pops[i].tot;
      if (h > currentLayer) currentLayer += skip;
      if (h < currentLayer) continue;
      if (currentLayer >= 20) break;
      if (used[i]) continue; // already marked
      const onborder = cells.c[i].some(n => cells.h[n] < h);
      if (!onborder) continue;
      const vertex = cells.v[i].find(v => vertices.c[v].some(i => cells.h[i] < h));
      const chain = connectVertices(cells, vertices, vertex, h, used);
      if (chain.length < 3) continue;
      const points = simplifyLine(chain, relax).map(v => vertices.p[v]);
      if (!paths[h]) paths[h] = "";
      paths[h] += round(lineGen(points));
    }
  }

  // land cells
  {
    const skip = +land.attr("skip") + 1 || 1;
    const relax = +land.attr("relax") || 0;
    lineGen.curve(d3[land.attr("curve") || "curveBasisClosed"]);

    let currentLayer = 0.1;
    for (const i of heights) {
      const h = cells.h[i];
      if (h > currentLayer) currentLayer += skip;
      if (h < currentLayer) continue;
      if (currentLayer > 100) break; // no layers possible with height > 100
      if (used[i]) continue; // already marked
      const onborder = cells.c[i].some(n => cells.h[n] < h);
      if (!onborder) continue;

      const startVertex = cells.v[i].find(v => vertices.c[v].some(i => cells.h[i] < h));
      const chain = connectVertices(cells, vertices, startVertex, h, used);
      if (chain.length < 3) continue;

      const points = simplifyLine(chain, relax).map(v => vertices.p[v]);
      if (!paths[h]) paths[h] = "";
      paths[h] += round(lineGen(points));
    }
  }

  // render paths
  for (const height of d3.range(0, 101)) {
    const group = height < 20 ? ocean : land;
    const scheme = getColorScheme(group.attr("scheme"));

    if (height === 0 && renderOceanCells) {
      // draw base ocean layer
      group
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("fill", scheme(1));
    }

    if (height === 20) {
      // draw base land layer
      group
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("fill", scheme(0.8));
    }

    if (paths[height] && paths[height].length >= 10) {
      const terracing = group.attr("terracing") / 10 || 0;
      const color = getColor(height, scheme);

      if (terracing) {
        group
          .append("path")
          .attr("d", paths[height])
          .attr("transform", "translate(.7,1.4)")
          .attr("fill", d3.color(color).darker(terracing))
          .attr("data-height", height);
      }
      group.append("path").attr("d", paths[height]).attr("fill", color).attr("data-height", height);
    }
  }

  // connect vertices to chain: specific case for heightmap
  function connectVertices(cells, vertices, start, h, used) {
    const MAX_ITERATIONS = vertices.c.length;

    const n = cells.i.length;
    const chain = []; // vertices chain to form a path
    for (let i = 0, current = start; i === 0 || (current !== start && i < MAX_ITERATIONS); i++) {
      const prev = chain[chain.length - 1]; // previous vertex in chain
      chain.push(current); // add current vertex to sequence
      const c = vertices.c[current]; // cells adjacent to vertex
      c.filter(c => cells.h[c] === h).forEach(c => (used[c] = 1));
      const c0 = c[0] >= n || cells.h[c[0]] < h;
      const c1 = c[1] >= n || cells.h[c[1]] < h;
      const c2 = c[2] >= n || cells.h[c[2]] < h;
      const v = vertices.v[current]; // neighboring vertices
      if (v[0] !== prev && c0 !== c1) current = v[0];
      else if (v[1] !== prev && c1 !== c2) current = v[1];
      else if (v[2] !== prev && c0 !== c2) current = v[2];
      if (current === chain[chain.length - 1]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    return chain;
  }

  function simplifyLine(chain, simplification) {
    if (!simplification) return chain;
    const n = simplification + 1; // filter each nth element
    return chain.filter((d, i) => i % n === 0);
  }

  TIME && console.timeEnd("drawHeightmap");
}
