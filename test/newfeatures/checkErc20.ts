
interface ABI {
    name: string;
    type: string;
    inputs: { name: string; type: string; indexed?: boolean }[];
}


const requiredFunctionsERC20 = [
    {
        name: 'totalSupply',
        inputs: [],
    },
    {
        name: 'balanceOf',
        inputs: [{ name: '_owner', type: 'address' }],
    },
    {
        name: 'transfer',
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
    },
    {
        name: 'transferFrom',
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
    },
    {
        name: 'approve',
        inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
    },
    {
        name: 'allowance',
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
        ],
    },
];


const requiredEventsERC20 = [
    {
        name: 'Transfer',
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
    },
    {
        name: 'Approval',
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
    },
];

function isERC20Contract(abi: ABI[]): boolean {
    // Check for required functions
    const hasRequiredFunctions = requiredFunctionsERC20.every((requiredFunc) => {
        const matchingFuncs = abi.filter(
            (item) =>
                item.type === 'function' &&
                item.name === requiredFunc.name &&
                item.inputs.length === requiredFunc.inputs.length
        );

        return matchingFuncs.some((func) =>
            func.inputs.every(
                (input, index) =>
                    input.name === requiredFunc.inputs[index].name &&
                    input.type === requiredFunc.inputs[index].type
            )
        );
    });

    // Check for required events


    const hasRequiredEvents = requiredEventsERC20.every((requiredEvent) => {
        const matchingEvents = abi.filter(
            (item) =>
                item.type === 'event' &&
                item.name === requiredEvent.name &&
                item.inputs.length === requiredEvent.inputs.length
        );

        return matchingEvents.some((event) =>
            event.inputs.every(
                (input, index) =>
                    input.name === requiredEvent.inputs[index].name &&
                    input.type === requiredEvent.inputs[index].type
            )
        );
    });

    return hasRequiredFunctions && hasRequiredEvents;
}

// Example usage
const abi = [
    {
        name: 'totalSupply',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: '_owner', type: 'address' }],
        outputs: [{ name: 'balance', type: 'uint256' }],
    },
    // ... other functions and events
];

const isERC20 = isERC20Contract(abi);
console.log(isERC20); // Output: true

