from typing import Any


class PySpiceMissingException(Exception):
    """Error to be raised when PySpice is missing"""

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)


class PySpiceConversionError(Exception):
    """Error to be raised when there's an error in PySpice conversion"""
