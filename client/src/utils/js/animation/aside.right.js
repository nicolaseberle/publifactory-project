import $ from 'jquery'

function asideRightAnimation () {
    // Selectors object
    // ----------------
  var asideRight = {
    tags: $('.header-comments-reviews'),
    button: $('aside.comments-reviews'),
    pannel: {
      all: $('aside.content-comments-reviews'),
      links: $('aside.content-comments-reviews a'),
      reviews: $('aside.content-comments-reviews a.showreviews'),
      comments: $('aside.content-comments-reviews a.showcomments'),
      close: $('aside.content-comments-reviews a.close'),
      article: $('aside.content-comments-reviews  [data-review]')
    },
    comments: $('aside.content-comments-reviews section.comments'),
    reviews: $('aside.content-comments-reviews section.reviews'),
    scroll: {
      reviews: 0,
      comments: 0
    }
  }

  // Functions show or hide pannel
  // -----------------------------
  function showCommentsReviewsPannel () {
    asideRight.pannel.all.css('display', 'block')
  }

  function hideCommentsReviewsPannel () {
    asideRight.pannel.all.css('display', 'none')
  }

  // Function maj the scroll position object
  // ---------------------------------------
  function majScrollPosition () {
    if (asideRight.comments.css('display') === 'block') {
      asideRight.scroll.comments = asideRight.comments.scrollTop()
      console.log(asideRight.scroll.comments)
    } else {
      asideRight.scroll.reviews = asideRight.reviews.scrollTop()
      console.log(asideRight.scroll.reviews)
    }
  }

  // Function go to the previous position scroll of the pannel
  // ---------------------------------------------------------
  function goPreviousScrollPosition () {
    var offset = 0
    var delay = 0
    if (asideRight.comments.css('display') === 'block') {
      asideRight.comments.animate({
        scrollTop: asideRight.scroll.comments - offset
      }, delay)
    } else {
      asideRight.reviews.animate({
        scrollTop: asideRight.scroll.reviews - offset
      }, delay)
    }
  }

    // Show the pannel on click
    // ------------------------
  asideRight.button.on('click', () => {
    console.log('asideRight_button_click')
    showCommentsReviewsPannel()
    goPreviousScrollPosition()
  })

  asideRight.tags.on('click', () => {
    console.log('tags_button_click')
    showCommentsReviewsPannel()
    goPreviousScrollPosition()
  })

  // Close the pannel on click
  // -------------------------
  asideRight.pannel.close.on('click', () => {
    console.log('asideRight_pannel_close')
    majScrollPosition()
    hideCommentsReviewsPannel()
  })

  // Comments or Reviews pannel selection
  // ------------------------------------
  asideRight.pannel.comments.on('click', () => {
    asideRight.pannel.links.removeClass('active')
    asideRight.pannel.comments.addClass('active')
    majScrollPosition()
    asideRight.reviews.css('display', 'none')
    asideRight.comments.css('display', 'block')
    goPreviousScrollPosition()
  })

  asideRight.pannel.reviews.on('click', () => {
    asideRight.pannel.links.removeClass('active')
    asideRight.pannel.reviews.addClass('active')
    majScrollPosition()
    asideRight.comments.css('display', 'none')
    asideRight.reviews.css('display', 'block')
    goPreviousScrollPosition()
  })

  // Scroll to the related section reviewed in the article
  // -----------------------------------------------------
  asideRight.pannel.article.on('click', function () {
    const markup = $(this).attr('data-review')
    console.log('markup : ' + markup)
    const articleText = $("main article span[data-review='" + markup + "'")
    console.log('articleText : ' + articleText)
    const accordionPannel = articleText.parents('div.accordion-panel').get(0)
    accordionPannel.style.display = 'block'
    accordionPannel.previousElementSibling.classList.remove('collapsed-180deg', 'collapsed-90deg')

    var offset = 200
    var delay = 1000
    $('html, body').animate({
      scrollTop: $(articleText).offset().top - offset
    }, delay, 'swing')
  })
  asideRight.pannel.article.mouseenter(function () {
    const markup = $(this).attr('data-review')
    console.log('markup : ' + markup)
    const articleText = $("main article span[data-review='" + markup + "'")
    articleText.css('background-color', 'rgba(92, 115, 141, 0.3)')
  })
  asideRight.pannel.article.mouseleave(function () {
    const markup = $(this).attr('data-review')
    const articleText = $("main article span[data-review='" + markup + "'")
    articleText.css('background-color', 'white')
  })
}

export default asideRightAnimation
