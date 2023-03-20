import { Contract, providers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import {
  CONTRACTS,
  NetworkProviders,
  insertLeavesAndGenerateRoot,
  EMPTY_ROOT,
  DOMAIN_NAMES,
  SPOKES,
  sendTx
} from '../snapshot-utils';
import { ProposedData } from '../types';

export async function snapshot_monitorPropose() {
  console.log('/////////////////////////////////////////////////////////');
  console.log('////////////// Start snapshot Monitor Propose //////////');
  console.log('///////////////////////////////////////////////////////\n');

  const networkProviders: NetworkProviders = {
    goerli: new providers.AlchemyProvider(5, process.env.ALCHEMY_GOERLI_KEY),
    'optimism-goerli': new providers.AlchemyProvider(420, process.env.ALCHEMY_OPTIMISM_GOERLI_KEY),
    mumbai: new providers.AlchemyProvider(80001, process.env.ALCHEMY_POLYGON_MUMBAI_KEY)
  };

  const { ROOT_MANAGER } = CONTRACTS;

  const provider = networkProviders[ROOT_MANAGER.network];
  const rootManagerContract = new Contract(
    ROOT_MANAGER.address,
    ROOT_MANAGER.abi,
    networkProviders[ROOT_MANAGER.network]
  );

  const optimisticMode: boolean = await rootManagerContract.optimisticMode;

  if (!optimisticMode) {
    throw new Error('Optimistic mode is off');
  }

  const { snapshotId, disputeCliff, aggregateRoot } = await rootManagerContract.proposedAggregateRoot();
  const snapshotsRoots = await rootManagerContract.getProposedAggregateRootSnapshots();
  const domains = await rootManagerContract.getProposedAggregateRootDomains();

  const proposedData: ProposedData = {
    snapshotId,
    disputeCliff,
    aggregateRoot,
    snapshotsRoots,
    domains
  };

  processPropose(rootManagerContract, proposedData, networkProviders);

  // Listen event to know when a new proposition is submitted.
  provider.on('AggregateRootProposed', async (eventData) => {
    const proposedData = defaultAbiCoder.decode(
      ['uint256', 'uint256', 'bytes32', 'bytes32[]', 'uint32[]'],
      eventData.data
    )[0] as ProposedData;

    processPropose(rootManagerContract, proposedData, networkProviders);
  });
}

async function processPropose(rootManager: Contract, proposedData: ProposedData, networkProviders: NetworkProviders) {
  const snapshotRoots: string[] = [];

  if (proposedData.aggregateRoot == EMPTY_ROOT) {
    console.log(`There's no proposition ongoing`);
    return;
  }


  // Use the submitted and verified domains at the time of the propose.
  const spokeConnectors: Contract[] = proposedData.domains.map((domain) => {
    const domainName = DOMAIN_NAMES[domain as unknown as number];
    const spoke = SPOKES[domainName];
    return new Contract(spoke.address, spoke.abi, networkProviders[domainName]);
  });

  // Loop every domain and fetch the snapshot root directly from chains.
  for (const spokeConnector of spokeConnectors) {
    let outboundRoot = await spokeConnector.snapshotRoots(proposedData.snapshotId);

    if (outboundRoot == EMPTY_ROOT) {
      outboundRoot = await spokeConnector.outboundRoot();
    }

    snapshotRoots.push(outboundRoot);
  }

  // Use Batch contract trick to insert and calculate new aggregateRoot. Uses the merkle tree on-chain as base tree.
  const generatedAggregateRoot: string = await insertLeavesAndGenerateRoot(
    snapshotRoots,
    networkProviders[CONTRACTS.ROOT_MERKLE_TREE.network]
  );

  // Compare aggregateRoots and switch to slow mode if they are different.
  if (proposedData.aggregateRoot != generatedAggregateRoot) {
    console.warn('Must switch to slow mode');
    await sendTx(() => rootManager.activateSlowMode());
  } else {
    console.log('Proposed aggregateRoot is valid');
  }

}