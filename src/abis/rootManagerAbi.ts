export const rootManagerAbi = [
  {
    inputs: [{ internalType: 'address', name: '_merkle', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  { inputs: [], name: 'InvalidAggregateRoot', type: 'error' },
  { inputs: [], name: 'InvalidDomains', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'snapshotId', type: 'uint256' }],
    name: 'InvalidSnapshotId',
    type: 'error'
  },
  { inputs: [], name: 'OptimsiticModeOn', type: 'error' },
  { inputs: [], name: 'ProposeInProgress', type: 'error' },
  { inputs: [], name: 'SlowModeOn', type: 'error' },
  {
    inputs: [],
    name: 'DISPUTE_TIME',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'MERKLE',
    outputs: [{ internalType: 'contract MerkleTreeManager', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'SNAPSHOT_DURATION',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  { inputs: [], name: 'activateOptimisticMode', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'activateSlowMode', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'finalize', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [],
    name: 'getLastVerifiedOptimisticAggregateRootDomains',
    outputs: [{ internalType: 'uint32[]', name: '', type: 'uint32[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getLastVerifiedOptimisticAggregateRootSnapshots',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getProposedAggregateRootDomains',
    outputs: [{ internalType: 'uint32[]', name: '', type: 'uint32[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getProposedAggregateRootSnapshots',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'lastPropagatedRoot',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'lastVerifiedOptimisticAggregateRoot',
    outputs: [
      { internalType: 'uint256', name: 'snapshotId', type: 'uint256' },
      { internalType: 'uint256', name: 'disputeCliff', type: 'uint256' },
      { internalType: 'bytes32', name: 'aggregateRoot', type: 'bytes32' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'optimisticMode',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_snapshotId', type: 'uint256' },
      { internalType: 'bytes32', name: '_aggregateRoot', type: 'bytes32' },
      { internalType: 'bytes32[]', name: '_snapshotsRoots', type: 'bytes32[]' },
      { internalType: 'uint32[]', name: '_domains', type: 'uint32[]' }
    ],
    name: 'proposeAggregateRoot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'proposedAggregateRoot',
    outputs: [
      { internalType: 'uint256', name: 'snapshotId', type: 'uint256' },
      { internalType: 'uint256', name: 'disputeCliff', type: 'uint256' },
      { internalType: 'bytes32', name: 'aggregateRoot', type: 'bytes32' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_disputeTime', type: 'uint256' }],
    name: 'setDisputeTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_snapshotDuration', type: 'uint256' }],
    name: 'setSnapshotDuration',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];
