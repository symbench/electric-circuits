import json
from importlib.util import module_from_spec, spec_from_file_location
from os import path
from pathlib import Path
from typing import Union

from PySpice.Spice.Netlist import Circuit, SubCircuit

script_dir = path.dirname(path.realpath(__file__))

BASE_PLUGIN_PATH = Path(
    f"{script_dir}/../../../common/plugins/CircuitAnalysisBases.py"
).resolve()
IMPORT_MODULE_NAME = "electric_circuits.plugin_bases"
BASE_PLUGIN_NAME = "AnalyzeCircuit"


def import_from_path(path, module_name):
    spec = spec_from_file_location(module_name, path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


base_module = import_from_path(BASE_PLUGIN_PATH, IMPORT_MODULE_NAME)
PluginBase = getattr(base_module, BASE_PLUGIN_NAME)

PYSPICE_TO_GME_TYPE = {
    "SubCircuitElement": "Circuit",
    "Resistor": "Resistor",
    "SemiconductorResistor": "Resistor",
    "BehavioralResistor": "Resistor",
    "Capacitor": "Capacitor",
    "SemiconductorCapacitor": "Capacitor",
    "BehavioralCapacitor": "Capacitor",
    "Inductor": "Inductor",
    "BehavioralInductor": "Inductor",
    "CoupledInductor": "Inductor",
    "VoltageControlledSwitch": None,
    "CurrentControlledSwitch": None,
    "VoltageSource": "Voltage",
    "CurrentSource": "Current",
    "VoltageControlledCurrentSource": "VCC",
    "VoltageControlledVoltageSource": "VCV",
    "CurrentControlledCurrentSource": "CCC",
    "CurrentControlledVoltageSource": "CCV",
    "NonLinearVoltageSource": None,
    "NonLinearCurrentSource": None,
    "Diode": "Diode",
    "BipolarJunctionTransistor": ["NPN", "PNP"],
    "JunctionFieldEffectTransistor": None,
    "Mesfet": None,
    "Mosfet": ["NMOS", "PMOS"],
    "LosslessTransmissionLine": None,
    "LossyTransmission": None,
    "CoupledMulticonductorLine": None,
    "UniformDistributedRCLine": None,
    "SingleLossyTransmissionLine": None,
    "XSpiceElement": None,
}


def load_model(name):
    model_path = Path(f"{script_dir}/models/{name}/__init__.py").resolve()
    model = import_from_path(model_path, name)
    return model


def sort_dict(d):
    sorted_keys = sorted(d.items(), key=lambda k: -k[1])
    return dict(sorted_keys)


class RecommendNextComponents(PluginBase):
    """Runs a mock implementation for recommending components to be added to the Circuit"""

    def run_analytics(self, circuit: Union[Circuit, SubCircuit]) -> None:
        model_name = self.get_current_config().get("model")
        model = load_model(model_name)
        recommendations = model.analyze(circuit)
        recommendations = sort_dict(
            {
                gme_type: conf
                for pyspice_type, conf in recommendations.items()
                if (gme_type := self._pyspice_to_gme_type(pyspice_type)) is not None
            }
        )
        self.add_file("recommendations.json", json.dumps(recommendations, indent=2))

    def _pyspice_to_gme_type(self, pyspice_type: dict) -> str:
        """Map a PySpice type to a metanode in the metamodel"""
        if pyspice_type in PYSPICE_TO_GME_TYPE:
            if isinstance(recs := PYSPICE_TO_GME_TYPE[pyspice_type], list):
                return recs[0]
            else:
                return recs
        else:
            self._log_error(
                warn := f"{pyspice_type} cannot be mapped to a component in the metamodel."
            )
            self.create_message(self.active_node, warn, "warning")
