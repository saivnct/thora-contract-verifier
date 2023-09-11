var path = require('path');
var fs = require('fs');
var requiredFunctionsERC20 = [
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                name: "",
                type: "string"
            }
        ],
        type: "function"
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [
            {
                name: "",
                type: "string"
            }
        ],
        type: "function"
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [
            {
                name: "",
                type: "uint8"
            }
        ],
        type: "function"
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_owner",
                type: "address"
            }
        ],
        name: "balanceOf",
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_to",
                type: "address"
            },
            {
                name: "_value",
                type: "uint256"
            }
        ],
        name: "transfer",
        outputs: [
            {
                name: "",
                type: "bool"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_from",
                type: "address"
            },
            {
                name: "_to",
                type: "address"
            },
            {
                name: "_value",
                type: "uint256"
            }
        ],
        name: "transferFrom",
        outputs: [
            {
                name: "",
                type: "bool"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_spender",
                type: "address"
            },
            {
                name: "_value",
                type: "uint256"
            }
        ],
        name: "approve",
        outputs: [
            {
                name: "",
                type: "bool"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_owner",
                type: "address"
            },
            {
                name: "_spender",
                type: "address"
            }
        ],
        name: "allowance",
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ],
        type: "function"
    },
];
var requiredEventsERC20 = [
    {
        inputs: [
            {
                indexed: true,
                name: "_from",
                type: "address"
            },
            {
                indexed: true,
                name: "_to",
                type: "address"
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256"
            }
        ],
        name: "Transfer",
        type: "event"
    },
    {
        inputs: [
            {
                indexed: true,
                name: "_owner",
                type: "address"
            },
            {
                indexed: true,
                name: "_spender",
                type: "address"
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256"
            }
        ],
        name: "Approval",
        type: "event"
    },
];
var requiredFunctionsERC721 = [
    {
        inputs: [
            {
                name: "_owner",
                type: "address"
            }
        ],
        name: "balanceOf",
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_tokenId",
                type: "uint256"
            }
        ],
        name: "ownerOf",
        outputs: [
            {
                name: "",
                type: "address"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_from",
                type: "address"
            },
            {
                name: "_to",
                type: "address"
            },
            {
                name: "_tokenId",
                type: "uint256"
            },
            {
                name: "data",
                type: "bytes"
            }
        ],
        name: "safeTransferFrom",
        outputs: [],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_from",
                type: "address"
            },
            {
                name: "_to",
                type: "address"
            },
            {
                name: "_tokenId",
                type: "uint256"
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_from",
                type: "address"
            },
            {
                name: "_to",
                type: "address"
            },
            {
                name: "_tokenId",
                type: "uint256"
            }
        ],
        name: "transferFrom",
        outputs: [],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_approved",
                type: "address"
            },
            {
                name: "_tokenId",
                type: "uint256"
            }
        ],
        name: "approve",
        outputs: [],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_operator",
                type: "address"
            },
            {
                name: "_approved",
                type: "bool"
            }
        ],
        name: "setApprovalForAll",
        outputs: [],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_tokenId",
                type: "uint256"
            },
        ],
        name: "getApproved",
        outputs: [
            {
                name: "",
                type: "address"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_owner",
                type: "address"
            },
            {
                name: "_operator",
                type: "address"
            },
        ],
        name: "isApprovedForAll",
        outputs: [
            {
                name: "",
                type: "bool"
            }
        ],
        type: "function"
    },
];
var requiredEventsERC721 = [
    {
        inputs: [
            {
                indexed: true,
                name: "_from",
                type: "address"
            },
            {
                indexed: true,
                name: "_to",
                type: "address"
            },
            {
                indexed: true,
                name: "_tokenId",
                type: "uint256"
            }
        ],
        name: "Transfer",
        type: "event"
    },
    {
        inputs: [
            {
                indexed: true,
                name: "_owner",
                type: "address"
            },
            {
                indexed: true,
                name: "_approved",
                type: "address"
            },
            {
                indexed: true,
                name: "_tokenId",
                type: "uint256"
            }
        ],
        name: "Approval",
        type: "event"
    },
    {
        inputs: [
            {
                indexed: true,
                name: "_owner",
                type: "address"
            },
            {
                indexed: true,
                name: "_operator",
                type: "address"
            },
            {
                indexed: false,
                name: "_approved",
                type: "bool"
            }
        ],
        name: "ApprovalForAll",
        type: "event"
    },
];
var requiredFunctionsERC1155 = [
    {
        inputs: [
            {
                name: "_from",
                type: "address"
            },
            {
                name: "_to",
                type: "address"
            },
            {
                name: "_id",
                type: "uint256"
            },
            {
                name: "_value",
                type: "uint256"
            },
            {
                name: "_data",
                type: "bytes"
            }
        ],
        name: "safeTransferFrom",
        outputs: [],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_from",
                type: "address"
            },
            {
                name: "_to",
                type: "address"
            },
            {
                name: "_ids",
                type: "uint256[]"
            },
            {
                name: "_values",
                type: "uint256[]"
            },
            {
                name: "_data",
                type: "bytes"
            }
        ],
        name: "safeBatchTransferFrom",
        outputs: [],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_owner",
                type: "address"
            },
            {
                name: "_id",
                type: "uint256"
            }
        ],
        name: "balanceOf",
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_owners",
                type: "address[]"
            },
            {
                name: "_ids",
                type: "uint256[]"
            }
        ],
        name: "balanceOfBatch",
        outputs: [
            {
                name: "",
                type: "uint256[]"
            }
        ],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_operator",
                type: "address"
            },
            {
                name: "_approved",
                type: "bool"
            }
        ],
        name: "setApprovalForAll",
        outputs: [],
        type: "function"
    },
    {
        inputs: [
            {
                name: "_owner",
                type: "address"
            },
            {
                name: "_operator",
                type: "address"
            },
        ],
        name: "isApprovedForAll",
        outputs: [
            {
                name: "",
                type: "bool"
            }
        ],
        type: "function"
    },
];
var requiredEventsERC1155 = [
    {
        inputs: [
            {
                indexed: true,
                name: "_operator",
                type: "address"
            },
            {
                indexed: true,
                name: "_from",
                type: "address"
            },
            {
                indexed: true,
                name: "_to",
                type: "address"
            },
            {
                indexed: false,
                name: "_id",
                type: "uint256"
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256"
            }
        ],
        name: "TransferSingle",
        type: "event"
    },
    {
        inputs: [
            {
                indexed: true,
                name: "_operator",
                type: "address"
            },
            {
                indexed: true,
                name: "_from",
                type: "address"
            },
            {
                indexed: true,
                name: "_to",
                type: "address"
            },
            {
                indexed: false,
                name: "_ids",
                type: "uint256[]"
            },
            {
                indexed: false,
                name: "_values",
                type: "uint256[]"
            }
        ],
        name: "TransferBatch",
        type: "event"
    },
    {
        inputs: [
            {
                indexed: true,
                name: "_owner",
                type: "address"
            },
            {
                indexed: true,
                name: "_operator",
                type: "address"
            },
            {
                indexed: false,
                name: "_approved",
                type: "bool"
            }
        ],
        name: "ApprovalForAll",
        type: "event"
    },
    {
        inputs: [
            {
                indexed: false,
                name: "_value",
                type: "string"
            },
            {
                indexed: true,
                name: "_id",
                type: "uint256"
            }
        ],
        name: "URI",
        type: "event"
    },
];
function verifyContract(abi, requireFunctions, requiredEvents) {
    // Check for required functions
    var hasRequiredFunctions = requireFunctions.every(function (requiredFunc) {
        var _a, _b, _c;
        var matchingFunc = abi.find(function (item) {
            var _a, _b;
            return item.type === 'function' &&
                item.name === requiredFunc.name &&
                item.inputs.length === requiredFunc.inputs.length &&
                ((_a = item.outputs) === null || _a === void 0 ? void 0 : _a.length) === ((_b = requiredFunc.outputs) === null || _b === void 0 ? void 0 : _b.length);
        });
        if (!matchingFunc) {
            return false;
        }
        if (requiredFunc.inputs.length > 0) {
            var matchInputs = requiredFunc.inputs.every(function (input, index) { return input.type === matchingFunc.inputs[index].type; });
            if (!matchInputs) {
                return false;
            }
        }
        if (requiredFunc.outputs && ((_a = requiredFunc.outputs) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            if (!matchingFunc.outputs || ((_b = matchingFunc.outputs) === null || _b === void 0 ? void 0 : _b.length) === 0) {
                return false;
            }
            var matchOutputs = (_c = requiredFunc.outputs) === null || _c === void 0 ? void 0 : _c.every(function (output, index) { return output.type === matchingFunc.outputs[index].type; });
            if (!matchOutputs) {
                return false;
            }
        }
        return true;
    });
    // console.log("hasRequiredFunctions",hasRequiredFunctions);
    // Check for required events
    var hasRequiredEvents = requiredEvents.every(function (requiredEvent) {
        var matchingEvent = abi.find(function (item) {
            return item.type === 'event' &&
                item.name === requiredEvent.name &&
                item.inputs.length === requiredEvent.inputs.length;
        });
        if (!matchingEvent) {
            return false;
        }
        if (requiredEvent.inputs.length > 0) {
            var matchInputs = requiredEvent.inputs.every(function (input, index) {
                return input.type === matchingEvent.inputs[index].type &&
                    input.indexed === matchingEvent.inputs[index].indexed;
            });
            if (!matchInputs) {
                return false;
            }
        }
        return true;
    });
    // console.log("hasRequiredEvents",hasRequiredEvents);
    return hasRequiredFunctions && hasRequiredEvents;
}
function isERC20Contract(abi) {
    return verifyContract(abi, requiredFunctionsERC20, requiredEventsERC20);
}
function isERC721Contract(abi) {
    return verifyContract(abi, requiredFunctionsERC721, requiredEventsERC721);
}
function isERC1155Contract(abi) {
    return verifyContract(abi, requiredFunctionsERC1155, requiredEventsERC1155);
}
//node checkErc20.js ERC20Asset_metadata.json
var fileName = process.argv[2];
console.log("Handle ", fileName);
var data = fs.readFileSync(path.join(__dirname, fileName), 'utf8');
var metadata = JSON.parse(data);
var abi = metadata.output.abi;
// console.log(abi);
var isERC20 = isERC20Contract(abi);
console.log("isERC20", isERC20);
var isERC721 = isERC721Contract(abi);
console.log("isERC721", isERC721);
var isERC1155 = isERC1155Contract(abi);
console.log("isERC1155", isERC1155);
