const path = require('path');
const fs = require('fs');

interface ABI {
    name: string;
    type: string;
    inputs: { name: string; type: string; indexed?: boolean }[];
    outputs?: { name: string; type: string; indexed?: boolean }[];
}


const requiredFunctionsERC20 : ABI[] = [
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

const requiredEventsERC20 : ABI[] = [
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



const requiredFunctionsERC721 : ABI[] = [
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

const requiredEventsERC721 : ABI[] = [
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



const requiredFunctionsERC1155 : ABI[] = [
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

const requiredEventsERC1155 : ABI[] = [
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




function verifyContract(abi: ABI[], requireFunctions: ABI[], requiredEvents: ABI[]): boolean {
    // Check for required functions
    const hasRequiredFunctions = requireFunctions.every((requiredFunc) => {
        const matchingFunc = abi.find(
            (item) =>
                item.type === 'function' &&
                item.name === requiredFunc.name &&
                item.inputs.length === requiredFunc.inputs.length &&
                item.outputs?.length === requiredFunc.outputs?.length
        );

        if (!matchingFunc) {return false;}

        if (requiredFunc.inputs.length > 0){
            const matchInputs = requiredFunc.inputs.every((input, index) => input.type === matchingFunc.inputs[index].type);
            if (!matchInputs) {return false;}
        }

        if (requiredFunc.outputs && requiredFunc.outputs?.length > 0){
            if (!matchingFunc.outputs || matchingFunc.outputs?.length === 0) {return false; }


            const matchOutputs = requiredFunc.outputs?.every((output, index) =>  output.type === matchingFunc.outputs![index].type);
            if (!matchOutputs) {return false;}
        }

        return true;
    });
    // console.log("hasRequiredFunctions",hasRequiredFunctions);

    // Check for required events
    const hasRequiredEvents = requiredEvents.every((requiredEvent) => {
        const matchingEvent = abi.find(
            (item) =>
                item.type === 'event' &&
                item.name === requiredEvent.name &&
                item.inputs.length === requiredEvent.inputs.length
        );

        if (!matchingEvent) {return false;}

        if (requiredEvent.inputs.length > 0){
            const matchInputs = requiredEvent.inputs.every((input, index) =>
                input.type === matchingEvent.inputs[index].type &&
                input.indexed === matchingEvent.inputs[index].indexed) ;
            if (!matchInputs) {return false;}
        }

        return true;

    });
    // console.log("hasRequiredEvents",hasRequiredEvents);

    return hasRequiredFunctions && hasRequiredEvents;
}


function isERC20Contract(abi: ABI[]){
    return verifyContract(abi, requiredFunctionsERC20, requiredEventsERC20);
}

function isERC721Contract(abi: ABI[]){
    return verifyContract(abi, requiredFunctionsERC721, requiredEventsERC721);
}

function isERC1155Contract(abi: ABI[]){
    return verifyContract(abi, requiredFunctionsERC1155, requiredEventsERC1155);
}

//node checkErc20.js ERC20Asset_metadata.json

const fileName = process.argv[2];
console.log("Handle ", fileName);

const data = fs.readFileSync(path.join(__dirname, fileName), 'utf8');
const metadata = JSON.parse(data);
const abi = metadata.output.abi;

// console.log(abi);

const isERC20 = isERC20Contract(abi);
console.log("isERC20",isERC20);

const isERC721 = isERC721Contract(abi);
console.log("isERC721",isERC721);

const isERC1155 = isERC1155Contract(abi);
console.log("isERC1155",isERC1155);


