
init();

function init() {
  // --- Definitions --- //
  var vis     = d3.select("#vis"),
      // Constants
      WIDTH   = 400,
      HEIGHT  = 400,
      MARGINS = {
        top:    20,
        right:  20,
        bottom: 20,
        left:   50
      },
      N_SEGMENTS = 100,
      // Scales , ranges, domains
      xScale  = d3.scale.linear()
                .range([MARGINS.left, WIDTH - MARGINS.right])
                .domain([0, 200]),
      yScale  = d3.scale.linear()
                .range([HEIGHT - MARGINS.top, MARGINS.bottom])
                .domain([0, 200]),
      // Axes
      xAxis   = d3.svg.axis().scale(xScale),
      yAxis   = d3.svg.axis().scale(yScale).orient('left'),

      // Line generator
      lineGen = d3.svg.line()
                .x(function(d) {
                  return xScale(d.x);
                })
                .y(function(d) {
                  return yScale(d.y);
                })
                .interpolate("basis");
  //! --- Definitions --- //

  // Render our elements
      // -- Axes
    var xAxisEl = vis.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
      .call(xAxis);

    var xAxisLabel = vis.append("text")
      .attr("class", "axis-label")
      .attr("transform", "translate(170,420)")
      .text("Air volume (m3/h)");
    
    var yAxisEl = vis.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(" + (MARGINS.left) + ",0)")
      .call(yAxis);

    var yAxisLabel = vis.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -5)
      .attr("x",0 - (HEIGHT / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Static pressure (Pa)");
      // -- Paths

    var statLineEl = vis.append('svg:path')
      .attr('id', 'statLine')
      .attr('d', lineGen(getData()[0].data))
      .attr('stroke', 'red')
      .attr('stroke-width', 3)
      .attr('fill', 'none');

    var curveLineEl = vis.append('svg:path')
      .attr('id', 'curveLine')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3)
      .attr('fill', 'none');

      // -- Circles
    var dotSelectedEl = vis.append('circle')
      .attr("cy", 0)
      .attr("cy", 0)
      .attr("r", 0)
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .style("fill", "white");

    var dotIntersectionEl = vis.append('circle')
      .attr("cy", 0)
      .attr("cy", 0)
      .attr("r", 0)
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .style("fill", "white");

      // -- Segment layer
    var segments_g = vis.append("g");

  //! --- Rendering --- //

  // Attach events
    vis.on("click", graphOnClick);

  // Initialize and return our app object
    var app = {
      vis: vis,
      constants: {
        n_segments: N_SEGMENTS
      },
      elements: {
        statLine:        statLineEl,
        curveLine:       curveLineEl,
        dotSelected:     dotSelectedEl,
        dotIntersection: dotIntersectionEl,
        segments:        segments_g
      },
      generators: {
        line: lineGen
      },
      scales: {
        x: xScale,
        y: yScale
      }
    };

    window.app = app;

}

function graphOnClick() {
  var coords = d3.mouse(this);
  // Convert pixels to values according to our scale
  var clickedPoint = {
    x: Math.round(app.scales.x.invert(coords[0])),
    y: Math.round(app.scales.y.invert(coords[1]))
  };

  // Render the selected point
  app.elements.dotSelected
              .attr("cx", coords[0])
              .attr("cy", coords[1])
              .attr("r", 4);
  d3.select('#xclicked').html(clickedPoint.x);
  d3.select('#yclicked').html(clickedPoint.y);

  // Generate the curve according to the clicked point;
  var curve = generateCurve(clickedPoint);
  // Generate the pixels to be rendered
  var curvePixels = app.generators.line(curve);
  // Finally, render the curve;
  app.elements.curveLine.attr('d', curvePixels);


  // Calculate the point that the curve intersects with the static path
  var intersectionPoint = getIntersection().points;

  if (intersectionPoint.length){
    // Render the intersection point
    app.elements.dotIntersection
        .attr("cx", intersectionPoint[0].x)
        .attr("cy", intersectionPoint[0].y)
        .attr("r", 4);

    var intPoint = {
      x: Math.round(app.scales.x.invert(intersectionPoint[0].x)),
      y: Math.round(app.scales.y.invert(intersectionPoint[0].y)),
    };



    d3.select('#xint').html(intPoint.x);
    d3.select('#yint').html(intPoint.y);
  }

}

function generateCurve(point) {


  function alphaFromPoint(p){
    // a = y / x^2
    return p.y / Math.pow(p.x, 2)
  };

  function y(x) {
    // y = a * x^2
    var a = alphaFromPoint(point);
    return a * Math.pow(x, 2);
  }
  // Start from 0,0
  var datum = [{
    x: 0,
    y: 0
  }];
  // Iterate over x, with a step of 10, and generate a point with our y(x) fn
  for (var x = 10; x < 250; x += 10) {

    datum.push({
       x: x,
       y: y(x)
     });

  }
  return datum;
}

// Trying 2D library
function getIntersection(){
  // Define Elements
  var statLineEl = app.elements.statLine.node();
  var curveLineEl = app.elements.curveLine.node();

  // Kevin Lindsey's library
  var shape1 = new Path(statLineEl);
  var shape2 = new Path(curveLineEl);

  var inter = Intersection.intersectShapes(shape1, shape2);

  return inter;

}

function getData() {
  var datasets = [{
    label: 'Dataset 1',
    backgroundColor: 'transparent',
    borderColor: 'red',
    borderWidth: 2,
    data: [{
      y: 137.29,
      x: 0.1
    }, {
      y: 138.12,
      x: 14.37
    }, {
      y: 133.92,
      x: 36.69
    }, {
      y: 116.32,
      x: 64.73
    }, {
      y: 83.76,
      x: 91.1
    }, {
      y: 52.08,
      x: 108.49
    }, {
      y: 20.78,
      x: 122.14
    }, {
      y: 0,
      x: 129.99
    }]
  }];

  return datasets;
}
