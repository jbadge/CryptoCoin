import React from 'react'
import { IconProps } from '../types/CoinTypes'
import genericIcon from '/cryptocurrency-icons/svg/color/generic.svg'

const Icon = ({ name, symbol }: IconProps) => {
  const iconElement = React.useRef<HTMLImageElement>(null)
  const [error, setError] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const onIconLoaded = () => setLoaded(true)

  React.useEffect(() => {
    const currIconElement = iconElement.current

    if (currIconElement) {
      currIconElement?.addEventListener('load', onIconLoaded)
      return () => currIconElement?.removeEventListener('load', onIconLoaded)
    }
  }, [iconElement])

  function handleImageError() {
    setError(true)
  }

  return (
    <>
      <p style={!loaded ? { display: 'block' } : { display: 'none' }}></p>
      <img
        // ref={iconElement}
        className="icon"
        src={
          !error ? `/cryptocurrency-icons/svg/color/${symbol}.svg` : genericIcon
        }
        onError={handleImageError}
        height="40px"
        width="40px"
        alt={`Image of ${name} icon`}
        style={loaded ? { display: 'inline-block' } : { display: 'none' }}
      />
    </>
  )
}

export default Icon
