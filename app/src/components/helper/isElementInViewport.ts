declare const window: any
declare const document: any

export function isElementInViewport(el: any) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    /* or $(window).height() */ rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  )
}
