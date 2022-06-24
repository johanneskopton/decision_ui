import string


def Math(args):
    operators = {
        "Add": "+",
        "Subtract": "-",
        "Multiply": "*",
        "Divide": "/"
    }
    operator = operators[args["Operation"]]
    return "{} {} {}".format(args["A"], operator, args["B"])


def Sum(input):
    for i in string.ascii_uppercase:
        print(i)


def ChanceEvent(input):
    pass


node_implementations = {
    "Math": Math,
    "Sum": Sum,
    "ChanceEvent": ChanceEvent
}
