has_pyspice = False

try:
    import PySpice

    has_pyspice = True
    del PySpice
except ImportError:
    has_pyspice = False
