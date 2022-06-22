import os
from setuptools import setup


# Utility function to read the README file
def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


setup(
    name="decision_backend",  # pypi name as in "pip install {name}"
    version="0.0.1",
    author="Johannes Kopton",
    author_email="johannes@kopton.org",
    description=(
        "Backend for decision_UI using the decisionSupport R package. "),
    keywords="decision analysis",
    url="https://github.com/johanneskopton/decision_backend",
    packages=["decision_backend"],  # python name as in "import {name}"
    long_description=read("README.md"),
    long_description_content_type="text/markdown",
    classifiers=[  # see https://pypi.org/classifiers/
        "Topic :: Scientific/Engineering",
        "Programming Language :: Python :: 3"
        "Operating System :: OS Independent",
    ],
    install_requires=[
    ],
    extras_require={
        "dev": [
            "pytest",
            "flake8",
            "autopep8",
        ],
    },
)
