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


def Sum(args):
    res_str = args["A"]
    for i in string.ascii_uppercase[1:]:
        if i not in args:
            break
        if args[i] != 0:
            res_str += " + {}".format(args[i])
    return res_str


def ChanceEvent(args):
    return "chance_event({}, {}, {})".format(
        args["chance"],
        args["value_if"],
        args["value_if_not"]
    )


def Display(args):
    return args["Value"]


def Result(args):
    return args["Value"]


def ValueVarier(args):
    if args["trend"] == 0:
        return "vv(var_mean={}, var_CV={}, n={})".format(
            args["var_mean"],
            args["var_CV"],
            args["n"]
        )
    else:
        return "vv(var_mean={}, var_CV={}, n={}, {}_trend={})".format(
            args["var_mean"],
            args["var_CV"],
            args["n"],
            args["TrendType"],
            args["trend"]
        )


node_implementations = {
    "Math": Math,
    "Sum": Sum,
    "ChanceEvent": ChanceEvent,
    "Display": Display,
    "Result": Result,
    "ValueVarier": ValueVarier
}
