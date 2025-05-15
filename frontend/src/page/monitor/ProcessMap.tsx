import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box } from "@chakra-ui/react";
import { InfraObjectProcess } from "../../type/models";
import { getCustomIcon } from "../../type/utils";
import { MapAutoCenter, InfraPopup } from "../../component/monitor/Process";

interface MapViewProps {
  infraObjects: InfraObjectProcess[];
  onAccept: (infra: InfraObjectProcess) => Promise<void>;
  onReject: (infra: InfraObjectProcess) => Promise<void>;
  onGoToTime: (infra: InfraObjectProcess) => void;
  firstMarkerRef: React.MutableRefObject<L.Marker | null>;
}

const ProcessMap: React.FC<MapViewProps> = ({
  infraObjects,
  onAccept,
  onReject,
  onGoToTime,
  firstMarkerRef,
}) => {
  // Auto-open first marker popup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (firstMarkerRef.current) {
        firstMarkerRef.current.openPopup();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [infraObjects, firstMarkerRef]);

  return (
    <Box w="70%" h="100%" position="relative" overflow="hidden">
      <MapContainer
        center={[21.028511, 105.804817]}
        zoom={20}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        gestureHandling={true}
        attributionControl={false}
        zoomControl={false}
        fullscreenControl={true}
      >
        <MapAutoCenter infraObjects={infraObjects} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Default">
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Google Maps"
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="Topographic">
            <TileLayer
              attribution="Google Maps"
              url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {infraObjects.map((infra, index) => (
          <Marker
            key={infra.id || index}
            position={[infra.latitude, infra.longitude]}
            icon={getCustomIcon(infra.name)}
            ref={index === 0 ? firstMarkerRef : null}
          >
            <Popup maxWidth={400}>
              <InfraPopup
                infra={infra}
                onAccept={onAccept}
                onReject={onReject}
                onGoToTime={onGoToTime}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default ProcessMap;