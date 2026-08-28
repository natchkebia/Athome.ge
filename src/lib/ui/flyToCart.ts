// "fly to cart" ანიმაცია — პროდუქტის სურათის მრგვალი ასლი გაფრინდება წყაროდან
// (ბარათის სურათი) header-ის სამიზნე აიქონისკენ (კალათა/ვიშლისტი), badge კი „ხტება".
// წყარო: მთლიანად client-side, DOM-ზე დეტაჩ ელემენტით — React render-ს არ ეხება.

const TARGET_IDS = {
  cart: ["mobile-nav-cart-icon", "nav-cart-icon"],
  wishlist: ["mobile-nav-wishlist-icon", "nav-wishlist-icon"],
} as const;

function findVisibleTarget(target: "cart" | "wishlist") {
  for (const id of TARGET_IDS[target]) {
    const element = document.getElementById(id);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return element;
  }

  return null;
}

export function flyToTarget(
  source: HTMLElement | null,
  imageUrl: string,
  target: "cart" | "wishlist"
) {
  if (typeof window === "undefined" || !source) return;

  const targetEl = findVisibleTarget(target);
  if (!targetEl) return;

  // reduced-motion — მხოლოდ badge bump, ფრენის გარეშე.
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduce || !imageUrl) {
    bump(targetEl);
    return;
  }

  const from = source.getBoundingClientRect();
  const to = targetEl.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) return;

  const size = 64;
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const endX = to.left + to.width / 2 - size / 2;
  const endY = to.top + to.height / 2 - size / 2;
  const dx = endX - startX;
  const dy = endY - startY;

  const flyer = document.createElement("div");
  flyer.style.cssText = [
    "position:fixed",
    `left:${startX}px`,
    `top:${startY}px`,
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:50%",
    "background-color:#fff",
    `background-image:url("${imageUrl}")`,
    "background-size:contain",
    "background-position:center",
    "background-repeat:no-repeat",
    "box-shadow:0 6px 18px rgba(0,0,0,.18)",
    "pointer-events:none",
    "z-index:99999",
    "will-change:transform,opacity",
  ].join(";");

  document.body.appendChild(flyer);

  // backstop — თუ ანიმაცია არ დასრულდა (მაგ. ტაბი ფონში გადავიდა), flyer მაინც წაიშალოს.
  const safety = window.setTimeout(() => {
    flyer.remove();
    bump(targetEl);
  }, 1600);

  // რკალი — შუა წერტილი ოდნავ მაღლა (dy*0.5 - 70), ბოლოს პატარავდება და ქრება.
  const anim = flyer.animate(
    [
      { transform: "translate(0px,0px) scale(1)", opacity: 1, offset: 0 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(0.7)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.12)`,
        opacity: 0,
        offset: 1,
      },
    ],
    { duration: 750, easing: "cubic-bezier(0.5,-0.15,0.75,1)" }
  );

  anim.onfinish = () => {
    window.clearTimeout(safety);
    flyer.remove();
    bump(targetEl);
  };
  anim.oncancel = () => {
    window.clearTimeout(safety);
    flyer.remove();
  };
}

function bump(el: HTMLElement | null) {
  if (!el) return;
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.35)" },
      { transform: "scale(1)" },
    ],
    { duration: 320, easing: "ease-out" }
  );
}
