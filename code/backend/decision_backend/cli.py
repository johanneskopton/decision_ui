import logging
import argparse
import uvicorn
import os


def main():
    parser = argparse.ArgumentParser(
        prog="decision-support-ui-backend",
        description="Backend REST API of the decision-support-ui, which stores models and user information.",
        add_help=False,
    )

    parser.add_argument("-h", "--help", action="help", help="show this help message and exit")
    parser.add_argument("-v", dest="verbose", action="store_true", help="print more log messages")
    parser.add_argument(
        "--reload",
        dest="reload",
        action="store_true",
        help="automatic server reload on code changes",
    )
    parser.add_argument(
        "-p",
        "--port",
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
    parser.add_argument(
        "-s",
        "--store",
        metavar="PATH",
        dest="store",
        help='file path to the sqlite database file (default "./data/decision-support-ui-backend.db")',
        type=str,
    )

    args = parser.parse_args()

    os.environ["DSUI_LOG_LEVEL"] = logging.getLevelName(logging.DEBUG if args.verbose else logging.INFO)

    if args.store:
        os.environ["DSUI_DATABASE_PATH"] = args.store

    uvicorn.run(
        "decision_backend.main:create_app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="debug" if args.verbose else "info",
        factory=True,
    )


if __name__ == "__main__":
    main()
