
var en = require('hyphenation.en-us')
var latexjs = require('latex.js')


var basename = ''
if (process.env.NODE_ENV === 'production') {
  basename = window.location.protocol + '//' + window.location.hostname + '/static/css'
} else {
  basename = window.location.protocol + '//' + window.location.hostname + ':9001/static/css'
}


var generator = new latexjs.HtmlGenerator({
  hyphenate: true,
  languagePatterns: en
})

var scrollY = 0

function links () {
  var as = document.getElementsByTagName('a')
  for (var i = 0; i < as.length; i++) {
    if (as[i].getAttribute('href').startsWith('#')) {
      as[i].addEventListener('click', function (ev) {
        ev.preventDefault()
        var target = ev.target.getAttribute('href').substr(1)
        var te = document.getElementById(target)
        document.scrollingElement.scrollTop = offsetTop(te)
      })
    }
  }
}

function getVariable (el, propertyName) {
  return String(doc.defaultView.getComputedStyle(el).getPropertyValue('--' + propertyName)).trim()
};

function processTheElements () {
  var thes = document.querySelectorAll('.the')
  for (var i = 0; i < thes.length; i++) {
    var v = getVariable(thes[i], thes[i].getAttribute('display-var'))
    // only mutate if it actually changed
    if (thes[i].textContent !== v) {
      thes[i].textContent = v
    }
  }
}

function _vertical (el, tb) {
  var doc, docEl, rect, win

  // return zero for disconnected and hidden (display: none) elements, IE <= 11 only
  // running getBoundingClientRect() on a disconnected node in IE throws an error
  if (!el.getClientRects().length) {
    return 0
  }

  rect = el.getBoundingClientRect()

  doc = el.ownerDocument
  docEl = doc.documentElement
  win = doc.defaultView

  return rect[tb] + win.pageYOffset - docEl.clientTop
}

function offsetTop (el) {
  return _vertical(el, 'top')
}

function offsetBottom (el) {
  return _vertical(el, 'bottom')
}

function offsetBaseline (el) {
  var mpbaseline = el.querySelector('.mpbaseline')
  return offsetBottom(mpbaseline)
}

function heightAboveBaseline (el) {
  var baseline = offsetBaseline(el)
  var top = offsetTop(el)
  return baseline - top
}

function positionMarginpars () {
  var mpars = document.querySelectorAll('.marginpar > div')
  var prevBottom = 0

  mpars.forEach(function (mpar) {
    var mpref = document.querySelector('.body #marginref-' + mpar.id)

    var baselineref = offsetBottom(mpref)
    var heightAB = heightAboveBaseline(mpar)
    var height = mpar.offsetHeight

    // round to 1 digit
    var top = Math.round((baselineref - heightAB - prevBottom) * 10) / 10

    // only mutate if it actually changed
    if (mpar.style.marginTop !== Math.max(0, top) + 'px') {
      mpar.style.marginTop = Math.max(0, top) + 'px'
    }

    // if marginTop would have been negative, the element is now further down by that offset => add it to prevBottom
    prevBottom = baselineref - heightAB + height - Math.min(0, top)
  })
}

// don't call resize event handlers too often
var optimizedResize = (function () {
  var callbacks = []
  var running = false

  // fired on resize event
  function resize () {
    if (!running) {
      running = true
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks)
      } else {
        setTimeout(runCallbacks, 66)
      }
    }
  }

  // run the actual callbacks
  function runCallbacks () {
    callbacks.forEach(function (callback) { callback() })
    running = false
  }

  // adds callback to loop
  function addCallback (callback) {
    if (callback) {
      callbacks.push(callback)
    }
  }

  return {
    // public method to add additional callback
    add: function (callback) {
      if (!callbacks.length) {
        window.addEventListener('resize', resize)
      }
      addCallback(callback)
    }
  }
}())

// setupLogin event listeners
function completed () {
  document.removeEventListener('DOMContentLoaded', completed)
	window.removeEventListener('load', positionMarginpars)

  var observer = new MutationObserver(function () {
    processTheElements()
    positionMarginpars()
  })

  observer.observe(document, { attributes: true, childList: true, characterData: true, subtree: true })

  // add resize event listener
  optimizedResize.add(positionMarginpars)

  processTheElements()
  positionMarginpars()
}

