import { capitalize, random, sample, shuffle } from 'lodash';

import { IEdge, INode } from './woodland-graph-creator';
import { ICampaign } from '../../../interfaces';
import { IContentMapLayout } from '../../../../../shared/interfaces';

export interface IGraphResult {
  nodes: INode[];
  edges: IEdge[];
}

export function generateLayout(campaign: ICampaign, mapLayouts: Record<string, IContentMapLayout>, width: number, height: number): IGraphResult {

  const nodes = [];

  const layout = mapLayouts[campaign.mapGenLayout];

  const flipX = sample([true, false]);
  const flipY = sample([true, false]);

  layout.nodePositions.forEach((pos, i) => {
    nodes.push({
      id: i,
      majority: 'marquise',
      r: 50,
      title: campaign.clearings[i].name,
      x: (flipX ? layout.maxX - pos.x : pos.x) * (width / layout.maxX),
      y: (flipY ? layout.maxY - pos.y : pos.y) * (height / layout.maxY),
    });
  });

  const oneWayEdges = {};
  campaign.clearings.forEach((c, i) => {
    c.landscape.clearingConnections.forEach(conn => {
      if (oneWayEdges[`${i}-${conn}`]) { return; }
      oneWayEdges[`${conn}-${i}`] = true;
    });
  });

  const edges = Object.keys(oneWayEdges)
    .map((key) => ({ source: nodes[+key.split('-')[0]], target: nodes[+key.split('-')[1]] }));

  return { nodes, edges };
}
