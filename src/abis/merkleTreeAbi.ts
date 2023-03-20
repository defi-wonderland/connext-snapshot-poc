export const merkleTreeAbi = [
  { inputs: [], name: 'MerkleLib__insert_treeIsFull', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'root', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'count', type: 'uint256' },
      { indexed: false, internalType: 'bytes32', name: 'leaf', type: 'bytes32' }
    ],
    name: 'LeafInserted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'root', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'count', type: 'uint256' },
      { indexed: false, internalType: 'bytes32[]', name: 'leaves', type: 'bytes32[]' }
    ],
    name: 'LeavesInserted',
    type: 'event'
  },
  {
    inputs: [],
    name: 'branch',
    outputs: [{ internalType: 'bytes32[32]', name: '', type: 'bytes32[32]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'count',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'leaf', type: 'bytes32' }],
    name: 'insert',
    outputs: [
      { internalType: 'bytes32', name: '_root', type: 'bytes32' },
      { internalType: 'uint256', name: '_count', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32[]', name: 'leaves', type: 'bytes32[]' }],
    name: 'insert',
    outputs: [
      { internalType: 'bytes32', name: '_root', type: 'bytes32' },
      { internalType: 'uint256', name: '_count', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'root',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'rootAndCount',
    outputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'tree',
    outputs: [{ internalType: 'uint256', name: 'count', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];
