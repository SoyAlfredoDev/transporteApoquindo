export type PlaceLocation = string | google.maps.LatLngLiteral;

export interface PlaceValue {
  label: string;
  location: PlaceLocation;
}

export interface RouteRequest {
  id: number;
  origin: PlaceLocation;
  destination: PlaceLocation;
}

export interface RouteInfo {
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
}
