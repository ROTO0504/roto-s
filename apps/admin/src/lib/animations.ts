import gsap from "gsap"

export function staggerRows(rows: HTMLElement[] | NodeListOf<Element>) {
  gsap.fromTo(rows, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out", stagger: 0.04 })
}

export function popCheck(el: Element) {
  gsap.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(2.5)" })
}

export function slideToast(el: Element) {
  gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24, ease: "power2.out" })
}

export function fadeIn(el: Element, delay = 0) {
  gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out", delay })
}
