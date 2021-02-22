import json
import re
import sys

from PySpice.Spice.Parser import SpiceParser
from PySpice.Spice.Netlist import Circuit, SubCircuit


class NetListJSON:
    def __init__(self, netlist: str) -> None:
        spice_parser = SpiceParser(source=netlist)
        self.ckt = self._build_circuit(spice_parser)
        self.webgme_name_re = re.compile(r"([A-Z])(.*)(_\d)")

    def json(self, ckt=None) -> str:
        ckt_json = {}
        if ckt is None:
            ckt = self.ckt
        self.get_json(ckt, ckt_json)
        return json.dumps(ckt_json)

    def get_json(self, ckt, initial):
        initial.update(
            {
                "name": ckt.name if isinstance(ckt, SubCircuit) else ckt.title,
                "nodes": {
                    self._get_webgme_name(element_name): self._get_nodes_for(
                        ckt.element(element_name)
                    )
                    for element_name in ckt.element_names
                },
            }
        )
        initial["sub_circuits"] = []
        for sub_ckt in ckt.subcircuits:
            sub_ckt_nodes = {}
            self.get_json(sub_ckt, sub_ckt_nodes)
            initial["sub_circuits"].append(sub_ckt_nodes)

    @staticmethod
    def _get_nodes_for(element):
        return [str(pin.node) for pin in element.pins]

    @staticmethod
    def _build_circuit(spice_parser: SpiceParser) -> Circuit:
        ckt = spice_parser.build_circuit()
        for sub_ckt in spice_parser.subcircuits:
            ckt.subcircuit(sub_ckt.build())
        return ckt

    def _get_webgme_name(self, element_name: str) -> str:
        match = self.webgme_name_re.match(element_name)
        if match:
            return match.group(2)
        else:
            return element_name


def main(netlist):
    jsonifier = NetListJSON(netlist)
    sys.stdout.write(jsonifier.json())


if __name__ == "__main__":
    main(sys.argv[1])
