import { BigNumber } from 'ethers';

export interface Database {
  blockNumber: number;
  blockTimestamp: number;
  optimisticMode: boolean;
  lastPropagatedRoot: string;
  proposedAggregateRoot: ProposedData;
  lastVerifiedOptimisticAggregateRoot: ProposedData;
  snapshotRoots: string[];
  snapshotId: BigNumber;
}

export type ProposedData = {
  snapshotId: BigNumber;
  disputeCliff: BigNumber;
  aggregateRoot: string;
  snapshotsRoots: string[];
  domains: BigNumber[];
};

export type NETWORK = 'goerli' | 'optimism-goerli' | 'mumbai';
