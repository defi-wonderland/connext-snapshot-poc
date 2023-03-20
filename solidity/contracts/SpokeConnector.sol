pragma solidity ^0.8.13;

contract SpokeConnector {
    uint256 public SNAPSHOT_DURATION = 3 minutes;

    mapping(uint256 => bytes32) public snapshotRoots;

    bytes32 public ROOT;

    // For PoC we just send the hash and set it as root to avoid real insertions.
    function dispatch(bytes32 _messageHash) external {
        // Before inserting the new message to the tree we need to check if the last snapshot root must be calculated and set.
        uint256 _lastCompletedSnapshotId = lastCompletedSnapshotId();
        if (snapshotRoots[_lastCompletedSnapshotId] == 0) {
            snapshotRoots[_lastCompletedSnapshotId] = ROOT;
            // emit SnapshotRootSaved(_lastCompletedSnapshotId, _currentRoot, MERKLE.count());
        }

        // Returns the root calculated after insertion of message, needed for events for
        ROOT = _messageHash;
    }

    function outboundRoot() external view returns (bytes32) {
        return ROOT;
    }

    function getCurrentSnapshotId() external view returns (uint256) {
        return currentSnapshotId();
    }

    function getLastCompletedSnapshotId() external view returns (uint256) {
        return lastCompletedSnapshotId();
    }

    function lastCompletedSnapshotId() internal view returns (uint256) {
        unchecked {
            return block.timestamp / SNAPSHOT_DURATION;
        }
    }

    function currentSnapshotId() internal view returns (uint256) {
        unchecked {
            return lastCompletedSnapshotId() + 1;
        }
    }

    function setRoot(bytes32 _root) external {
        ROOT = _root;
    }

    function setSnapshotDuration(uint256 _snapshotDuration) external {
        SNAPSHOT_DURATION = _snapshotDuration;
    }
}
