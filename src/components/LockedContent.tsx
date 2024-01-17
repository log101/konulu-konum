import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import distance from "@/utils/distance"

import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"

import "../styles/locked-content.css"

const LocationButton = () => {
  const [atTarget, setAtTarget] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  const startWatchingLocation = () => {
    setHasPermission(true)
    navigator.geolocation.watchPosition(
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
    return <div className='module-unlocked w-full h-[450px] p-4'></div>
  } else {
    return (
      <div className='module w-full h-[450px] p-4'>
        {atTarget ? (
          <div className='module-inside flex flex-col justify-center items-center gap-2'>
            <div>
              <Button size={"lg"} onClick={() => setContentVisible(true)}>
                <LockOpen1Icon className='mr-2 h-4 w-4' />
                İçeriğin Kilidi Açıldı
              </Button>
            </div>

            <Card className='p-2'>
              <CardContent className='pb-0 text-center'>İçeriği görmek için butona bas!</CardContent>
            </Card>
          </div>
        ) : (
          <div className='module-inside flex flex-col justify-center items-center gap-4'>
            <Button size={"lg"}>
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
        )}
      </div>
    )
  }
}

export default LocationButton
