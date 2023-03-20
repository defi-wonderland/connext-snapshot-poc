// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.17;

import { MerkleLib } from 'contracts/MerkleLib.sol';

/**
 * @title MerkleTreeManager
 * @notice Contains a Merkle tree instance and exposes read/write functions for the tree.
 * @dev On the hub domain there are two MerkleTreeManager contracts, one for the hub and one for the MainnetSpokeConnector.
 */
contract MerkleTreeManager {
    // ============ Events ============

    event LeafInserted(bytes32 root, uint256 count, bytes32 leaf);

    event LeavesInserted(bytes32 root, uint256 count, bytes32[] leaves);

    // ============ Libraries ============

    using MerkleLib for MerkleLib.Tree;

    // ============ Public Storage ============

    /**
     * @notice Core data structure with which this contract is tasked with keeping custody.
     * Writable only by the designated arborist.
     */
    MerkleLib.Tree public tree;

    // ============ Getters ============

    /**
     * @notice Returns the current branch.
     */
    function branch() public view returns (bytes32[32] memory) {
        return tree.branch;
    }

    /**
     * @notice Calculates and returns the current root.
     */
    function root() public view returns (bytes32) {
        return tree.root();
    }

    /**
     * @notice Returns the number of inserted leaves in the tree (current index).
     */
    function count() public view returns (uint256) {
        return tree.count;
    }

    /**
     * @notice Convenience getter: returns the root and count.
     */
    function rootAndCount() public view returns (bytes32, uint256) {
        return (tree.root(), tree.count);
    }

    // ========= Public Functions =========

    /**
     * @notice Inserts the given leaves into the tree.
     * @param leaves The leaves to be inserted into the tree.
     * @return _root Current root for convenience.
     * @return _count Current node count (i.e. number of indices) AFTER the insertion of the new leaf,
     * provided for convenience.
     */
    function insert(bytes32[] memory leaves) public returns (bytes32 _root, uint256 _count) {
        // For > 1 leaf, considerably more efficient to put this tree into memory, conduct operations,
        // then re-assign it to storage - *especially* if we have multiple leaves to insert.
        MerkleLib.Tree memory _tree = tree;

        uint256 leafCount = leaves.length;
        for (uint256 i; i < leafCount; ) {
            // Insert the new node (using in-memory method).
            _tree = _tree.insert(leaves[i]);
            unchecked {
                ++i;
            }
        }
        // Write the newly updated tree to storage.
        tree = _tree;

        // Get return details for convenience.
        _count = _tree.count;
        // NOTE: Root calculation method currently reads from storage only.
        _root = tree.root();

        emit LeavesInserted(_root, _count, leaves);
    }

    /**
     * @notice Inserts the given leaf into the tree.
     * @param leaf The leaf to be inserted into the tree.
     * @return _root Current root for convenience.
     * @return _count Current node count (i.e. number of indices) AFTER the insertion of the new leaf,
     * provided for convenience.
     */
    function insert(bytes32 leaf) public returns (bytes32 _root, uint256 _count) {
        // Insert the new node.
        tree = tree.insert(leaf);
        _count = tree.count;
        _root = tree.root();

        emit LeafInserted(_root, _count, leaf);
    }

    // ============ Upgrade Gap ============
    uint256[48] private __GAP; // gap for upgrade safety
}
