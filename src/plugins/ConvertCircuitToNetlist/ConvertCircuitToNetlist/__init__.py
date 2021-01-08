"""
This is where the implementation of the plugin code goes.
The ConvertCircuitToNetlist-class is imported from both run_plugin.py and run_debug.py
"""

import sys
import logging
from typing import List, Union
from functools import partial

from PySpice.Spice.Netlist import Circuit, SubCircuit

from webgme_bindings import PluginBase
from .node_utils import ComponentNode

# Setup a logger
logger = logging.getLogger('ConvertCircuitToNetlist')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

component_counts = {
    'R': 0,
    'L': 0,
    'C': 0,
    'D': 0,
}


def get_next_label_for(component: str) -> int:
    assert component in ['R', 'L', 'C', 'D']
    component_counts[component] = component_counts[component] + 1
    return component_counts[component]


class ConvertCircuitToNetlist(PluginBase):
    def main(self) -> None:
        self._assign_meta_functions()
        self._initialize_spice_netlist()
        circuit = self.active_node
        self._create_adjacency_list(circuit)
        self._assign_spice_node_labels_to_pins()
        self._write_netlist(circuit)

    def _assign_meta_functions(self) -> None:
        for name, meta_node in self.META.items():
            p = partial(self.core.is_type_of, node=None, type_node_or_path=meta_node)
            setattr(self, f'is_{name.lower()}', p)
        self.logger.debug(f'Assigned meta type classification functions to {self.__class__.__name__}')

    def _initialize_spice_netlist(self) -> None:
        circuit_name = self.core.get_attribute(self.active_node, 'name')
        self.netlist_ckt = Circuit(circuit_name)
        self.logger.debug('Initialized empty spice netlist')

    def _create_adjacency_list(self, circuit: dict) -> None:
        self.adj_list = dict()
        self.junction_pin_ids = set()
        wires = sorted(
            self._get_children_of_type(circuit, 'Wire'),
            key=lambda x: self.core.get_path(x)
        )

        for wire in wires:
            src_pin = self.core.load_pointer(wire, 'src')
            dst_pin = self.core.load_pointer(wire, 'dst')

            src_pin_id = self.core.get_path(src_pin)
            dst_pin_id = self.core.get_path(dst_pin)
            if not self.adj_list.get(src_pin_id):
                self.adj_list[src_pin_id] = set()
            if not self.adj_list.get(dst_pin_id):
                self.adj_list[dst_pin_id] = set()

            self.adj_list[src_pin_id].add(dst_pin_id)
            self.adj_list[dst_pin_id].add(src_pin_id)

            for pin, pin_id in [(src_pin, src_pin_id), (dst_pin, dst_pin_id)]:
                if self._is_junction_pin(pin):
                    remaining_pin_ids = self._get_remaining_pin_ids(pin)
                    self.junction_pin_ids.add(pin_id)
                    for remaining_pin_id in remaining_pin_ids:
                        self.adj_list[src_pin_id].add(remaining_pin_id)
                        self.adj_list[dst_pin_id].add(remaining_pin_id)
                        self.junction_pin_ids.add(remaining_pin_id)

        self._expand_junction_adjacency()

    def _expand_junction_adjacency(self):
        for pin_id in list(self.adj_list.keys()):
            if pin_id not in self.junction_pin_ids:
                self._visit_junctions(pin_id, set())

    def _visit_junctions(self, pin_id, visited):
        adj_pins = self.adj_list.get(pin_id, set())
        for adj_pin_id in list(adj_pins):
            if adj_pin_id in self.junction_pin_ids and adj_pin_id not in visited:
                visited.add(adj_pin_id)
                extra_pin_ids = self.adj_list.get(adj_pin_id, set())
                for extra_pin_id in list(extra_pin_ids):
                    self.adj_list[pin_id].add(extra_pin_id)
                    self._visit_junctions(extra_pin_id, visited)

    def _assign_spice_node_labels_to_pins(self):
        self.pin_labels = {}
        self.nodes_count = 0
        for pin_id in self.adj_list:
            if pin_id in self.pin_labels:
                for adj_pin in self.adj_list[pin_id]:
                    self.pin_labels[adj_pin] = self.pin_labels[pin_id]
            else:
                self.nodes_count += 1
                self.pin_labels[pin_id] = f'N000{self.nodes_count}'
                for adj_pin in self.adj_list[pin_id]:
                    self.pin_labels[adj_pin] = self.pin_labels[pin_id]

    def _get_remaining_pin_ids(self, pin):
        parent = self.core.get_parent(pin)
        pins = self._get_children_of_type(parent, 'Pin')
        pins.remove(pin)
        return list(map(lambda node: self.core.get_path(node), pins))

    def _is_junction_pin(self, pin: dict) -> bool:
        parent = self.core.get_parent(pin)
        return self.is_junction(node=parent)

    def _write_netlist(self, circuit):
        components = self._get_children_except(circuit, 'Pin', 'Wire', 'Junction')
        is_subckt = False
        if self.is_circuit(node=self.core.get_parent(circuit)):
            is_subckt = True
            pins = self._get_children_of_type(circuit, 'Pin')
            spice_nodes = []
            for pin in pins:
                spice_nodes.append(self.pin_labels[self.core.get_path(pin)])
            current_ckt = SubCircuit(self.core.get_attribute(circuit, 'name'), *spice_nodes)
        else:
            current_ckt = self.netlist_ckt

        components_map = {}
        for component in components:
            component_id = self.core.get_path(component)
            components_map[component_id] = dict()
            components_map[component_id]['node'] = component
            pins = self._get_children_of_type(component, 'Pin')
            for pin in pins:
                pin_id = self.core.get_path(pin)
                pin_name = self.core.get_attribute(pin, 'name')
                if pin_id in self.pin_labels:
                    components_map[component_id][pin_name] = self.pin_labels[pin_id]
                else:
                    self.nodes_count += 1
                    components_map[component_id][pin_name] = f'N000{self.nodes_count}'

        for component in components_map.values():
            self._add_to_netlist(component, current_ckt)

        if is_subckt:
            self.netlist_ckt.subcircuit(current_ckt)

        print(self.netlist_ckt)

    def _add_to_netlist(self, component: dict, netlist_ckt: Union[Circuit, SubCircuit]) -> None:
        if self.is_resistor(node=component['node']):
            netlist_ckt.R(
                get_next_label_for('R'),
                component['p'],
                component['n']
            )
        if self.is_diode(node=component['node']):
            netlist_ckt.D(
                get_next_label_for('D'),
                component['p'],
                component['n']
            )

        if self.is_capacitor(node=component['node']):
            netlist_ckt.D(
                get_next_label_for('D'),
                component['p'],
                component['n']
            )

        if self.is_inductor(node=component['node']):
            netlist_ckt.D(
                get_next_label_for('D'),
                component['p'],
                component['n']
            )

    # Helper Methods for gme nodes
    def _get_children_of_type(self, node: dict, type_: str) -> List[dict]:
        return list(
            filter(
                lambda x: self.core.get_meta_type(x) == self.META[type_],
                self.core.load_children(node)
            )
        )

    def _get_children_except(self, node: dict, *args: List[str]) -> List[dict]:
        assert (type(arg) == str for arg in args), 'Please Provide a specific type'
        children = []
        for child in self.core.load_children(node):
            if all(self.core.get_meta_type(child) != self.META[arg] for arg in args):
                children.append(child)
        return children
