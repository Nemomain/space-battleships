document.querySelectorAll('button').forEach((value => {
  value.addEventListener('click', (e) => {
    if (e.target.innerText === 'PLAY EASY') {
      localStorage.setItem('gameMode', 'easy')
    } else if (e.target.innerText === 'PLAY NORMAL') {
      localStorage.setItem('gameMode', 'normal')
    }
    document.querySelector('.botonera').style.display = 'none'
    const au = new Audio('sound/onindex.mp3')
    au.volume = 0.1
    au.play()
    setTimeout(() =>{
      window.location.href = 'game.html'
    },4500)
  })
}))