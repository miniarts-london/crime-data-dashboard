import 'leaflet';

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    showCoverageOnHover?: boolean;
    maxClusterRadius?: number;
    disableClusteringAtZoom?: number;
    spiderfyOnMaxZoom?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyDistanceMultiplier?: number;
  }

  interface MarkerCluster extends LayerGroup {
    getAllChildMarkers(): Marker[];
    spiderfy(): this;
    zoomToBounds(options?: { padding?: [number, number] }): this;
    getLatLng(): LatLng;
  }

  interface MarkerClusterMouseEvent extends LeafletEvent {
    layer: MarkerCluster;
  }

  interface MarkerClusterGroup extends FeatureGroup {}

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
