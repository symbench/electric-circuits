"""
This is where the implementation of the plugin code goes.
The ConvertNetlistToCircuit-class is imported from both run_plugin.py and run_debug.py
"""
import logging
import sys
from typing import List, Union

from PySpice.Spice.Netlist import Circuit, SubCircuit
from PySpice.Spice.Parser import SpiceParser
from webgme_bindings import PluginBase

# Setup a logger
logger = logging.getLogger("ConvertNetlistToCircuit")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

elements_map = {
    "A": None,
    "B": None,
    "BehavioralCapacitor": "Capacitor",
    "C": "Capacitor",
    "D": "Diode",
    "E": "VCV",
    "F": "CCC",
    "G": "VCC",
    "H": "CCV",
    "I": "Current",
    "J": None,
    "K": None,
    "L": "Inductor",
    "M": ["NMOS", "PMOS"],
    "O": None,
    "P": None,
    "Q": ["NPN", "PNP"],
    "R": "Resistor",
    "S": None,
    "T": None,
    "U": None,
    "V": "Voltage",
    "W": None,
    "X": "Circuit",
    "Y": None,
    "Z": None,
}

pyspice_to_gme_pins = {
    "plus": "p",
    "minus": "n",
    "drain": "D",
    "gate": "G",
    "source": "S",
    "bulk": "B",
    "cathode": "p",
    "anode": "n",
    "collector": "C",
    "base": "B",
    "emitter": "E",
}


