// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MfiEscrow} from "../src/MfiEscrow.sol";

contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    function mint(address to, uint256 amt) external { balanceOf[to] += amt; }
    function approve(address s, uint256 a) external returns (bool) { allowance[msg.sender][s] = a; return true; }
    function transfer(address to, uint256 a) external returns (bool) { balanceOf[msg.sender] -= a; balanceOf[to] += a; return true; }
    function transferFrom(address f, address t, uint256 a) external returns (bool) {
        allowance[f][msg.sender] -= a; balanceOf[f] -= a; balanceOf[t] += a; return true;
    }
}

contract MfiEscrowTest is Test {
    MfiEscrow escrow;
    MockERC20 coll;
    MockERC20 debt;
    address borrower = address(0xB0);
    address solver = address(0x501);
    address keeper = address(0xCAFE);
    bytes32 id = keccak256("loan-1");

    function setUp() public {
        escrow = new MfiEscrow(keeper);
        coll = new MockERC20();
        debt = new MockERC20();
        coll.mint(borrower, 100e18);
        debt.mint(solver, 50_000e6);
    }

    function _open() internal {
        vm.startPrank(borrower);
        coll.approve(address(escrow), 48e18);
        escrow.openLoan(id, solver, address(coll), 48e18, address(debt), 100_000e6, 804, 45, 2410e8, MfiEscrow.Lane.P2P);
        vm.stopPrank();
    }

    function _bond() internal {
        vm.startPrank(solver);
        debt.approve(address(escrow), 12_000e6);
        escrow.postBond(id, 12_000e6);
        vm.stopPrank();
    }

    function testOpenEscrowsCollateral() public {
        _open();
        assertEq(coll.balanceOf(address(escrow)), 48e18);
    }

    function testRepayReturnsCollateralAndBond() public {
        _open();
        _bond();
        vm.prank(borrower);
        escrow.repay(id);
        assertEq(coll.balanceOf(borrower), 100e18);   // collateral back
        assertEq(debt.balanceOf(solver), 50_000e6);   // bond back to solver
    }

    function testSlashPaysBorrower() public {
        _open();
        _bond();
        vm.prank(keeper);
        escrow.slash(id);
        assertEq(debt.balanceOf(borrower), 12_000e6); // bond slashed to borrower
    }

    function testOnlyKeeperCanSlash() public {
        _open();
        _bond();
        vm.expectRevert(MfiEscrow.NotKeeper.selector);
        vm.prank(borrower);
        escrow.slash(id);
    }
}
