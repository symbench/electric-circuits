import json
from collections import Counter
from importlib.util import module_from_spec, spec_from_file_location
from typing import Union
from PySpice.Spice.Netlist import Circuit, SubCircuit
from pathlib import Path
from os import path

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

def load_model(name):
    model_path = Path(
        f'{script_dir}/models/{name}/__init__.py'
    ).resolve()
    model = import_from_path(model_path, name)
    return model

class RecommendNextComponents(PluginBase):
    """Runs a mock implementation for recommending components to be added to the Circuit"""

    def run_analytics(self, circuit: Union[Circuit, SubCircuit]) -> None:
        model_name = self.get_current_config().get("model")
        model = load_model(model_name)
        recommendations = model.analyze(circuit)
        self.add_file("recommendations.json", json.dumps(recommendations, indent=2))
