from symbench.electric_circuits import CircuitToPySpiceBase as PluginBase


class ConvertCircuitToNetlist(PluginBase):
    def main(self) -> None:
        circuit = super().convert_to_pyspice(self.active_node)
        output_filename = self.get_current_config().get("file_name")
        if not output_filename:
            output_filename = self.core.get_attribute(self.active_node, "name")
        self.add_file(f"{output_filename}.cir", str(circuit))
        self.result_set_success(True)
