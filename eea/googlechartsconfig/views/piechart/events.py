""" Handle events
"""
from eea.daviz.views.events import facet_deleted

def piechart_facet_deleted(obj, evt):
    """ Cleanup removed facet from view properties
    """
    return facet_deleted(obj, evt, 'googlechart.piechart')
