from collections import Counter
from itertools import chain
from typing import Union

from PySpice.Spice.Netlist import Circuit, SubCircuit


def new_element(element_cls, circuit: Union[Circuit, SubCircuit]):
    existing = next((element for element in all_elements(circuit)))
    return {
        "type": element_cls.__name__,
        "pins": [pin.node.name for pin in existing.pins],
    }


def all_elements(circuit: Union[Circuit, SubCircuit]):
    return chain(
        (element for element in circuit.elements),
        *[all_elements(subckt) for subckt in circuit.subcircuits],
    )


def analyze(circuit: Union[Circuit, SubCircuit]):
    component_counts = Counter(type(element) for element in all_elements(circuit))

    total = sum(component_counts.values())

    recommendations = [
        (new_element(element, circuit), count / total)
        for (element, count) in component_counts.items()
    ]
    return recommendations
