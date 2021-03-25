"""
electric-circuits
WebGME-Spice Facilitation/Utility Library
"""
import sys

from setuptools import find_namespace_packages, setup

short_description = __doc__.split("\n")

# from https://github.com/pytest-dev/pytest-runner#conditional-requirement
needs_pytest = {"pytest", "test", "ptr"}.intersection(sys.argv)
pytest_runner = ["pytest-runner"] if needs_pytest else []


setup(
    # Self-descriptive entries which should always be present
    name="electric-circuits",
    author="Symbench",
    author_email="umesh.timalsina@vanderbilt.edu",
    description=short_description[0],
    long_description="\n".join(short_description),
    long_description_content_type="text/markdown",
    version="0.1.0",
    license="apache-2.0",
    # Which Python importable modules should be included when your package is installed
    # Handled automatically by setuptools. Use 'exclude' to prevent some specific
    # subpackage(s) from being added, if needed
    packages=find_namespace_packages(include=["symbench.*"]),
    # Optional include package data to ship with your package
    # Customize MANIFEST.in if the general case does not suit your needs
    # Comment out this line to prevent the files from being packaged with your software
    include_package_data=True,
    # Allows `setup.py test` to work correctly with pytest
    setup_requires=[] + pytest_runner,
)
