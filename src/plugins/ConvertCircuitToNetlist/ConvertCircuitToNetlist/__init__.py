"""
This is where the implementation of the plugin code goes.
The ConvertCircuitToNetlist-class is imported from both run_plugin.py and run_debug.py
"""
import re
import sys
import logging
from typing import List, Union, Optional
from functools import partial


from PySpice.Spice.Netlist import Circuit, SubCircuit

from webgme_bindings import PluginBase

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
    'Q': 0,
    'M': 0,
    'V': 0,
    'I': 0,
    'G': 0,
    'E': 0,
    'F': 0,
    'H': 0
}

SKIP_NODES = [
    'VariableResistor',
    'VariableConductor',
    'VariableCapacitor',
    'VariableInductor',
    'SaturatingInductor',
    'OpAmp',
    'OpAmpDetailed',
    'Gyrator',
    'OpAmpDetailed',
    'Potentiometer',
    'Transformer'
]


def get_next_label_for(component: str) -> int:
    assert component in component_counts
    component_counts[component] = component_counts[component] + 1
    return component_counts[component]


class NetListConversionError(Exception):
    """Error to be raised when there's an error in netlist conversion"""


class ConvertCircuitToNetlist(PluginBase):
    def main(self) -> None:
        self._assign_meta_functions()
        if not self.is_circuit(node=self.active_node):
            self.logger.error('Active Node is not a circuit')
            self.result_set_success(False)
            self.result_set_error('Active Node is not a circuit')
        else:
            circuit = self.active_node
            self._initialize(circuit)
            self._identify_pins(circuit)
            self._expand_junction_adjacency()
            self._assign_spice_node_labels_to_pins()
            self._populate_netlist(circuit, self._netlist_ckt)
            output_filename = self.get_current_config().get('file_name')
            if not output_filename or output_filename == '':
                output_filename = self.core.get_attribute(circuit, "name")
            self.add_file(f'{output_filename}.cir', str(self._netlist_ckt))
            self.result_set_success(True)

    def _assign_meta_functions(self) -> None:
        """Assign is_* function for easier meta type checks"""
        for name, meta_node in self.META.items():
            p = partial(self.core.is_type_of, node=None, type_node_or_path=meta_node)
            setattr(self, f'is_{self._to_camel_case(name)}', p)
        self.logger.debug(f'Assigned meta type classification functions to {self.__class__.__name__}')

    def _initialize(self, circuit: dict) -> None:
        """Initialize an empty netlist and the necessary data-structures for netlist conversion

        Parameters
        ----------
        circuit: dict
            A gme node of type Circuit
        """
        self._adj_list = dict()
        self._junction_pin_ids = set()
        self._ground_pins = set()
        circuit_name = self.core.get_attribute(circuit, 'name')
        self._netlist_ckt = Circuit(circuit_name)
        self.logger.debug('Initialized empty spice netlist')

    def _identify_pins(self, circuit: dict) -> None:
        """Identify the pins and build adjacency list for pins
        This method(recursively) identifies all the connected pins
        and builds an adjacency list for individual pin.
        There are three possible situations to handle:
            1. The Pin is contained inside a normal component node
            2. The Pin is a ground Pin (Special Case for SPICE labeled '0')
            3. The Pin is contained in a Junction node

        Parameters:
        ----------
        circuit: dict
            A gme node of type Circuit
        """
        sub_circuits = self._get_children_of_type(circuit, 'Circuit')
        for sub_circuit in sub_circuits:
            self._identify_pins(sub_circuit)

        wires = sorted(
            self._get_children_of_type(circuit, 'Wire'),
            key=lambda x: self.core.get_path(x)
        )

        for wire in wires:
            src_pin = self.core.load_pointer(wire, 'src')
            dst_pin = self.core.load_pointer(wire, 'dst')

            src_pin_id = self.core.get_path(src_pin)
            dst_pin_id = self.core.get_path(dst_pin)
            if not self._adj_list.get(src_pin_id):
                self._adj_list[src_pin_id] = set()
            if not self._adj_list.get(dst_pin_id):
                self._adj_list[dst_pin_id] = set()

            self._adj_list[src_pin_id].add(dst_pin_id)
            self._adj_list[dst_pin_id].add(src_pin_id)

            for pin, pin_id in [(src_pin, src_pin_id), (dst_pin, dst_pin_id)]:
                if self._is_junction_pin(pin):
                    remaining_pin_ids = self._get_remaining_pin_ids(pin)
                    self._junction_pin_ids.add(pin_id)
                    for remaining_pin_id in remaining_pin_ids:
                        self._adj_list[src_pin_id].add(remaining_pin_id)
                        self._adj_list[dst_pin_id].add(remaining_pin_id)
                        self._junction_pin_ids.add(remaining_pin_id)

            if self._is_ground_pin(src_pin) or self._is_ground_pin(dst_pin):
                self._ground_pins.add(src_pin_id)
                self._ground_pins.add(dst_pin_id)

    def _expand_junction_adjacency(self):
        """Expand the adjacency for pins connected to Junctions"""
        for pin_id in list(self._adj_list.keys()):
            self._visit_junctions(pin_id, set())

    def _visit_junctions(self, pin_id, visited):
        """Traverse the adjacency list of a pin to visit any connected Junctions"""
        adj_pins = self._adj_list.get(pin_id, set())
        for adj_pin_id in list(adj_pins):
            if adj_pin_id in self._junction_pin_ids and adj_pin_id not in visited:
                visited.add(adj_pin_id)
                extra_pin_ids = self._adj_list.get(adj_pin_id, set())
                for extra_pin_id in list(extra_pin_ids):
                    self._adj_list[pin_id].add(extra_pin_id)
                    self._visit_junctions(extra_pin_id, visited)

    def _assign_spice_node_labels_to_pins(self):
        self.nodes_count = 0
        self.pin_labels = dict()
        component_pin_ids = []
        junction_pin_ids = []
        for pin_id in self._ground_pins:
            self.pin_labels[pin_id] = '0'

        for pin_id in self._adj_list:
            if pin_id in self._junction_pin_ids:
                junction_pin_ids.append(pin_id)
            else:
                component_pin_ids.append(pin_id)

        for pin_id in component_pin_ids + junction_pin_ids:
            if pin_id in self.pin_labels:
                for adj_pin in self._adj_list[pin_id]:
                    self.pin_labels[adj_pin] = self.pin_labels[pin_id]
            else:
                current_label = None
                for adj_pin in self._adj_list[pin_id]:
                    if adj_pin in self.pin_labels:
                        current_label = self.pin_labels[adj_pin]

                    if not current_label:
                        self.nodes_count += 1
                        current_label = f'N000{self.nodes_count}'

                self.pin_labels[pin_id] = current_label

                for adj_pin in self._adj_list[pin_id]:
                    self.pin_labels[adj_pin] = self.pin_labels[pin_id]

    def _get_remaining_pin_ids(self, pin):
        parent = self.core.get_parent(pin)
        pins = self._get_children_of_type(parent, 'Pin')
        pins.remove(pin)
        return list(map(lambda node: self.core.get_path(node), pins))

    def _is_junction_pin(self, pin: dict) -> bool:
        parent = self.core.get_parent(pin)
        return self.is_junction(node=parent)

    def _is_ground_pin(self, pin: dict) -> bool:
        parent = self.core.get_parent(pin)
        return self.is_ground(node=parent)

    def _is_circuit_pin(self, pin: dict) -> bool:
        parent = self.core.get_parent(pin)
        return self.is_circuit(node=parent)

    def _get_parent_id(self, node: dict) -> str:
        parent = self.core.get_parent(node)
        return self.core.get_path(parent)

    def _populate_netlist(self, circuit: dict,
                          parent_netlist: Optional[Union[Circuit, SubCircuit]] = None):
        components = self._get_children_except(circuit, 'Pin', 'Wire', 'Junction')
        sub_circuits = self._get_children_of_type(circuit, 'Circuit')

        for sub_circuit in sub_circuits:
            exposed_nodes = self._get_external_spice_nodes_for(sub_circuit)
            subckt_netlist = SubCircuit(self.core.get_attribute(sub_circuit, 'name'), *exposed_nodes)
            parent_netlist.subcircuit(subckt_netlist)
            self._populate_netlist(sub_circuit, subckt_netlist)

        components_map = {}
        for component in components:
            component_id = self.core.get_path(component)
            components_map[component_id] = dict()
            components_map[component_id]['node'] = component
            pins = self._get_children_of_type(component, 'Pin')
            for pin in pins:
                pin_id = self.core.get_path(pin)
                pin_name = self.core.get_attribute(pin, 'name')
                components_map[component_id][pin_name] = self._resolve_spice_node_id_for(pin_id)

        for component in components_map.values():
            self._add_to_netlist(component, parent_netlist)

    def _add_to_netlist(self, component: dict, netlist_ckt: Union[Circuit, SubCircuit]) -> None:
        try:
            self._is_capable_to_convert(component['node'])
        except NetListConversionError as e:
            self._log_error(str(e))
            self.create_message(component['node'], str(e), severity='error')
            raise e

        if self.core.is_type_of(component['node'], self.META['Basic']):
            self._add_basic_elements(component, netlist_ckt)

        elif self.core.is_type_of(component['node'], self.META['Semiconductors']):
            self._add_semiconductors(component, netlist_ckt)

    def _add_basic_elements(self, component: dict, netlist_ckt: Union[Circuit, SubCircuit]) -> None:
        node = component['node']
        if is_res := (self.is_resistor(node=node)) or self.is_conductor(node=node):
            netlist_ckt.R(
                get_next_label_for('R'),
                component['p'],
                component['n'],
                self.core.get_attribute(node, 'R') if is_res else
                1/self.core.get_attribute(node, 'G')
            )
        if self.is_inductor(node=node):
            netlist_ckt.L(
                get_next_label_for('L'),
                component['p'],
                component['n'],
                self.core.get_attribute(node, 'L')
            )
        if self.is_capacitor(node=node):
            netlist_ckt.C(
                get_next_label_for('C'),
                component['p'],
                component['n'],
                self.core.get_attribute(node, 'C')
            )
        if self.is_voltage(node=node):
            netlist_ckt.V(
                get_next_label_for('V'),
                component['p'],
                component['n'],
                self.core.get_attribute(node, 'V')
            )

        if self.is_current(node=node):
            netlist_ckt.I(
                get_next_label_for('V'),
                component['p'],
                component['n'],
                self.core.get_attribute(node, 'I')
            )

        if is_vcc := self.is_vcc(node=node) or self.is_vcv(node=node):
            netlist_ckt.G(
                get_next_label_for('G' if is_vcc else 'E'),
                component['p2'],
                component['n2'],
                component['p1'],
                component['n1'],
                self.core.get_attribute(node, 'transConductance' if is_vcc else 'gain')
            )

        if is_ccc := self.is_ccc(node=node) or self.is_ccv(node=node):
            voltage_label = get_next_label_for('V')
            netlist_ckt.V(voltage_label, component['p1'], component['n1'])
            if is_ccc:
                netlist_ckt.F(
                    get_next_label_for('G'),
                    component['p2'],
                    component['n2'],
                    source=voltage_label,
                    current_gain=self.core.get_attribute(node, 'gain')
                )
            else:
                netlist_ckt.H(
                    get_next_label_for('H'),
                    component['p2'],
                    component['n2'],
                    source=voltage_label,
                    transresistance=self.core.get_attribute(node, 'transResistance')
                )

        if any([
            vol := self.is_piece_wise_linear_voltage_source(node=node),
            self.is_piece_wise_linear_current_source(node=node),
            vol := self.is_random_voltage_source(node=node),
            self.is_random_current_source(node=node),
            vol := self.is_single_frequency_fm_voltage_source(node=node),
            self.is_single_frequency_fm_current_source(node=node),
            vol := self.is_pulse_voltage_source(node=node),
            self.is_pulse_current_source(node=node),
            vol := self.is_amplitude_modulated_voltage_source(node=node),
            self.is_amplitude_modulated_current_source(node=node),
            vol := self.is_exponential_voltage_source(node=node),
            self.is_exponential_current_source(node=node),
            vol := self.is_pulse_voltage_source(node=node),
            self.is_pulse_current_source(node=node),
            vol := self.is_ac_line(node=node)
        ]):
            attrs = self.core.get_valid_attribute_names(node)
            attrs.remove('name')
            class_name = self._get_pyspice_class_name(node)
            class_callable = getattr(netlist_ckt, class_name)
            ctor_kwargs = {attr: self.core.get_attribute(node, attr) for attr in attrs}

            if self.is_piece_wise_linear_voltage_source(node=node) or \
                    self.is_piece_wise_linear_current_source(node=node):
                ctor_kwargs['values'] = eval(ctor_kwargs['values'])
                for value in ctor_kwargs['values']:
                    assert len(value) == 2
                    assert all(isinstance(val, int) or isinstance(val, float) for val in value), \
                        self._log_error('Could not cast values to float')

            class_callable(
                get_next_label_for('V' if vol else 'I'),
                component['p'],
                component['n'],
                **ctor_kwargs
            )

    def _add_semiconductors(self, component: dict, netlist_ckt: Union[Circuit, SubCircuit]) -> None:
        node = component['node']
        # SemiConductors
        if self.is_diode(node=node) or self.is_led(node=node) \
                or self.is_schottky_diode(node=node) or self.is_z_diode(node=node):
            netlist_ckt.D(
                get_next_label_for('D'),
                component['p'],
                component['n']
            )

        if self.is_npn(node=node) or self.is_pnp(node=node):
            netlist_ckt.Q(
                get_next_label_for('Q'),
                component['C'],
                component['B'],
                component['E']
            )

        if self.is_nmos(node=node) or self.is_pmos(node=node):
            netlist_ckt.M(
                get_next_label_for('M'),
                component['D'],
                component['G'],
                component['B'],
                component['S']
            )

    def _get_external_spice_nodes_for(self, circuit: dict) -> list:
        msg = 'Provided node is not of type Circuit'
        assert self.is_circuit(node=circuit), self._log_error(msg)

        pins = self._get_children_of_type(circuit, 'Pin')
        external_spice_nodes = []
        for pin in pins:
            pin_id = self.core.get_path(pin)
            spice_node_id = self._resolve_spice_node_id_for(pin_id)
            external_spice_nodes.append(spice_node_id)
        return external_spice_nodes

    def _resolve_spice_node_id_for(self, pin_id):
        if pin_id in self.pin_labels:
            return self.pin_labels[pin_id]
        else:
            self.nodes_count += 1
            return f'N000{self.nodes_count}'

    def _get_pyspice_class_name(self, node: dict) -> str:
        meta_node = self.core.get_meta_type(node)
        if meta_node:
            return self.core.get_attribute(meta_node, 'name')

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

    # General Logging functions
    def _log_error(self, msg: str) -> None:
        self.logger.error(msg)

    def _log_info(self, msg: str) -> None:
        self.logger.info(msg)

    def _log_debug(self, msg: str) -> None:
        self.logger.debug(msg)

    def _is_capable_to_convert(self, node) -> bool:
        for skip in SKIP_NODES:
            if self.core.is_type_of(node, self.META[skip]):
                raise NetListConversionError(
                    f'Node of type {skip} is not supported yet'
                )
        return True

    @staticmethod
    def _to_camel_case(string: str) -> str:
        string = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', string)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', string).lower()
