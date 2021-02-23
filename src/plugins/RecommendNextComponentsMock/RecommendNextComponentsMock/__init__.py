import json
from collections import Counter
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

BASE_PLUGIN_PATH = Path(
    f"{__file__}/../../../../common/plugins/CircuitAnalysisBases.py"
).resolve()
IMPORT_MODULE_NAME = "electric_circuits.plugin_bases"
BASE_PLUGIN_NAME = "AnalyzeCircuit"

spec = spec_from_file_location(IMPORT_MODULE_NAME, BASE_PLUGIN_PATH)

base_module = module_from_spec(spec)
spec.loader.exec_module(base_module)

PluginBase = getattr(base_module, BASE_PLUGIN_NAME)


class RecommendNextComponentsMock(PluginBase):
    """Runs a mock implementation for recommending components to be added to the Circuit"""

    def run_analytics(self) -> None:
        self._recommend_next_components()

    def _recommend_next_components(self) -> None:
        component_counts = Counter(
            type(element).__name__ for element in self.pyspice_circuit.elements
        )

        for subckt in self.pyspice_circuit.subcircuits:
            component_counts.update(
                type(element).__name__ for element in subckt.elements
            )

        most_common = dict(component_counts.most_common(3))

        recommendations = [
            {"element": element, "confidence": f"{ count / 50 * 100}%"}
            for element, count in most_common.items()
        ]
        self.add_file("recommendations.json", json.dumps(recommendations, indent=2))
