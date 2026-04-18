import React from 'react'

const navbar = (theme,setTheme) => {
  return (
    <div className=''>
      


      <img src={theme === 'dark' ? assets.imgDark: assets.imgLight} />
    </div>
  )
}

export default navbar
