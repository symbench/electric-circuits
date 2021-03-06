"""
This Plugin Takes in a Netlist and attempts to build an equivalent representation in WebGME.
"""
import itertools
import logging
import os
import sys
from builtins import isinstance
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from typing import Callable, List, Optional, Tuple, Union

from PySpice.Spice.BasicElement import SubCircuitElement
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
    "BehavioralInductor": "Inductor",
    "L": "Inductor",
    "M": ["NMOS", "PMOS"],
    "O": None,
    "P": None,
    "Q": ["NPN", "PNP"],
    "BehavioralResistor": "Resistor",
    "R": "Resistor",
    "S": None,
    "T": None,
    "U": None,
    "V": "Voltage",
    "W": None,
    "X": "Circuit",
    "Y": None,
    "Z": None,
    "Ground": "Ground",
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
    "input_plus": "p1",
    "input_minus": "n1",
    "output_plus": "p2",
    "output_minus": "n2",
}

GROUND_NODE_ID = 0


def find_by_key(
    input_list: List[dict], key: str, value: str
) -> Optional[Tuple[dict, int]]:
    """Utility method to find an element in a list of dictionary by a specific key"""
    for element in input_list:
        if element[key] == value:
            return element, input_list.index(element)
    raise ValueError(f"No Element with {key}={value} found in the list")


