This file contains documentation about the contained shared plugins.

## CircuitAnalysisBases
The base implementations for all circuit analysis/conversion Plugins. This module implements a conversion from a Circuit(WebGME) to a Circuit(PySpice) and a base class for running analysis on the Circuit.

Currently these implementations are used by the following plugins:

1. [ConvertCircuitToNetlist](../../plugins/ConvertCircuitToNetlist/ConvertCircuitToNetlist/__init__.py): Converts a WebGME Circuit to its equivalent SPICE Netlist (uses CircuitToPySpiceBase)
2. [RecommendNextComponents](../../plugins/RecommendNextComponents/RecommendNextComponents/__init__.py): Implementation for recommending components to be added to the Circuit (uses AnalyzeCircuit)


## PythonPluginBase
`PluginBase` for Python plugins, which uses [run_python_plugin.py](./run_python_plugin.py) to discover and execute the Python script for the plugin.
