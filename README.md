# Tim's library for calculating element positions for a hierarchical graph visualization

## How to use

The main function is `addPositionsSimple`, which has the following signature...

```typescript
export function addPositionsSimple(
  m: Model,
  customStyleProps?: CustomPositionStyle
): {
  nodeCoordMap: NodeCoordMap;
  edgeCoordMap: EdgeCoordMap;
  tileCoordMap: TileCoordMap;
  columns: Columns;
  bounds: ModelBounds;
} {
  // function
}
  ```
