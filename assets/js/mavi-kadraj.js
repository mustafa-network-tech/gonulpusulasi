(() => {
  const video = document.querySelector('.mk-video');
  const copy = document.getElementById('videoCopy');
  const textElement = document.getElementById('videoText');
  const signature = document.getElementById('videoSignature');
  const status = document.getElementById('videoStatus');
  const soundButton = document.getElementById('videoSound');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const texts = [...textElement.querySelectorAll('p')].flatMap(p => p.textContent.trim().split(/\r?\n/));
  const SIGNATURE_TIME = 43;
  const START_TIME = 0.5;
  const totalCharacters = texts.reduce((total, text) => total + Array.from(text).length, 0);
  const secondsPerCharacter = (SIGNATURE_TIME - START_TIME) / totalCharacters;
  let characterOffset = 0;
  textElement.setAttribute('aria-label', texts.join(' '));
  textElement.textContent = '';
  const lines = texts.map(text => {
    const line = document.createElement('p');
    line.className = 'mk-line';
    line.setAttribute('aria-hidden', 'true');
    const reserve = document.createElement('span');
    reserve.className = 'mk-reserve';
    reserve.textContent = text;
    const typed = document.createElement('span');
    line.append(reserve, typed);
    textElement.append(line);
    const characters = Array.from(text);
    const start = START_TIME + characterOffset * secondsPerCharacter;
    characterOffset += characters.length;
    return { line, typed, characters, start, duration: characters.length * secondsPerCharacter };
  });
  function render() {
    const time = video.currentTime;
    const finished = time >= SIGNATURE_TIME;
    copy.classList.toggle('is-fading', finished);
    signature.classList.toggle('is-visible', finished);
    let active = -1;
    for (const [index, entry] of lines.entries()) {
      if (time >= entry.start) active = index;
      const progress = Math.max(0, Math.min(1, (time - entry.start) / entry.duration));
      const count = reducedMotion && progress > 0 ? entry.characters.length : Math.floor(progress * entry.characters.length);
      const value = entry.characters.slice(0, count).join('');
      if (entry.typed.textContent !== value) entry.typed.textContent = value;
    }
    if (active >= 0) {
      const line = lines[active].line;
      const target = copy.clientHeight - line.offsetTop - line.offsetHeight - 14;
      textElement.style.transform = `translateY(${target}px)`;
    } else textElement.style.transform = `translateY(${copy.clientHeight}px)`;
  }
  let frame;
  function animate() {
    render();
    if (!video.paused && !video.ended) frame = requestAnimationFrame(animate);
  }
  video.addEventListener('playing', () => { cancelAnimationFrame(frame); animate(); });
  ['timeupdate', 'seeked', 'loadedmetadata', 'pause'].forEach(event => video.addEventListener(event, render));
  window.addEventListener('resize', render);
  document.fonts.ready.then(render);
  video.addEventListener('error', () => {
    status.textContent = 'Video yüklenemedi.';
    status.hidden = false;
  }, true);
  function updateSoundButton() {
    const audible = !video.muted && video.volume > 0;
    soundButton.textContent = audible ? 'Sesi kapat' : 'Sesi aç';
    soundButton.setAttribute('aria-pressed', String(audible));
  }
  video.addEventListener('volumechange', updateSoundButton);
  soundButton.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
    updateSoundButton();
    if (video.paused) video.play().then(() => { status.hidden = true; }).catch(() => {
      status.textContent = 'Video oynatılamadı. Yeniden deneyebilirsin.';
      status.hidden = false;
    });
  });
  video.muted = false;
  updateSoundButton();
  render();
  video.play().catch(() => {
    video.muted = true;
    updateSoundButton();
    video.play().catch(() => {
      status.textContent = 'Başlatmak için aşağıdaki Sesi aç düğmesine dokun.';
      status.hidden = false;
    });
  });
})();
