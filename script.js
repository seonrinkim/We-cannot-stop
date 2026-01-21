const scrollArea = document.getElementById("scrollArea");
const paragraphs = document.querySelectorAll(".text p");

// 글자 분해 + 고정 랜덤
paragraphs.forEach(p => {
  const text = p.innerText;
  p.innerHTML = "";
  [...text].forEach(char => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.dataset.rx = (Math.random() - 0.5);
    span.dataset.ry = (Math.random() - 0.5);
    span.dataset.rr = (Math.random() - 0.5);
    p.appendChild(span);
  });
});

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// mid 문단의 인덱스 찾기
let midIndex = -1;
paragraphs.forEach((p, i) => {
  if (p.classList.contains("mid") && midIndex === -1) midIndex = i;
});

let rafId = null;

function updateEffects() {
  // mid 문단의 scrollRatio 계산
  let midScrollRatio = 0;
  if (midIndex !== -1) {
    const midRect = paragraphs[midIndex].getBoundingClientRect();
    const vh = window.innerHeight;
    midScrollRatio = clamp(
      (vh * 0.55 - (midRect.top + midRect.height / 2)) / (vh * 0.4),
      0,
      1
    );
  }

  paragraphs.forEach((p, index) => {
    let opacity = 1;
    let distortion = 0;
    let blur = 0;
    
    // mid 문단 자체
    if (p.classList.contains("mid")) {
      opacity = 1 - midScrollRatio * 0.25;
      distortion = midScrollRatio * 3;
      blur = midScrollRatio * 0.4;
    }
    // mid 이후 모든 문단들 (중반 + 후반 파트 전부)
    else if (index > midIndex && midIndex !== -1) {
      const positionAfterMid = index - midIndex;
      
      // hard 문단인지 체크
      if (p.classList.contains("hard")) {
        // hard는 약간만 더 강하게 (배율 조정)
        const multiplier = 1 + (positionAfterMid * 0.7);
        opacity = clamp(1 - midScrollRatio * 0.3 * multiplier, 0.35, 1);
        distortion = midScrollRatio * 4 * multiplier;
        blur = midScrollRatio * 0.5 * multiplier;
      } else {
        // 일반 하위 문단
        const multiplier = 1 + (positionAfterMid * 0.8);
        opacity = clamp(1 - midScrollRatio * 0.25 * multiplier, 0.4, 1);
        distortion = midScrollRatio * 3 * multiplier;
        blur = midScrollRatio * 0.4 * multiplier;
      }
    }
    
    p.querySelectorAll("span").forEach(span => {
      const x = span.dataset.rx * distortion;
      const y = span.dataset.ry * distortion;
      const r = span.dataset.rr * distortion * 1.5;
      span.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
      span.style.opacity = opacity;
      span.style.filter = `blur(${blur}px)`;
    });
  });
}

scrollArea.addEventListener("scroll", () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  rafId = requestAnimationFrame(updateEffects);
}, { passive: true });

// 초기 실행
updateEffects();