/* ==========================================================================
   CỔNG THÔNG TIN ĐIỆN TỬ VĂN PHÒNG XÃ HỘI XÃ MỸ THIỆN
   CLIENT-SIDE JAVASCRIPT & ACCESSIBILITY LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Live Clock & Date in Vietnamese
  const clockElem = document.getElementById('live-clock');
  if (clockElem) {
    function updateClock() {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      clockElem.innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${dayName}, ${dateStr} - ${timeStr}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 2. Font Resizing Tools (Accessibility)
  const btnFontNormal = document.getElementById('btn-font-normal');
  const btnFontLarge = document.getElementById('btn-font-large');
  const btnFontXLarge = document.getElementById('btn-font-xlarge');
  const btnContrast = document.getElementById('btn-contrast');

  if (btnFontNormal) {
    btnFontNormal.addEventListener('click', () => {
      document.body.classList.remove('font-large', 'font-xlarge');
      localStorage.setItem('gov_font_size', 'normal');
    });
  }

  if (btnFontLarge) {
    btnFontLarge.addEventListener('click', () => {
      document.body.classList.remove('font-xlarge');
      document.body.classList.add('font-large');
      localStorage.setItem('gov_font_size', 'large');
    });
  }

  if (btnFontXLarge) {
    btnFontXLarge.addEventListener('click', () => {
      document.body.classList.remove('font-large');
      document.body.classList.add('font-xlarge');
      localStorage.setItem('gov_font_size', 'xlarge');
    });
  }

  if (btnContrast) {
    btnContrast.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
      const isContrast = document.body.classList.contains('high-contrast');
      localStorage.setItem('gov_contrast', isContrast ? 'high' : 'normal');
    });
  }

  // Restore saved accessibility preferences
  const savedFontSize = localStorage.getItem('gov_font_size');
  if (savedFontSize === 'large') document.body.classList.add('font-large');
  if (savedFontSize === 'xlarge') document.body.classList.add('font-xlarge');

  const savedContrast = localStorage.getItem('gov_contrast');
  if (savedContrast === 'high') document.body.classList.add('high-contrast');

  // 3. Simple Text-to-Speech (Đọc bài viết cho người thị lực kém)
  const btnTts = document.getElementById('btn-tts');
  if (btnTts) {
    btnTts.addEventListener('click', () => {
      const articleText = document.querySelector('.article-body') || document.querySelector('.main-wrapper');
      if (articleText && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          btnTts.innerHTML = '<i class="fa-solid fa-volume-high"></i> Đọc bài viết';
        } else {
          const textToRead = articleText.innerText;
          const utterance = new SpeechSynthesisUtterance(textToRead.substring(0, 1000));
          utterance.lang = 'vi-VN';
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
          btnTts.innerHTML = '<i class="fa-solid fa-circle-stop"></i> Dừng đọc';
          utterance.onend = () => {
            btnTts.innerHTML = '<i class="fa-solid fa-volume-high"></i> Đọc bài viết';
          };
        }
      } else {
        alert('Trình duyệt của bạn không hỗ trợ tính năng Đọc văn bản.');
      }
    });
  }
});
