document.querySelector('button').addEventListener('click', () => {
  const au = new Audio('sound/onindex.mp3')
  au.volume = 0.1
  au.play()
  setTimeout(() =>{
    window.location.href = 'game.html'
  },4500)
})

