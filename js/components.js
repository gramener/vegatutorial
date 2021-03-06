/*
The declaration:

    <vega-chart>{ JSON Vega Spec here}</vega-chart>
    <vega-chart href="vega-spec.json"></vega-chart>

... is translated into a Vega chart. The <vega-chart> element gets the following
attributes:

- spec: The JSON spec that is drawn
- view: The vg.View that is returned by vg.parse.spec. You can use view.update()
  to update the view.
*/

var VegaChart = (function() {
  var proto = Object.create(HTMLElement.prototype)

  function draw_chart(spec, el) {
    el.spec = spec
    el.innerHTML = ''
    vg.parse.spec(el.spec, function(chart) {
      el.view = chart({el: el, renderer: 'svg'}).update()
    })
  }

  proto.attachedCallback = function() {
    var el = this,
        href = el.getAttribute('href')
    if (href)
      d3.json(href, function(error, spec) {
        if (error)
          return console.warn('Unable to load', href, error)
        draw_chart(spec, el)
      })
    else
      draw_chart(JSON.parse(el.textContent), el)
  }

  return document.registerElement('vega-chart', {prototype: proto})
})()


var MarkDown = (function() {
  var proto = Object.create(HTMLElement.prototype)

  proto.attachedCallback = function() {
    var el = this,
        markdown = el.textContent
    el.innerHTML = marked(dedent(markdown), {
      // highlight: TODO,
      smartypants: true
    })
  }

  return document.registerElement('mark-down', {prototype: proto})
})()


var LoadFile = (function() {
  var proto = Object.create(HTMLPreElement.prototype)

  proto.attachedCallback = function() {
    var el = this,
        href = el.getAttribute('href')

    if (href)
      d3.text(href, function(text) {
        el.innerHTML = text
      })
  }

  return document.registerElement('load-file', {
    prototype: proto,
    extends: 'pre'
  })
})()


var TableOfContents = (function() {
  var proto = Object.create(HTMLElement.prototype)

  proto.attachedCallback = function() {
    var el = this,
        href = el.getAttribute('href')
    if (href)
      d3.json(href, function(error, toc) {
        var filename = location.pathname.split('/').pop() || 'index.html'
        if (error)
          return console.warn('Unable to load', href, error)
        d3.select(el)
          .append('div')
          .classed('list-group', true)
          .selectAll('a')
            .data(toc)
          .enter()
            .append('a')
            .classed('list-group-item', true)
            .classed('active', function(row) { return row.href == filename })
            .classed('disabled', function(row) { return !row.href })
            .text(function(row) { return row.title })
            .filter(function(row) { return row.href })
            .attr('href', function(row) { return row.href })
      })
    else
      draw_chart(JSON.parse(el.textContent), el)
  }
  return document.registerElement('table-of-contents', {prototype: proto})
})()
