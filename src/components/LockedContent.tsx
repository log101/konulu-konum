import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import distance from "@/utils/distance";

import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import "../styles/locked-content.css";

const LocationButton = () => {
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    setInterval(
      () =>
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            const totalDistanceInKM = distance(
              pos.lat,
              pos.lng,
              pos.lat,
              pos.lng
            ).toFixed(0);

            if (totalDistanceInKM === "0") {
              setIsLocked(false);
            }
          }
        ),
      3000
    );
  }, []);

  if (isLocked) {
    return (
      <div className="module w-full h-[450px] p-4">
        <div className="module-inside flex flex-col justify-center items-center gap-2">
          <div>
            <Button size={"lg"}>
              <LockClosedIcon className="mr-2 h-4 w-4" /> İçerik Kilitli
            </Button>
          </div>

          <Card className="p-2">
            <CardContent className="pb-0 text-center">
              İçeriği görmek için konuma gitmelisin!
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } else {
    return (
      <div className="module w-full h-[450px] p-4">
        <div className="module-inside flex flex-col justify-center items-center gap-2">
          <div>
            <Button size={"lg"} asChild>
              <a href="/unlocked">
                <LockOpen1Icon className="mr-2 h-4 w-4" />
                İçeriğin Kilidi Açıldı
              </a>
            </Button>
          </div>

          <Card className="p-2">
            <CardContent className="pb-0 text-center">
              İçeriği görmek için butona bas!
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
};

export default LocationButton;
