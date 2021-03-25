import inspect
from typing import Any, Union

from symbench.electric_circuits.exceptions import PySpiceMissingException

SPLIT_PLACE_HOLDER = "~"

__all__ = "PySpiceParser"


def _get_missing_attribute_meta(param: str, class_name: str) -> dict:
    if param == "dc_offset":
        return {
            "name": "dc_offset",
            "parameter": "dc offset",
            "default_value": 0,
            "units": "A" if "Current" in class_name else "V",
        }
    elif param == "ac_magnitude":
        return {
            "name": "ac_magnitude",
            "parameter": "ac magnitude",
            "default_value": 0,
            "units": "A" if "Current" in class_name else "V",
        }
    elif param == "values":
        return {
            "name": "values",
            "parameter": "Piecewise Linear Values",
            "default_value": "[(0, 0)]",
            "units": "A" if "Current" in class_name else "V",
        }
    elif param == "repeate_time":
        return {
            "name": "repeate_time",
            "parameter": "Repeat Time",
            "default_value": 0,
            "units": "sec",
        }
    elif param == "delay_time" or param == "time_delay":
        return {
            "name": param,
            "parameter": "Delay Time",
            "default_value": 0,
            "units": "sec",
        }
    elif param == "duration":
        return {
            "name": "duration",
            "parameter": "Duration for random values to show up",
            "default_value": 0,
            "units": "sec",
        }
    else:
        return {}


def _get_attribute_constraints(name: str) -> Union[dict, None]:
    if name == "random_type":
        return {"possible_values": ["uniform", "exponential", "gaussian", "poisson"]}


class PySpiceParser:
    """A class to parse PySpice python library

    This class parses the PySpice python library
    for attributes of the various components to be used in SPICE simulations
    """

    def __init__(self) -> None:
        self._high_level_elements = []
        self._basic_elements = []
        self._confirm_pyspice_existence()
        self._meta_dict = {}

    def run(self) -> dict:
        import PySpice

        self._parse_basic_elements()
        print(f"Found {len(self._basic_elements)} basic elements")

        self._parse_highlevel_elements()
        print(f"Found {len(self._high_level_elements)} high level elements")

        return {
            "high_level_elements": self._high_level_elements,
            "basic_elements": self._basic_elements,
            "pyspice_version": str(PySpice.__version__),
        }

    def _parse_basic_elements(self) -> None:
        pass

    def _parse_highlevel_elements(self) -> None:
        from PySpice.Spice import HighLevelElement, _get_elements

        for element in _get_elements(HighLevelElement):
            if "Spice.HighLevelElement" in repr(element):
                self._high_level_elements.append(
                    self._parse_high_level_members(element)
                )

    def _parse_high_level_members(self, class_: type) -> dict:
        class_details = {
            "name": class_.__name__,
            "pins_count": 2,
            "attributes": [],
            "class_doc": class_.__doc__,
        }

        for super_class in inspect.getmro(class_):
            if "Mixin" in repr(super_class) and "MixinAbc" not in repr(super_class):
                mixin_signature = inspect.signature(super_class)
                class_details["mixin_doc"] = super_class.__doc__
                meta_dict = self._add_to_meta_dict(class_.__name__, super_class.__doc__)
                for param_name, param in mixin_signature.parameters.items():
                    if not (val := meta_dict.get(param_name)):
                        val = _get_missing_attribute_meta(param_name, class_.__name__)

                    class_details["attributes"].append(
                        {
                            "name": param_name,
                            "default": self._get_default_for(param_name, param),
                            "constraints": _get_attribute_constraints(param_name),
                            "attribute_meta": val if val is not None else {},
                        }
                    )

        return class_details

    def _add_to_meta_dict(self, class_name: str, class_doc: str) -> dict:
        meta_dict = {}
        if "TRRANDOM" in class_doc:
            return {}
        usable_lines = []
        for line in class_doc.split("\n"):
            if line.strip().startswith("+") or line.strip().startswith("|"):
                if line and "-" not in line:
                    usable_lines.append(
                        line.replace("Td1+Tstep", "sum(Td1, Tstep)")
                        .strip()
                        .replace("|", "")
                        .strip()
                        .replace("+", SPLIT_PLACE_HOLDER)
                    )

        if len(usable_lines):
            meta_keys = list(
                key.strip() for key in usable_lines[0].split(SPLIT_PLACE_HOLDER)
            )
            for params in usable_lines[1:]:
                params_gen = (val.strip() for val in params.split(SPLIT_PLACE_HOLDER))
                params_dict = {}
                param_name = ""
                for j, val in enumerate(params_gen):
                    meta_key = self._to_camel_case(meta_keys[j])
                    if meta_key == "parameter":
                        param_name = self._to_camel_case(val)

                    if (freq := "1/sec") in val:
                        val = val.replace(freq, "Hz")

                    if "sum" in val or "," not in val:
                        params_dict[meta_key] = val
                    elif "Current" in class_name:
                        params_dict[self._to_camel_case(meta_keys[j])] = "A"
                    elif "Voltage" in class_name:
                        params_dict[self._to_camel_case(meta_keys[j])] = "V"

                meta_dict[param_name] = params_dict

        return meta_dict

    @staticmethod
    def _to_camel_case(string: str) -> str:
        return "_".join(string.lower().split(" ")).replace(".", "")

    @staticmethod
    def _confirm_pyspice_existence() -> None:
        from symbench.electric_circuits.utils import has_pyspice

        if not has_pyspice:
            raise PySpiceMissingException("PySpice is not installed")

    @staticmethod
    def _get_default_for(param_name: str, parameter: inspect.Parameter) -> Any:
        if param_name == "values":
            return "[(0, 0)]"
        if param_name == "random_type":
            return "uniform"
        if param_name == "damping_factor":
            return 0.01
        if param_name in (
            "phase",
            "fall_delay_time",
            "fall_time_constant",
            "rise_time_constant",
        ):
            return 0
        return (
            parameter.default
            if not parameter.default == inspect.Parameter.empty
            else 0.0
        )
