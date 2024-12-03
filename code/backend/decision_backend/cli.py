import logging
import argparse
import uvicorn

def main():
    parser = argparse.ArgumentParser(
                    prog='decision-support-ui-backend',
                    description='Backend REST API of the decision-support-ui, which stores models and user information.',
                    add_help=False)

    parser.add_argument("-h", "--help", action="help", help="show this help message and exit")
    parser.add_argument("-v", dest="verbose", action="store_true", help="print more log messages")
    parser.add_argument("--reload", dest="reload", action="store_true", help="automatic server reload on code changes")

    parser.add_argument(
        "-p", "--port",
        metavar="PORT",
        dest="port",
        default="8000",
        help="the port that is used to serve the rest api (default 8000)",
        type=int,
    )
    parser.add_argument(
        "--host",
        metavar="HOST",
        dest="host",
        default="0.0.0.0",
        help="the host address that is used to serve the rest api (default 0.0.0.0)",
        type=str,
    )

    args = parser.parse_args()

    logging_level = logging.DEBUG if args.verbose else logging.INFO
    uvicorn_level = "debug" if args.verbose else "info"
    logging.basicConfig(level=logging_level, format="%(asctime)s %(levelname)s:%(name)s:%(message)s")

    uvicorn.run("decision_backend.main:app", host=args.host, port=args.port, reload=args.reload, log_level=uvicorn_level)


if __name__ == "__main__":
    main()
