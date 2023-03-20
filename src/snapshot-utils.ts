import { BigNumber, Contract, providers, utils, Wallet } from 'ethers';
import { merkleTreeAbi } from './abis/merkleTreeAbi';
import { rootManagerAbi } from './abis/rootManagerAbi';
import { spokeConnectorAbi } from './abis/spokeConnectorAbi';

import { bytecode as BatchTreeDataBytecode } from '../out/BatchTreeData.sol/BatchTreeData.json';
import { Database, NETWORK, ProposedData } from './types';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';

export type NetworkProviders = { [key in NETWORK]: providers.AlchemyProvider };

export const CONTRACTS: { [key: string]: { address: string; network: NETWORK; abi: any } } = {
  ROOT_MANAGER: {
    address: '0xF2039eEC8c31C4acb58e07bfA7D23cE8aB822403',
    network: 'goerli',
    abi: rootManagerAbi
  },
  ROOT_MERKLE_TREE: {
    address: '0xB15Af0DFb2FdCbf8F85862510Ff7AD085a183Bcc',
    network: 'goerli',
    abi: merkleTreeAbi
  }
};

export const EMPTY_ROOT = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const SPOKES: { [key: string]: { address: string; abi: any } } = {
  'optimism-goerli': {
    address: '0x472bc2DCE820228407CdD39958F2c36FE2874cC9',
    abi: spokeConnectorAbi
  },
  mumbai: {
    address: '0x6b7092804cbB52260633dF948F1Aa1F72E4ff419',
    abi: spokeConnectorAbi
  }
};

export const DOMAIN_NAMES: Record<string, string> = {
  420: 'optimism-goerli',
  80001: 'mumbai'
};

export const DOMAINS: NETWORK[] = ['optimism-goerli', 'mumbai'];

export async function getDatabase(networkProviders: NetworkProviders): Promise<Database> {
  const ROOT_MANAGER = CONTRACTS.ROOT_MANAGER;
  const rootProvider = networkProviders[ROOT_MANAGER.network];
  const rootManagerContract = new Contract(ROOT_MANAGER.address, ROOT_MANAGER.abi, rootProvider);

  const lastBlock = await rootProvider.getBlock('latest');
  const optimisticMode = await rootManagerContract.optimisticMode();
  const lastPropagatedRoot = await rootManagerContract.lastPropagatedRoot();

  // Get proposedAggregateRoot ProposedData
  let proposedAggregateRoot: ProposedData;
  {
    const { snapshotId, disputeCliff, aggregateRoot } = await rootManagerContract.proposedAggregateRoot();
    const snapshotsRoots = await rootManagerContract.getProposedAggregateRootSnapshots();
    const domains = await rootManagerContract.getProposedAggregateRootDomains();
    proposedAggregateRoot = {
      snapshotId,
      disputeCliff,
      aggregateRoot,
      snapshotsRoots,
      domains
    };
  }

  // Get lastVerifiedOptimisticAggregateRoot ProposedData
  let lastVerifiedOptimisticAggregateRoot: ProposedData;
  {
    const { snapshotId, disputeCliff, aggregateRoot } = await rootManagerContract.lastVerifiedOptimisticAggregateRoot();
    const snapshotsRoots = await rootManagerContract.getLastVerifiedOptimisticAggregateRootSnapshots();
    const domains = await rootManagerContract.getLastVerifiedOptimisticAggregateRootDomains();
    lastVerifiedOptimisticAggregateRoot = {
      snapshotId,
      disputeCliff,
      aggregateRoot,
      snapshotsRoots,
      domains
    };
  }

  const snapshotDuration = await rootManagerContract.SNAPSHOT_DURATION();
  const snapshotId = BigNumber.from(Math.floor(lastBlock.timestamp / snapshotDuration));

  const snapshotRoots: string[] = [];
  for (const domain of DOMAINS) {
    const SPOKE_CONNECTOR = SPOKES[domain];
    const SpokeContract = new Contract(SPOKE_CONNECTOR.address, SPOKE_CONNECTOR.abi, networkProviders[domain]);

    let snapshotRoot = await SpokeContract.snapshotRoots(snapshotId);
    if (snapshotRoot == EMPTY_ROOT) {
      snapshotRoot = await SpokeContract.outboundRoot();
    }
    snapshotRoots.push(snapshotRoot);
  }

  return {
    blockNumber: lastBlock.number,
    blockTimestamp: lastBlock.timestamp,
    optimisticMode,
    proposedAggregateRoot,
    lastVerifiedOptimisticAggregateRoot,
    lastPropagatedRoot,
    snapshotId,
    snapshotRoots
  };
}

export async function insertLeavesAndGenerateRoot(
  leaves: string[],
  provider: providers.AlchemyProvider
): Promise<string> {
  // Encoded input data to be sent to the batch contract constructor
  const inputData = utils.defaultAbiCoder.encode(
    ['address', 'bytes32[]'],
    [CONTRACTS.ROOT_MERKLE_TREE.address, leaves]
  );

  // Generate payload from input data
  const payload = BatchTreeDataBytecode.object.concat(inputData.slice(2));

  // Call the deployment transaction with the payload
  const returnedData = await provider.call({ data: payload });

  // Parse the returned value: [tree, root]
  const [decoded] = utils.defaultAbiCoder.decode(['tuple(tuple(bytes32[32], uint256), bytes32)'], returnedData);

  const newRoot = decoded[1];

  return newRoot;
}

export function getSigner(provider: providers.AlchemyProvider): Wallet {
  return new Wallet(process.env.TESTNET_DEPLOYER_PK, provider);
}

export async function finalize(provider: providers.AlchemyProvider) {
  const ROOT_MANAGER = CONTRACTS.ROOT_MANAGER;
  const signer = getSigner(provider);
  const rootManagerContract = new Contract(ROOT_MANAGER.address, ROOT_MANAGER.abi, signer);

  await sendTx(() => rootManagerContract.finalize());
}

export async function proposeRoot(
  snapshotId: BigNumber,
  aggregateRoot: string,
  snapshotRoots: string[],
  domains: number[],
  provider: providers.AlchemyProvider
) {
  console.log('PARAMS:');
  console.log({ snapshotId, aggregateRoot, snapshotRoots, domains });
  const ROOT_MANAGER = CONTRACTS.ROOT_MANAGER;
  const signer = getSigner(provider);
  const rootManagerContract = new Contract(ROOT_MANAGER.address, ROOT_MANAGER.abi, signer);

  await sendTx(() => rootManagerContract.proposeAggregateRoot(snapshotId, aggregateRoot, snapshotRoots, domains));
}

export async function sendTx(contractCall: () => Promise<TransactionResponse>): Promise<TransactionReceipt> {
  const tx: TransactionResponse = await contractCall();
  console.log(`Transaction submitted: ${tx.hash}`);

  // TODO manage status
  const receipt = await tx.wait();
  console.log('Transaction mined');

  return receipt;
}
