PIN_TYPE = 'Pin'


class ComponentNode:
    def __init__(self, core, gme_node):
        self.core = core
        self.gme_node = gme_node
        self._load_ports()

    @property
    def gme_id(self):
        return self.core.get_path(self.gme_node)

    @property
    def name(self):
        return self.core.get_attribute(self.gme_node, 'name')

    def _load_ports(self):
        self.ports = {}
        if self.core.get_attribute(self.core.get_meta_type(self.gme_node), 'name') == PIN_TYPE:
            pin_id = self.core.get_path(self.gme_node)
            self.ports[pin_id] = self.gme_node
        else:
            for child in self.core.load_children(self.gme_node):
                if self.core.get_attribute(self.core.get_meta_type(child), 'name') == PIN_TYPE:
                    pin_id = self.core.get_path(child)
                    self.ports[pin_id] = child

    def __eq__(self, other):
        return self.gme_node is other.gme_node

    def __hash__(self):
        return hash(self.core.get_path(self.gme_node))

    def __repr__(self):
        return f'<{self.__class__.__name__} ({self.name}), id: {self.gme_id}, {len(self.ports)} Pins>'