document.addEventListener('DOMContentLoaded', completed)
window.addEventListener('load', completed)

/* function to compile latex source into the given iframe */
function compile (latex, iframe) {

  var doc = iframe.contentDocument

  if (doc.readyState !== 'complete') {
    return
  }

  try {
    generator.reset()
    var newDoc = latexjs.parse(latex, { generator: generator }).htmlDocument(basename)

    // we need to disable normal processing of same-page links in the iframe
    // see also https://stackoverflow.com/questions/50657574/iframe-with-srcdoc-same-page-links-load-the-parent-page-in-the-frame
    var linkScript = newDoc.createElement('script')
    linkScript.text = 'document.addEventListener("DOMContentLoaded", ' + links.toString() + ')'
    newDoc.head.appendChild(linkScript)

    // don't reload all the styles and fonts if not needed!
    if (doc.head.innerHTML === newDoc.head.innerHTML) {
      var newBody = doc.adoptNode(newDoc.body)
      doc.documentElement.replaceChild(newBody, doc.body)
      doc.documentElement.style.cssText = newDoc.documentElement.style.cssText
    } else {
      iframe.srcdoc = newDoc.documentElement.outerHTML

      // var blob = new Blob([newDoc.documentElement.innerHTML], {type : 'text/html'});
      // iframe.src = URL.createObjectURL(blob);
    }

    if (scrollY) {
      iframe.contentWindow.scrollTo(0, scrollY)
      scrollY = 0
    }
  } catch (e) {
    console.error(e)

    // save scrolling position and restore on next successful compile
    if (!scrollY) {
      scrollY = iframe.contentWindow.pageYOffset
    }

    if (e instanceof latexjs.SyntaxError) {
      var error = {
        line: definedOrElse(e.location.start.line, 0),
        column: definedOrElse(e.location.start.column, 0),
        message: e.message,
        found: definedOrElse(e.found, ''),
        expected: definedOrElse(e.expected, ''),
        location: excerpt(latex, definedOrElse(e.location.start.offset, 0))
      }

      doc.body.innerHTML = '<pre class="error">ERROR: Parsing failure:\n\n' + errorMessage(error, true) + '</pre>'
    } else {
      doc.body.innerHTML = '<pre class="error">ERROR: ' + e.message + '</pre>'
    }
  }
}

function definedOrElse (value, fallback) {
  return (typeof value !== 'undefined' ? value : fallback)
};

/* utility function: create a source excerpt */
function excerpt (txt, o) {
  var l = txt.length
  var b = o - 20; if (b < 0) b = 0
  var e = o + 20; if (e > l) e = l
  var hex = function (ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase()
  }
  var extract = function (txt, pos, len) {
    return txt.substr(pos, len)
    .replace(/\\/g, '\\\\')
    .replace(/\x08/g, '\\b')
    .replace(/\t/g, '\\t')
    .replace(/\n/g, '\\n')
    .replace(/\f/g, '\\f')
    .replace(/\r/g, '\\r')
    .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) { return '\\x0' + hex(ch) })
    .replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) { return '\\x' + hex(ch) })
    .replace(/[\u0100-\u0FFF]/g, function (ch) { return '\\u0' + hex(ch) })
    .replace(/[\u1000-\uFFFF]/g, function (ch) { return '\\u' + hex(ch) })
  }
  return {
    prolog: extract(txt, b, o - b),
    token: extract(txt, o, 1),
    epilog: extract(txt, o + 1, e - (o + 1))
  }
}

/* render a useful error message */
function errorMessage (e, noFinalNewline) {
  var l = e.location
  var prefix1 = 'line ' + e.line + ' (column ' + e.column + '): '
  var prefix2 = ''
  for (var i = 0; i < prefix1.length + l.prolog.length; i++) {
    prefix2 += '-'
  }
  var msg = prefix1 + l.prolog + l.token + l.epilog + '\n' +
      prefix2 + '^' + '\n' +
      e.message + (noFinalNewline ? '' : '\n')

  return msg
}

export default compile