class ConvertNetlistToCircuit(PluginBase):
    def main(self):

        if not self.core.is_type_of(
            self.active_node, self.META["ElectricCircuitsFolder"]
        ):
            self._fail("Active node is not an ElectricCircuitsFolder")
        else:
            if not (
                input_netlist_hash := self.get_current_config().get("input_netlist")
            ):
                self._fail("Input netlist not provided")
            self._initialize()
            start_commit = self.project.get_commit_object(self.branch_name)["parents"]
            input_netlist = self.get_file(input_netlist_hash)
            circuit_dict = self._netlist_to_dict(input_netlist)
            self._dict_to_gme(circuit_dict, self.active_node)
            self._commit_results(start_commit)
            self.result_set_success(True)

    def _initialize(self) -> None:
        self.generate_positions = self.get_position_generator()

    def _netlist_to_dict(self, netlist: str) -> dict:
        """Return a PySpice Circuit from an input Netlist"""
        spice_parser = SpiceParser(source=netlist)
        spice_ckt = spice_parser.build_circuit()
        for sub_ckt in spice_parser.subcircuits:
            spice_ckt.subcircuit(sub_ckt.build())
        return self._pyspice_circuit_to_dict(spice_ckt)

    def _pyspice_circuit_to_dict(self, spice_ckt: Union[Circuit, SubCircuit]) -> dict:
        """Recursively build a dictionary of elements and pins for the circuit to a dictionary"""
        circuit_dict = {
            "type": "Circuit",
            "id": id(spice_ckt),
            "name": spice_ckt.title
            if isinstance(spice_ckt, Circuit)
            else spice_ckt.name,
            "sub_circuits": [],
            "elements": self._get_elements_for(spice_ckt),
            "nodes": self._get_element_nodes_for(spice_ckt),
            "pins": [],
        }

        if isinstance(spice_ckt, SubCircuit):
            for index, node in enumerate(spice_ckt.external_nodes):
                circuit_dict["pins"].append(
                    {"name": f"p{index + 1}", "node": str(node)}
                )

        for sub_ckt in spice_ckt.subcircuits:
            circuit_dict["sub_circuits"].append(self._pyspice_circuit_to_dict(sub_ckt))

        return circuit_dict

    def _dict_to_gme(self, circuit_dict: dict, parent_ckt: dict) -> None:
        """Convert PySpice circuit into WebGME Circuit"""
        gme_ckt_node = self.core.create_child(
            parent_ckt, self.META[circuit_dict["type"]]
        )
        self.core.set_attribute(
            gme_ckt_node, "name", name := (circuit_dict["name"] or "Circuit")
        )
        self._set_position(gme_ckt_node)
        self.generate_positions = self.get_position_generator()

        self._add_external_pins(gme_ckt_node, circuit_dict["pins"])

        self.logger.debug(f'Added node of type {circuit_dict["type"]}, named {name}')
        element_to_gme_id = {circuit_dict["id"]: self.core.get_path(gme_ckt_node)}

        for element in circuit_dict["elements"]:
            element_node = self.core.create_child(
                gme_ckt_node, self.META[element["type"]]
            )
            self.core.set_registry(element_node, "position", self.generate_positions())
            self.core.set_attribute(element_node, "name", element["name"])
            element_to_gme_id[element["id"]] = self.core.get_path(element_node)
            self.logger.debug(
                f'Added node of type {element["type"]}, named {element["name"]}'
            )

            if element["type"] == "Circuit":
                self._add_external_pins(element_node, element["pins"])

        for pins in circuit_dict["nodes"].values():
            self._add_wires(pins, element_to_gme_id, gme_ckt_node)
        for sub_ckt in circuit_dict["sub_circuits"]:
            self._dict_to_gme(sub_ckt, gme_ckt_node)

    def _add_wires(self, pins: List[dict], gme_id_map: dict, gme_circuit: dict) -> None:
        """Adds wires between connected nodes from the Netlist"""
        if not pins:
            return
        src_element = self.core.load_by_path(
            self.root_node, gme_id_map[pins[0]["element_id"]]
        )

        src_pin = self._get_pin_by_name(src_element, pins[0]["pin_name"])
        for pin in pins[1:]:
            dst_element = self.core.load_by_path(
                self.root_node, gme_id_map[pin["element_id"]]
            )
            dst_pin = self._get_pin_by_name(dst_element, pin["pin_name"])
            wire = self.core.create_child(gme_circuit, self.META["Wire"])
            self.core.set_pointer(wire, "src", src_pin)
            self.core.set_pointer(wire, "dst", dst_pin)

    def _add_external_pins(self, circuit: dict, pins: List[dict]) -> None:
        for pin in pins:
            pin_node = self.core.create_child(circuit, self.META["Pin"])
            self.core.set_attribute(pin_node, "name", pin["name"])
            self._set_position(pin_node)

    def _set_position(self, node: dict) -> None:
        self.core.set_registry(node, "position", self.generate_positions())

    def _get_pin_by_name(self, element_node, pin_name):
        """Get an element pin by its name"""
        return list(
            filter(
                lambda node: (
                    self.core.is_type_of(node, self.META["Pin"])
                    and self.core.get_attribute(node, "name") == pin_name
                ),
                self.core.load_children(element_node),
            )
        ).pop()

    def _commit_results(self, start_commit: List[str]) -> None:
        """Commit the nodes created by this plugin"""
        persisted = self.core.persist(self.active_node)
        commit_result = self.project.make_commit(
            self.branch_name,
            start_commit,
            persisted["rootHash"],
            persisted["objects"],
            "Successfully created the circuit",
        )

        self.project.set_branch_hash(
            self.branch_name,
            commit_result["hash"],
            self.project.get_branch_hash(self.branch_name),
        )

        self.logger.info(
            f"Successfully committed results to branch {self.branch_name}. "
            f'The hash is {commit_result["hash"]}'
        )

    def _fail(self, err: str) -> None:
        self.logger.error(err)
        self.result_set_error(err)
        self.result_set_success(False)

    @staticmethod
    def _get_elements_for(spice_ckt: Union[Circuit, SubCircuit]) -> List:
        """Get a dictionary of elements from the spice Circuit or SubCircuit"""
        elements = []

        for element in spice_ckt.elements:
            if meta_name := elements_map.get(element.__alias__):
                current_element = {
                    "type": meta_name if isinstance(meta_name, str) else meta_name[0],
                    "name": element.name,
                    "pins": [],
                    "id": id(element),
                }

                for index, pin in enumerate(element.pins):
                    if pin.name:
                        current_element["pins"].append(
                            {
                                "name": pyspice_to_gme_pins[pin.name],
                                "node": pin.node.name,
                            }
                        )
                    else:
                        pin._name = f"p{index+1}"
                        current_element["pins"].append(
                            {"name": f"p{index+1}", "node": pin.node.name}
                        )
                elements.append(current_element)

        return elements

    @staticmethod
    def _get_element_nodes_for(spice_ckt: Union[Circuit, SubCircuit]) -> dict:
        nodes = {}

        for node in spice_ckt.nodes:
            nodes[node.name] = []
            for pin in node.pins:
                nodes[node.name].append(
                    {
                        "element_id": id(pin.element),
                        "pin_name": pyspice_to_gme_pins.get(pin.name, pin.name),
                    }
                )

        return nodes

    @staticmethod
    def get_position_generator(margin=200, max_width=800):
        x = 50
        y = 50

        def position_generator():
            nonlocal x
            nonlocal y
            if x + margin > max_width:
                x = 50
                y += margin
            x += margin
            return {"x": x, "y": y}

        return position_generator
