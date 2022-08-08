import string
import numpy as np

"""
Each function is the implementation of one node:

If it returns a string, it is interpreted as the right side of
the R assignment like `a <- {right_side}`.

If it returns a tuple of strings, it is interpreted as follows:
The first element is treated like described above.
The second element is treated as the right side in a following row:
```
a <- {first_right_side}
a{second_right_side}
```

This way something like
```
a = rep(0, 10)
a[3] = 5
```
can be implemented.
"""


def Math(args):
    operators = {
        "Add": "+",
        "Subtract": "-",
        "Multiply": "*",
        "Divide": "/"
    }
    operator = operators[args["Operation"]]
    return "{} {} {}".format(args["A"], operator, args["B"])


def Comparison(args):
    operator = args["Operation"]
    return "({} {} {}) * 1".format(args["A"], operator, args["B"])


def Round(args):
    return "{}({})".format(args["Operation"], args["x"])


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


def ToSeries(args):
    if args["TimestepMethod"] == "every":
        return "rep({}, {})".format(args["value"], args["n"])
    elif args["TimestepMethod"] == "as defined":
        timestep = args["timestep"]
        if type(timestep) in [int, float, np.int64]:
            return (
                "rep({}, {})".format(0, args["n"]),
                "[{}] <- {}".format(args["timestep"]+1, args["value"])
            )
        else:
            return (
                "rep({}, {})".format(0, args["n"]),
                "[{}+1] <- {}".format(args["timestep"], args["value"])
            )


def NPV(args):
    return "discount({}, {}, calculate_NPV=TRUE)".format(
        args["x"],
        args["discount"]
    )


node_implementations = {
    "Math": Math,
    "Comparison": Comparison,
    "Round": Round,
    "RoundDeterministic": Round,
    "SeriesMath": Math,
    "Sum": Sum,
    "ChanceEvent": ChanceEvent,
    "SeriesChanceEvent": ChanceEvent,
    "Display": Display,
    "Result": Result,
    "ValueVarier": ValueVarier,
    "NPV": NPV,
    "ToSeries": ToSeries
}
