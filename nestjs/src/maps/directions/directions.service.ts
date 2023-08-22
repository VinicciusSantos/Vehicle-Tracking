import { Injectable } from '@nestjs/common';
import {
  DirectionsRequest,
  Client as GoogleMapsClient,
  TravelMode,
} from '@googlemaps/google-maps-services-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DirectionsService {
  constructor(
    private googleMapsClient: GoogleMapsClient,
    private configService: ConfigService,
  ) {}

  public async getDirections(
    placeOriginId: string,
    placeDestinationId: string,
  ) {
    const params: DirectionsRequest['params'] = {
      origin: `place_id:${placeOriginId.replace('place_id:', '')}`,
      destination: `place_id:${placeDestinationId.replace('place_id:', '')}`,
      mode: TravelMode.driving,
      key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
    };
    const { data } = await this.googleMapsClient.directions({ params });
    return {
      ...data,
      request: {
        origin: {
          placeId: placeOriginId,
          location: {
            lat: data.routes[0].legs[0].start_location.lat,
            lng: data.routes[0].legs[0].start_location.lng,
          },
        },
        destination: {
          placeId: placeDestinationId,
          location: {
            lat: data.routes[0].legs[0].end_location.lat,
            lng: data.routes[0].legs[0].end_location.lng,
          },
        },
        mode: params.mode,
      },
    };
  }
}
