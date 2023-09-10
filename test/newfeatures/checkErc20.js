var requiredFunctionsERC20 = [
    {
        name: 'totalSupply',
        inputs: []
    },
    {
        name: 'balanceOf',
        inputs: [{ name: '_owner', type: 'address' }]
    },
    {
        name: 'transfer',
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ]
    },
    {
        name: 'transferFrom',
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ]
    },
    {
        name: 'approve',
        inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
        ]
    },
    {
        name: 'allowance',
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
        ]
    },
];
var requiredEventsERC20 = [
    {
        name: 'Transfer',
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ]
    },
    {
        name: 'Approval',
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
        ]
    },
];
function isERC20Contract(abi) {
    // Check for required functions
    var hasRequiredFunctions = requiredFunctionsERC20.every(function (requiredFunc) {
        var matchingFuncs = abi.filter(function (item) {
            return item.type === 'function' &&
                item.name === requiredFunc.name &&
                item.inputs.length === requiredFunc.inputs.length;
        });
        return matchingFuncs.some(function (func) {
            return func.inputs.every(function (input, index) {
                return input.name === requiredFunc.inputs[index].name &&
                    input.type === requiredFunc.inputs[index].type;
            });
        });
    });
    // Check for required events
    var hasRequiredEvents = requiredEventsERC20.every(function (requiredEvent) {
        var matchingEvents = abi.filter(function (item) {
            return item.type === 'event' &&
                item.name === requiredEvent.name &&
                item.inputs.length === requiredEvent.inputs.length;
        });
        return matchingEvents.some(function (event) {
            return event.inputs.every(function (input, index) {
                return input.name === requiredEvent.inputs[index].name &&
                    input.type === requiredEvent.inputs[index].type;
            });
        });
    });
    return hasRequiredFunctions && hasRequiredEvents;
}
// Example usage
var abi = [
    {
        name: 'totalSupply',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }]
    },
    {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: '_owner', type: 'address' }],
        outputs: [{ name: 'balance', type: 'uint256' }]
    },
    // ... other functions and events
];
var isERC20 = isERC20Contract(abi);
console.log(isERC20); // Output: true
