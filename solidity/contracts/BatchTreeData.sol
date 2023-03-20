// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import 'contracts/MerkleLib.sol';

interface IMerkleTreeManager {
    function count() external view returns (uint256);

    function branch() external view returns (bytes32[32] memory);
}

contract BatchTreeData {
    using MerkleLib for MerkleLib.Tree;

    struct TreeData {
        MerkleLib.Tree newTree;
        bytes32 root;
    }

    MerkleLib.Tree tree;

    constructor(IMerkleTreeManager merkleTreeManager, bytes32[] memory leaves) {
        TreeData memory returnData;

        {
            MerkleLib.Tree memory _tree;
            _tree.branch = merkleTreeManager.branch();
            _tree.count = merkleTreeManager.count();

            for (uint256 _i; _i < leaves.length; ) {
                // Insert the new node (using in-memory method).
                _tree = _tree.insert(leaves[_i]);
                unchecked {
                    ++_i;
                }
            }
            tree = _tree;
            returnData.newTree = tree;
            returnData.root = tree.root();
        }

        // encode return data
        bytes memory data = abi.encode(returnData);

        // force constructor return via assembly
        assembly {
            let dataStart := add(data, 32) // abi.encode adds an additional offset
            return(dataStart, sub(msize(), dataStart))
        }
    }
}
