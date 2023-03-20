import { providers } from 'ethers';

import {
  CONTRACTS,
  EMPTY_ROOT,
  getDatabase,
  insertLeavesAndGenerateRoot,
  NetworkProviders,
  proposeRoot
} from '../snapshot-utils';
import { Database } from '../types';

export async function snapshot_propose() {
  console.log('/////////////////////////////////////////////////////////');
  console.log('////////////// Start snapshot Propose ////////////////');
  console.log('///////////////////////////////////////////////////////\n');

  let database: Database;

  const networkProviders: NetworkProviders = {
    goerli: new providers.AlchemyProvider(5, process.env.ALCHEMY_GOERLI_KEY),
    'optimism-goerli': new providers.AlchemyProvider(420, process.env.ALCHEMY_OPTIMISM_GOERLI_KEY),
    mumbai: new providers.AlchemyProvider(80001, process.env.ALCHEMY_POLYGON_MUMBAI_KEY)
  };

  try {
    // Update local database
    database = await getDatabase(networkProviders);

    if (!database.optimisticMode) {
      throw new Error('Optimistic mode is off');
    }

    if (database.proposedAggregateRoot.aggregateRoot != EMPTY_ROOT) {
      throw new Error('Propose is in progress');
    }

    const proposedRoot = await insertLeavesAndGenerateRoot(
      database.snapshotRoots,
      networkProviders[CONTRACTS.ROOT_MERKLE_TREE.network]
    );

    const domains = [420, 80001] // op-goerli, mumbai;
    await proposeRoot(
      database.snapshotId,
      proposedRoot,
      database.snapshotRoots,
      domains,
      networkProviders[CONTRACTS.ROOT_MANAGER.network]
    );
  } catch (error) {
    console.error(error);
  }
}
