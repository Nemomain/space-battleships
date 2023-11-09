document.querySelectorAll('button').forEach((value => {
  value.addEventListener('click', (e) => {
    let variable
    if (e.target.innerText === 'PLAY EASY') {
      variable = 'easy'
    } else if (e.target.innerText === 'PLAY NORMAL') {
      variable = 'normal'
    } else if (e.target.innerText === 'PLAY HARD') {
      variable = 'hard'
    } else if (e.target.innerText === '2 PLAYERS') {
      variable = '2p'
    }
    localStorage.setItem('gameMode', variable)
    
    document.querySelector('.botonera').style.display = 'none'
    const au = new Audio('sound/onindex.mp3')
    au.volume = 0.2
    au.play()
    setTimeout(() =>{
      window.location.href = 'game.html'
    },4500)
  })
}))