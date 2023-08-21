import { Controller, Get, Query } from '@nestjs/common';
import { DirectionsService } from './directions.service';

@Controller('directions')
export class DirectionsController {

    constructor(private directionsService: DirectionsService) {}

  @Get()
  public getDirections(
    @Query('originId') originId: string,
    @Query('destinationId') destinationId: string,
  ) {
    console.log(originId, destinationId);
    return this.directionsService.getDirections(originId, destinationId);
  }
}
