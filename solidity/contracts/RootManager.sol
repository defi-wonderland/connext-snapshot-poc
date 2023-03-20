pragma solidity 0.8.17;

import { MerkleTreeManager } from './MerkleTreeManager.sol';

contract RootManager {
    error InvalidSnapshotId(uint256 snapshotId);

    error InvalidDomains();

    error InvalidAggregateRoot();

    error SlowModeOn();

    error OptimsiticModeOn();

    error ProposeInProgress();

    /**
     * @notice Duration of the snapshot
     */
    uint256 public SNAPSHOT_DURATION = 3 minutes;

    uint256 public DISPUTE_TIME = 5 minutes;

    /**
     * @notice True if the system is working in optimistic mode. Otherwise is working in slow mode
     */
    bool public optimisticMode;

    /**
     * @notice The last aggregate root we propagated to spoke chains. Used to prevent sending redundant
     * aggregate roots in `propagate`.
     */
    bytes32 public lastPropagatedRoot;

    ProposedData public proposedAggregateRoot;
    ProposedData public lastVerifiedOptimisticAggregateRoot;

    MerkleTreeManager public immutable MERKLE;

    /**
     * @notice Struct to store the proposed data
     * @dev The list of the snapshots roots and the domains must be in the
     * same order as the roots insertions on the tree.
     * @param snapshotId The id of the snapshots used
     * @param timestamp The timestamp when the data is proposed
     * @param aggregateRoot The new aggregate root
     * @param snapshotsRoots The list of roots added
     * @param domains The list of domains
     */
    struct ProposedData {
        uint256 snapshotId;
        uint256 disputeCliff;
        bytes32 aggregateRoot;
        bytes32[] snapshotsRoots;
        uint32[] domains;
    }

    modifier onlyOptimisticMode() {
        if (!optimisticMode) revert SlowModeOn();
        _;
    }

    constructor(address _merkle) {
        MERKLE = MerkleTreeManager(_merkle);

        optimisticMode = true;
    }

    function proposeAggregateRoot(
        uint256 _snapshotId,
        bytes32 _aggregateRoot,
        bytes32[] calldata _snapshotsRoots,
        uint32[] calldata _domains
    ) external onlyOptimisticMode {
        if (_snapshotId == 0 || _aggregateRoot == 0) revert InvalidAggregateRoot();
        if (_snapshotId != block.timestamp / SNAPSHOT_DURATION) revert InvalidSnapshotId(_snapshotId);
        if (proposedAggregateRoot.aggregateRoot > 0) revert ProposeInProgress();

        uint256 _disputeCliff = block.timestamp + DISPUTE_TIME;
        proposedAggregateRoot = ProposedData(_snapshotId, _disputeCliff, _aggregateRoot, _snapshotsRoots, _domains);

        // emit ProposeAggregateRoot(_snapshotId, _disputeCliff, _aggregateRoot, _snapshotsRoots, _domains);
    }

    function finalize() public onlyOptimisticMode {
        ProposedData memory _proposedAggregateRoot = proposedAggregateRoot;
        if (_proposedAggregateRoot.aggregateRoot == 0) revert InvalidAggregateRoot();
        if (_proposedAggregateRoot.disputeCliff > block.timestamp) revert ProposeInProgress();

        lastVerifiedOptimisticAggregateRoot = _proposedAggregateRoot;
        delete proposedAggregateRoot;
        // emit LastVerifiedAggregateRoot(
        //     _proposedAggregateRoot.snapshotId,
        //     _proposedAggregateRoot.aggregateRoot,
        //     _proposedAggregateRoot.snapshotsRoots,
        //     _proposedAggregateRoot.domains
        // );
    }

    function activateSlowMode() external onlyOptimisticMode {
        optimisticMode = false;

        delete proposedAggregateRoot;
        // emit SlowModeActivated();
    }

    function activateOptimisticMode() external {
        if (optimisticMode) revert OptimsiticModeOn();

        // pendingInboundRoots.last = pendingInboundRoots.first - 1;

        optimisticMode = true;
        // emit OptimisticModeActivated();
    }

    function setDisputeTime(uint256 _disputeTime) external {
        DISPUTE_TIME = _disputeTime;
    }

    function setSnapshotDuration(uint256 _snapshotDuration) external {
        SNAPSHOT_DURATION = _snapshotDuration;
    }

    function getLastVerifiedOptimisticAggregateRootSnapshots() external view returns (bytes32[] memory) {
        return lastVerifiedOptimisticAggregateRoot.snapshotsRoots;
    }

    function getLastVerifiedOptimisticAggregateRootDomains() external view returns (uint32[] memory) {
        return lastVerifiedOptimisticAggregateRoot.domains;
    }

    function getProposedAggregateRootSnapshots() external view returns (bytes32[] memory) {
        return proposedAggregateRoot.snapshotsRoots;
    }

    function getProposedAggregateRootDomains() external view returns (uint32[] memory) {
        return proposedAggregateRoot.domains;
    }
}
