pragma solidity >=0.5 <0.6.0;

/// @title An Instance of a ILP
contract Problem {
    
    uint32 public n;
    uint32 public m;
    int32[] public a;  // int[m, n]
    int32[] public b;  // int[m]
    int32[] public c;  // int[n]
    uint public deadline;
    address public owner;
    
    struct BlindSolution {
        bytes32 hashValue;
        int opt;
        uint timeStamp;
    }
    
    struct Solution {
        int32[] x;
        int opt;
        uint timeStamp;
        address addr;
    }
    
    mapping(address => BlindSolution) public blindSolution;
    Solution public best;
    bool public finished;
    
    // n variables, m constraints; a is int[m, n], b is int[m], c is int[n]
    constructor(uint32 _n, uint32 _m, int32[] memory _a, int32[] memory _b, int32[] memory _c, uint _time) public payable {
        require(_a.length == uint64(_n) * uint64(_m));
        require(_b.length == _m);
        require(_c.length == _n);
        n = _n;
        m = _m;
        a = _a;
        b = _b;
        c = _c;
        deadline = block.timestamp + _time;
        finished = false;
        owner = msg.sender;
    }
    
    function hash(int32[] memory _x, bytes8 _nonce) public view returns (bytes32) {
        return keccak256(abi.encodePacked(_x, _nonce, msg.sender));
    }
    
    function solve(bytes32 _hashValue, int _opt) public {
        require(block.timestamp < deadline);
        blindSolution[msg.sender] = BlindSolution({
           hashValue: _hashValue,
           opt: _opt,
           timeStamp: block.timestamp
        });
    }
    
    function reveal(int32[] memory _x, bytes8 _nonce, int opt) public {
        require(block.timestamp < deadline);
        require(_x.length == n);
        require(validate(_x, opt));
        BlindSolution memory sol = blindSolution[msg.sender];
        uint timeStamp = block.timestamp;
        if (keccak256(abi.encodePacked(_x, _nonce, msg.sender)) == sol.hashValue && opt == sol.opt) {
            timeStamp = sol.timeStamp;
        }
        if ((best.addr == address(0x00)) || (opt > best.opt) || ((opt == best.opt) && (timeStamp < best.timeStamp))) {
            best = Solution({
               x: _x,
               opt: opt,
               timeStamp: timeStamp,
               addr: msg.sender
            });
        }
        delete blindSolution[msg.sender];
    }
    
    function validate(int32[] memory _x, int opt) internal view returns (bool) {
        int s;
        for (uint32 i = 0; i < m; ++i) {
            s = 0;
            for (uint32 j = 0; j < n; ++j) {
                s += int(a[i * n + j]) * int(_x[j]);
            }
            if (s > b[i]) {
                return false;
            }
        }
        s = 0;
        for (uint32 i = 0; i < n; ++i) {
            s += int(c[i]) * int(_x[i]);
        }
        return (s == opt);
    }
    
    function finish() public {
        require(block.timestamp >= deadline);
        require(msg.sender == best.addr);
        require(!finished);
        finished = true;
        msg.sender.transfer(address(this).balance);
    }
    
    function refund() public {
        require(block.timestamp >= deadline);
        require(msg.sender == owner);
        require(best.addr == address(0x00));
        require(!finished);
        finished = true;
        msg.sender.transfer(address(this).balance);
    }
    
    function describe() public view returns (uint32, uint32, int32[] memory, int32[] memory, int32[] memory, uint, address, int, bool, uint) {
        return (n, m, a, b, c, deadline, owner, best.opt, finished, address(this).balance);
    }
}

contract ProblemCreator {
    address payable public funder;
    
    event ProblemCreated(Problem problemAddr);
    
    constructor() public {
        funder = msg.sender;
    }
    
    // consistent with constructor of Problem
    function createProblem(uint32 _n, uint32 _m, int32[] memory _a, int32[] memory _b, int32[] memory _c, uint _time) public payable returns (Problem) {
        funder.transfer(msg.value / 100);
        Problem problemAddr = (new Problem).value(msg.value - msg.value / 100)(_n, _m, _a, _b, _c, _time);
        emit ProblemCreated(problemAddr);
        return problemAddr;
    }
}