def import_from_path(import_path, module_name):
    spec = spec_from_file_location(module_name, import_path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


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
            input_netlist_filename = self._get_metadata(input_netlist_hash).get(
                "name", None
            )

            created_circuits = []
            failures = []

            if Path(input_netlist_filename).suffix == ".zip":
                netlists = self._get_zip_file_contents(input_netlist_hash)
            else:
                netlists = dict()
                netlists[input_netlist_filename] = self.get_file(input_netlist_hash)

            pos_gen = self.get_position_generator(alternate_positions=False)
            for filename, netlist_string in netlists.items():
                try:
                    pyspice_circuit = self._netlist_to_pyspice_circuit(
                        netlist_string, filename
                    )
                except Exception as e:
                    failures.append((filename, e))
                    continue
                gme_circuit = self._create_gme_circuit_from_pyspice(pyspice_circuit)
                self._set_position(gme_circuit, pos_gen)
                created_circuits.append((pyspice_circuit, gme_circuit))

            for filename, error in failures:
                self.create_message(
                    self.active_node,
                    f"Conversion failed for {filename}, "
                    f"as it is not a valid Netlist. The "
                    f"error message is {error}.",
                    "error",
                )

            if created_circuits:
                self._commit_results(start_commit)
                self.result_set_success(True)
                if os.environ.get("NODE_ENV") == "test":
                    for (pyspice_circuit, gme_circuit) in created_circuits:
                        self.assert_valid(gme_circuit, pyspice_circuit)
            else:
                self.result_set_success(False)

    def _initialize(self) -> None:
        self._generate_positions = self.get_position_generator()
        self._pyspice_id_to_gme_node = {}
        self._connected_pins = {}

    def _circuit_to_dict(self, circuit: Union[Circuit, SubCircuit]) -> dict:
        """Return a PySpice Circuit from an input Netlist"""
        return self._pyspice_circuit_to_dict(circuit)

    def _netlist_to_pyspice_circuit(
        self, netlist: str, filename: str = None
    ) -> Circuit:
        spice_parser = SpiceParser(source=netlist)
        spice_ckt = spice_parser.build_circuit()
        for sub_ckt in spice_parser.subcircuits:
            spice_ckt.subcircuit(sub_ckt.build())

        if not spice_ckt.title and filename is not None:
            spice_ckt.title = Path(filename).stem

        return spice_ckt

    def _create_gme_circuit_from_pyspice(
        self, pyspice_circuit: Union[Circuit, SubCircuit]
    ) -> dict:
        """From a given PySpice Circuit, create a GME Circuit"""
        circuit_dict = self._circuit_to_dict(pyspice_circuit)
        gme_circuit = self._dict_to_gme(circuit_dict, self.active_node)
        return gme_circuit

    def _pyspice_circuit_to_dict(self, spice_ckt: Union[Circuit, SubCircuit]) -> dict:
        """Recursively build a dictionary of elements and pins for the circuit to a dictionary"""
        circuit_dict = {
            "type": "Circuit",
            "id": id(spice_ckt),
            "name": spice_ckt.title
            if isinstance(spice_ckt, Circuit)
            else spice_ckt.name,
            "elements": self._get_elements_for(spice_ckt),
            "nodes": self._get_element_nodes_for(spice_ckt),
            "subcircuits": [],
            "pins": [],
        }

        if isinstance(spice_ckt, SubCircuit):
            for index, node in enumerate(spice_ckt.external_nodes):
                node_id = str(node)
                pin_name = f"p{index+1}"
                circuit_dict["pins"].append(
                    {
                        "name": f"{pin_name}",
                        "node": node_id,
                        "element_id": id(spice_ckt),
                    }
                )

                pin_node_info = {"element_id": id(spice_ckt), "pin_name": pin_name}

                if circuit_dict["nodes"].get(node_id):
                    circuit_dict["nodes"][node_id].append(pin_node_info)
                else:
                    circuit_dict["nodes"][node_id] = [pin_node_info]

        for sub_ckt in spice_ckt.subcircuits:
            sub_ckt_dict = self._pyspice_circuit_to_dict(sub_ckt)
            circuit_dict["subcircuits"].append(sub_ckt_dict)

        for subckt_dict in circuit_dict["subcircuits"]:
            for node in subckt_dict["nodes"]:
                if node in circuit_dict["nodes"]:
                    circuit_dict["nodes"][node].extend(subckt_dict["nodes"][node])

        return circuit_dict

    def _dict_to_gme(self, circuit_dict: dict, parent_ckt: dict) -> None:
        """Convert PySpice circuit into WebGME Circuit"""
        gme_ckt_node = self.core.create_child(
            parent_ckt, self.META[circuit_dict["type"]]
        )

        self.core.set_attribute(
            gme_ckt_node, "name", name := (circuit_dict["name"] or "Circuit")
        )
        self.logger.debug(f"Added node of type {circuit_dict['type']}, named {name}")
        self._pyspice_id_to_gme_node[circuit_dict["id"]] = gme_ckt_node

        self._generate_positions = self.get_position_generator()

        self._add_external_pins(gme_ckt_node, circuit_dict["pins"])

        for element in circuit_dict["elements"]:
            element_node = self.core.create_child(
                gme_ckt_node, self.META[element["type"]]
            )

            self.core.set_registry(element_node, "position", self._generate_positions())
            self.core.set_attribute(element_node, "name", name := element["name"])
            self._pyspice_id_to_gme_node[element["id"]] = element_node
            self.logger.debug(
                f"Added node of type {element['type']} ({self.core.get_path(element_node)}) "
                f"named {name}"
            )

            if element["type"] == "Circuit":
                self._add_external_pins(element_node, element["pins"])

        for sub_ckt in circuit_dict["subcircuits"]:
            self._dict_to_gme(sub_ckt, gme_ckt_node)

        for pins in circuit_dict["nodes"].values():
            self._add_wires(pins, gme_ckt_node)

        return gme_ckt_node

    def _add_external_pins(self, circuit: dict, pins: List[dict]) -> None:
        """Add external pins to the GME Circuit"""
        for pin in pins:
            pin_node = self.core.create_child(circuit, self.META["Pin"])
            self.core.set_attribute(pin_node, "name", pin["name"])
            self.logger.debug(
                f"Added node of type Pin ({self.core.get_path(pin_node)}) "
                f"named {pin['name']}, Parent Id: {self.core.get_path(circuit)}"
            )

            self._set_position(pin_node)

    def _add_wires(self, pins: List[dict], gme_circuit: dict) -> None:
        """Add Wires between connected pins"""
        if not pins:
            return
        # Remove self loops
        connected_pins = (
            (src, dst)
            for src, dst in itertools.product(pins, pins)
            if pins.index(src) != pins.index(dst)
        )

        for src, dst in connected_pins:
            try:
                src_element = self._pyspice_id_to_gme_node[src["element_id"]]
                src_pin = self._get_pin_by_name(src_element, src["pin_name"])
                dst_element = self._pyspice_id_to_gme_node[dst["element_id"]]
                dst_pin = self._get_pin_by_name(dst_element, dst["pin_name"])
                if not self._path_exists(src_pin, dst_pin):
                    wire = self.core.create_child(gme_circuit, self.META["Wire"])
                    self._add_to_adjacency(src_pin, dst_pin)
                    self.core.set_pointer(wire, "src", src_pin)
                    self.core.set_pointer(wire, "dst", dst_pin)

                    self.logger.debug(
                        f"Added Wire ({self.core.get_path(wire)}) between "
                        f"nodes ({self.core.get_path(src_pin)}, {self.core.get_path(dst_pin)})"
                    )

            except KeyError:  # Some nodes `src` and `dst` might not exist yet
                pass

    def _add_to_adjacency(self, src: dict, dst: dict) -> None:
        """Add connected pins to adjacency list"""
        if not self._connected_pins.get(src_id := self.core.get_path(src)):
            self._connected_pins[src_id] = {src_id}

        self._connected_pins[src_id].add(dst_id := self.core.get_path(dst))

        if not self._connected_pins.get(dst_id):
            self._connected_pins[dst_id] = {dst_id}

        self._connected_pins[dst_id].add(src_id)

    def _path_exists(self, pin1: dict, pin2: dict) -> bool:
        """Check if the pins are connected by a wire"""
        exists = False

        if all(
            [
                (pin1_id := self.core.get_path(pin1)) in self._connected_pins,
                (pin2_id := self.core.get_path(pin2)) in self._connected_pins,
            ]
        ):
            exists = bool(
                self._connected_pins[pin1_id].intersection(
                    self._connected_pins[pin2_id]
                )
            )

        return exists

    def _set_position(
        self, node: dict, position_generator: Optional[Callable] = None
    ) -> None:
        """Set registry positions for GMENode `node`"""
        if position_generator is None:
            position_generator = self._generate_positions

        self.core.set_registry(node, "position", position_generator())
        self.logger.debug(
            f"Set position of node ({self.core.get_path(node)}) "
            f"to {self.core.get_registry(node, 'position')}"
        )

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

    def _get_children_of_type(self, node: dict, type_: str) -> List[dict]:
        """Get Children of specific type for this GMENode"""
        return list(
            filter(
                lambda child: self.core.is_type_of(child, self.META[type_]),
                self.core.load_children(node),
            )
        )

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

        self.create_message(
            self.active_node,
            self.core.get_path(self.active_node),
            self.core.get_children_paths(self.active_node),
        )

        self.logger.info(
            f"Successfully committed results to branch {self.branch_name}. "
            f'The hash is {commit_result["hash"]}'
        )

    def _fail(self, err: str) -> None:
        """Add `err` to error message and fail"""
        self.logger.error(err)
        self.result_set_error(err)
        self.create_message(self.active_node, err, "error")
        self.result_set_success(False)

    def _get_metadata(self, artifact_hash: str) -> dict:
        """Returns metadata for given artifact hash from webGME BlobStorage"""
        return self._send({"name": "getMetadata", "args": [artifact_hash]})

    def _get_zip_file_contents(self, artifact_hash: str) -> dict:
        """Returns contents of a zip file from the WebGME BlobStorage as text"""
        return self._send({"name": "getZipFileContents", "args": [artifact_hash]})

    @staticmethod
    def _get_elements_for(spice_ckt: Union[Circuit, SubCircuit]) -> List:
        """Get a dictionary of elements from the spice Circuit or SubCircuit"""
        elements = []
        cc_elements = []

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
                                "name": pyspice_to_gme_pins[pin.name] + "2"
                                if element.__alias__ in ("F", "H")
                                else pyspice_to_gme_pins[pin.name],
                                "node": pin.node.name,
                            }
                        )
                    else:
                        pin._name = f"p{index+1}"
                        current_element["pins"].append(
                            {"name": f"p{index+1}", "node": pin.node.name}
                        )

                elements.append(current_element)

                if element.__alias__ in ("F", "H"):
                    cc_elements.append(
                        {
                            "name": current_element["name"],
                            "source": f"V{element.source}",
                        }
                    )

        if spice_ckt.has_ground_node():
            # fmt: off
            elements.append(
                {
                    "type": "Ground",
                    "name": "GND",
                    "pins": [
                        {
                            "name": "p",
                            "node": 0,
                        }
                    ],
                    "id": GROUND_NODE_ID,
                }
            )
            # fmt: on

        ConvertNetlistToCircuit._remove_cc_sources(cc_elements, elements)

        return elements

    @staticmethod
    def _get_element_nodes_for(spice_ckt: Union[Circuit, SubCircuit]) -> dict:
        """Return elements in this circuit"""
        nodes = {}

        for node in spice_ckt.nodes:
            nodes[node.name] = []
            for pin in node.pins:
                nodes[node.name].append(
                    {
                        "element_id": id(pin.element),
                        "pin_name": pyspice_to_gme_pins.get(pin.name, pin.name) + "2"
                        if pin.element.__alias__ in ("F", "H")
                        else pyspice_to_gme_pins.get(pin.name, pin.name),
                    }
                )
                if pin.element.__alias__ == "V":
                    for element in spice_ckt.elements:
                        if hasattr(element, "source") and pin.element.name[
                            1:
                        ] == getattr(element, "source"):
                            nodes[node.name][-1]["element_id"] = id(element)
                            nodes[node.name][-1]["pin_name"] += "1"

        if spice_ckt.has_ground_node():
            if not nodes.get("0"):
                nodes["0"] = []

            nodes["0"].append({"element_id": GROUND_NODE_ID, "pin_name": "p"})

        return nodes

    @staticmethod
    def _remove_cc_sources(sources_list: List, elements: List) -> None:
        """Find and remove any voltage references to CCV Sources"""
        src_indices = []
        for source in sources_list:
            voltage, index = find_by_key(elements, "name", source["source"])
            source, _ = find_by_key(elements, "name", source["name"])

            for pin in voltage["pins"]:
                source["pins"].append({"name": f"{pin['name']}1", "node": pin["node"]})
            src_indices.append(index)

        for index in src_indices:
            elements.pop(index)

    @staticmethod
    def get_position_generator(margin=200, max_width=800, alternate_positions=True):
        """Return a position generator for CompositionView"""
        x = 50
        y = 50
        row = 0

        def generate_positions():
            nonlocal x, y, row
            if x + margin > max_width:
                x = 50
                y += margin
                row += 1
            x += margin
            return {
                "x": x + margin / 2 if (row % 2 == 0 and alternate_positions) else x,
                "y": y,
            }

        return generate_positions

    # Tests in Python Go here
    def assert_valid(self, gme_circuit: dict, pyspice_circuit: Circuit) -> None:
        """Assert validity of created gme circuit"""
        if hasattr(pyspice_circuit, "title"):
            assert self.core.get_attribute(gme_circuit, "name") == pyspice_circuit.title

        gme_subcircuits = self._get_children_of_type(gme_circuit, "Circuit")
        sub_circuit_elements = [
            element
            for element in pyspice_circuit.elements
            if isinstance(element, SubCircuitElement)
        ]
        assert len(gme_subcircuits) == len(list(pyspice_circuit.subcircuits)) + len(
            sub_circuit_elements
        ), len(gme_subcircuits)

        # Check Ground
        if pyspice_circuit.has_ground_node():
            assert len(self._get_children_of_type(gme_circuit, "Ground")) == 1

        for wire in self._get_children_of_type(gme_circuit, "Wire"):
            src = self.core.load_pointer(wire, "src")
            dst = self.core.load_pointer(wire, "dst")
            src_parent = self.core.get_parent(src)
            dst_parent = self.core.get_parent(dst)
            src_node = None
            dst_node = None
            for element in pyspice_circuit.elements:
                if self.core.get_attribute(src_parent, "name") in element.name:
                    for pin in element.pins:
                        if pyspice_to_gme_pins.get(pin.name) and pyspice_to_gme_pins[
                            pin.name
                        ] == self.core.get_attribute(src, "name"):
                            src_node = pin.node.name

                if self.core.get_attribute(dst_parent, "name") in element.name:
                    for pin in element.pins:
                        if pyspice_to_gme_pins.get(pin.name) and pyspice_to_gme_pins[
                            pin.name
                        ] == self.core.get_attribute(dst, "name"):
                            dst_node = pin.node.name

                if src_node and dst_node:
                    assert (
                        src_node == dst_node
                    ), f"Nodes Mismatch ({src_node}, {dst_node})"
                    break

        for sub_circuit in gme_subcircuits:
            if (
                subckt_name := self.core.get_attribute(sub_circuit, "name")
            ) in pyspice_circuit._subcircuits:
                self.assert_valid(
                    sub_circuit, pyspice_circuit._subcircuits[subckt_name]
                )
