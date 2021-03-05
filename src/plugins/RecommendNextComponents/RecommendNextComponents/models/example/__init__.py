from collections import Counter
from typing import Union

from PySpice.Spice.Netlist import Circuit, SubCircuit


def analyze(circuit: Union[Circuit, SubCircuit]):
    component_counts = Counter(type(element).__name__ for element in circuit.elements)

    for subckt in circuit.subcircuits:
        component_counts.update(type(element).__name__ for element in subckt.elements)

    most_common = dict(component_counts.most_common(3))

    recommendations = [
        {"element": element, "confidence": f"{ count / 50 * 100}%"}
        for element, count in most_common.items()
    ]
    return recommendations
