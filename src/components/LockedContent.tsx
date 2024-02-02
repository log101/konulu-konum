import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"

import "../styles/locked-content.css"
import type { Generated } from "kysely"

const incrementCounter = async (id: string | Generated<string>) =>
  await fetch(`${import.meta.env.PUBLIC_HOME_URL}/api/content/increment?id=${id}`)

const LocationButton = ({
  contentId = "",
  imageUrl = "#",
  location = ""
}: {
  contentId?: string | Generated<string>
  imageUrl?: string
  location?: string
}) => {
  const [atTarget, setAtTarget] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [watchId, setWatchId] = useState<number>()
  const [distanceRemain, setDistanceRemain] = useState<string>("")

  const targetCoordinates = JSON.parse(location).coordinates
  const targetPos = {
    lat: targetCoordinates[0],
    lng: targetCoordinates[1]
  }

  const startWatchingLocation = () => {
    setHasPermission(true)
    if (!watchId) {
      const id = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }

          // @ts-expect-error 3rd party script
          const targetLatLng = L.latLng(targetPos)

          // @ts-expect-error 3rd party script
          const currentLatLng = L.latLng(pos)

          const betweenMeters = currentLatLng.distanceTo(targetLatLng)

          if (betweenMeters > 1000) {
            setDistanceRemain(`${(betweenMeters / 1000).toFixed()} KM`)
          } else if (betweenMeters > 50) {
            setDistanceRemain(`${betweenMeters.toFixed(0)} M`)
          } else {
            setAtTarget(true)
          }
        },
        () => null,
        { enableHighAccuracy: true, maximumAge: 10000 }
      )

      setWatchId(id)
    }
  }

  const handleUnlock = async () => {
    setContentVisible(true)
    await incrementCounter(contentId)
  }

  if (contentVisible) {
    return (
      <div className='w-full h-[475px] p-4 flex justify-center'>
        <img src={imageUrl} />
      </div>
    )
  } else {
    return (
      <div className='w-full h-[475px] p-4'>
        {atTarget ? (
          <div className='flex flex-col justify-center items-center image-wrapper'>
            <img src={imageUrl} className='blur-lg h-[450px]' />

            <div className='flex flex-col justify-center gap-4 overlay'>
              <Button
                size='lg'
                className='text-lg p-6 animate-pulse bg-indigo-600 hover:bg-indigo-700 hover:animate-none border-2 border-indigo-800'
                onClick={handleUnlock}
              >
                <LockOpen1Icon className='mr-2 h-4 w-4' />
                İçeriğin Kilidi Açıldı
              </Button>

              <Card className='p-2'>
                <CardContent className='pb-0 text-center'>İçeriği görmek için butona bas!</CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className='flex flex-col justify-center items-center image-wrapper'>
            <img src={imageUrl} className='blur-lg h-[450px]' />
            <div className='flex flex-col justify-center gap-4 overlay'>
              <Button size='lg' className='text-md'>
                <LockClosedIcon className='mr-2 h-4 w-4' /> İçerik Kilitli
              </Button>
              <Card className='p-2'>
                {hasPermission ? (
                  <CardContent className='pb-0 text-center'>
                    <p>İçeriği görmek için konuma gitmelisin!</p>
                    <p>{distanceRemain && `Kalan mesafe: ${distanceRemain}`}</p>
                  </CardContent>
                ) : (
                  <div className='flex flex-col gap-2'>
                    <CardContent className='pb-0 text-center'>
                      Ne kadar yaklaştığını görmek için aşağıdaki butona bas.
                    </CardContent>

                    <Button
                      size='sm'
                      className='bg-green-700 hover:bg-green-600 text-md'
                      onClick={() => startWatchingLocation()}
                    >
                      Konum İzni Ver
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default LocationButton
