
from odoo import models, api, fields


class Configuration(models.Model):
    """In this class the model pos.config is inherited
    to add a new boolean field in the settings of
    point of sale which is used to make enable/disable
    multiple order note in pos interface"""

    _inherit = 'pos.config'

    note_config = fields.Boolean(string='Order Line Note',
                                 help='Allow to write internal note in POS interface',
                                 default=True)
    iface_orderline_notes = fields.Boolean(string='Orderline Notes',
                                           help='Allow custom notes on Orderlines.',
                                           default=False, compute='_compute_iface_orderline_notes',
                                           readonly=False)

    @api.multi
    def _compute_iface_orderline_notes(self):
        """This is the compute function to disable
        the existing single order note facility
        in the point of sale interface"""
        if self.note_config:
            self.iface_orderline_notes = False

    @api.onchange('note_config')
    @api.depends('note_config')
    def _onchange_note_config(self):
        """This is the onchange function to disable/enable
        the existing single order note facility
            in the point of sale interface"""
        if self.note_config:
            self.iface_orderline_notes = False
        if not self.note_config:
            self.iface_orderline_notes = True
