// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal ERC-20 surface used by the escrow.
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title MfiEscrow
 * @notice Hybrid settlement for m.fi credit intents. The borrower escrows
 *         collateral; the winning solver posts a bond in the debt token. The
 *         bond is the enforcement of the borrower's mandate:
 *           - repay()  → collateral back to borrower, bond back to solver
 *           - slash()  → bond paid to borrower (called by the keeper/monitor on
 *                        an objective mandate breach, e.g. forced-close below floor)
 *
 * This is intentionally compact for the hackathon: it proves the bond/slash
 * mechanic that CoW itself does not have (CoW gates solvers by allowlist only).
 */
contract MfiEscrow {
    enum Lane { P2P, OTC, OPEN }

    struct Loan {
        address borrower;
        address solver;
        address collateralToken;
        uint256 collateralAmount;
        address debtToken;
        uint256 debtAmount;
        uint16 rateBps;
        uint16 termDays;
        uint256 floorPrice; // mandate: forced-close floor (oracle units)
        uint256 bond;
        Lane lane;
        bool active;
        bool repaid;
        bool slashed;
        uint64 openedAt;
    }

    address public keeper; // authorized monitor that can slash on breach
    mapping(bytes32 => Loan) public loans;

    event LoanOpened(bytes32 indexed id, address indexed borrower, address indexed solver, uint256 collateral, uint256 debt, uint16 rateBps, uint8 lane);
    event BondPosted(bytes32 indexed id, address indexed solver, uint256 totalBond);
    event Repaid(bytes32 indexed id);
    event Slashed(bytes32 indexed id, address indexed to, uint256 amount);
    event KeeperChanged(address indexed keeper);

    error NotKeeper();
    error NotBorrower();
    error NotSolver();
    error LoanExists();
    error NoLoan();
    error NoBond();
    error AlreadySettled();

    constructor(address _keeper) {
        keeper = _keeper == address(0) ? msg.sender : _keeper;
        emit KeeperChanged(keeper);
    }

    function setKeeper(address k) external {
        if (msg.sender != keeper) revert NotKeeper();
        keeper = k;
        emit KeeperChanged(k);
    }

    /// @notice Borrower escrows collateral and records the agreed terms. Requires prior approve().
    function openLoan(
        bytes32 id,
        address solver,
        address collateralToken,
        uint256 collateralAmount,
        address debtToken,
        uint256 debtAmount,
        uint16 rateBps,
        uint16 termDays,
        uint256 floorPrice,
        Lane lane
    ) external {
        Loan storage l = loans[id];
        if (l.active || l.repaid) revert LoanExists();

        require(IERC20(collateralToken).transferFrom(msg.sender, address(this), collateralAmount), "collateral xfer");

        l.borrower = msg.sender;
        l.solver = solver;
        l.collateralToken = collateralToken;
        l.collateralAmount = collateralAmount;
        l.debtToken = debtToken;
        l.debtAmount = debtAmount;
        l.rateBps = rateBps;
        l.termDays = termDays;
        l.floorPrice = floorPrice;
        l.lane = lane;
        l.active = true;
        l.openedAt = uint64(block.timestamp);

        emit LoanOpened(id, msg.sender, solver, collateralAmount, debtAmount, rateBps, uint8(lane));
    }

    /// @notice Winning solver posts (or tops up) its bond in the debt token. Requires prior approve().
    function postBond(bytes32 id, uint256 amount) external {
        Loan storage l = loans[id];
        if (!l.active) revert NoLoan();
        if (msg.sender != l.solver) revert NotSolver();
        require(IERC20(l.debtToken).transferFrom(msg.sender, address(this), amount), "bond xfer");
        l.bond += amount;
        emit BondPosted(id, msg.sender, l.bond);
    }

    /// @notice Borrower closes the loan: collateral returns to borrower, bond returns to solver.
    function repay(bytes32 id) external {
        Loan storage l = loans[id];
        if (!l.active) revert NoLoan();
        if (msg.sender != l.borrower) revert NotBorrower();
        l.active = false;
        l.repaid = true;
        require(IERC20(l.collateralToken).transfer(l.borrower, l.collateralAmount), "collateral return");
        if (l.bond > 0) {
            uint256 b = l.bond;
            l.bond = 0;
            require(IERC20(l.debtToken).transfer(l.solver, b), "bond return");
        }
        emit Repaid(id);
    }

    /// @notice Keeper slashes the solver's bond to the borrower on a mandate breach.
    function slash(bytes32 id) external {
        if (msg.sender != keeper) revert NotKeeper();
        Loan storage l = loans[id];
        if (!l.active) revert NoLoan();
        if (l.bond == 0) revert NoBond();
        if (l.slashed) revert AlreadySettled();
        l.slashed = true;
        uint256 amt = l.bond;
        l.bond = 0;
        require(IERC20(l.debtToken).transfer(l.borrower, amt), "slash xfer");
        emit Slashed(id, l.borrower, amt);
    }

    function getLoan(bytes32 id) external view returns (Loan memory) {
        return loans[id];
    }
}
