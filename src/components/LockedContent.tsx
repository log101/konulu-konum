import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import distance from "@/utils/distance"

import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"

import "../styles/locked-content.css"

const LocationButton = ({ imageUrl = "#" }: { imageUrl?: string }) => {
  const [atTarget, setAtTarget] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [watchId, setWatchId] = useState<number>()

  const startWatchingLocation = () => {
    setHasPermission(true)
    if (!watchId) {
      const id = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }

          const totalDistanceInKM = distance(pos.lat, pos.lng, pos.lat, pos.lng).toFixed(0)

          if (totalDistanceInKM === "0") {
            setAtTarget(true)
          }
        },
        () => null,
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      )

      setWatchId(id)
    }
  }

  useEffect(() => {
    navigator.permissions.query({ name: "geolocation" }).then(permissionStatus => {
      if (permissionStatus.state === "granted") {
        setHasPermission(true)
        startWatchingLocation()
      }
    })
  }, [])

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

            <div className='flex flex-col justify-center gap-2 overlay'>
              <Button size={"lg"} onClick={() => setContentVisible(true)}>
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
            <div className='flex flex-col justify-center gap-2 overlay'>
              <Button size='lg'>
                <LockClosedIcon className='mr-2 h-4 w-4' /> İçerik Kilitli
              </Button>
              <Card className='p-2'>
                {hasPermission ? (
                  <CardContent className='pb-0 text-center'>İçeriği görmek için konuma gitmelisin!</CardContent>
                ) : (
                  <div className='flex flex-col gap-2'>
                    <CardContent className='pb-0 text-center'>
                      Ne kadar yaklaştığını görmek için aşağıdaki butona bas.
                    </CardContent>

                    <Button
                      size={"sm"}
                      className='bg-green-700 hover:bg-green-600'
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
