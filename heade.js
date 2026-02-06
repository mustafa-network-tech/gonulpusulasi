(function(){
    window.toggleHMenu = function() {
        document.getElementById('hPanel').classList.toggle('open');
    };
  
   
    function sync() {
        const lock = localStorage.getItem('p_lock');
        const choice = localStorage.getItem('p_choice');
        if(lock && Date.now() < parseInt(lock)) {
            box.classList.add('locked');
            pills.forEach(p => { if(p.getAttribute('data-opt') === choice) p.classList.add('selected'); });
        }
    }
    pills.forEach(p => {
        p.addEventListener('click', function(e) {
            e.stopPropagation();
            if(box.classList.contains('locked')) return;
            pills.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            localStorage.setItem('p_choice', this.getAttribute('data-opt'));
            localStorage.setItem('p_lock', new Date().setHours(24,0,0,0));
            setTimeout(() => box.classList.add('locked'), 400);
        });
    });
    sync();
})();
