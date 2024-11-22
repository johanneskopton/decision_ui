import { Node, NodeInterface, type CalculateFunction, NumberInterface, SelectInterface } from "baklavajs";

interface Inputs {
    number1: number;
    number2: number;
    operation: string;
}

interface Outputs {
    output: number;
}

export default class TestNode extends Node<Inputs, Outputs> {
    public type = "MathNode";
    
    public get title() {
        return "MathNode";
    };

    public inputs = {
        number1: new NumberInterface("Number", 1),
        number2: new NumberInterface("Number", 2),
        operation: new SelectInterface("Operation", "Add", ["Add", "Subtract"]).setPort(false),
    };

    public outputs = {
        output: new NodeInterface("Output", 0),
    };

    public constructor() {
        super();
        this.initializeIo();
    }

    public calculate: CalculateFunction<Inputs, Outputs> = ({ number1, number2, operation }) => {
        let output;
        if (operation === "Add") {
            output = number1 + number2;
        } else if (operation === "Subtract") {
            output = number1 - number2;
        } else {
            throw new Error("Unknown operation: " + operation);
        }
        return { output };
    }
}