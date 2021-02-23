import logging
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

BASE_PLUGIN_PATH = Path(
    f"{__file__}/../../../../common/plugins/CircuitAnalysisBases.py"
).resolve()

IMPORT_MODULE_NAME = "electric_circuits.plugin_bases"
BASE_PLUGIN_NAME = "CircuitToPySpiceBase"

spec = spec_from_file_location(IMPORT_MODULE_NAME, BASE_PLUGIN_PATH)

base_module = module_from_spec(spec)
spec.loader.exec_module(base_module)

PluginBase = getattr(base_module, BASE_PLUGIN_NAME)


class ConvertCircuitToNetlist(PluginBase):
    def main(self) -> None:
        super().convert_to_pyspice(self.active_node)
        output_filename = self.get_current_config().get("file_name")
        if not output_filename:
            output_filename = self.core.get_attribute(self.active_node, "name")
        self.add_file(f"{output_filename}.cir", str(self.pyspice_circuit))
        self.result_set_success(True)
