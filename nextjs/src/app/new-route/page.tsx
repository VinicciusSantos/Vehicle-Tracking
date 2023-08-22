"use client";

import {
  DirectionsResponseData,
  FindPlaceFromTextResponseData,
} from "@googlemaps/google-maps-services-js";
import { FormEvent, useRef, useState } from "react";
import UseMap from "../hooks/useMap";

export default function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = UseMap(mapContainerRef);
  const [directionsData, setDirectionsData] = useState<
    DirectionsResponseData & { request: any }
  >();

  async function searchPlaces(event: FormEvent) {
    event.preventDefault();
    const source = document.getElementById("source") as HTMLInputElement;
    const destination = document.getElementById("dest") as HTMLInputElement;

    const [sourceResponse, destinationResponse] = await Promise.all([
      fetch(`http://localhost:3000/places?text=${source.value}`),
      fetch(`http://localhost:3000/places?text=${destination.value}`),
    ]);

    const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] =
      await Promise.all([sourceResponse.json(), destinationResponse.json()]);

    if (sourcePlace.status !== "OK") return alert("Origem não encontrada");

    if (destinationPlace.status !== "OK")
      return alert("Destino não encontrado");

    const sourcePlaceId = sourcePlace.candidates[0].place_id;
    const destinationPlaceId = destinationPlace.candidates[0].place_id;

    const directionsReponse = await fetch(
      `http://localhost:3000/directions?originId=${sourcePlaceId}&destinationId=${destinationPlaceId}`
    );

    const directionsData: DirectionsResponseData & { request: any } =
      await directionsReponse.json();
    setDirectionsData(directionsData);

    map?.removeAllRoutes();
    await map?.addRouteWithIcons({
      routeId: "1",
      startMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: directionsData.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
    });
  }

  async function createRoute() {
    const startAddress = directionsData?.routes[0].legs[0].start_address;
    const endAddress = directionsData?.routes[0].legs[0].end_address;

    const response = await fetch("http://localhost:3000/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${startAddress} - ${endAddress}`,
        source_id: directionsData?.request.origin.placeId,
        destination_id: directionsData?.request.destination.placeId,
      }),
    });
    const route = await response.json();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      <div>
        <h1>Nova rota</h1>
        <form
          onSubmit={searchPlaces}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div>
            <input id="source" type="text" placeholder="origem" />
          </div>
          <div>
            <input id="dest" type="text" placeholder="destino" />
          </div>
          <button type="submit">Pesquisar</button>
        </form>
        {directionsData && (
          <ul>
            <li>Origem: {directionsData.routes[0].legs[0].start_address}</li>
            <li>Destino: {directionsData.routes[0].legs[0].end_address}</li>
            <li>
              <button onClick={createRoute}>Criar rota</button>
            </li>
          </ul>
        )}
      </div>
      <div
        id="map"
        style={{
          width: "100%",
          height: "100%",
        }}
        ref={mapContainerRef}
      ></div>
    </div>
  );
}
